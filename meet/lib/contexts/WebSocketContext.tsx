'use client'

import { createContext, useContext, useEffect, useRef, useCallback, useState, type ReactNode } from 'react'
import { createWsClient, type WsClient, type WsMessageHandler } from '@shared/ws/wsClient'
import { getAccessToken } from '@shared/api/tokenManager'
import { useAuth } from './AuthContext'

interface WebSocketContextValue {
  isConnected: boolean
  send: (type: string, data: Record<string, unknown>) => void
  on: (type: string, handler: WsMessageHandler) => void
  off: (type: string, handler: WsMessageHandler) => void
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null)

const CLOUD_WS_URL = 'http://localhost:4000'

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const wsClientRef = useRef<WsClient | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      if (wsClientRef.current) {
        wsClientRef.current.disconnect()
        wsClientRef.current = null
      }
      setIsConnected(false)
      return
    }

    const client = createWsClient({
      baseUrl: CLOUD_WS_URL,
      getToken: getAccessToken,
      onConnect: () => setIsConnected(true),
      onDisconnect: () => setIsConnected(false),
    })

    wsClientRef.current = client
    client.connect()

    return () => {
      client.disconnect()
      wsClientRef.current = null
      setIsConnected(false)
    }
  }, [isAuthenticated])

  const send = useCallback((type: string, data: Record<string, unknown>) => {
    wsClientRef.current?.send(type, data)
  }, [])

  const on = useCallback((type: string, handler: WsMessageHandler) => {
    wsClientRef.current?.on(type, handler)
  }, [])

  const off = useCallback((type: string, handler: WsMessageHandler) => {
    wsClientRef.current?.off(type, handler)
  }, [])

  return (
    <WebSocketContext.Provider value={{ isConnected, send, on, off }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket(): WebSocketContextValue {
  const context = useContext(WebSocketContext)
  if (!context) throw new Error('useWebSocket muss innerhalb von WebSocketProvider verwendet werden')
  return context
}
