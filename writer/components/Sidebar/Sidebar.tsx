'use client'

import { Editor } from '@tiptap/react'
import { useEffect, useState, useCallback, useRef } from 'react'
import { FileText, MessageSquare, ChevronRight } from 'lucide-react'
import { CommentsSidebar } from './CommentsSidebar'
import type { Comment } from '../../lib/types/comments'

interface HeadingItem {
  level: number
  text: string
  pos: number
  numbering: string // e.g. "1", "1.1", "1.1.2"
}

interface SidebarProps {
  editor: Editor
  comments?: Comment[]
  onAddReply?: (parentId: string, text: string) => void
  onResolveComment?: (commentId: string) => void
  onDeleteComment?: (commentId: string) => void
}

/**
 * Generates hierarchical numbering for headings (1, 1.1, 1.1.1, etc.)
 */
function generateNumbering(headings: { level: number; text: string; pos: number }[]): HeadingItem[] {
  const counters = [0, 0, 0, 0, 0, 0] // h1..h6
  const result: HeadingItem[] = []

  for (const h of headings) {
    const idx = h.level - 1
    counters[idx]++
    // Reset all deeper levels
    for (let i = idx + 1; i < 6; i++) counters[i] = 0

    // Build numbering string from top level down to current
    const parts: number[] = []
    for (let i = 0; i <= idx; i++) {
      if (counters[i] > 0) parts.push(counters[i])
    }

    result.push({
      level: h.level,
      text: h.text,
      pos: h.pos,
      numbering: parts.join('.'),
    })
  }
  return result
}

