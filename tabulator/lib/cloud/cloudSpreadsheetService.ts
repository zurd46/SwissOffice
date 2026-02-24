// Cloud-Service für ImpulsTabulator
// Verbindet den Tabulator mit der Cloud-API (/api/v1/documents)

import type { ApiClient } from '@shared/api/types'
import type { WorkbookData } from '@/lib/types/spreadsheet'
import type { TabulatorSettings } from '@/lib/types/document'

export interface CloudSpreadsheetMeta {
  id: string
  title: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CloudSpreadsheetFull extends CloudSpreadsheetMeta {
  content: {
    version: number
    workbook: WorkbookData
    settings?: TabulatorSettings
  }
}

interface ListResponse {
  documents: CloudSpreadsheetMeta[]
  total: number
  page: number
  limit: number
}

export async function listCloudSpreadsheets(
  api: ApiClient,
  options?: { search?: string; page?: number; limit?: number },
): Promise<{ documents: CloudSpreadsheetMeta[]; total: number }> {
  const params = new URLSearchParams()
  params.set('docType', 'tabulator')
  if (options?.search) params.set('search', options.search)
  if (options?.page) params.set('page', String(options.page))
  if (options?.limit) params.set('limit', String(options.limit))

  const res = await api.get<ListResponse>(`/api/v1/documents?${params}`)
  if (res.ok && res.data) {
    return { documents: res.data.documents, total: res.data.total }
  }
  return { documents: [], total: 0 }
}

export async function loadCloudSpreadsheet(
  api: ApiClient,
  documentId: string,
): Promise<CloudSpreadsheetFull | null> {
  const res = await api.get<CloudSpreadsheetFull>(`/api/v1/documents/${documentId}`)
  if (res.ok && res.data) return res.data
  return null
}

export async function saveSpreadsheetToCloud(
  api: ApiClient,
  title: string,
  workbook: WorkbookData,
  settings?: TabulatorSettings,
): Promise<string | null> {
  const content = {
    version: 1,
    workbook,
    settings,
  }
  const res = await api.post<{ id: string }>('/api/v1/documents', {
    title,
    content,
    docType: 'tabulator',
  })
  if (res.ok && res.data) return res.data.id
  return null
}

export async function updateCloudSpreadsheet(
  api: ApiClient,
  documentId: string,
  updates: { title?: string; workbook?: WorkbookData; settings?: TabulatorSettings },
): Promise<boolean> {
  const body: Record<string, unknown> = {}
  if (updates.title) body.title = updates.title
  if (updates.workbook || updates.settings) {
    body.content = {
      version: 1,
      ...(updates.workbook && { workbook: updates.workbook }),
      ...(updates.settings && { settings: updates.settings }),
    }
  }
  const res = await api.put<unknown>(`/api/v1/documents/${documentId}`, body)
  return res.ok === true
}

export async function deleteCloudSpreadsheet(
  api: ApiClient,
  documentId: string,
): Promise<boolean> {
  const res = await api.delete<unknown>(`/api/v1/documents/${documentId}`)
  return res.ok === true
}
