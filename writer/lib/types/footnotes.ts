export interface Footnote {
  id: string
  number: number
  content: string // HTML content of the footnote
}

export function generateFootnoteId(): string {
  return `fn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
