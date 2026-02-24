import { app } from './app'
import { env } from './config/env'
import { runMigrations } from './db/migrate'
import { wsManager, type WSData } from './ws/WebSocketManager'
import { registerChatHandlers } from './ws/handlers/chatHandler'
import { registerPresenceHandlers } from './ws/handlers/presenceHandler'
import { registerCallSignalingHandlers } from './ws/handlers/callSignalingHandler'
import { jwtVerify } from 'jose'

await runMigrations()

// WebSocket-Handler registrieren
registerChatHandlers()
registerPresenceHandlers()
registerCallSignalingHandlers()

console.log(`ImpulsCloud Server laeuft auf ${env.HOST}:${env.PORT}`)

const jwtSecret = new TextEncoder().encode(env.JWT_SECRET)

const server = Bun.serve<WSData>({
  port: env.PORT,
  hostname: env.HOST,
  async fetch(req, server) {
    const url = new URL(req.url)

    // WebSocket Upgrade für /ws — mit JWT-Verifikation (Sicherheit!)
    if (url.pathname === '/ws') {
      const token = url.searchParams.get('token')
      if (!token) {
        return new Response('Token erforderlich', { status: 401 })
      }

      // JWT verifizieren — nur authentifizierte User dürfen verbinden
      let userId: string
      try {
        const { payload } = await jwtVerify(token, jwtSecret)
        if (!payload.sub) {
          return new Response('Ungueltiger Token', { status: 401 })
        }
        userId = payload.sub
      } catch {
        return new Response('Ungueltiger oder abgelaufener Token', { status: 401 })
      }

      const success = server.upgrade(req, {
        data: {
          userId,
          connectionId: crypto.randomUUID(),
        },
      })
      if (success) return undefined
      return new Response('WebSocket Upgrade fehlgeschlagen', { status: 500 })
    }

    // Normale HTTP-Requests an Hono weiterleiten
    return app.fetch(req)
  },
  websocket: {
    open(ws) {
      wsManager.addConnection(ws.data.userId, ws)
      wsManager.broadcast('presence:changed', {
        userId: ws.data.userId,
        status: 'online',
      }, ws.data.userId)
      console.log(`WebSocket verbunden: ${ws.data.userId}`)
    },
    message(ws, message) {
      wsManager.handleMessage(ws, String(message))
    },
    close(ws) {
      wsManager.removeConnection(ws.data.userId, ws)
      if (!wsManager.isOnline(ws.data.userId)) {
        wsManager.broadcast('presence:changed', {
          userId: ws.data.userId,
          status: 'offline',
        })
      }
      console.log(`WebSocket getrennt: ${ws.data.userId}`)
    },
  },
})

console.log(`WebSocket Server bereit auf ws://${env.HOST}:${env.PORT}/ws`)
