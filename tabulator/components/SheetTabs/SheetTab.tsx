'use client'

// =============================================
// ImpulsTabulator — Einzelner Sheet-Tab
// =============================================

import { useState, useRef, useEffect } from 'react'

interface SheetTabProps {
  name: string
  isActive: boolean
  onClick: () => void
  onRename: (name: string) => void
  onDelete: () => void
  onDuplicate: () => void
  canDelete: boolean
}

export function SheetTab({
  name,
  isActive,
  onClick,
  onRename,
  onDelete,
  onDuplicate,
  canDelete,
}: SheetTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(name)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 })
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    setEditName(name)
    setIsEditing(true)
  }

  const handleCommitRename = () => {
    if (editName.trim()) {
      onRename(editName.trim())
    }
    setIsEditing(false)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenuPos({ x: e.clientX, y: e.clientY })
    setShowContextMenu(true)
  }

  useEffect(() => {
    if (!showContextMenu) return
    const close = () => setShowContextMenu(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [showContextMenu])

  if (isEditing) {
    return (
      <div className={`sheet-tab ${isActive ? 'active' : ''}`}>
        <input
          ref={inputRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCommitRename()
            if (e.key === 'Escape') setIsEditing(false)
          }}
          onBlur={handleCommitRename}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 11,
            fontWeight: isActive ? 600 : 400,
            width: Math.max(40, editName.length * 7),
            padding: 0,
          }}
        />
      </div>
    )
  }

  return (
    <>
      <div
        className={`sheet-tab ${isActive ? 'active' : ''}`}
        onClick={onClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        {name}
      </div>

      {showContextMenu && (
        <div
          style={{
            position: 'fixed',
            left: contextMenuPos.x,
            top: contextMenuPos.y,
            background: 'white',
            border: '1px solid #d6d6d6',
            borderRadius: 4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            padding: '4px 0',
            minWidth: 160,
          }}
        >
          <button
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 16px', fontSize: 12, border: 'none', background: 'transparent', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            onClick={() => { setEditName(name); setIsEditing(true); setShowContextMenu(false) }}
          >
            Umbenennen
          </button>
          <button
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 16px', fontSize: 12, border: 'none', background: 'transparent', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            onClick={() => { onDuplicate(); setShowContextMenu(false) }}
          >
            Duplizieren
          </button>
          {canDelete && (
            <button
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 16px', fontSize: 12, border: 'none', background: 'transparent', cursor: 'pointer', color: '#c00' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              onClick={() => { onDelete(); setShowContextMenu(false) }}
            >
              Löschen
            </button>
          )}
        </div>
      )}
    </>
  )
}
