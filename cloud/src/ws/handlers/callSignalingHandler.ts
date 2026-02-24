import type { ServerWebSocket } from 'bun'
import { wsManager, type WSData } from '../WebSocketManager'

export function registerCallSignalingHandlers() {
  // Anruf starten
  wsManager.registerHandler('call:initiate', (ws: ServerWebSocket<WSData>, data: Record<string, unknown>) => {
    const { callId, targetUserId, type } = data as { callId: string; targetUserId: string; type: 'audio' | 'video' }
    wsManager.sendToUser(targetUserId, 'call:incoming', {
      callId,
      callerId: ws.data.userId,
      type,
    })
    wsManager.joinRoom(`call-${callId}`, ws.data.userId)
  })

  // Anruf annehmen
  wsManager.registerHandler('call:accept', (ws: ServerWebSocket<WSData>, data: Record<string, unknown>) => {
    const { callId } = data as { callId: string }
    wsManager.joinRoom(`call-${callId}`, ws.data.userId)
    wsManager.sendToRoom(`call-${callId}`, 'call:accepted', {
      callId,
      userId: ws.data.userId,
    }, ws.data.userId)
  })

  // Anruf ablehnen
  wsManager.registerHandler('call:decline', (ws: ServerWebSocket<WSData>, data: Record<string, unknown>) => {
    const { callId } = data as { callId: string }
    wsManager.sendToRoom(`call-${callId}`, 'call:declined', {
      callId,
      userId: ws.data.userId,
    })
  })

  // Anruf beenden
  wsManager.registerHandler('call:end', (ws: ServerWebSocket<WSData>, data: Record<string, unknown>) => {
    const { callId } = data as { callId: string }
    wsManager.sendToRoom(`call-${callId}`, 'call:ended', {
      callId,
      userId: ws.data.userId,
    })
  })

  // WebRTC Offer
  wsManager.registerHandler('call:offer', (ws: ServerWebSocket<WSData>, data: Record<string, unknown>) => {
    const { callId, targetUserId, sdp } = data as { callId: string; targetUserId: string; sdp: unknown }
    wsManager.sendToUser(targetUserId, 'call:offer', {
      callId,
      userId: ws.data.userId,
      sdp,
    })
  })

  // WebRTC Answer
  wsManager.registerHandler('call:answer', (ws: ServerWebSocket<WSData>, data: Record<string, unknown>) => {
    const { callId, targetUserId, sdp } = data as { callId: string; targetUserId: string; sdp: unknown }
    wsManager.sendToUser(targetUserId, 'call:answer', {
      callId,
      userId: ws.data.userId,
      sdp,
    })
  })

  // ICE Candidate
  wsManager.registerHandler('call:ice_candidate', (ws: ServerWebSocket<WSData>, data: Record<string, unknown>) => {
    const { callId, targetUserId, candidate } = data as { callId: string; targetUserId: string; candidate: unknown }
    wsManager.sendToUser(targetUserId, 'call:ice_candidate', {
      callId,
      userId: ws.data.userId,
      candidate,
    })
  })

  // Media State Update
  wsManager.registerHandler('call:media_state', (ws: ServerWebSocket<WSData>, data: Record<string, unknown>) => {
    const { callId, mediaState } = data as { callId: string; mediaState: unknown }
    wsManager.sendToRoom(`call-${callId}`, 'call:media_state_changed', {
      callId,
      userId: ws.data.userId,
      mediaState,
    }, ws.data.userId)
  })

  // Hand heben
  wsManager.registerHandler('call:raise_hand', (ws: ServerWebSocket<WSData>, data: Record<string, unknown>) => {
    const { callId, raised } = data as { callId: string; raised: boolean }
    wsManager.sendToRoom(`call-${callId}`, 'call:hand_raised', {
      callId,
      userId: ws.data.userId,
      raised,
    }, ws.data.userId)
  })
}
