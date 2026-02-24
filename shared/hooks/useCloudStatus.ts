'use client'

import { useState, useEffect, useCallback } from 'react'

export interface CloudStatus {
  isOnline: boolean
  isCloudReachable: boolean
  lastCheck: number | null
}

const HEALTH_CHECK_INTERVAL = 30000 // 30 Sekunden

export function useCloudStatus(cloudBaseUrl: string): CloudStatus {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [isCloudReachable, setIsCloudReachable] = useState<boolean>(false)
  const [lastCheck, setLastCheck] = useState<number | null>(null)

  const checkCloudHealth = useCallback(async () => {
    if (!isOnline) {
      setIsCloudReachable(false)
      return
    }

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      const res = await fetch(`${cloudBaseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      })
      clearTimeout(timeout)

      setIsCloudReachable(res.ok)
    } catch {
      setIsCloudReachable(false)
    }
    setLastCheck(Date.now())
  }, [cloudBaseUrl, isOnline])

  // Browser Online/Offline Events
  useEffect(() => {
    function handleOnline() { setIsOnline(true) }
    function handleOffline() {
      setIsOnline(false)
      setIsCloudReachable(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Periodischer Health-Check
  useEffect(() => {
    checkCloudHealth()
    const interval = setInterval(checkCloudHealth, HEALTH_CHECK_INTERVAL)
    return () => clearInterval(interval)
  }, [checkCloudHealth])

  return { isOnline, isCloudReachable, lastCheck }
}
