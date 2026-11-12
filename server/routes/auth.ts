import { Router } from 'express'
import { database, type UserRole } from '../db/database.js'
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  generateUserId,
  generateRecoveryCode,
} from '../utils/auth-crypto.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { ensureUserSandboxSync } from '../services/user-sandbox.js'

export const authRouter = Router()

/**
 * 探查认证系统状态：系统是否已初始化管理员、当前会话用户
 */
authRouter.get('/auth/status', (req, res) => {
  const userCount = database.getUserCount()
  res.json({
    initialized: userCount > 0,
    userCount,
    currentUser: req.user
      ? {
          id: req.user.id,
          username: req.user.username,
          displayName: req.user.displayName,
          role: req.user.role,
          points: req.user.points ?? 5.0,
          lastCheckinAt: req.user.lastCheckinAt,
        }
      : null,
  })
})

/**
 * 首次启动一键初始化超级管理员
 */
authRouter.post('/auth/init-admin', async (req, res) => {
  const userCount = database.getUserCount()
  if (userCount > 0) {
    res.status(400).json({ error: '系统已存在管理员账户，禁止重复初始化' })
    return
  }

  const { username, password, displayName, securityQuestion, securityAnswer } = req.body || {}
  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    res.status(400).json({ error: '账号名至少需要 3 个字符' })
    return
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ error: '管理员初始密码长度不能少于 6 位' })
    return
  }

  const now = new Date().toISOString()
  const { hash, salt } = await hashPassword(password.trim())
  const user = {
    id: generateUserId(),
    username: username.trim(),
    displayName: (displayName && typeof displayName === 'string' ? displayName.trim() : '') || username.trim(),
    passwordHash: hash,
    salt,
    role: 'admin' as UserRole,
    points: 100.0, // 超级管理员初始赠送 100 积分
    recoveryCode: generateRecoveryCode(),
    createdAt: now,
    updatedAt: now,
  }

  database.insertUser(user)
  ensureUserSandboxSync(user.id, user.username)

  // 颁发初始登录 Token（有效期 7 天）
  const token = generateSecureToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  database.insertSession({
    token,
    userId: user.id,
    createdAt: now,
    expiresAt,
  })

  res.status(201).json({
    message: '超级管理员账户初始化成功',
    token,
    expiresAt,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      points: user.points,
    },
  })
})

/**
 * 公开自主注册接口（新用户默认分配学生只读 student 角色，注册后自动登录）
 */
authRouter.post('/auth/register', async (req, res) => {
  const userCount = database.getUserCount()
  if (userCount === 0) {
    res.status(400).json({ error: '系统尚未初始化，请先创建首位超级管理员账户' })
    return
  }

  const { username, password, displayName, securityQuestion, securityAnswer } = req.body || {}
  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    res.status(400).json({ error: '用户名至少需要 3 个字符' })
    return
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ error: '登录密码至少需要 6 个字符' })
    return
  }

  const cleanUsername = username.trim()
  const existing = database.findUserByUsername(cleanUsername)
  if (existing) {
    res.status(409).json({ error: `用户名 "${cleanUsername}" 已被注册，请尝试其他名称` })
    return
  }

  const now = new Date().toISOString()
  const { hash, salt } = await hashPassword(password.trim())
  
  const recoveryCode = generateRecoveryCode()
  let secAnswerHash: string | undefined = undefined
  let secAnswerSalt: string | undefined = undefined
  if (securityQuestion && securityAnswer && typeof securityAnswer === 'string' && securityAnswer.trim().length > 0) {
    const hashed = await hashPassword(securityAnswer.trim().toLowerCase())
    secAnswerHash = hashed.hash
    secAnswerSalt = hashed.salt
  }

  // 严格强制默认角色为 student（学生只读），杜绝越权提权；新注册赠送 5.0 积分
  const user = {
    id: generateUserId(),
    username: cleanUsername,
    displayName: (displayName && typeof displayName === 'string' ? displayName.trim() : '') || cleanUsername,
    passwordHash: hash,
    salt,
    role: 'student' as UserRole,
    points: 5.0,
    securityQuestion: securityQuestion && typeof securityQuestion === 'string' ? securityQuestion.trim() : undefined,
    securityAnswerHash: secAnswerHash,
    securityAnswerSalt: secAnswerSalt,
    recoveryCode,
    createdAt: now,
    updatedAt: now,
  }

  database.insertUser(user)
  ensureUserSandboxSync(user.id, user.username)

  // 注册完成后自动颁发 7 天会话令牌，无缝登入
  const token = generateSecureToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  database.insertSession({
    token,
    userId: user.id,
    createdAt: now,
    expiresAt,
  })

  res.status(201).json({
    message: '研学账号注册成功，已自动登入',
    token,
    expiresAt,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      points: user.points,
      recoveryCode: user.recoveryCode,
    },
  })
})