export function Sidebar({ editor, comments = [], onAddReply, onResolveComment, onDeleteComment }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'toc' | 'comments'>('toc')
  const [headings, setHeadings] = useState<HeadingItem[]>([])
  const [activeHeadingPos, setActiveHeadingPos] = useState<number | null>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  // Extract headings from document
  const updateHeadings = useCallback(() => {
    const items: { level: number; text: string; pos: number }[] = []
    const doc = editor.state.doc
    doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        items.push({
          level: node.attrs.level,
          text: node.textContent,
          pos,
        })
      }
    })
    setHeadings(generateNumbering(items))
  }, [editor])

  // Track which heading the cursor is near
  const updateActiveHeading = useCallback(() => {
    const { from } = editor.state.selection
    let closestPos: number | null = null
    const doc = editor.state.doc
    doc.descendants((node, pos) => {
      if (node.type.name === 'heading' && pos <= from) {
        closestPos = pos
      }
    })
    setActiveHeadingPos(closestPos)
  }, [editor])

  useEffect(() => {
    updateHeadings()
    updateActiveHeading()

    const handleUpdate = () => {
      updateHeadings()
      updateActiveHeading()
    }
    const handleSelectionUpdate = () => updateActiveHeading()

    editor.on('update', handleUpdate)
    editor.on('selectionUpdate', handleSelectionUpdate)
    return () => {
      editor.off('update', handleUpdate)
      editor.off('selectionUpdate', handleSelectionUpdate)
    }
  }, [editor, updateHeadings, updateActiveHeading])

  // Auto-scroll active heading into view in the sidebar
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [activeHeadingPos])

  const scrollToHeading = useCallback((pos: number) => {
    // Set cursor to the heading
    editor.chain().focus().setTextSelection(pos + 1).run()

    // Find the DOM element and scroll to it
    try {
      const resolvedPos = editor.view.state.doc.resolve(pos)
      const dom = editor.view.nodeDOM(resolvedPos.before(resolvedPos.depth + 1 > 0 ? 1 : 0))
      if (dom && dom instanceof HTMLElement) {
        dom.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
      }
    } catch {
      // fallback
    }
    // Fallback: use domAtPos
    try {
      const domAtPos = editor.view.domAtPos(pos)
      const node = domAtPos.node as HTMLElement
      const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node
      if (el?.scrollIntoView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } catch {
      // ignore scroll errors
    }
  }, [editor])

  const tabs = [
    { id: 'toc' as const, label: 'Inhalt', icon: FileText },
    { id: 'comments' as const, label: 'Kommentare', icon: MessageSquare },
  ]

  const levelStyles: Record<number, { fontSize: number; fontWeight: number; color: string; iconSize: number }> = {
    1: { fontSize: 13, fontWeight: 600, color: '#1a1a1a', iconSize: 12 },
    2: { fontSize: 12.5, fontWeight: 500, color: '#333', iconSize: 11 },
    3: { fontSize: 12, fontWeight: 400, color: '#555', iconSize: 10 },
    4: { fontSize: 11.5, fontWeight: 400, color: '#666', iconSize: 9 },
    5: { fontSize: 11, fontWeight: 400, color: '#777', iconSize: 8 },
    6: { fontSize: 11, fontWeight: 400, color: '#888', iconSize: 8 },
  }

  return (
    <div style={{
      width: 260,
      minWidth: 260,
      backgroundColor: 'white',
      borderRight: '1px solid #e5e5e5',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '1px 0 3px rgba(0,0,0,0.04)',
    }}>
      {/* Tab Strip */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e5e5e5',
        backgroundColor: '#fafafa',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '9px 8px',
              fontSize: 12,
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? '#0078d4' : '#605e5c',
              backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #0078d4' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            <tab.icon size={14} />
            {tab.label}
            {tab.id === 'comments' && comments.length > 0 && (
              <span style={{
                backgroundColor: '#0078d4',
                color: 'white',
                fontSize: 9,
                borderRadius: 8,
                padding: '1px 5px',
                fontWeight: 600,
              }}>
                {comments.filter(c => !c.parentId && !c.resolved).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'toc' && (
          <div style={{ padding: 8 }}>
            {/* TOC Header */}
            <div style={{
              padding: '6px 8px',
              fontSize: 11,
              color: '#8a8886',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 4,
            }}>
              Inhaltsverzeichnis
              {headings.length > 0 && (
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>
                  ({headings.length})
                </span>
              )}
            </div>

            {headings.length === 0 ? (
              <p style={{ fontSize: 12, color: '#a0a0a0', fontStyle: 'italic', margin: 0, padding: '8px' }}>
                Fuegen Sie Ueberschriften (H1-H6) hinzu, um ein Inhaltsverzeichnis zu erstellen.
              </p>
            ) : (
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {headings.map((heading, index) => {
                  const isActive = activeHeadingPos === heading.pos
                  const style = levelStyles[heading.level] || levelStyles[6]
                  const indent = (heading.level - 1) * 14

                  return (
                    <button
                      key={`${heading.pos}-${index}`}
                      ref={isActive ? activeRef : undefined}
                      onClick={() => scrollToHeading(heading.pos)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: `4px 8px 4px ${indent + 8}px`,
                        borderRadius: 4,
                        fontSize: style.fontSize,
                        backgroundColor: isActive ? '#e8f0fe' : 'transparent',
                        border: 'none',
                        borderLeft: isActive ? '3px solid #0078d4' : '3px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        color: isActive ? '#0078d4' : style.color,
                        fontWeight: isActive ? 600 : style.fontWeight,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.4,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = '#f5f5f5'
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                      title={`${heading.numbering} ${heading.text}`}
                    >
                      <ChevronRight size={style.iconSize} style={{
                        flexShrink: 0,
                        color: isActive ? '#0078d4' : '#c0c0c0',
                        transform: 'rotate(0deg)',
                      }} />
                      <span style={{
                        color: isActive ? '#0078d4' : '#a0a0a0',
                        fontSize: style.fontSize - 1,
                        fontWeight: 500,
                        flexShrink: 0,
                        minWidth: heading.numbering.length > 3 ? 32 : 20,
                      }}>
                        {heading.numbering}
                      </span>
                      <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {heading.text || 'Leere Ueberschrift'}
                      </span>
                    </button>
                  )
                })}
              </nav>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <CommentsSidebar
            comments={comments}
            onAddReply={onAddReply ?? (() => {})}
            onResolve={onResolveComment ?? (() => {})}
            onDelete={onDeleteComment ?? (() => {})}
          />
        )}
      </div>
    </div>
  )
}
