'use client'

// =============================================
// ImpulsTabulator — Inline Zell-Editor
// =============================================

import { useEffect, useRef } from 'react'

interface CellEditorProps {
  value: string
  onChange: (value: string) => void
  onCommit: () => void
  onCancel: () => void
  onTab: (shiftKey: boolean) => void
  left: number
  top: number
  width: number
  height: number
}

export function CellEditor({
  value,
  onChange,
  onCommit,
  onCancel,
  onTab,
  left,
  top,
  width,
  height,
}: CellEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      // Cursor ans Ende setzen
      const len = inputRef.current.value.length
      inputRef.current.setSelectionRange(len, len)
    }
  }, [])

  return (
    <input
      ref={inputRef}
      className="cell-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          onCommit()
        } else if (e.key === 'Escape') {
          e.preventDefault()
          onCancel()
        } else if (e.key === 'Tab') {
          e.preventDefault()
          onTab(e.shiftKey)
        }
      }}
      style={{
        position: 'absolute',
        left: left - 1,
        top: top - 1,
        width: Math.max(width + 2, 100),
        height: height + 2,
        zIndex: 10,
      }}
    />
  )
}
