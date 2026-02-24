// Cloud-Dokument-Service für ImpulsWriter
// Verbindet den Writer mit der Cloud-API (/api/v1/documents)

import type { ApiClient, ApiResponse } from '@shared/api/types'

export interface CloudDocumentMeta {
  id: string
  title: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CloudDocumentFull extends CloudDocumentMeta {
  content: Record<string, unknown>
}

interface ListResponse {
  documents: CloudDocumentMeta[]
  total: number
  page: number
  limit: number
}

export async function listCloudDocuments(
  api: ApiClient,
  options?: { search?: string; page?: number; limit?: number },
): Promise<{ documents: CloudDocumentMeta[]; total: number }> {
  const params = new URLSearchParams()
  params.set('docType', 'writer')
  if (options?.search) params.set('search', options.search)
  if (options?.page) params.set('page', String(options.page))
  if (options?.limit) params.set('limit', String(options.limit))

  const res = await api.get<ListResponse>(`/api/v1/documents?${params}`)
  if (res.ok && res.data) {
    return { documents: res.data.documents, total: res.data.total }
  }
  return { documents: [], total: 0 }
}

export async function loadCloudDocument(
  api: ApiClient,
  documentId: string,
): Promise<CloudDocumentFull | null> {
  const res = await api.get<CloudDocumentFull>(`/api/v1/documents/${documentId}`)
  if (res.ok && res.data) return res.data
  return null
}

export async function saveToCloud(
  api: ApiClient,
  title: string,
  content: Record<string, unknown>,
): Promise<string | null> {
  const res = await api.post<{ id: string }>('/api/v1/documents', {
    title,
    content,
    docType: 'writer',
  })
  if (res.ok && res.data) return res.data.id
  return null
}

export async function updateCloudDocument(
  api: ApiClient,
  documentId: string,
  updates: { title?: string; content?: Record<string, unknown> },
): Promise<boolean> {
  const res = await api.put<unknown>(`/api/v1/documents/${documentId}`, updates)
  return res.ok === true
}

export async function deleteCloudDocument(
  api: ApiClient,
  documentId: string,
): Promise<boolean> {
  const res = await api.delete<unknown>(`/api/v1/documents/${documentId}`)
  return res.ok === true
}
