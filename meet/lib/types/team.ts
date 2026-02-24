export type TeamRole = 'owner' | 'admin' | 'member' | 'guest'

export interface Team {
  id: string
  name: string
  description?: string
  avatarUrl?: string
  isPublic: boolean
  memberCount: number
  channels: import('./channel').Channel[]
  createdAt: string
  createdBy: string
}

export interface TeamMember {
  id: string
  teamId: string
  userId: string
  user: import('./user').User
  role: TeamRole
  joinedAt: string
}
