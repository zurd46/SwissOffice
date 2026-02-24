'use client'

import { Editor } from '@tiptap/react'
import { useEffect, useState, useCallback } from 'react'
import { FileText, X } from 'lucide-react'

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
    // Scroll the editor view to the heading
    const domAtPos = editor.view.domAtPos(pos)
    const node = domAtPos.node as HTMLElement
    if (node.scrollIntoView) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <FileText size={16} className="text-blue-600" />
        <span className="text-sm font-semibold text-gray-700">Inhaltsverzeichnis</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {headings.length === 0 ? (
          <p className="text-xs text-gray-400 italic">
            Fügen Sie Überschriften hinzu, um ein Inhaltsverzeichnis zu erstellen.
          </p>
        ) : (
          <nav className="space-y-1">
            {headings.map((heading, index) => (
              <button
                key={index}
                onClick={() => scrollToHeading(heading.pos)}
                className={`
                  w-full text-left px-2 py-1 rounded text-sm hover:bg-blue-50 hover:text-blue-700
                  transition-colors truncate block
                `}
                style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
                title={heading.text}
              >
                <span className={`
                  ${heading.level === 1 ? 'font-semibold text-gray-800' : ''}
                  ${heading.level === 2 ? 'font-medium text-gray-700' : ''}
                  ${heading.level >= 3 ? 'text-gray-600' : ''}
                `}>
                  {heading.text || 'Leere Überschrift'}
                </span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  )
}
