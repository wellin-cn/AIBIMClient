import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { User } from '../types'

export interface AuthState {
  // 认证状态
  isAuthenticated: boolean
  currentUser: User | null
  
  // 连接信息
  serverUrl: string
  username: string
  
  // 会话状态
  sessionId: string | null
  lastLoginTime: Date | null
  autoConnect: boolean
  
  // UI状态
  isLoggingIn: boolean
  loginError: string | null
}

export interface AuthActions {
  // 认证操作
  login: (username: string, serverUrl: string) => void
  logout: () => void
  setCurrentUser: (user: User | null) => void
  
  // 连接设置
  setServerUrl: (url: string) => void
  setUsername: (username: string) => void
  setAutoConnect: (autoConnect: boolean) => void
  
  // 会话管理
  setSessionId: (sessionId: string | null) => void
  updateLastLoginTime: () => void
  
  // UI状态
  setLoggingIn: (loading: boolean) => void
  setLoginError: (error: string | null) => void
  clearLoginError: () => void
}

export type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  isAuthenticated: false,
  currentUser: null,
  serverUrl: 'http://localhost:3001',
  username: '',
  sessionId: null,
  lastLoginTime: null,
  autoConnect: false,
  isLoggingIn: false,
  loginError: null,
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // 认证操作
        login: (username: string, serverUrl: string) => {
          set({
            username: username.trim(),
            serverUrl: serverUrl.trim(),
            isLoggingIn: true,
            loginError: null,
          }, false, 'login')
        },

        logout: () => {
          set({
            isAuthenticated: false,
            currentUser: null,
            sessionId: null,
            isLoggingIn: false,
            loginError: null,
          }, false, 'logout')
        },

        setCurrentUser: (user: User | null) => {
          set((state) => ({
            currentUser: user,
            isAuthenticated: !!user,
            isLoggingIn: false,
            lastLoginTime: user ? new Date() : state.lastLoginTime,
          }), false, 'setCurrentUser')
        },

        // 连接设置
        setServerUrl: (url: string) => {
          set({ serverUrl: url.trim() }, false, 'setServerUrl')
        },

        setUsername: (username: string) => {
          set({ username: username.trim() }, false, 'setUsername')
        },

        setAutoConnect: (autoConnect: boolean) => {
          set({ autoConnect }, false, 'setAutoConnect')
        },

        // 会话管理
        setSessionId: (sessionId: string | null) => {
          set({ sessionId }, false, 'setSessionId')
        },

        updateLastLoginTime: () => {
          set({ lastLoginTime: new Date() }, false, 'updateLastLoginTime')
        },

        // UI状态
        setLoggingIn: (loading: boolean) => {
          set({ isLoggingIn: loading }, false, 'setLoggingIn')
        },

        setLoginError: (error: string | null) => {
          set({ 
            loginError: error,
            isLoggingIn: false,
          }, false, 'setLoginError')
        },

        clearLoginError: () => {
          set({ loginError: null }, false, 'clearLoginError')
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          // 持久化用户配置，但不包括敏感信息
          serverUrl: state.serverUrl,
          username: state.username,
          autoConnect: state.autoConnect,
          lastLoginTime: state.lastLoginTime,
        }),
        onRehydrateStorage: () => (state) => {
          // 重新水合时重置认证状态
          if (state) {
            state.isAuthenticated = false
            state.currentUser = null
            state.sessionId = null
            state.isLoggingIn = false
            state.loginError = null
          }
        },
      }
    ),
    { name: 'AuthStore' }
  )
)

// 选择器函数
export const useCurrentUser = () => useAuthStore(state => state.currentUser)
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated)
export const useLoginState = () => useAuthStore(state => ({
  isLoggingIn: state.isLoggingIn,
  loginError: state.loginError,
}))
export const useConnectionSettings = () => useAuthStore(state => ({
  serverUrl: state.serverUrl,
  username: state.username,
  autoConnect: state.autoConnect,
}))