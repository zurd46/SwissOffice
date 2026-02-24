export type MessageType = 'text' | 'image' | 'video' | 'file' | 'audio' | 'gif' | 'system'

export interface Attachment {
  id: string
  messageId: string
  fileName: string
  fileSize: number
  mimeType: string
  url: string
  thumbnailUrl?: string
  width?: number
  height?: number
}

export interface Reaction {
  id: string
  messageId: string
  userId: string
  emoji: string
  createdAt: string
}

export interface ReactionGroup {
  emoji: string
  count: number
  userIds: string[]
  hasReacted: boolean
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  type: MessageType
  content: string
  attachments: Attachment[]
  reactions: ReactionGroup[]
  replyToId?: string
  replyTo?: Message
  threadCount?: number
  isEdited: boolean
  isPinned: boolean
  readBy: string[]
  createdAt: string
  updatedAt?: string
}

export interface MessageDraft {
  conversationId: string
  content: string
  attachments: File[]
  replyToId?: string
}
