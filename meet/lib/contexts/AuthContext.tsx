'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User, PresenceStatus } from '@/lib/types'

interface AuthContextValue {
  currentUser: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updatePresence: (status: PresenceStatus) => void
  updateCustomStatus: (message: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Demo-User für Entwicklung
const demoUser: User = {
  id: 'user-1',
  email: 'daniel@impulsmeet.local',
  displayName: 'Daniel Zurmühle',
  presence: 'online',
  createdAt: new Date().toISOString(),
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(demoUser)

  const login = useCallback(async (_email: string, _password: string) => {
    // TODO: Echte Auth-Logik über cloud/ Backend
    setCurrentUser(demoUser)
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
  }, [])

  const updatePresence = useCallback((status: PresenceStatus) => {
    setCurrentUser(prev => prev ? { ...prev, presence: status } : null)
  }, [])

  const updateCustomStatus = useCallback((message: string) => {
    setCurrentUser(prev => prev ? { ...prev, customStatus: message } : null)
  }, [])

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      login,
      logout,
      updatePresence,
      updateCustomStatus,
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
