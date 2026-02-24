'use client'

import { useEffect, type ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface AuthGuardProps {
  children: ReactNode
  loginPath?: string
}

export function AuthGuard({ children, loginPath = '/login' }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = loginPath
    }
  }, [isAuthenticated, isLoading, loginPath])

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'system-ui, sans-serif',
        color: '#666',
      }}>
        Laden...
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
