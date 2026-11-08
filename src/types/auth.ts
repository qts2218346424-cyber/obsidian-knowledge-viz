export type UserRole = 'admin' | 'editor' | 'student'

export interface UserProfile {
  id: string
  username: string
  displayName: string
  role: UserRole
  points?: number
  lastCheckinAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface AuthStatusResponse {
  initialized: boolean
  userCount: number
  currentUser: UserProfile | null
}

export interface LoginResponse {
  message: string
  token: string
  expiresAt: string
  user: UserProfile
}

export interface UserPermissions {
  canWriteVault: boolean
  canManageSettings: boolean
  canManageUsers: boolean
  isReadOnly: boolean
}

export type PointLogType =
  | 'checkin'
  | 'chat_deduct'
  | 'admin_grant'
  | 'admin_deduct'
  | 'initial_grant'

export interface PointLogItem {
  id: string
  userId: string
  type: PointLogType
  amount: number
  balanceAfter: number
  remark?: string
  operatorId?: string
  createdAt: string
}

export interface UserPointsInfo {
  points: number
  lastCheckinAt?: string
  canCheckinToday: boolean
  logs: PointLogItem[]
}

export interface CheckinResult {
  success: boolean
  points: number
  earned: number
  message: string
  lastCheckinAt: string
}

export interface AdminGrantResult {
  success: boolean
  points: number
  delta: number
  message?: string
}
