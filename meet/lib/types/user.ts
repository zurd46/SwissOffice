export type PresenceStatus = 'online' | 'offline' | 'away' | 'busy' | 'dnd'

export interface User {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  department?: string
  jobTitle?: string
  phone?: string
  presence: PresenceStatus
  customStatus?: string
  lastSeen?: string
  createdAt: string
}

export interface UserProfile extends User {
  bio?: string
  location?: string
  timezone?: string
}

export interface Contact {
  id: string
  userId: string
  contactId: string
  isFavorite: boolean
  user: User
}