/**
 * 账户登录
 */
authRouter.post('/auth/login', async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    res.status(400).json({ error: '请输入用户名与密码' })
    return
  }

  const user = database.findUserByUsername(String(username).trim())
  if (!user) {
    res.status(401).json({ error: '用户名或密码不正确' })
    return
  }

  const isMatched = await verifyPassword(String(password).trim(), user.passwordHash, user.salt)
  if (!isMatched) {
    res.status(401).json({ error: '用户名或密码不正确' })
    return
  }

  const now = new Date().toISOString()
  const token = generateSecureToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  database.insertSession({
    token,
    userId: user.id,
    createdAt: now,
    expiresAt,
  })

  res.json({
    message: '登录成功',
    token,
    expiresAt,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      points: user.points ?? 5.0,
      lastCheckinAt: user.lastCheckinAt,
    },
  })
})

/**
 * 注销退出登录
 */
authRouter.post('/auth/logout', (req, res) => {
  if (req.token) {
    database.deleteSession(req.token)
  }
  res.json({ message: '已安全退出登录' })
})

/**
 * 获取当前登录用户信息与权限描述
 */
authRouter.get('/auth/me', requireAuth, (req, res) => {
  const user = req.user!
  // 获取最新积分状态
  const pointInfo = database.getUserPoints(user.id)
  res.json({
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      points: pointInfo?.points ?? user.points ?? 5.0,
      lastCheckinAt: pointInfo?.lastCheckinAt ?? user.lastCheckinAt,
      createdAt: user.createdAt,
    },
    permissions: {
      canWriteVault: user.role === 'admin' || user.role === 'editor',
      canManageSettings: user.role === 'admin',
      canManageUsers: user.role === 'admin',
      isReadOnly: user.role === 'student',
    },
  })
})

/**
 * 用户自行修改密码
 */
authRouter.post('/auth/change-password', requireAuth, async (req, res) => {
  const { oldPassword, newPassword } = req.body || {}
  if (!oldPassword || !newPassword) {
    res.status(400).json({ error: '请提供原密码与新密码' })
    return
  }
  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    res.status(400).json({ error: '新密码长度至少需要 6 个字符' })
    return
  }

  const isMatched = await verifyPassword(String(oldPassword).trim(), req.user!.passwordHash, req.user!.salt)
  if (!isMatched) {
    res.status(400).json({ error: '原密码验证错误' })
    return
  }

  const { hash, salt } = await hashPassword(String(newPassword).trim())
  database.updateUser(req.user!.id, {
    passwordHash: hash,
    salt,
  })

  // 清除该用户其他所有会话，要求重新登录
  database.deleteUserSessions(req.user!.id)

  res.json({ message: '密码已修改，请使用新密码重新登录' })
})

// ==========================================
// ===== 找回密码与安全密保重置接口 (公开) =====
// ==========================================

/**
 * 忘记密码第一步：查询指定用户名预设的安全密保问题
 */
