'use client'

import { Editor } from '@tiptap/react'
import { useEffect, useState, useCallback } from 'react'
import { FileText, MessageSquare } from 'lucide-react'
import { CommentsSidebar } from './CommentsSidebar'
import type { Comment } from '../../lib/types/comments'

interface HeadingItem {
  level: number
  text: string
  id: string
  pos: number
}

interface SidebarProps {
  editor: Editor
  comments?: Comment[]
  onAddReply?: (parentId: string, text: string) => void
  onResolveComment?: (commentId: string) => void
  onDeleteComment?: (commentId: string) => void
}

export function Sidebar({ editor, comments = [], onAddReply, onResolveComment, onDeleteComment }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'toc' | 'comments'>('toc')
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

  const tabs = [
    { id: 'toc' as const, label: 'Inhalt', icon: FileText },
    { id: 'comments' as const, label: 'Kommentare', icon: MessageSquare },
  ]

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
      <div style={{ flex: 1, overflowY: 'auto', padding: activeTab === 'toc' ? 12 : 0 }}>
        {activeTab === 'toc' && (
          headings.length === 0 ? (
            <p style={{ fontSize: 12, color: '#a0a0a0', fontStyle: 'italic', margin: 0 }}>
              Fuegen Sie Ueberschriften hinzu, um ein Inhaltsverzeichnis zu erstellen.
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
                  {heading.text || 'Leere Ueberschrift'}
                </button>
              ))}
            </nav>
          )
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
