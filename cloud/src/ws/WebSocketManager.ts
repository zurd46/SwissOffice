import type { ServerWebSocket } from 'bun'

export interface WSData {
  userId: string
  connectionId: string
}

type MessageHandler = (ws: ServerWebSocket<WSData>, data: Record<string, unknown>) => void

class WebSocketManager {
  private connections = new Map<string, Set<ServerWebSocket<WSData>>>()
  private rooms = new Map<string, Set<string>>()
  private handlers = new Map<string, MessageHandler>()

  addConnection(userId: string, ws: ServerWebSocket<WSData>) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set())
    }
    this.connections.get(userId)!.add(ws)
  }

  removeConnection(userId: string, ws: ServerWebSocket<WSData>) {
    const userConns = this.connections.get(userId)
    if (userConns) {
      userConns.delete(ws)
      if (userConns.size === 0) {
        this.connections.delete(userId)
      }
    }
  }

  joinRoom(roomId: string, userId: string) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set())
    }
    this.rooms.get(roomId)!.add(userId)
  }

  leaveRoom(roomId: string, userId: string) {
    const room = this.rooms.get(roomId)
    if (room) {
      room.delete(userId)
      if (room.size === 0) {
        this.rooms.delete(roomId)
      }
    }
  }

  sendToUser(userId: string, type: string, data: Record<string, unknown>) {
    const userConns = this.connections.get(userId)
    if (!userConns) return
    const message = JSON.stringify({ type, ...data })
    for (const ws of userConns) {
      ws.send(message)
    }
  }

  sendToRoom(roomId: string, type: string, data: Record<string, unknown>, excludeUserId?: string) {
    const room = this.rooms.get(roomId)
    if (!room) return
    for (const userId of room) {
      if (userId !== excludeUserId) {
        this.sendToUser(userId, type, data)
      }
    }
  }

  broadcast(type: string, data: Record<string, unknown>, excludeUserId?: string) {
    for (const userId of this.connections.keys()) {
      if (userId !== excludeUserId) {
        this.sendToUser(userId, type, data)
      }
    }
  }

  registerHandler(type: string, handler: MessageHandler) {
    this.handlers.set(type, handler)
  }

  handleMessage(ws: ServerWebSocket<WSData>, raw: string) {
    try {
      const message = JSON.parse(raw) as { type: string } & Record<string, unknown>
      const handler = this.handlers.get(message.type)
      if (handler) {
        handler(ws, message)
      }
    } catch {
      console.error('Ungültige WebSocket-Nachricht:', raw)
    }
  }

  isOnline(userId: string): boolean {
    return this.connections.has(userId) && this.connections.get(userId)!.size > 0
  }

  getOnlineUsers(): string[] {
    return Array.from(this.connections.keys())
  }

  getRoomMembers(roomId: string): string[] {
    return Array.from(this.rooms.get(roomId) ?? [])
  }
}

export const wsManager = new WebSocketManager()
