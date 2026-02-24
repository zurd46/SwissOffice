// WebSocket-Client mit Auto-Reconnect und JWT-Auth
//
// SICHERHEIT:
// - Verbindung nur mit gültigem JWT-Token (als Query-Param 'token')
// - Server verifiziert Token bei WebSocket-Upgrade
// - Auto-Reconnect mit Exponential Backoff (1s → 30s max)
// - Kein Klartext-userId im Query-Param

export type WsMessageHandler = (data: Record<string, unknown>) => void

interface WsClientOptions {
  baseUrl: string
  getToken: () => string | null
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

export interface WsClient {
  connect: () => void
  disconnect: () => void
  send: (type: string, data: Record<string, unknown>) => void
  on: (type: string, handler: WsMessageHandler) => void
  off: (type: string, handler: WsMessageHandler) => void
  isConnected: () => boolean
}

export function createWsClient(options: WsClientOptions): WsClient {
  let ws: WebSocket | null = null
  let reconnectAttempts = 0
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let intentionalClose = false
  const handlers = new Map<string, Set<WsMessageHandler>>()

  const MAX_RECONNECT_DELAY = 30000
  const BASE_RECONNECT_DELAY = 1000

  function getReconnectDelay(): number {
    const delay = Math.min(
      BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts),
      MAX_RECONNECT_DELAY,
    )
    // Jitter: ±25% Zufall, um Thundering Herd zu vermeiden
    const jitter = delay * 0.25 * (Math.random() * 2 - 1)
    return Math.round(delay + jitter)
  }

  function emit(type: string, data: Record<string, unknown>): void {
    const typeHandlers = handlers.get(type)
    if (typeHandlers) {
      for (const handler of typeHandlers) {
        try {
          handler(data)
        } catch (err) {
          console.error(`WebSocket Handler-Fehler für "${type}":`, err)
        }
      }
    }
  }

  function connect(): void {
    const token = options.getToken()
    if (!token) {
      console.warn('WebSocket: Kein Token verfügbar, Verbindung nicht möglich')
      return
    }

    // Bestehende Verbindung schliessen
    if (ws) {
      intentionalClose = true
      ws.close()
    }

    intentionalClose = false

    // ws:// oder wss:// basierend auf http:// oder https://
    const wsProtocol = options.baseUrl.startsWith('https') ? 'wss' : 'ws'
    const host = options.baseUrl.replace(/^https?:\/\//, '')
    const url = `${wsProtocol}://${host}/ws?token=${encodeURIComponent(token)}`

    ws = new WebSocket(url)

    ws.onopen = () => {
      reconnectAttempts = 0
      options.onConnect?.()
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(String(event.data)) as { type: string } & Record<string, unknown>
        emit(message.type, message)
      } catch {
        console.error('WebSocket: Ungültige Nachricht empfangen')
      }
    }

    ws.onclose = () => {
      ws = null
      options.onDisconnect?.()

      if (!intentionalClose) {
        // Auto-Reconnect mit Exponential Backoff
        const delay = getReconnectDelay()
        reconnectAttempts++
        reconnectTimer = setTimeout(() => {
          connect()
        }, delay)
      }
    }

    ws.onerror = (event) => {
      options.onError?.(event)
    }
  }

  function disconnect(): void {
    intentionalClose = true
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (ws) {
      ws.close()
      ws = null
    }
  }

  function send(type: string, data: Record<string, unknown>): void {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket: Nicht verbunden, Nachricht wird verworfen')
      return
    }
    ws.send(JSON.stringify({ type, ...data }))
  }

  function on(type: string, handler: WsMessageHandler): void {
    if (!handlers.has(type)) {
      handlers.set(type, new Set())
    }
    handlers.get(type)!.add(handler)
  }

  function off(type: string, handler: WsMessageHandler): void {
    const typeHandlers = handlers.get(type)
    if (typeHandlers) {
      typeHandlers.delete(handler)
      if (typeHandlers.size === 0) {
        handlers.delete(type)
      }
    }
  }

  function isConnected(): boolean {
    return ws !== null && ws.readyState === WebSocket.OPEN
  }

  return { connect, disconnect, send, on, off, isConnected }
}
