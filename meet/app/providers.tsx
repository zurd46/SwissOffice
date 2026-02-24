'use client'

import type { ReactNode } from 'react'
import { AuthProvider } from '@shared/contexts/AuthContext'
import { CloudProvider } from '@shared/contexts/CloudContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CloudProvider>
        {children}
      </CloudProvider>
    </AuthProvider>
  )
}