authRouter.get('/auth/security-question', (req, res) => {
  const username = String(req.query.username || '').trim()
  if (!username) {
    res.status(400).json({ error: '请输入用户名' })
    return
  }

  const secInfo = database.findUserSecurityInfo(username)
  if (!secInfo) {
    res.status(404).json({ error: '未检索到该用户名，请核对是否拼写正确' })
    return
  }

  res.json({
    username: secInfo.username,
    hasSecurityQuestion: secInfo.hasSecurityQuestion,
    securityQuestion: secInfo.securityQuestion || null,
    hasRecoveryCode: secInfo.hasRecoveryCode,
  })
})

/**
 * 忘记密码第二步：通过安全密保答案或应急救援码验证并重置新密码
 */
authRouter.post('/auth/reset-password', async (req, res) => {
  const { username, answer, recoveryCode, newPassword } = req.body || {}
  if (!username || typeof username !== 'string' || !username.trim()) {
    res.status(400).json({ error: '请输入用户名' })
    return
  }
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    res.status(400).json({ error: '重置的新密码长度不能少于 6 位' })
    return
  }

  const user = database.findUserByUsername(username.trim())
  if (!user) {
    res.status(404).json({ error: '未找到该用户名，请核对账号' })
    return
  }

  // 严格沙箱隔离：演示/访客账号一律禁止在线重置密码
  if (user.username.toLowerCase() === 'demo' || user.role === 'guest' || user.username.toLowerCase() === 'test') {
    res.status(403).json({ error: '公共演示与访客体验账号处于系统沙箱保护中，禁止重置密码。如需使用请注册属于您的独立考生账号！' })
    return
  }

  let verified = false
  let verifyType = ''

  // 1. 优先校验安全密保答案（忽略首尾空格并小写比对）
  if (answer && typeof answer === 'string' && answer.trim()) {
    if (!user.securityAnswerHash || !user.securityAnswerSalt) {
      res.status(400).json({ error: '该账号未预设密保答案，请改用专属救援码重置或联系管理员协助' })
      return
    }
    const cleanAnswer = answer.trim().toLowerCase()
    const isAnswerMatched = await verifyPassword(cleanAnswer, user.securityAnswerHash, user.securityAnswerSalt)
    if (!isAnswerMatched) {
      res.status(400).json({ error: '密保问题答案验证错误，请重新核对' })
      return
    }
    verified = true
    verifyType = '安全密保'
  } else if (recoveryCode && typeof recoveryCode === 'string' && recoveryCode.trim()) {
    // 2. 次选校验备用应急救援码
    if (!user.recoveryCode) {
      res.status(400).json({ error: '该账号未生成或绑定备用救援码，请联系研学管理员协助重置' })
      return
    }
    const cleanInputCode = recoveryCode.trim().toUpperCase().replace(/\s+/g, '')
    const userCode = user.recoveryCode.toUpperCase().replace(/\s+/g, '')
    if (cleanInputCode !== userCode) {
      res.status(400).json({ error: '备用安全救援码无效或不匹配' })
      return
    }
    verified = true
    verifyType = '应急救援码'
  } else {
    res.status(400).json({ error: '请提供安全密保答案或备用安全救援码进行身份校验' })
    return
  }

  if (!verified) {
    res.status(400).json({ error: '身份凭证校验未通过' })
    return
  }

  // 验证通过，计算新密码哈希并刷新救援码
  const { hash, salt } = await hashPassword(newPassword.trim())
  const newRecoveryCode = generateRecoveryCode()

  database.updateUser(user.id, {
    passwordHash: hash,
    salt,
    recoveryCode: newRecoveryCode,
  })

  // 强制清除旧登录会话
  database.deleteUserSessions(user.id)

  res.json({
    message: `身份凭证（${verifyType}）验证通过，新密码已重置成功，请重新登录！`,
    newRecoveryCode,
  })
})

/**
 * 考生已登录：获取自身的安全密保与专属救援码
 */
