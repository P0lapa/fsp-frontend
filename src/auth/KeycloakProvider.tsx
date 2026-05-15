import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import type { KeycloakProfile } from 'keycloak-js'
import keycloak from './keycloak'
import {
  AuthContext,
  type AuthContextValue,
  type AuthProfile,
  type AuthState,
} from './AuthContext'

type AuthProviderProps = {
  children: ReactNode
}

function getTokenValue(key: string): string {
  const value = keycloak.tokenParsed?.[key]

  return typeof value === 'string' ? value : ''
}

function mapProfile(keycloakProfile: KeycloakProfile | null): AuthProfile | null {
  if (!keycloakProfile && !keycloak.tokenParsed) {
    return null
  }

  return {
    username:
      keycloakProfile?.username ||
      getTokenValue('preferred_username'),

    email:
      keycloakProfile?.email ||
      getTokenValue('email'),

    firstName:
      keycloakProfile?.firstName ||
      getTokenValue('given_name'),

    lastName:
      keycloakProfile?.lastName ||
      getTokenValue('family_name'),

    subject:
      keycloak.subject ||
      getTokenValue('sub'),
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isInitialized: false,
    isAuthenticated: false,
    profile: null,
  })

  useEffect(() => {
    let isMounted = true

    async function initialize() {
      try {
        const isAuthenticated = await keycloak.init({
          onLoad: 'check-sso',
          pkceMethod: 'S256',
          checkLoginIframe: false,
        })

        let profile: AuthProfile | null = null

        if (isAuthenticated) {
          try {
            const loadedProfile = await keycloak.loadUserProfile()
            profile = mapProfile(loadedProfile)
          } catch {
            profile = mapProfile(null)
          }
        }

        if (!isMounted) {
          return
        }

        setAuthState({
          isInitialized: true,
          isAuthenticated,
          profile,
        })
      } catch (error) {
        console.error('Keycloak initialization failed:', error)

        if (!isMounted) {
          return
        }

        setAuthState({
          isInitialized: true,
          isAuthenticated: false,
          profile: null,
        })
      }
    }

    initialize()

    return () => {
      isMounted = false
    }
  }, [])

  const login = useCallback(() => {
    return keycloak.login({
      redirectUri: window.location.origin,
    })
  }, [])

  const register = useCallback(() => {
    return keycloak.register({
      redirectUri: window.location.origin,
    })
  }, [])

  const logout = useCallback(() => {
    return keycloak.logout({
      redirectUri: window.location.origin,
    })
  }, [])

  const getToken = useCallback(async () => {
    if (!keycloak.authenticated) {
      return undefined
    }

    try {
      await keycloak.updateToken(30)
      return keycloak.token
    } catch (error) {
      console.error('Failed to refresh Keycloak token:', error)
      await keycloak.login({
        redirectUri: window.location.origin,
      })
      return undefined
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...authState,
      login,
      register,
      logout,
      getToken,
    }),
    [authState, login, register, logout, getToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
