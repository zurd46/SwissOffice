'use client'

import { ClipboardCopy, FileInput } from 'lucide-react'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  onInsertToDocument?: (content: string) => void
}

export function ChatMessage({ role, content, onInsertToDocument }: ChatMessageProps) {
  const isUser = role === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          maxWidth: '85%',
          padding: '8px 12px',
          borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
          backgroundColor: isUser ? '#0078d4' : '#f0f0f0',
          color: isUser ? 'white' : '#323130',
          fontSize: 13,
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {content}
        {!isUser && (
          <div
            style={{
              display: 'flex',
              gap: 4,
              marginTop: 6,
              borderTop: '1px solid #e0e0e0',
              paddingTop: 6,
            }}
          >
            <button
              onClick={handleCopy}
              title="Kopieren"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 6px',
                fontSize: 11,
                color: '#605e5c',
                backgroundColor: 'transparent',
                border: '1px solid #d2d0ce',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              <ClipboardCopy size={12} />
              Kopieren
            </button>
            {onInsertToDocument && (
              <button
                onClick={() => onInsertToDocument(content)}
                title="In Dokument einfügen"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 6px',
                  fontSize: 11,
                  color: '#0078d4',
                  backgroundColor: 'transparent',
                  border: '1px solid #0078d4',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                <FileInput size={12} />
                Einfügen
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
