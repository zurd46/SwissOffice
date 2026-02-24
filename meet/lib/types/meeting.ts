export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly'

export interface Meeting {
  id: string
  title: string
  description?: string
  organizerId: string
  organizerName: string
  channelId?: string
  teamId?: string
  startTime: string
  endTime: string
  isAllDay: boolean
  recurrence: RecurrenceType
  meetingLink: string
  hasLobby: boolean
  isRecordingEnabled: boolean
  participants: MeetingParticipant[]
  createdAt: string
}

export interface MeetingParticipant {
  id: string
  meetingId: string
  userId: string
  displayName: string
  avatarUrl?: string
  status: 'pending' | 'accepted' | 'declined' | 'tentative'
  isRequired: boolean
}
