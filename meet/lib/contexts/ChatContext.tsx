'use client'

// ChatContext — verbunden mit Cloud-Backend via REST API + WebSocket
// Conversations und Messages werden vom Server geladen, nicht mehr Demo-Daten

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { useAuth as useSharedAuth } from '@shared/contexts/AuthContext'
import { useWebSocket } from './WebSocketContext'
import { fetchConversations, fetchMessages, sendMessage as apiSendMessage, createConversation as apiCreateConversation } from '@/lib/api/meetApi'
import type { Conversation, Message } from '@/lib/types'
import type { ApiConversation, ApiMessage } from '@/lib/api/meetApi'

interface ChatContextValue {
  conversations: Conversation[]
  activeConversationId: string | null
  activeConversation: Conversation | null
  messages: Map<string, Message[]>
  isLoading: boolean
  setActiveConversation: (id: string | null) => void
  addMessage: (conversationId: string, message: Message) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void
  deleteMessage: (conversationId: string, messageId: string) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  markAsRead: (conversationId: string) => void
  typingUsers: Map<string, string[]>
  setTypingUsers: (conversationId: string, userIds: string[]) => void
  sendChatMessage: (conversationId: string, content: string, replyToId?: string) => Promise<void>
  createNewConversation: (type: 'direct' | 'group', name: string, memberIds: string[]) => Promise<string | null>
}

const ChatContext = createContext<ChatContextValue | null>(null)

// API-Conversation → Frontend-Conversation mappen
function mapConversation(apiConv: ApiConversation): Conversation {
  return {
    id: apiConv.id,
    type: apiConv.type,
    name: apiConv.name ?? 'Unbenannt',
    members: [],
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    createdAt: apiConv.createdAt,
    updatedAt: apiConv.updatedAt,
  }
}

