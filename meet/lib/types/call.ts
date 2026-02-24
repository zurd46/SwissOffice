export type CallType = 'audio' | 'video'
export type CallStatus = 'ringing' | 'active' | 'ended' | 'missed' | 'declined'

export interface MediaState {
  audioEnabled: boolean
  videoEnabled: boolean
  screenSharing: boolean
  handRaised: boolean
}

export interface CallParticipant {
  id: string
  userId: string
  displayName: string
  avatarUrl?: string
  mediaState: MediaState
  joinedAt: string
  stream?: MediaStream
}

export interface Call {
  id: string
  type: CallType
  status: CallStatus
  conversationId?: string
  channelId?: string
  initiatorId: string
  participants: CallParticipant[]
  startedAt: string
  endedAt?: string
  duration?: number
}

export interface CallSettings {
  selectedAudioInput?: string
  selectedAudioOutput?: string
  selectedVideoInput?: string
  virtualBackground?: 'none' | 'blur' | string
  noiseSuppression: boolean
}
