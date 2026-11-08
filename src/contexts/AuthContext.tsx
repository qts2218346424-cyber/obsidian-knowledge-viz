import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { UserProfile, UserRole } from '../types/auth'
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
    } catch {
      setUser(null)
      setToken(null)
      authService.setStoredToken(null)
    }
  }, [])

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

    window.addEventListener('auth-unauthorized', onUnauthorized)
    return () => {
      window.removeEventListener('auth-unauthorized', onUnauthorized)
    }
  }, [checkStatus])

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await authService.login({ username, password })
      setUser(res.user)
      setToken(res.token)
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