// API-Message → Frontend-Message mappen
function mapMessage(apiMsg: ApiMessage): Message {
  return {
    id: apiMsg.id,
    conversationId: apiMsg.conversationId ?? '',
    senderId: apiMsg.senderId,
    senderName: apiMsg.senderId, // Wird später mit User-Lookup ersetzt
    type: apiMsg.type as Message['type'],
    content: apiMsg.content,
    attachments: [],
    reactions: [],
    isEdited: apiMsg.isEdited,
    isPinned: apiMsg.isPinned,
    readBy: [],
    replyToId: apiMsg.replyToId ?? undefined,
    createdAt: apiMsg.createdAt,
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { apiClient, user } = useSharedAuth()
  const ws = useWebSocket()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map())
  const [typingUsers, setTypingUsersState] = useState<Map<string, string[]>>(new Map())
  const [isLoading, setIsLoading] = useState(true)

  const activeConversation = conversations.find(c => c.id === activeConversationId) ?? null

  // Conversations vom Server laden
  useEffect(() => {
    if (!user) {
      setConversations([])
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function loadConversations() {
      setIsLoading(true)
      const apiConvs = await fetchConversations(apiClient)
      if (!cancelled) {
        setConversations(apiConvs.map(mapConversation))
        setIsLoading(false)
      }
    }

    loadConversations()
    return () => { cancelled = true }
  }, [apiClient, user])

  // Messages laden wenn Conversation gewechselt wird
  useEffect(() => {
    if (!activeConversationId || !user) return

    // Nur laden wenn noch keine Messages gecached sind
    if (messages.has(activeConversationId)) return

    let cancelled = false

    async function loadMessages() {
      const apiMsgs = await fetchMessages(apiClient, activeConversationId!)
      if (!cancelled) {
        setMessages(prev => {
          const next = new Map(prev)
          next.set(activeConversationId!, apiMsgs.map(mapMessage))
          return next
        })
      }
    }

    loadMessages()
    return () => { cancelled = true }
  }, [activeConversationId, apiClient, user, messages])

  // WebSocket-Events für Echtzeit-Nachrichten
  useEffect(() => {
    if (!ws.isConnected) return

    function handleNewMessage(data: Record<string, unknown>) {
      const msg = data as unknown as {
        messageId: string
        conversationId: string
        senderId: string
        senderName: string
        content: string
        type: string
        createdAt: string
      }

      const message: Message = {
        id: msg.messageId,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        senderName: msg.senderName ?? msg.senderId,
        type: (msg.type as Message['type']) ?? 'text',
        content: msg.content,
        attachments: [],
        reactions: [],
        isEdited: false,
        isPinned: false,
        readBy: [msg.senderId],
        createdAt: msg.createdAt ?? new Date().toISOString(),
      }

      setMessages(prev => {
        const next = new Map(prev)
        const existing = next.get(msg.conversationId) ?? []
        // Duplikat-Check
        if (existing.some(m => m.id === message.id)) return prev
        next.set(msg.conversationId, [...existing, message])
        return next
      })

      setConversations(prev => prev.map(c =>
        c.id === msg.conversationId
          ? { ...c, lastMessage: message, updatedAt: message.createdAt }
          : c
      ))
    }

    function handleTyping(data: Record<string, unknown>) {
      const { conversationId, userId, isTyping } = data as {
        conversationId: string
        userId: string
        isTyping: boolean
      }

      setTypingUsersState(prev => {
        const next = new Map(prev)
        const current = next.get(conversationId) ?? []
        if (isTyping && !current.includes(userId)) {
          next.set(conversationId, [...current, userId])
        } else if (!isTyping) {
          next.set(conversationId, current.filter(id => id !== userId))
        }
        return next
      })
    }

    ws.on('chat:new_message', handleNewMessage)
    ws.on('chat:typing', handleTyping)

    return () => {
      ws.off('chat:new_message', handleNewMessage)
      ws.off('chat:typing', handleTyping)
    }
  }, [ws])

  // Chat-Room joinen wenn Conversation gewechselt wird
  useEffect(() => {
    if (!activeConversationId || !ws.isConnected) return

    ws.send('chat:join', { conversationId: activeConversationId })

    return () => {
      ws.send('chat:leave', { conversationId: activeConversationId })
    }
  }, [activeConversationId, ws])

  const setActiveConversation = useCallback((id: string | null) => {
    setActiveConversationId(id)
    if (id) {
      setConversations(prev => prev.map(c =>
        c.id === id ? { ...c, unreadCount: 0 } : c
      ))
    }
  }, [])

  // Nachricht senden — über REST API + WebSocket
  const sendChatMessage = useCallback(async (conversationId: string, content: string, replyToId?: string) => {
    // Optimistisches Update: sofort lokal anzeigen
    const tempId = crypto.randomUUID()
    const optimisticMessage: Message = {
      id: tempId,
      conversationId,
      senderId: user?.id ?? '',
      senderName: user?.displayName ?? '',
      type: 'text',
      content,
      attachments: [],
      reactions: [],
      isEdited: false,
      isPinned: false,
      readBy: [user?.id ?? ''],
      replyToId,
      createdAt: new Date().toISOString(),
    }

    setMessages(prev => {
      const next = new Map(prev)
      const existing = next.get(conversationId) ?? []
      next.set(conversationId, [...existing, optimisticMessage])
      return next
    })

    // API-Call
    const serverMsgId = await apiSendMessage(apiClient, conversationId, content, 'text', replyToId)

    // Temp-ID mit Server-ID ersetzen
    if (serverMsgId) {
      setMessages(prev => {
        const next = new Map(prev)
        const existing = next.get(conversationId) ?? []
        next.set(conversationId, existing.map(m =>
          m.id === tempId ? { ...m, id: serverMsgId } : m
        ))
        return next
      })
    }

    // WebSocket benachrichtigen (für andere Clients)
    ws.send('chat:send_message', {
      conversationId,
      content,
      type: 'text',
      replyToId,
    })
  }, [apiClient, user, ws])

  // Neue Conversation erstellen
  const createNewConversation = useCallback(async (
    type: 'direct' | 'group',
    name: string,
    memberIds: string[],
  ): Promise<string | null> => {
    const convId = await apiCreateConversation(apiClient, { type, name, memberIds })
    if (convId) {
      const newConv: Conversation = {
        id: convId,
        type,
        name,
        members: [],
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setConversations(prev => [newConv, ...prev])
    }
    return convId
  }, [apiClient])

  const addMessage = useCallback((conversationId: string, message: Message) => {
    setMessages(prev => {
      const next = new Map(prev)
      const existing = next.get(conversationId) ?? []
      next.set(conversationId, [...existing, message])
      return next
    })
    setConversations(prev => prev.map(c =>
      c.id === conversationId
        ? { ...c, lastMessage: message, updatedAt: message.createdAt }
        : c
    ))
  }, [])

  const updateMessage = useCallback((conversationId: string, messageId: string, updates: Partial<Message>) => {
    setMessages(prev => {
      const next = new Map(prev)
      const existing = next.get(conversationId) ?? []
      next.set(conversationId, existing.map(m =>
        m.id === messageId ? { ...m, ...updates } : m
      ))
      return next
    })
  }, [])

  const deleteMessage = useCallback((conversationId: string, messageId: string) => {
    setMessages(prev => {
      const next = new Map(prev)
      const existing = next.get(conversationId) ?? []
      next.set(conversationId, existing.filter(m => m.id !== messageId))
      return next
    })
  }, [])

  const addConversation = useCallback((conversation: Conversation) => {
    setConversations(prev => [conversation, ...prev])
  }, [])

  const updateConversation = useCallback((id: string, updates: Partial<Conversation>) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }, [])

  const markAsRead = useCallback((conversationId: string) => {
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    ))
    ws.send('chat:mark_read', { conversationId })
  }, [ws])

  const setTypingUsers = useCallback((conversationId: string, userIds: string[]) => {
    setTypingUsersState(prev => {
      const next = new Map(prev)
      next.set(conversationId, userIds)
      return next
    })
  }, [])

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversationId,
      activeConversation,
      messages,
      isLoading,
      setActiveConversation,
      addMessage,
      updateMessage,
      deleteMessage,
      addConversation,
      updateConversation,
      markAsRead,
      typingUsers,
      setTypingUsers,
      sendChatMessage,
      createNewConversation,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext)
  if (!context) throw new Error('useChat muss innerhalb von ChatProvider verwendet werden')
  return context
}