authRouter.get('/auth/security-settings', requireAuth, (req, res) => {
  const user = req.user!
  const isDemo = user.username.toLowerCase() === 'demo' || user.role === 'guest' || user.username.toLowerCase() === 'test'

  // 演示账号启用安全沙箱，绝对不返回明文恢复码
  if (isDemo) {
    res.json({
      username: user.username,
      hasSecurityQuestion: false,
      securityQuestion: null,
      recoveryCode: null,
      isDemo: true,
    })
    return
  }

  // 若历史老用户尚未生成救援码，自动为其生成并存入
  let recoveryCode = user.recoveryCode
  if (!recoveryCode) {
    recoveryCode = generateRecoveryCode()
    database.updateUser(user.id, { recoveryCode })
  }

  res.json({
    username: user.username,
    hasSecurityQuestion: Boolean(user.securityQuestion && user.securityAnswerHash),
    securityQuestion: user.securityQuestion || null,
    recoveryCode,
    isDemo: false,
  })
})

/**
 * 考生已登录：设置或修改自身安全密保问题与答案
 */
authRouter.post('/auth/security-settings', requireAuth, async (req, res) => {
  const { question, answer, refreshRecoveryCode } = req.body || {}
  const user = req.user!
  const isDemo = user.username.toLowerCase() === 'demo' || user.role === 'guest' || user.username.toLowerCase() === 'test'

  if (isDemo) {
    res.status(403).json({ error: '演示/访客体验账号处于沙箱模式，禁止在线修改安全凭据。' })
    return
  }

  const updates: any = {}

  if (question && typeof question === 'string' && question.trim().length >= 2) {
    if (!answer || typeof answer !== 'string' || answer.trim().length < 1) {
      res.status(400).json({ error: '请提供对应的密保答案' })
      return
    }
    const cleanAnswer = answer.trim().toLowerCase()
    const { hash, salt } = await hashPassword(cleanAnswer)
    updates.securityQuestion = question.trim()
    updates.securityAnswerHash = hash
    updates.securityAnswerSalt = salt
  }

  let finalRecoveryCode = user.recoveryCode
  if (refreshRecoveryCode || !finalRecoveryCode) {
    finalRecoveryCode = generateRecoveryCode()
    updates.recoveryCode = finalRecoveryCode
  }

  database.updateUser(user.id, updates)

  res.json({
    message: '账号安全密保与救援码已更新',
    recoveryCode: finalRecoveryCode,
    hasSecurityQuestion: Boolean(updates.securityQuestion || user.securityQuestion),
    securityQuestion: updates.securityQuestion || user.securityQuestion || null,
  })
})

// ==========================================
// ===== 管理员专用接口 (需 admin 角色) =====
// ==========================================

/**
 * 获取系统所有用户列表
 */
authRouter.get('/auth/users', requireAuth, requireRole('admin'), (_req, res) => {
  const users = database.listUsers()
  res.json({ users })
})

/**
 * 管理员开户/创建新用户（分配角色：admin/editor/student）
 */
authRouter.post('/auth/users', requireAuth, requireRole('admin'), async (req, res) => {
  const { username, password, displayName, role } = req.body || {}
  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    res.status(400).json({ error: '用户名至少需要 3 个字符' })
    return
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ error: '初始密码至少需要 6 个字符' })
    return
  }

  const validRoles: UserRole[] = ['admin', 'editor', 'student']
  const assignedRole: UserRole = validRoles.includes(role) ? role : 'student'

  const existing = database.findUserByUsername(username.trim())
  if (existing) {
    res.status(409).json({ error: `用户名 "${username.trim()}" 已被占用` })
    return
  }

  const now = new Date().toISOString()
  const { hash, salt } = await hashPassword(password.trim())
  const newUser = {
    id: generateUserId(),
    username: username.trim(),
    displayName: (displayName && typeof displayName === 'string' ? displayName.trim() : '') || username.trim(),
    passwordHash: hash,
    salt,
    role: assignedRole,
    createdAt: now,
    updatedAt: now,
  }

  database.insertUser(newUser)
  ensureUserSandboxSync(newUser.id, newUser.username)

  res.status(201).json({
    message: '用户创建成功',
    user: {
      id: newUser.id,
      username: newUser.username,
      displayName: newUser.displayName,
      role: newUser.role,
      createdAt: newUser.createdAt,
    },
  })
})

