export interface DocumentVersion {
  id: string
  timestamp: number
  label: string
  content: unknown // Tiptap JSON
  documentName: string
}

export function generateVersionId(): string {
  return `ver-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}
