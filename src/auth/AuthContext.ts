import { createContext, useContext } from 'react'

export type AuthProfile = {
  username: string
  email: string
  firstName: string
  lastName: string
  subject: string
}

export type AuthState = {
  isInitialized: boolean
  isAuthenticated: boolean
  profile: AuthProfile | null
}

export type AuthContextValue = AuthState & {
  login: () => Promise<void>
  register: () => Promise<void>
  logout: () => Promise<void>
  getToken: () => Promise<string | undefined>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