/**
 * 管理员修改指定用户（修改角色、昵称或重置密码）
 */
authRouter.patch('/auth/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params
  const targetUser = database.findUserById(id)
  if (!targetUser) {
    res.status(404).json({ error: '目标用户不存在' })
    return
  }

  const { displayName, role, resetPassword } = req.body || {}
  const updates: { displayName?: string; role?: UserRole; passwordHash?: string; salt?: string } = {}

  if (displayName !== undefined && typeof displayName === 'string') {
    updates.displayName = displayName.trim()
  }

  if (role !== undefined) {
    const validRoles: UserRole[] = ['admin', 'editor', 'student']
    if (!validRoles.includes(role)) {
      res.status(400).json({ error: '无效的用户角色' })
      return
    }

    // 保护：如果目标用户是最后一个 admin，不允许降级为其他角色
    if (targetUser.role === 'admin' && role !== 'admin') {
      const allAdmins = database.listUsers().filter(u => u.role === 'admin')
      if (allAdmins.length <= 1) {
        res.status(400).json({ error: '系统必须至少保留一位管理员，无法降级唯一的管理员' })
        return
      }
    }
    updates.role = role
  }

  if (resetPassword && typeof resetPassword === 'string') {
    if (resetPassword.length < 6) {
      res.status(400).json({ error: '重置密码长度不能少于 6 位' })
      return
    }
    const { hash, salt } = await hashPassword(resetPassword.trim())
    updates.passwordHash = hash
    updates.salt = salt
    // 强制踢出目标用户的旧会话
    database.deleteUserSessions(id)
  }

  database.updateUser(id, updates)

  const updated = database.findUserById(id)
  res.json({
    message: '用户信息已更新',
    user: updated ? {
      id: updated.id,
      username: updated.username,
      displayName: updated.displayName,
      role: updated.role,
      updatedAt: updated.updatedAt,
    } : null,
  })
})

/**
 * 管理员删除指定用户
 */
authRouter.delete('/auth/users/:id', requireAuth, requireRole('admin'), (req, res) => {
  const { id } = req.params
  if (req.user?.id === id) {
    res.status(400).json({ error: '无法删除当前正在登录的自身账户' })
    return
  }

  const target = database.findUserById(id)
  if (!target) {
    res.status(404).json({ error: '目标用户不存在' })
    return
  }

  if (target.role === 'admin') {
    const allAdmins = database.listUsers().filter(u => u.role === 'admin')
    if (allAdmins.length <= 1) {
      res.status(400).json({ error: '系统必须至少保留一位管理员，禁止删除唯一的管理员' })
      return
    }
  }

  database.deleteUser(id)
  res.json({ message: `用户 "${target.username}" 已成功注销删除` })
})

// ==========================================
// ===== 积分体系与每日签到接口 =====
// ==========================================

/**
 * 获取当前登录用户的积分资产信息与今日签到状态
 */
authRouter.get('/user/points', requireAuth, (req, res) => {
  const userId = req.user!.id
  const pointInfo = database.getUserPoints(userId)
  if (!pointInfo) {
    res.status(404).json({ error: '用户不存在' })
    return
  }
  const logs = database.listPointLogs(userId, 20)
  res.json({
    points: pointInfo.points,
    lastCheckinAt: pointInfo.lastCheckinAt,
    canCheckinToday: pointInfo.canCheckinToday,
    logs,
  })
})

/**
 * 每日签到接口：每天赠送 1.0 积分
 */
authRouter.post('/user/checkin', requireAuth, (req, res) => {
  const userId = req.user!.id
  const result = database.checkinUser(userId)
  if (!result.success) {
    res.status(400).json(result)
    return
  }
  res.json(result)
})

/**
 * 管理员为指定用户分配/增减积分
 */
