import { Router } from 'express'
import { database, type UserRole } from '../db/database.js'
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  generateUserId,
} from '../utils/auth-crypto.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

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

  const { username, password, displayName } = req.body || {}
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
    createdAt: now,
    updatedAt: now,
  }

  database.insertUser(user)

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

  const { username, password, displayName } = req.body || {}
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
  
  // 严格强制默认角色为 student（学生只读），杜绝越权提权
  const user = {
    id: generateUserId(),
    username: cleanUsername,
    displayName: (displayName && typeof displayName === 'string' ? displayName.trim() : '') || cleanUsername,
    passwordHash: hash,
    salt,
    role: 'student' as UserRole,
    createdAt: now,
    updatedAt: now,
  }

  database.insertUser(user)

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
  res.json({
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
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
