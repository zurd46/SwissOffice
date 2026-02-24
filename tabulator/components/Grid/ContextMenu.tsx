'use client'

// =============================================
// ImpulsTabulator — Kontextmenü
// =============================================

import { useEffect, useRef } from 'react'
import {
  Scissors, Copy, ClipboardPaste, Rows, Columns,
  Minus, ArrowUpDown, Trash2, Settings2, MessageSquare,
} from 'lucide-react'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onCut: () => void
  onCopy: () => void
  onPaste: () => void
  onInsertRow: () => void
  onInsertColumn: () => void
  onDeleteRow: () => void
  onDeleteColumn: () => void
  onSortAsc: () => void
  onSortDesc: () => void
  onClearContents: () => void
  onFormatCells?: () => void
  onAddComment?: () => void
}

export function ContextMenu({
  x, y, onClose,
  onCut, onCopy, onPaste,
  onInsertRow, onInsertColumn,
  onDeleteRow, onDeleteColumn,
  onSortAsc, onSortDesc,
  onClearContents,
  onFormatCells,
  onAddComment,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Position korrigieren, damit das Menü nicht aus dem Viewport ragt
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      if (rect.right > window.innerWidth) {
        menuRef.current.style.left = `${x - rect.width}px`
      }
      if (rect.bottom > window.innerHeight) {
        menuRef.current.style.top = `${y - rect.height}px`
      }
    }
  }, [x, y])

  // Klick ausserhalb schliesst das Menü
  useEffect(() => {
    const handleClick = () => onClose()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('click', handleClick)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('click', handleClick)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const items: { label: string; icon: React.ReactNode; action: () => void; shortcut?: string }[] = [
    { label: 'Ausschneiden', icon: <Scissors size={14} />, action: onCut, shortcut: 'Ctrl+X' },
    { label: 'Kopieren', icon: <Copy size={14} />, action: onCopy, shortcut: 'Ctrl+C' },
    { label: 'Einfügen', icon: <ClipboardPaste size={14} />, action: onPaste, shortcut: 'Ctrl+V' },
  ]

  const rowColItems = [
    { label: 'Zeile einfügen', icon: <Rows size={14} />, action: onInsertRow },
    { label: 'Spalte einfügen', icon: <Columns size={14} />, action: onInsertColumn },
    { label: 'Zeile löschen', icon: <Minus size={14} />, action: onDeleteRow },
    { label: 'Spalte löschen', icon: <Minus size={14} />, action: onDeleteColumn },
  ]

  const otherItems = [
    { label: 'Inhalte löschen', icon: <Trash2 size={14} />, action: onClearContents },
    { label: 'Aufsteigend sortieren', icon: <ArrowUpDown size={14} />, action: onSortAsc },
    { label: 'Absteigend sortieren', icon: <ArrowUpDown size={14} />, action: onSortDesc },
  ]

  const extraItems = [
    ...(onFormatCells ? [{ label: 'Zellen formatieren...', icon: <Settings2 size={14} />, action: onFormatCells, shortcut: 'Ctrl+1' }] : []),
    ...(onAddComment ? [{ label: 'Kommentar einfügen', icon: <MessageSquare size={14} />, action: onAddComment }] : []),
  ]

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        left: x,
        top: y,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="context-menu-item"
          onClick={() => { item.action(); onClose() }}
        >
          {item.icon}
          <span style={{ flex: 1 }}>{item.label}</span>
          {item.shortcut && (
            <span style={{ color: '#80868b', fontSize: 11 }}>{item.shortcut}</span>
          )}
        </div>
      ))}

      <div className="context-menu-divider" />

      {rowColItems.map((item) => (
        <div
          key={item.label}
          className="context-menu-item"
          onClick={() => { item.action(); onClose() }}
        >
          {item.icon}
          <span>{item.label}</span>
        </div>
      ))}

      <div className="context-menu-divider" />

      {otherItems.map((item) => (
        <div
          key={item.label}
          className="context-menu-item"
          onClick={() => { item.action(); onClose() }}
        >
          {item.icon}
          <span>{item.label}</span>
        </div>
      ))}

      {extraItems.length > 0 && (
        <>
          <div className="context-menu-divider" />
          {extraItems.map((item) => (
            <div
              key={item.label}
              className="context-menu-item"
              onClick={() => { item.action(); onClose() }}
            >
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {'shortcut' in item && item.shortcut && (
                <span style={{ color: '#80868b', fontSize: 11 }}>{item.shortcut}</span>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
