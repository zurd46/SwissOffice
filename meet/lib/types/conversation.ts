import type { User } from './user'
import type { Message } from './message'

export type ConversationType = 'direct' | 'group'

export interface Conversation {
  id: string
  type: ConversationType
  name?: string
  avatarUrl?: string
  members: ConversationMember[]
  lastMessage?: Message
  unreadCount: number
  isPinned: boolean
  isMuted: boolean
  createdAt: string
  updatedAt: string
}

export interface ConversationMember {
  id: string
  conversationId: string
  userId: string
  user: User
  joinedAt: string
  lastReadAt?: string
}
