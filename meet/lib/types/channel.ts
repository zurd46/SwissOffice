export type ChannelType = 'public' | 'private' | 'announcement'

export interface Channel {
  id: string
  teamId: string
  name: string
  description?: string
  topic?: string
  type: ChannelType
  isDefault: boolean
  memberCount: number
  unreadCount: number
  lastMessageAt?: string
  createdAt: string
  createdBy: string
}

export interface ChannelMember {
  id: string
  channelId: string
  userId: string
  user: import('./user').User
  notificationSetting: 'all' | 'mentions' | 'none'
  joinedAt: string
}
