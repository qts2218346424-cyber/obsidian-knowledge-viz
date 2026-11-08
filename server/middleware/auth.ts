import type { Request, Response, NextFunction } from 'express'
import { database, type DbUser, type UserRole } from '../db/database.js'

// 扩展 Express Request 类型定义
declare global {
  namespace Express {
    interface Request {
      user?: DbUser
      token?: string
    }
  }
}

/**
 * 提取并验证 Authorization 请求头中的 Bearer Token
 */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.slice(7).trim()
  if (!token) return next()

  const record = database.findSessionByToken(token)
  if (record) {
    req.user = record.user
    req.token = token
  }
  next()
}

/**
 * 强制登录验证中间件：未携带有效令牌或会话过期时返回 401
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({
      error: '请先登录账号后访问',
      code: 'UNAUTHORIZED',
    })
    return
  }
  next()
}

/**
 * 基于角色权限检查中间件
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: '请先登录账号后访问', code: 'UNAUTHORIZED' })
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `权限受限：该操作仅允许 [${allowedRoles.join('/')}] 角色执行，当前身份为 [${req.user.role}]`,
        code: 'FORBIDDEN',
        currentRole: req.user.role,
      })
      return
    }

    next()
  }
}

/**
 * 学生只读守卫中间件：
 * 当角色为 'student' 时，严格拦截对知识库与系统配置的非幂等修改请求（POST / PUT / PATCH / DELETE）
 */
export function readOnlyGuard(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role === 'student') {
    const method = req.method.toUpperCase()
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      res.status(403).json({
        error: '操作受限：当前为学生只读账号，无权修改或删除知识库内容与系统配置',
        code: 'STUDENT_READ_ONLY',
      })
      return
    }
  }
  next()
}
