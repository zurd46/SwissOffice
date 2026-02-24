'use client'

// =============================================
// ImpulsTabulator — Kommentar-Popup
// =============================================

import { useState, useEffect, useRef } from 'react'

interface CommentPopupProps {
  comment: string
  author?: string
  position: { x: number; y: number }
  onEdit?: (newComment: string) => void
  onDelete?: () => void
  onClose: () => void
  readOnly?: boolean
}

export function CommentPopup({
  comment,
  author,
  position,
  onEdit,
  onDelete,
  onClose,
  readOnly,
}: CommentPopupProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment)
  const popupRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Klick ausserhalb schliesst das Popup
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditing) {
          setIsEditing(false)
          setEditText(comment)
        } else {
          onClose()
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, isEditing, comment])

  // Textarea fokussieren wenn Bearbeitungsmodus aktiviert wird
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(editText.length, editText.length)
    }
  }, [isEditing, editText.length])

  // Position korrigieren, damit Popup nicht aus dem Viewport ragt
  useEffect(() => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect()
      if (rect.right > window.innerWidth) {
        popupRef.current.style.left = `${position.x - rect.width - 8}px`
      }
      if (rect.bottom > window.innerHeight) {
        popupRef.current.style.top = `${position.y - rect.height - 8}px`
      }
    }
  }, [position.x, position.y])

  const handleSave = () => {
    if (onEdit && editText.trim() !== '') {
      onEdit(editText.trim())
    }
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
    }
    onClose()
  }

  return (
    <div
      ref={popupRef}
      style={{
        position: 'fixed',
        left: position.x + 8,
        top: position.y + 8,
        maxWidth: 250,
        minWidth: 180,
        backgroundColor: '#fffde7',
        border: '1px solid #e0d88c',
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        padding: 10,
        zIndex: 1000,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 12,
        lineHeight: 1.4,
      }}
    >
      {/* Autor */}
      {author && (
        <div
          style={{
            fontWeight: 'bold',
            fontSize: 11,
            color: '#333',
            marginBottom: 4,
            borderBottom: '1px solid #e0d88c',
            paddingBottom: 4,
          }}
        >
          {author}
        </div>
      )}

      {/* Kommentar-Anzeige oder Bearbeitung */}
      {isEditing ? (
        <div>
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault()
                handleSave()
              }
            }}
            style={{
              width: '100%',
              minHeight: 60,
              border: '1px solid #ccc',
              borderRadius: 2,
              padding: 4,
              fontSize: 12,
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              backgroundColor: '#fff',
              boxSizing: 'border-box',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 6,
              marginTop: 6,
            }}
          >
            <button
              onClick={() => {
                setIsEditing(false)
                setEditText(comment)
              }}
              style={{
                padding: '3px 10px',
                fontSize: 11,
                border: '1px solid #ccc',
                borderRadius: 3,
                backgroundColor: '#f5f5f5',
                cursor: 'pointer',
                color: '#333',
              }}
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '3px 10px',
                fontSize: 11,
                border: '1px solid #4a86c8',
                borderRadius: 3,
                backgroundColor: '#4a86c8',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Speichern
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div
            style={{
              color: '#444',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {comment}
          </div>

          {/* Aktionen */}
          {!readOnly && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 6,
                marginTop: 8,
                borderTop: '1px solid #e0d88c',
                paddingTop: 6,
              }}
            >
              {onEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '3px 10px',
                    fontSize: 11,
                    border: '1px solid #ccc',
                    borderRadius: 3,
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer',
                    color: '#333',
                  }}
                >
                  Bearbeiten
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  style={{
                    padding: '3px 10px',
                    fontSize: 11,
                    border: '1px solid #d32f2f',
                    borderRadius: 3,
                    backgroundColor: '#fff',
                    color: '#d32f2f',
                    cursor: 'pointer',
                  }}
                >
                  L\u00f6schen
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
