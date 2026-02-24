import type { ServerWebSocket } from 'bun'
import { wsManager, type WSData } from '../WebSocketManager'

export function registerPresenceHandlers() {
  wsManager.registerHandler('presence:update', (ws: ServerWebSocket<WSData>, data: Record<string, unknown>) => {
    const { status, customMessage } = data as { status: string; customMessage?: string }
    wsManager.broadcast('presence:changed', {
      userId: ws.data.userId,
      status,
      customMessage,
    }, ws.data.userId)
  })

  wsManager.registerHandler('presence:get_online', (ws: ServerWebSocket<WSData>) => {
    const onlineUsers = wsManager.getOnlineUsers()
    wsManager.sendToUser(ws.data.userId, 'presence:online_users', {
      users: onlineUsers,
    })
  })
}
