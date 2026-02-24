// Meet API-Helper — typisierte Funktionen für alle Meet-Endpoints

import type { ApiClient, ApiResponse } from '@shared/api/types'

// ----- Conversations -----

export interface ApiConversation {
  id: string
  type: 'direct' | 'group'
  name: string | null
  avatarUrl: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ApiMessage {
  id: string
  conversationId: string | null
  channelId: string | null
  senderId: string
  type: string
  content: string
  replyToId: string | null
  isEdited: boolean
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export async function fetchConversations(api: ApiClient): Promise<ApiConversation[]> {
  const res = await api.get<ApiConversation[]>('/api/v1/meet/conversations')
  return res.ok && res.data ? res.data : []
}

export async function fetchMessages(
  api: ApiClient,
  conversationId: string,
  limit = 50,
  offset = 0,
): Promise<ApiMessage[]> {
  const res = await api.get<ApiMessage[]>(
    `/api/v1/meet/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
  )
  return res.ok && res.data ? res.data : []
}

export async function sendMessage(
  api: ApiClient,
  conversationId: string,
  content: string,
  type = 'text',
  replyToId?: string,
): Promise<string | null> {
  const res = await api.post<{ id: string }>(
    `/api/v1/meet/conversations/${conversationId}/messages`,
    { content, type, replyToId },
  )
  return res.ok && res.data ? res.data.id : null
}

export async function createConversation(
  api: ApiClient,
  data: { type: 'direct' | 'group'; name?: string; memberIds: string[] },
): Promise<string | null> {
  const res = await api.post<{ id: string }>('/api/v1/meet/conversations', data)
  return res.ok && res.data ? res.data.id : null
}

// ----- Teams -----

export interface ApiChannel {
  id: string
  teamId: string
  name: string
  description: string | null
  topic: string | null
  type: string
  isDefault: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ApiTeam {
  id: string
  name: string
  description: string | null
  avatarUrl: string | null
  isPublic: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
  channels: ApiChannel[]
}

export async function fetchTeams(api: ApiClient): Promise<ApiTeam[]> {
  const res = await api.get<ApiTeam[]>('/api/v1/meet/teams')
  return res.ok && res.data ? res.data : []
}

export async function createTeam(
  api: ApiClient,
  data: { name: string; description?: string; isPublic?: boolean },
): Promise<string | null> {
  const res = await api.post<{ id: string }>('/api/v1/meet/teams', data)
  return res.ok && res.data ? res.data.id : null
}

export async function createChannel(
  api: ApiClient,
  teamId: string,
  data: { name: string; description?: string; type?: string },
): Promise<string | null> {
  const res = await api.post<{ id: string }>(`/api/v1/meet/teams/${teamId}/channels`, data)
  return res.ok && res.data ? res.data.id : null
}

export async function inviteMember(
  api: ApiClient,
  teamId: string,
  userId: string,
  role = 'member',
): Promise<boolean> {
  const res = await api.post<unknown>(`/api/v1/meet/teams/${teamId}/members`, { userId, role })
  return res.ok === true
}
