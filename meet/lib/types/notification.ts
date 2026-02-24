export type NotificationType =
  | 'new_message'
  | 'mention'
  | 'reaction'
  | 'call_incoming'
  | 'call_missed'
  | 'meeting_reminder'
  | 'team_invite'
  | 'channel_invite'
  | 'file_shared'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  avatarUrl?: string
  actionUrl?: string
  isRead: boolean
  createdAt: string
}
