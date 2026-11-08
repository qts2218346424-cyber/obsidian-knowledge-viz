import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { UserProfile, UserRole, CheckinResult } from '../types/auth'
import * as authService from '../services/auth'

export interface AuthContextValue {
  user: UserProfile | null
  token: string | null
  isLoading: boolean
  initialized: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isEditor: boolean
  isStudent: boolean
  canWriteVault: boolean
  points: number
  canCheckinToday: boolean
  lastCheckinAt?: string
  checkin: () => Promise<CheckinResult>
  refreshPoints: () => Promise<void>
  updatePointsDirectly: (newPoints: number) => void
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, displayName?: string) => Promise<void>
  initAdmin: (username: string, password: string, displayName?: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  checkStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(authService.getStoredToken())
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [initialized, setInitialized] = useState<boolean>(true)
  const [points, setPoints] = useState<number>(5.0)
  const [lastCheckinAt, setLastCheckinAt] = useState<string | undefined>(undefined)
  const [canCheckinToday, setCanCheckinToday] = useState<boolean>(true)

  const refreshPoints = useCallback(async () => {
    if (!authService.getStoredToken()) return
    try {
      const data = await authService.getUserPoints()
      setPoints(data.points)
      setLastCheckinAt(data.lastCheckinAt)
      setCanCheckinToday(data.canCheckinToday)
    } catch {
      // ignore
    }
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
      if (typeof data.user.points === 'number') {
        setPoints(data.user.points)
      }
      setLastCheckinAt(data.user.lastCheckinAt)
      await refreshPoints()
    } catch {
      setUser(null)
      setToken(null)
      authService.setStoredToken(null)
    }
  }, [refreshPoints])

  const checkStatus = useCallback(async () => {
    try {
      setIsLoading(true)
      const status = await authService.getAuthStatus()
      setInitialized(status.initialized)

      if (authService.getStoredToken()) {
        await refreshUser()
      } else {
        setUser(null)
        setToken(null)
      }
    } catch (err) {
      console.error('[Auth] 检查状态异常:', err)
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
    const res = await authService.checkin()
    if (res.success) {
      setPoints(res.points)
      setLastCheckinAt(res.lastCheckinAt)
      setCanCheckinToday(false)
    }
    return res
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

  const isAuthenticated = Boolean(user && token)
  const role: UserRole | undefined = user?.role
  const isAdmin = role === 'admin'
  const isEditor = role === 'editor'
  const isStudent = role === 'student'
  const canWriteVault = isAdmin || isEditor

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        initialized,
        isAuthenticated,
        isAdmin,
        isEditor,
        isStudent,
        canWriteVault,
        points,
        canCheckinToday,
        lastCheckinAt,
        checkin: handleCheckin,
        refreshPoints,
        updatePointsDirectly,
        login: handleLogin,
        register: handleRegister,
        initAdmin: handleInitAdmin,
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
