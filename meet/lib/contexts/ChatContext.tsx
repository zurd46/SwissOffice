'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Conversation, Message } from '@/lib/types'

interface ChatContextValue {
  conversations: Conversation[]
  activeConversationId: string | null
  activeConversation: Conversation | null
  messages: Map<string, Message[]>
  setActiveConversation: (id: string | null) => void
  addMessage: (conversationId: string, message: Message) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void
  deleteMessage: (conversationId: string, messageId: string) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  markAsRead: (conversationId: string) => void
  typingUsers: Map<string, string[]>
  setTypingUsers: (conversationId: string, userIds: string[]) => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

// Demo-Daten
const demoConversations: Conversation[] = [
  {
    id: 'conv-1',
    type: 'direct',
    name: 'Anna Müller',
    members: [],
    lastMessage: {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-2',
      senderName: 'Anna Müller',
      type: 'text',
      content: 'Hast du die Präsentation fertig?',
      attachments: [],
      reactions: [],
      isEdited: false,
      isPinned: false,
      readBy: ['user-2'],
      createdAt: new Date(Date.now() - 300000).toISOString(),
    },
    unreadCount: 1,
    isPinned: false,
    isMuted: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'conv-2',
    type: 'group',
    name: 'Projektteam Alpha',
    members: [],
    lastMessage: {
      id: 'msg-2',
      conversationId: 'conv-2',
      senderId: 'user-3',
      senderName: 'Max Weber',
      type: 'text',
      content: 'Meeting morgen um 10 Uhr!',
      attachments: [],
      reactions: [],
      isEdited: false,
      isPinned: false,
      readBy: ['user-3'],
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
    unreadCount: 3,
    isPinned: true,
    isMuted: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'conv-3',
    type: 'direct',
    name: 'Lisa Schmidt',
    members: [],
    lastMessage: {
      id: 'msg-3',
      conversationId: 'conv-3',
      senderId: 'user-1',
      senderName: 'Daniel Zurmühle',
      type: 'text',
      content: 'Perfekt, danke dir! 👍',
      attachments: [],
      reactions: [],
      isEdited: false,
      isPinned: false,
      readBy: ['user-1', 'user-4'],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'conv-4',
    type: 'group',
    name: 'Design Review',
    members: [],
    lastMessage: {
      id: 'msg-4',
      conversationId: 'conv-4',
      senderId: 'user-5',
      senderName: 'Julia Koch',
      type: 'image',
      content: 'Neues Mockup angehängt',
      attachments: [],
      reactions: [{ emoji: '🔥', count: 3, userIds: ['user-1', 'user-2', 'user-3'], hasReacted: true }],
      isEdited: false,
      isPinned: false,
      readBy: ['user-5'],
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    unreadCount: 5,
    isPinned: false,
    isMuted: false,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
]

const demoMessages: Map<string, Message[]> = new Map([
  ['conv-1', [
    {
      id: 'msg-1a',
      conversationId: 'conv-1',
      senderId: 'user-2',
      senderName: 'Anna Müller',
      type: 'text',
      content: 'Hey Daniel!',
      attachments: [],
      reactions: [],
      isEdited: false,
      isPinned: false,
      readBy: ['user-1', 'user-2'],
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: 'msg-1b',
      conversationId: 'conv-1',
      senderId: 'user-1',
      senderName: 'Daniel Zurmühle',
      type: 'text',
      content: 'Hi Anna, alles klar?',
      attachments: [],
      reactions: [{ emoji: '👋', count: 1, userIds: ['user-2'], hasReacted: false }],
      isEdited: false,
      isPinned: false,
      readBy: ['user-1', 'user-2'],
      createdAt: new Date(Date.now() - 540000).toISOString(),
    },
    {
      id: 'msg-1c',
      conversationId: 'conv-1',
      senderId: 'user-2',
      senderName: 'Anna Müller',
      type: 'text',
      content: 'Ja, alles gut! Hast du die Präsentation fertig?',
      attachments: [],
      reactions: [],
      isEdited: false,
      isPinned: false,
      readBy: ['user-2'],
      createdAt: new Date(Date.now() - 300000).toISOString(),
    },
  ]],
])

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(demoConversations)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Map<string, Message[]>>(demoMessages)
  const [typingUsers, setTypingUsersState] = useState<Map<string, string[]>>(new Map())

  const activeConversation = conversations.find(c => c.id === activeConversationId) ?? null

  const setActiveConversation = useCallback((id: string | null) => {
    setActiveConversationId(id)
    if (id) {
      setConversations(prev => prev.map(c =>
        c.id === id ? { ...c, unreadCount: 0 } : c
      ))
    }
  }, [])

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
  }, [])

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
      setActiveConversation,
      addMessage,
      updateMessage,
      deleteMessage,
      addConversation,
      updateConversation,
      markAsRead,
      typingUsers,
      setTypingUsers,
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
