/**
 * 用户、角色与积分契约
 */
export type UserRole = 'admin' | 'editor' | 'student'

export interface UserProfile {
  id: string
  username: string
  displayName?: string
  role: UserRole
  points: number
  lastCheckinAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface CheckinResult {
  success: boolean
  pointsAwarded: number
  points: number
  lastCheckinAt: string
  message: string
}

export interface RedeemCouponResult {
  success: boolean
  pointsAwarded?: number
  points?: number
  message?: string
}

export interface RechargeResult {
  success: boolean
  pointsAdded?: number
  points?: number
  message?: string
}
