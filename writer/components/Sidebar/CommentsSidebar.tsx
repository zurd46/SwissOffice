'use client'

import { useState } from 'react'
import type { Comment } from '../../lib/types/comments'
import { X, Check, Reply, Trash2 } from 'lucide-react'

interface CommentsSidebarProps {
  comments: Comment[]
  onAddReply: (parentId: string, text: string) => void
  onResolve: (commentId: string) => void
  onDelete: (commentId: string) => void
}

export function CommentsSidebar({ comments, onAddReply, onResolve, onDelete }: CommentsSidebarProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const rootComments = comments.filter(c => !c.parentId)
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId)

  const handleSubmitReply = (parentId: string) => {
    if (replyText.trim()) {
      onAddReply(parentId, replyText.trim())
      setReplyText('')
      setReplyingTo(null)
    }
  }

  if (rootComments.length === 0) {
    return (
      <div style={{ padding: 16, color: '#a19f9d', fontSize: 12, fontStyle: 'italic' }}>
        Keine Kommentare vorhanden. Markieren Sie Text und klicken Sie auf &ldquo;Kommentar&rdquo; um einen hinzuzufuegen.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
      {rootComments.map(comment => (
        <div
          key={comment.id}
          style={{
            padding: '8px 12px',
            borderLeft: comment.resolved ? '3px solid #10b981' : '3px solid #0078d4',
            backgroundColor: comment.resolved ? '#f0fdf4' : '#f8faff',
            opacity: comment.resolved ? 0.7 : 1,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#323130' }}>{comment.author}</span>
            <span style={{ fontSize: 10, color: '#a19f9d' }}>
              {new Date(comment.timestamp).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#605e5c', margin: 0, lineHeight: 1.4 }}>{comment.text}</p>

          {/* Replies */}
          {getReplies(comment.id).map(reply => (
            <div key={reply.id} style={{ marginTop: 6, paddingLeft: 8, borderLeft: '2px solid #e1dfdd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#605e5c' }}>{reply.author}</span>
                <span style={{ fontSize: 9, color: '#a19f9d' }}>
                  {new Date(reply.timestamp).toLocaleDateString('de-CH', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style={{ fontSize: 11, color: '#605e5c', margin: 0 }}>{reply.text}</p>
            </div>
          ))}

          {/* Reply input */}
          {replyingTo === comment.id && (
            <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitReply(comment.id) }}
                placeholder="Antworten..."
                autoFocus
                style={{
                  flex: 1, fontSize: 11, padding: '3px 6px',
                  border: '1px solid #c8c6c4', borderRadius: 3,
                }}
              />
              <button
                onClick={() => handleSubmitReply(comment.id)}
                style={{ border: 'none', background: '#0078d4', color: 'white', borderRadius: 3, padding: '2px 6px', cursor: 'pointer', fontSize: 10 }}
              >
                <Check size={12} />
              </button>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            <ActionButton onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}>
              <Reply size={10} /> Antworten
            </ActionButton>
            {!comment.resolved && (
              <ActionButton onClick={() => onResolve(comment.id)}>
                <Check size={10} /> Loesen
              </ActionButton>
            )}
            <ActionButton onClick={() => onDelete(comment.id)}>
              <Trash2 size={10} /> Loeschen
            </ActionButton>
          </div>
        </div>
      ))}
    </div>
  )
}

function ActionButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 3,
        fontSize: 10, color: '#605e5c', background: 'none',
        border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 3,
      }}
    >
      {children}
    </button>
  )
}
