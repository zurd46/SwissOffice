export interface Comment {
  id: string
  author: string
  text: string
  timestamp: number
  parentId?: string // for threaded replies
  resolved: boolean
}

export function generateCommentId(): string {
  return `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
