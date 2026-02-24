'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { createApiClient, type ApiClient } from '../api/client'
import {
  setTokens,
  clearTokens,
  getRefreshToken,
  getAccessToken,
  hasStoredRefreshToken,
  scheduleTokenRefresh,
} from '../api/tokenManager'
import type {
  AuthUser,
  LoginResponse,
  RefreshResponse,
  ProfileResponse,
} from '../api/types'

const CLOUD_BASE_URL = 'http://localhost:4000'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  apiClient: ApiClient
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [apiClient] = useState(() => createApiClient(CLOUD_BASE_URL))

  // Automatischen Token-Refresh planen
  const scheduleRefresh = useCallback(() => {
    scheduleTokenRefresh(async () => {
      const refreshTokenValue = getRefreshToken()
      if (!refreshTokenValue) return

      const res = await apiClient.post<RefreshResponse>('/api/v1/auth/refresh', {
        refreshToken: refreshTokenValue,
      })

      if (res.ok && res.data) {
        setTokens(res.data.accessToken, res.data.refreshToken)
        scheduleRefresh()
      } else {
        clearTokens()
        setUser(null)
      }
    })
  }, [apiClient])

  // Bei Mount: gespeichertes Refresh-Token prüfen und Session wiederherstellen
  useEffect(() => {
    async function restoreSession() {
      if (!hasStoredRefreshToken()) {
        setIsLoading(false)
        return
      }

      const refreshTokenValue = getRefreshToken()
      if (!refreshTokenValue) {
        setIsLoading(false)
        return
      }

      try {
        // Neues Access-Token holen
        const refreshRes = await apiClient.post<RefreshResponse>('/api/v1/auth/refresh', {
          refreshToken: refreshTokenValue,
        })

        if (!refreshRes.ok || !refreshRes.data) {
          clearTokens()
          setIsLoading(false)
          return
        }

        setTokens(refreshRes.data.accessToken, refreshRes.data.refreshToken)

        // Profil laden
        const profileRes = await apiClient.get<ProfileResponse>('/api/v1/auth/me')
        if (profileRes.ok && profileRes.data) {
          setUser({
            id: profileRes.data.id,
            email: profileRes.data.email,
            displayName: profileRes.data.displayName,
            createdAt: profileRes.data.createdAt,
          })
          scheduleRefresh()
        } else {
          clearTokens()
        }
      } catch {
        clearTokens()
      }

      setIsLoading(false)
    }

    restoreSession()
  }, [apiClient, scheduleRefresh])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post<LoginResponse>('/api/v1/auth/login', { email, password })

    if (!res.ok || !res.data) {
      throw new Error(res.error?.message ?? 'Anmeldung fehlgeschlagen')
    }

    setTokens(res.data.accessToken, res.data.refreshToken)
    setUser(res.data.user)
    scheduleRefresh()
  }, [apiClient, scheduleRefresh])

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const res = await apiClient.post<{ user: AuthUser }>('/api/v1/auth/register', {
      email,
      password,
      displayName,
    })

    if (!res.ok || !res.data) {
      throw new Error(res.error?.message ?? 'Registrierung fehlgeschlagen')
    }

    // Nach Registrierung automatisch einloggen
    await login(email, password)
  }, [apiClient, login])

  const logout = useCallback(async () => {
    const refreshTokenValue = getRefreshToken()
    if (refreshTokenValue) {
      try {
        await apiClient.post('/api/v1/auth/logout', { refreshToken: refreshTokenValue })
      } catch {
        // Server-Logout fehlgeschlagen — lokale Tokens trotzdem löschen
      }
    }
    clearTokens()
    setUser(null)
  }, [apiClient])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      apiClient,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden')
  return context
}
