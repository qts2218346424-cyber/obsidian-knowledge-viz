export type {
  UserProfile,
  UserRole,
  AuthStatusResponse,
  LoginResponse,
  UserPermissions,
  UserPointsInfo,
  CheckinResult,
  AdminGrantResult,
  PointLogItem,
  CouponCodeItem,
  RedeemCouponResult,
  RechargeResult,
  SecurityQuestionResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  SecuritySettingsResponse,
} from '../types/auth'
import type {
  UserProfile,
  UserRole,
  AuthStatusResponse,
  LoginResponse,
  UserPermissions,
  UserPointsInfo,
  CheckinResult,
  AdminGrantResult,
  PointLogItem,
  CouponCodeItem,
  RedeemCouponResult,
  RechargeResult,
  SecurityQuestionResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  SecuritySettingsResponse,
} from '../types/auth'

const TOKEN_KEY = 'coreforge_auth_token'
const BASE = '/api/auth'

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  } catch {
    // ignore
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

async function requestJSON<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string> || {}),
  }

  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    let errorMsg = `HTTP ${res.status}`
    try {
      const data = await res.json()
      if (data.error) errorMsg = data.error
    } catch {
      // not json
    }
    // 如果是 401 凭证过期，广播事件通知前端上下文重置
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('auth-unauthorized'))
    }
    throw new Error(errorMsg)
  }
  return res.json()
}

/** 探查系统初始化状态 */
export async function getAuthStatus(): Promise<AuthStatusResponse> {
  return requestJSON<AuthStatusResponse>(`${BASE}/status`)
}

