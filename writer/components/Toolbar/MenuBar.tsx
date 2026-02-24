'use client'

import { Editor } from '@tiptap/react'
import { useState, useRef, useEffect } from 'react'
import { saveDocument, saveAsHTML, loadDocument, newDocument, printDocument } from '../../lib/fileOperations'
import { exportPDF } from '../Export/exportPDF'
import { exportDOCX } from '../Export/exportDOCX'

interface MenuBarProps {
  editor: Editor
  documentName: string
  setDocumentName: (name: string) => void
  onToggleFindReplace: () => void
  onToggleSidebar: () => void
}

type MenuItem = {
  label: string
  action?: () => void
  shortcut?: string
  divider?: boolean
}

type Menu = {
  label: string
  items: MenuItem[]
}

export function MenuBar({ editor, documentName, setDocumentName, onToggleFindReplace, onToggleSidebar }: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const menus: Menu[] = [
    {
      label: 'Datei',
      items: [
        { label: 'Neu', action: () => { newDocument(editor); setDocumentName('Unbenannt') }, shortcut: 'Ctrl+N' },
        { label: 'Öffnen...', action: () => loadDocument(editor), shortcut: 'Ctrl+O' },
        { label: '', divider: true },
        { label: 'Speichern', action: () => saveDocument(editor, documentName), shortcut: 'Ctrl+S' },
        { label: 'Als HTML speichern', action: () => saveAsHTML(editor, documentName) },
        { label: '', divider: true },
        { label: 'Als PDF exportieren', action: () => exportPDF(editor, documentName) },
        { label: 'Als DOCX exportieren', action: () => exportDOCX(editor, documentName) },
        { label: '', divider: true },
        { label: 'Drucken', action: () => printDocument(), shortcut: 'Ctrl+P' },
      ],
    },
    {
      label: 'Bearbeiten',
      items: [
        { label: 'Rückgängig', action: () => editor.chain().focus().undo().run(), shortcut: 'Ctrl+Z' },
        { label: 'Wiederholen', action: () => editor.chain().focus().redo().run(), shortcut: 'Ctrl+Y' },
        { label: '', divider: true },
        { label: 'Alles markieren', action: () => editor.chain().focus().selectAll().run(), shortcut: 'Ctrl+A' },
        { label: '', divider: true },
        { label: 'Suchen & Ersetzen', action: onToggleFindReplace, shortcut: 'Ctrl+H' },
      ],
    },
    {
      label: 'Einfügen',
      items: [
        {
          label: 'Bild...', action: () => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = () => {
                editor.chain().focus().setImage({ src: reader.result as string }).run()
              }
              reader.readAsDataURL(file)
            }
            input.click()
          }
        },
        {
          label: 'Tabelle (3x3)', action: () => {
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        },
        { label: 'Horizontale Linie', action: () => editor.chain().focus().setHorizontalRule().run() },
        { label: 'Seitenumbruch', action: () => editor.chain().focus().setPageBreak().run() },
        { label: '', divider: true },
        {
          label: 'Link...', action: () => {
            const url = prompt('URL eingeben:')
            if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
          }
        },
      ],
    },
    {
      label: 'Format',
      items: [
        { label: 'Fett', action: () => editor.chain().focus().toggleBold().run(), shortcut: 'Ctrl+B' },
        { label: 'Kursiv', action: () => editor.chain().focus().toggleItalic().run(), shortcut: 'Ctrl+I' },
        { label: 'Unterstrichen', action: () => editor.chain().focus().toggleUnderline().run(), shortcut: 'Ctrl+U' },
        { label: 'Durchgestrichen', action: () => editor.chain().focus().toggleStrike().run() },
        { label: '', divider: true },
        { label: 'Formatierung entfernen', action: () => editor.chain().focus().clearNodes().unsetAllMarks().run() },
      ],
    },
    {
      label: 'Tabelle',
      items: [
        { label: 'Tabelle einfügen', action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
        { label: '', divider: true },
        { label: 'Spalte davor', action: () => editor.chain().focus().addColumnBefore().run() },
        { label: 'Spalte danach', action: () => editor.chain().focus().addColumnAfter().run() },
        { label: 'Spalte löschen', action: () => editor.chain().focus().deleteColumn().run() },
        { label: '', divider: true },
        { label: 'Zeile darüber', action: () => editor.chain().focus().addRowBefore().run() },
        { label: 'Zeile darunter', action: () => editor.chain().focus().addRowAfter().run() },
        { label: 'Zeile löschen', action: () => editor.chain().focus().deleteRow().run() },
        { label: '', divider: true },
        { label: 'Tabelle löschen', action: () => editor.chain().focus().deleteTable().run() },
        { label: 'Zellen verbinden', action: () => editor.chain().focus().mergeCells().run() },
        { label: 'Zellen teilen', action: () => editor.chain().focus().splitCell().run() },
      ],
    },
    {
      label: 'Ansicht',
      items: [
        { label: 'Seitenleiste ein/aus', action: onToggleSidebar },
        { label: 'Suchen & Ersetzen', action: onToggleFindReplace, shortcut: 'Ctrl+H' },
      ],
    },
  ]

  return (
    <div ref={menuRef} className="bg-white border-b border-gray-200 flex items-center px-2 h-9 select-none">
      {/* Document Name */}
      <div className="flex items-center mr-4">
        <span className="text-blue-600 font-semibold text-sm mr-2">W</span>
        <input
          type="text"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          className="text-sm font-medium bg-transparent border-none outline-none hover:bg-gray-100 px-1 rounded w-40"
        />
      </div>

      {/* Menus */}
      {menus.map(menu => (
        <div key={menu.label} className="relative">
          <button
            className={`px-3 py-1 text-sm rounded hover:bg-gray-100 ${activeMenu === menu.label ? 'bg-gray-200' : ''}`}
            onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
            onMouseEnter={() => activeMenu && setActiveMenu(menu.label)}
          >
            {menu.label}
          </button>

          {activeMenu === menu.label && (
            <div className="absolute left-0 top-full mt-0.5 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 min-w-[220px]">
              {menu.items.map((item, i) => (
                item.divider ? (
                  <div key={i} className="border-t border-gray-100 my-1" />
                ) : (
                  <button
                    key={i}
                    className="w-full text-left px-4 py-1.5 text-sm hover:bg-blue-50 flex justify-between items-center"
                    onClick={() => {
                      item.action?.()
                      setActiveMenu(null)
                    }}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && <span className="text-xs text-gray-400 ml-4">{item.shortcut}</span>}
                  </button>
                )
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
