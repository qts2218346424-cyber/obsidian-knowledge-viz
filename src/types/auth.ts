export type UserRole = 'admin' | 'editor' | 'student'

export interface UserProfile {
  id: string
  username: string
  displayName: string
  role: UserRole
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