authRouter.post('/admin/users/:id/points', requireAuth, requireRole('admin'), (req, res) => {
  const { id } = req.params
  const { amount, remark } = req.body || {}

  const numAmount = Number(amount)
  if (isNaN(numAmount) || numAmount === 0) {
    res.status(400).json({ error: '请提供有效的积分调整数值（可为正数或负数）' })
    return
  }

  const result = database.grantUserPoints(
    id,
    numAmount,
    req.user!.id,
    typeof remark === 'string' ? remark.trim() : undefined
  )

  if (!result.success) {
    res.status(400).json(result)
    return
  }

  res.json(result)
})

/**
 * 管理员查看指定用户的积分流水
 */
authRouter.get('/admin/users/:id/point-logs', requireAuth, requireRole('admin'), (req, res) => {
  const { id } = req.params
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30))
  const logs = database.listPointLogs(id, limit)
  res.json({ logs })
})

/**
 * 用户自主充值伴学积分接口（已对普通学员暂时关闭，仅管理员可作为调试使用）
 */
authRouter.post('/user/recharge', requireAuth, (req, res) => {
  const user = req.user!
  if (user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: '自主充值通道已暂时关闭。如需增加伴学积分，请参与每日签到打卡或联系管理员获取卡密兑换码。',
    })
    return
  }

  const userId = user.id
  const { amount, channel } = req.body || {}
  const numAmount = Number(amount)
  if (isNaN(numAmount) || numAmount <= 0) {
    res.status(400).json({ error: '请选择或输入有效的充值积分额度（大于 0）' })
    return
  }
  const result = database.rechargeUserPoints(
    userId,
    numAmount,
    typeof channel === 'string' ? channel.trim() : '研学充值(管理员调试)'
  )
  if (!result.success) {
    res.status(400).json(result)
    return
  }
  res.json(result)
})

/**
 * 用户使用优惠码/卡密兑换伴学积分
 */
authRouter.post('/user/redeem-coupon', requireAuth, (req, res) => {
  const userId = req.user!.id
  const { code } = req.body || {}
  if (!code || typeof code !== 'string' || !code.trim()) {
    res.status(400).json({ error: '请输入优惠兑换码' })
    return
  }
  const result = database.redeemCoupon(userId, code)
  if (!result.success) {
    res.status(400).json(result)
    return
  }
  res.json(result)
})

/**
 * 管理员获取所有优惠码列表
 */
authRouter.get('/admin/coupons', requireAuth, requireRole('admin'), (_req, res) => {
  const coupons = database.listCoupons()
  res.json({ coupons })
})

/**
 * 管理员批量/单个生成优惠码
 */
authRouter.post('/admin/coupons', requireAuth, requireRole('admin'), (req, res) => {
  const { points, count, maxUses, description, expiresAt, customCode } = req.body || {}
  const numPoints = Number(points)
  if (isNaN(numPoints) || numPoints <= 0) {
    res.status(400).json({ error: '请输入有效的积分面额（大于 0）' })
    return
  }
  const coupons = database.createCoupons(
    {
      points: numPoints,
      count: Number(count) || 1,
      maxUses: Number(maxUses) || 1,
      description: typeof description === 'string' ? description.trim() : undefined,
      expiresAt: typeof expiresAt === 'string' ? expiresAt.trim() : undefined,
      customCode: typeof customCode === 'string' ? customCode.trim() : undefined,
    },
    req.user!.username || req.user!.id
  )
  res.status(201).json({
    message: `成功生成 ${coupons.length} 张优惠兑换码`,
    coupons,
  })
})

/**
 * 管理员删除/作废优惠码
 */
authRouter.delete('/admin/coupons/:code', requireAuth, requireRole('admin'), (req, res) => {
  const { code } = req.params
  const success = database.deleteCoupon(code)
  if (!success) {
    res.status(404).json({ error: '优惠码不存在或删除失败' })
    return
  }
  res.json({ message: `优惠码 [${code.toUpperCase()}] 已成功作废删除` })
})
