'use client'

import { useCloud } from '../contexts/CloudContext'
import { useAuth } from '../contexts/AuthContext'

/**
 * Kleiner Verbindungs-Indikator für die StatusBar/TopBar
 * Zeigt grün wenn online + verbunden, grau wenn offline, rot wenn Fehler
 */
export function OnlineIndicator() {
  const { isAuthenticated } = useAuth()
  const { status } = useCloud()

  // Nicht eingeloggt → kein Indikator
  if (!isAuthenticated) return null

  const isConnected = status.isOnline && status.isCloudReachable
  const isOffline = !status.isOnline

  const dotColor = isConnected ? '#22c55e' : isOffline ? '#9ca3af' : '#f59e0b'
  const label = isConnected
    ? 'Cloud verbunden'
    : isOffline
      ? 'Offline'
      : 'Cloud nicht erreichbar'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#666',
        padding: '0 8px',
      }}
      title={label}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          flexShrink: 0,
        }}
      />
      <span>{label}</span>
    </div>
  )
}
