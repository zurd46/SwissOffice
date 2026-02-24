'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useCloudStatus, type CloudStatus } from '../hooks/useCloudStatus'

const CLOUD_BASE_URL = 'http://localhost:4000'

interface CloudContextValue {
  status: CloudStatus
  cloudBaseUrl: string
}

const CloudContext = createContext<CloudContextValue | null>(null)

export function CloudProvider({ children }: { children: ReactNode }) {
  const status = useCloudStatus(CLOUD_BASE_URL)

  return (
    <CloudContext.Provider value={{ status, cloudBaseUrl: CLOUD_BASE_URL }}>
      {children}
    </CloudContext.Provider>
  )
}

export function useCloud(): CloudContextValue {
  const context = useContext(CloudContext)
  if (!context) throw new Error('useCloud muss innerhalb von CloudProvider verwendet werden')
  return context
}
