import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type {
  UserProfile,
  UserRole,
  CheckinResult,
  RedeemCouponResult,
  RechargeResult,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from '../types/auth'
import * as authService from '../services/auth'

export interface AuthContextValue {
  user: UserProfile | null
  token: string | null
  isLoading: boolean
  initialized: boolean
  isAuthenticated: boolean
  isLocalMode: boolean
  isAdmin: boolean
  isEditor: boolean
  isStudent: boolean
  canWriteVault: boolean
  points: number
  canCheckinToday: boolean
  lastCheckinAt?: string
  checkin: () => Promise<CheckinResult>
  redeemCoupon: (code: string) => Promise<RedeemCouponResult>
  recharge: (amount: number, channel?: string) => Promise<RechargeResult>
  refreshPoints: () => Promise<void>
  updatePointsDirectly: (newPoints: number) => void
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, displayName?: string) => Promise<void>
  initAdmin: (username: string, password: string, displayName?: string) => Promise<void>
  resetPassword: (payload: ResetPasswordPayload) => Promise<ResetPasswordResponse>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  checkStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => authService.getStoredUser())
  const [token, setToken] = useState<string | null>(authService.getStoredToken())
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [initialized, setInitialized] = useState<boolean>(true)
  const [isLocalMode, setIsLocalMode] = useState<boolean>(false)
  const [points, setPoints] = useState<number>(5.0)
  const [lastCheckinAt, setLastCheckinAt] = useState<string | undefined>(undefined)
  const [canCheckinToday, setCanCheckinToday] = useState<boolean>(true)

  const refreshPoints = useCallback(async () => {
    // 开源单机纯净版：永久拥有无限研学算力，无需请求云端积分
    setPoints(999999)
    setCanCheckinToday(false)
  }, [])

  const refreshUser = useCallback(async () => {
    const currentToken = authService.getStoredToken()
    if (!currentToken) {
      setUser(null)
      setToken(null)
      return
    }
    try {
      const data = await authService.getCurrentUser()
      setUser(data.user)
      setToken(currentToken)
      authService.setStoredUser(data.user)
      if (typeof data.user.points === 'number') {
        setPoints(data.user.points)
      }
      setLastCheckinAt(data.user.lastCheckinAt)
      await refreshPoints()
    } catch {
      setUser(null)
      setToken(null)
      authService.setStoredToken(null)
      authService.setStoredUser(null)
    }
  }, [refreshPoints])

  const checkStatus = useCallback(async () => {
    try {
      setIsLoading(true)
      const status = await authService.getAuthStatus()
      setInitialized(status.initialized)

      const isElectron = typeof window !== 'undefined' && Boolean((window as any).electronAPI || (window as any).electron)
      const isLocalHost = typeof window !== 'undefined' && Boolean(
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        /^192\.168\./.test(window.location.hostname) ||
        /^10\./.test(window.location.hostname) ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(window.location.hostname) ||
        window.location.protocol === 'file:'
      )
      const isLocalEnv = status.isLocalMode || status.authRequired === false || isElectron || isLocalHost

      if (isLocalEnv) {
        setIsLocalMode(true)
        setInitialized(true)
        const localUser: UserProfile = status.currentUser || {
          id: 'local-master',
          username: 'admin',
          displayName: '本地研学者',
          role: 'admin',
          points: 999999,
        }
        setUser(localUser)
        setToken('local-open-source-token')
        authService.setStoredToken('local-open-source-token')
        authService.setStoredUser(localUser)
        setPoints(999999)
        return
      }

      if (authService.getStoredToken()) {
        await refreshUser()
      } else {
        setUser(null)
        setToken(null)
      }
    } catch (err) {
      console.warn('[Auth] 离线或本地单机检测，自动启用本地开源免登模式:', err)
      setIsLocalMode(true)
      setInitialized(true)
      const offlineUser: UserProfile = {
        id: 'local-master',
        username: 'admin',
        displayName: '本地研学者',
        role: 'admin',
        points: 999999,
      }
      setUser(offlineUser)
      setToken('local-open-source-token')
      setPoints(999999)
    } finally {
      setIsLoading(false)
    }
  }, [refreshUser])

  useEffect(() => {
    checkStatus()

    const onUnauthorized = () => {
      setUser(null)
      setToken(null)
      authService.setStoredToken(null)
      authService.setStoredUser(null)
    }

    const onPointsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ points: number }>
      if (customEvent.detail && typeof customEvent.detail.points === 'number') {
        setPoints(customEvent.detail.points)
      }
    }

    window.addEventListener('auth-unauthorized', onUnauthorized)
    window.addEventListener('points-updated', onPointsUpdated)
    return () => {
      window.removeEventListener('auth-unauthorized', onUnauthorized)
      window.removeEventListener('points-updated', onPointsUpdated)
    }
  }, [checkStatus])

  const updatePointsDirectly = useCallback((newPoints: number) => {
    setPoints(newPoints)
  }, [])

  const handleCheckin = useCallback(async (): Promise<CheckinResult> => {
    return { success: true, points: 999999, earned: 0, message: '开源单机版无需打卡，拥有完整无限制特权', lastCheckinAt: new Date().toISOString() }
  }, [])

  const handleRedeemCoupon = useCallback(async (_code: string): Promise<RedeemCouponResult> => {
    return { success: true, points: 999999, earned: 0, message: '开源单机版无需兑换码，已全量放行全部功能' }
  }, [])

  const handleRecharge = useCallback(async (_amount: number, _channel?: string): Promise<RechargeResult> => {
    return { success: true, points: 999999, recharged: 0, message: '开源单机版完全免费无内购' }
  }, [])

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await authService.login({ username, password })
      setUser(res.user)
      setToken(res.token)
      if (typeof res.user.points === 'number') {
        setPoints(res.user.points)
      }
      setLastCheckinAt(res.user.lastCheckinAt)
      await refreshPoints()
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (username: string, password: string, displayName?: string) => {
    setIsLoading(true)
    try {
      const res = await authService.register({ username, password, displayName })
      setUser(res.user)
      setToken(res.token)
      if (typeof res.user.points === 'number') {
        setPoints(res.user.points)
      }
      setLastCheckinAt(res.user.lastCheckinAt)
      await refreshPoints()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (payload: ResetPasswordPayload) => {
    return await authService.resetPassword(payload)
  }

  const handleInitAdmin = async (username: string, password: string, displayName?: string) => {
    setIsLoading(true)
    try {
      const res = await authService.initAdmin({ username, password, displayName })
      setUser(res.user)
      setToken(res.token)
      setInitialized(true)
      if (typeof res.user.points === 'number') {
        setPoints(res.user.points)
      }
      await refreshPoints()
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
    } finally {
      setUser(null)
      setToken(null)
    }
  }

  const role: UserRole | undefined = user?.role

  // 区分「开源桌面端/本地单机运行」与「线上多租户云端生产站」
  const isElectron = typeof window !== 'undefined' && Boolean((window as any).electronAPI || (window as any).electron)
  const isLocalHost = typeof window !== 'undefined' && Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:'
  )
  const isLocalStandalone = isLocalMode || isElectron || isLocalHost

  // 在发布的开源桌面端与本地运行环境下，用户就是自己机器的主人，默认全权赋予超级管理员权限
  const isAuthenticated = Boolean((user && token) || isLocalStandalone)
  const isAdmin = isLocalStandalone ? true : (role === 'admin')
  const isEditor = isLocalStandalone || role === 'editor'
  const isStudent = !isLocalStandalone && role === 'student'
  const canWriteVault = isLocalStandalone || isAdmin || isEditor
  const effectivePoints = isLocalStandalone ? 999999 : points

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        initialized,
        isAuthenticated,
        isLocalMode: isLocalStandalone,
        isAdmin,
        isEditor,
        isStudent,
        canWriteVault,
        points: effectivePoints,
        canCheckinToday,
        lastCheckinAt,
        checkin: handleCheckin,
        redeemCoupon: handleRedeemCoupon,
        recharge: handleRecharge,
        refreshPoints,
        updatePointsDirectly,
        login: handleLogin,
        register: handleRegister,
        initAdmin: handleInitAdmin,
        resetPassword: handleResetPassword,
        logout: handleLogout,
        refreshUser,
        checkStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 作用域内使用')
  }
  return context
}
