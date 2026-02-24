'use client'

import { Editor } from '@tiptap/react'
import { X, Trash2, Send, Sparkles } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useAI } from '@/lib/ai/aiContext'
import { ChatMessage } from './ChatMessage'

interface AIChatSidebarProps {
  editor: Editor
  onClose: () => void
}

export function AIChatSidebar({ editor, onClose }: AIChatSidebarProps) {
  const {
    chatMessages,
    addUserMessage,
    clearChat,
    isChatLoading,
    isConfigured,
    setShowSettingsDialog,
  } = useAI()

  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSend = useCallback(async () => {
    const message = inputValue.trim()
    if (!message) return

    if (!isConfigured) {
      setShowSettingsDialog(true)
      return
    }

    setInputValue('')
    const documentContent = editor.getText()
    await addUserMessage(message, documentContent)
  }, [inputValue, isConfigured, setShowSettingsDialog, editor, addUserMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const insertIntoDocument = useCallback(
    (content: string) => {
      editor.chain().focus().insertContent(content).run()
    },
    [editor],
  )

  return (
    <div
      style={{
        width: 320,
        minWidth: 320,
        backgroundColor: 'white',
        borderLeft: '1px solid #e5e5e5',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '-1px 0 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fafafa',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={16} style={{ color: '#0078d4' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#323130' }}>
            AI-Chat
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={clearChat}
            title="Chat leeren"
            style={{
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              backgroundColor: 'transparent',
              borderRadius: 4,
              cursor: 'pointer',
              color: '#605e5c',
            }}
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={onClose}
            title="Schliessen"
            style={{
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              backgroundColor: 'transparent',
              borderRadius: 4,
              cursor: 'pointer',
              color: '#605e5c',
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 12,
        }}
      >
        {chatMessages.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#a0a0a0',
              textAlign: 'center',
              padding: 24,
            }}
          >
            <Sparkles size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
            <p style={{ fontSize: 13, margin: 0, fontStyle: 'italic' }}>
              Stelle eine Frage oder bitte die AI, Inhalte für dein Dokument zu
              erstellen.
            </p>
          </div>
        ) : (
          <>
            {chatMessages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role as 'user' | 'assistant'}
                content={msg.content}
                onInsertToDocument={
                  msg.role === 'assistant' ? insertIntoDocument : undefined
                }
              />
            ))}
            {isChatLoading && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px 12px 12px 2px',
                    backgroundColor: '#f0f0f0',
                    color: '#605e5c',
                    fontSize: 13,
                  }}
                >
                  <span className="ai-typing-dots">Denkt nach</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div
        style={{
          padding: 12,
          borderTop: '1px solid #e5e5e5',
          backgroundColor: '#fafafa',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'flex-end',
          }}
        >
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nachricht eingeben..."
            rows={2}
            style={{
              flex: 1,
              resize: 'none',
              border: '1px solid #c8c6c4',
              borderRadius: 6,
              padding: '8px 10px',
              fontSize: 13,
              lineHeight: 1.4,
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handleSend}
            disabled={isChatLoading || !inputValue.trim()}
            title="Senden"
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                isChatLoading || !inputValue.trim() ? '#e1dfdd' : '#0078d4',
              color: isChatLoading || !inputValue.trim() ? '#a0a0a0' : 'white',
              border: 'none',
              borderRadius: 6,
              cursor:
                isChatLoading || !inputValue.trim()
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
