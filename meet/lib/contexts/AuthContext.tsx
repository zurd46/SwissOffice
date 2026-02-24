'use client'

// Meet-spezifischer Auth-Context — nutzt den Shared AuthContext
// und fügt Meet-spezifische Methoden hinzu (Presence, Custom Status)

import { createContext, useContext, useCallback, useState, type ReactNode } from 'react'
import { useAuth as useSharedAuth } from '@shared/contexts/AuthContext'
import type { User, PresenceStatus } from '@/lib/types'

interface MeetAuthContextValue {
  currentUser: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updatePresence: (status: PresenceStatus) => void
  updateCustomStatus: (message: string) => void
}

const MeetAuthContext = createContext<MeetAuthContextValue | null>(null)

export function MeetAuthProvider({ children }: { children: ReactNode }) {
  const shared = useSharedAuth()
  const [presence, setPresence] = useState<PresenceStatus>('online')
  const [customStatus, setCustomStatus] = useState<string>('')

  // Shared User auf Meet User-Format mappen
  const currentUser: User | null = shared.user
    ? {
        id: shared.user.id,
        email: shared.user.email,
        displayName: shared.user.displayName,
        presence,
        customStatus,
        createdAt: shared.user.createdAt ?? new Date().toISOString(),
      }
    : null

  const updatePresence = useCallback((status: PresenceStatus) => {
    setPresence(status)
  }, [])

  const updateCustomStatus = useCallback((message: string) => {
    setCustomStatus(message)
  }, [])

  return (
    <MeetAuthContext.Provider value={{
      currentUser,
      isAuthenticated: shared.isAuthenticated,
      isLoading: shared.isLoading,
      login: shared.login,
      logout: shared.logout,
      updatePresence,
      updateCustomStatus,
    }}>
      {children}
    </MeetAuthContext.Provider>
  )
}

export function useAuth(): MeetAuthContextValue {
  const context = useContext(MeetAuthContext)
  if (!context) throw new Error('useAuth muss innerhalb von MeetAuthProvider verwendet werden')
  return context
}
