'use client'

import { Editor } from '@tiptap/react'
import { useEffect, useState, useCallback } from 'react'
import { FileText } from 'lucide-react'

interface HeadingItem {
  level: number
  text: string
  id: string
  pos: number
}

interface SidebarProps {
  editor: Editor
}

export function Sidebar({ editor }: SidebarProps) {
  const [headings, setHeadings] = useState<HeadingItem[]>([])

  const updateHeadings = useCallback(() => {
    const items: HeadingItem[] = []
    const doc = editor.state.doc
    doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        items.push({
          level: node.attrs.level,
          text: node.textContent,
          id: `heading-${pos}`,
          pos,
        })
      }
    })
    setHeadings(items)
  }, [editor])

  useEffect(() => {
    updateHeadings()
    editor.on('update', updateHeadings)
    return () => {
      editor.off('update', updateHeadings)
    }
  }, [editor, updateHeadings])

  const scrollToHeading = (pos: number) => {
    editor.chain().focus().setTextSelection(pos).run()
    const domAtPos = editor.view.domAtPos(pos)
    const node = domAtPos.node as HTMLElement
    if (node.scrollIntoView) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div style={{
      width: 240,
      minWidth: 240,
      backgroundColor: 'white',
      borderRight: '1px solid #e5e5e5',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '1px 0 3px rgba(0,0,0,0.04)',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e5e5e5',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fafafa',
      }}>
        <FileText size={16} style={{ color: '#0078d4' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#323130' }}>Inhaltsverzeichnis</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {headings.length === 0 ? (
          <p style={{ fontSize: 12, color: '#a0a0a0', fontStyle: 'italic', margin: 0 }}>
            Fügen Sie Überschriften hinzu, um ein Inhaltsverzeichnis zu erstellen.
          </p>
        ) : (
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {headings.map((heading, index) => (
              <button
                key={index}
                onClick={() => scrollToHeading(heading.pos)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: `5px 8px 5px ${(heading.level - 1) * 12 + 8}px`,
                  borderRadius: 4,
                  fontSize: 13,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.1s',
                  color: heading.level === 1 ? '#242424' : heading.level === 2 ? '#444' : '#666',
                  fontWeight: heading.level === 1 ? 600 : heading.level === 2 ? 500 : 400,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#eff6fc' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                title={heading.text}
              >
                {heading.text || 'Leere Überschrift'}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  )
}