/** 首次启动初始化超级管理员 */
export async function initAdmin(data: {
  username: string
  password: string
  displayName?: string
}): Promise<LoginResponse> {
  const res = await requestJSON<LoginResponse>(`${BASE}/init-admin`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (res.token) {
    setStoredToken(res.token)
  }
  return res
}

/** 用户自主注册（默认学生角色，注册即登入） */
export async function register(data: {
  username: string
  password: string
  displayName?: string
}): Promise<LoginResponse> {
  const res = await requestJSON<LoginResponse>(`${BASE}/register`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (res.token) {
    setStoredToken(res.token)
  }
  return res
}

/** 账号密码登录 */
export async function login(data: {
  username: string
  password: string
}): Promise<LoginResponse> {
  const res = await requestJSON<LoginResponse>(`${BASE}/login`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (res.token) {
    setStoredToken(res.token)
  }
  return res
}

/** 退出登录 */
export async function logout(): Promise<void> {
  try {
    await requestJSON(`${BASE}/logout`, { method: 'POST' })
  } catch {
    // 即使网络失败也清除本地凭证
  } finally {
    setStoredToken(null)
  }
}

/** 获取当前登录态详情与权限 */
export async function getCurrentUser(): Promise<{
  user: UserProfile
  permissions: UserPermissions
}> {
  return requestJSON<{ user: UserProfile; permissions: UserPermissions }>(`${BASE}/me`)
}

/** 修改个人密码 */
export async function changePassword(
  oldPasswordOrPayload: string | { oldPassword: string; newPassword: string },
  newPassword?: string
): Promise<{ message: string }> {
  const body = typeof oldPasswordOrPayload === 'string'
    ? { oldPassword: oldPasswordOrPayload, newPassword: newPassword! }
    : oldPasswordOrPayload
  return requestJSON<{ message: string }>(`${BASE}/change-password`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// ===== 管理员专用接口 =====

/** 获取系统全部用户 */
export async function listUsers(): Promise<{ users: UserProfile[] }> {
  return requestJSON<{ users: UserProfile[] }>(`${BASE}/users`)
}

/** 管理员添加用户 */
export async function createUser(data: {
  username: string
  password: string
  displayName?: string
  role: UserRole
}): Promise<{ user: UserProfile; message: string }> {
  return requestJSON<{ user: UserProfile; message: string }>(`${BASE}/users`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** 管理员更新用户信息/角色/重置密码 */
export async function updateUser(
  id: string,
  updates: { displayName?: string; role?: UserRole; resetPassword?: string }
): Promise<{ user: UserProfile | null; message: string }> {
  return requestJSON<{ user: UserProfile | null; message: string }>(`${BASE}/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

/** 管理员删除用户 */
export async function deleteUser(id: string): Promise<{ message: string }> {
  return requestJSON<{ message: string }>(`${BASE}/users/${id}`, {
    method: 'DELETE',
  })
}

// ===== 伴学积分体系与签到 API =====

/** 获取当前用户积分信息与今日签到状态 */
export async function getUserPoints(): Promise<UserPointsInfo> {
  return requestJSON<UserPointsInfo>('/api/user/points')
}

/** 每日签到领 1 积分 */
export async function checkin(): Promise<CheckinResult> {
  return requestJSON<CheckinResult>('/api/user/checkin', {
    method: 'POST',
  })
}

/** 管理员为用户增减/分配积分 */
export async function adminGrantPoints(
  userId: string,
  amount: number,
  remark?: string
): Promise<AdminGrantResult> {
  return requestJSON<AdminGrantResult>(`/api/admin/users/${userId}/points`, {
    method: 'POST',
    body: JSON.stringify({ amount, remark }),
  })
}

/** 管理员查看用户积分变动流水 */
export async function adminListPointLogs(
  userId: string,
  limit = 30
): Promise<{ logs: PointLogItem[] }> {
  return requestJSON<{ logs: PointLogItem[] }>(`/api/admin/users/${userId}/point-logs?limit=${limit}`)
}

// ===== 优惠码与自主充值 API =====

/** 用户使用优惠码兑换积分 */
export async function redeemCoupon(code: string): Promise<RedeemCouponResult> {
  return requestJSON<RedeemCouponResult>('/api/user/redeem-coupon', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

/** 用户自主充值积分 */
export async function rechargePoints(amount: number, channel?: string): Promise<RechargeResult> {
  return requestJSON<RechargeResult>('/api/user/recharge', {
    method: 'POST',
    body: JSON.stringify({ amount, channel }),
  })
}

/** 管理员获取所有优惠码 */
export async function adminListCoupons(): Promise<{ coupons: CouponCodeItem[] }> {
  return requestJSON<{ coupons: CouponCodeItem[] }>('/api/admin/coupons')
}

/** 管理员批量/单个创建优惠码 */
export async function adminCreateCoupons(data: {
  points: number
  count: number
  maxUses?: number
  description?: string
  expiresAt?: string
  customCode?: string
}): Promise<{ message: string; coupons: CouponCodeItem[] }> {
  return requestJSON<{ message: string; coupons: CouponCodeItem[] }>('/api/admin/coupons', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** 管理员删除优惠码 */
export async function adminDeleteCoupon(code: string): Promise<{ message: string }> {
  return requestJSON<{ message: string }>(`/api/admin/coupons/${code}`, {
    method: 'DELETE',
  })
}

// ===== 找回密码与安全密保 API =====

/** 查询指定用户的安全密保问题（找回密码第一步） */
export async function getSecurityQuestion(username: string): Promise<SecurityQuestionResponse> {
  return requestJSON<SecurityQuestionResponse>(`/api/auth/security-question?username=${encodeURIComponent(username)}`)
}

/** 提交安全验证并重置新密码（找回密码第二步） */
export async function resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
  return requestJSON<ResetPasswordResponse>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** 考生获取自身安全设置（密保与救援码） */
export async function getSecuritySettings(): Promise<SecuritySettingsResponse> {
  return requestJSON<SecuritySettingsResponse>('/api/auth/security-settings')
}

/** 考生设置/修改自身安全密保问题与救援码 */
export async function updateSecuritySettings(data: {
  question?: string
  answer?: string
  refreshRecoveryCode?: boolean
}): Promise<{ message: string; recoveryCode: string; hasSecurityQuestion: boolean; securityQuestion: string | null }> {
  return requestJSON('/api/auth/security-settings', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
