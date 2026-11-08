import type {
  UserProfile,
  UserRole,
  AuthStatusResponse,
  LoginResponse,
  UserPermissions,
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
  oldPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  return requestJSON<{ message: string }>(`${BASE}/change-password`, {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
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
