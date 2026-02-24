import type { ServerWebSocket } from 'bun'
import { wsManager, type WSData } from '../WebSocketManager'

export function registerChatHandlers() {
  wsManager.registerHandler('chat:send_message', (ws: ServerWebSocket<WSData>, data: Record<string, unknown>) => {
    const { conversationId, content, type, replyToId, attachments } = data as {
      conversationId: string
      content: string
      type?: string
      replyToId?: string
      attachments?: unknown[]
    }

    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      conversationId,
      senderId: ws.data.userId,
      type: type ?? 'text',
      content,
      replyToId,
      attachments: attachments ?? [],
      createdAt: new Date().toISOString(),
    }

    // An alle im Raum senden (inkl. Sender)
    wsManager.sendToRoom(conversationId, 'chat:new_message', { message })
  })

  wsManager.registerHandler('chat:typing_start', (ws: ServerWebSocket<WSData>, data: Record<string, unknown>) => {
    const { conversationId } = data as { conversationId: string }
    wsManager.sendToRoom(conversationId, 'chat:typing', {
      conversationId,
      userId: ws.data.userId,
      isTyping: true,
    }, ws.data.userId)
  })

  wsManager.registerHandler('chat:typing_stop', (ws: ServerWebSocket<WSData>, data: Record<string, unknown>) => {
    const { conversationId } = data as { conversationId: string }
    wsManager.sendToRoom(conversationId, 'chat:typing', {
      conversationId,
      userId: ws.data.userId,
      isTyping: false,
    }, ws.data.userId)
  })

  wsManager.registerHandler('chat:mark_read', (_ws: ServerWebSocket<WSData>, data: Record<string, unknown>) => {
    const { conversationId, messageId } = data as { conversationId: string; messageId: string }
    wsManager.sendToRoom(conversationId, 'chat:message_read', {
      conversationId,
      messageId,
      userId: _ws.data.userId,
    })
  })

  wsManager.registerHandler('chat:add_reaction', (ws: ServerWebSocket<WSData>, data: Record<string, unknown>) => {
    const { conversationId, messageId, emoji } = data as { conversationId: string; messageId: string; emoji: string }
    wsManager.sendToRoom(conversationId, 'chat:reaction_added', {
      conversationId,
      messageId,
      userId: ws.data.userId,
      emoji,
    })
  })

  wsManager.registerHandler('chat:join', (ws: ServerWebSocket<WSData>, data: Record<string, unknown>) => {
    const { conversationId } = data as { conversationId: string }
    wsManager.joinRoom(conversationId, ws.data.userId)
  })

  wsManager.registerHandler('chat:leave', (ws: ServerWebSocket<WSData>, data: Record<string, unknown>) => {
    const { conversationId } = data as { conversationId: string }
    wsManager.leaveRoom(conversationId, ws.data.userId)
  })
}
