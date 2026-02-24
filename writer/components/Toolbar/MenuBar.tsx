'use client'

import { Editor } from '@tiptap/react'
import { useState, useRef, useEffect } from 'react'
import { saveDocument, saveAsHTML, loadDocument, newDocument, printDocument } from '../../lib/fileOperations'
import { exportPDF } from '../Export/exportPDF'
import { exportDOCX } from '../Export/exportDOCX'
import {
  File, FilePlus, FolderOpen, Save, FileText, FileDown, FileOutput, Printer,
  Undo2, Redo2, MousePointerClick, Search,
  Image, Table, Minus, FileDown as PageBreak, Link,
  Bold, Italic, Underline, Strikethrough, RemoveFormatting,
  TableProperties, Columns2, Rows3, Trash2, Merge, Split,
  PanelLeft,
} from 'lucide-react'

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
  icon?: React.ReactNode
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
        { label: 'Neu', action: () => { newDocument(editor); setDocumentName('Unbenannt') }, shortcut: 'Ctrl+N', icon: <FilePlus size={15} /> },
        { label: 'Öffnen...', action: () => loadDocument(editor), shortcut: 'Ctrl+O', icon: <FolderOpen size={15} /> },
        { label: '', divider: true },
        { label: 'Speichern', action: () => saveDocument(editor, documentName), shortcut: 'Ctrl+S', icon: <Save size={15} /> },
        { label: 'Als HTML speichern', action: () => saveAsHTML(editor, documentName), icon: <FileText size={15} /> },
        { label: '', divider: true },
        { label: 'Als PDF exportieren', action: () => exportPDF(editor, documentName), icon: <FileDown size={15} /> },
        { label: 'Als DOCX exportieren', action: () => exportDOCX(editor, documentName), icon: <FileOutput size={15} /> },
        { label: '', divider: true },
        { label: 'Drucken', action: () => printDocument(), shortcut: 'Ctrl+P', icon: <Printer size={15} /> },
      ],
    },
    {
      label: 'Bearbeiten',
      items: [
        { label: 'Rückgängig', action: () => editor.chain().focus().undo().run(), shortcut: 'Ctrl+Z', icon: <Undo2 size={15} /> },
        { label: 'Wiederholen', action: () => editor.chain().focus().redo().run(), shortcut: 'Ctrl+Y', icon: <Redo2 size={15} /> },
        { label: '', divider: true },
        { label: 'Alles markieren', action: () => editor.chain().focus().selectAll().run(), shortcut: 'Ctrl+A', icon: <MousePointerClick size={15} /> },
        { label: '', divider: true },
        { label: 'Suchen & Ersetzen', action: onToggleFindReplace, shortcut: 'Ctrl+H', icon: <Search size={15} /> },
      ],
    },
    {
      label: 'Einfügen',
      items: [
        {
          label: 'Bild...', icon: <Image size={15} />, action: () => {
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
          label: 'Tabelle (3x3)', icon: <Table size={15} />, action: () => {
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        },
        { label: 'Horizontale Linie', action: () => editor.chain().focus().setHorizontalRule().run(), icon: <Minus size={15} /> },
        { label: 'Seitenumbruch', action: () => editor.chain().focus().setPageBreak().run(), icon: <PageBreak size={15} /> },
        { label: '', divider: true },
        {
          label: 'Link...', icon: <Link size={15} />, action: () => {
            const url = prompt('URL eingeben:')
            if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
          }
        },
      ],
    },
    {
      label: 'Format',
      items: [
        { label: 'Fett', action: () => editor.chain().focus().toggleBold().run(), shortcut: 'Ctrl+B', icon: <Bold size={15} /> },
        { label: 'Kursiv', action: () => editor.chain().focus().toggleItalic().run(), shortcut: 'Ctrl+I', icon: <Italic size={15} /> },
        { label: 'Unterstrichen', action: () => editor.chain().focus().toggleUnderline().run(), shortcut: 'Ctrl+U', icon: <Underline size={15} /> },
        { label: 'Durchgestrichen', action: () => editor.chain().focus().toggleStrike().run(), icon: <Strikethrough size={15} /> },
        { label: '', divider: true },
        { label: 'Formatierung entfernen', action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(), icon: <RemoveFormatting size={15} /> },
      ],
    },
    {
      label: 'Tabelle',
      items: [
        { label: 'Tabelle einfügen', action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), icon: <TableProperties size={15} /> },
        { label: '', divider: true },
        { label: 'Spalte davor', action: () => editor.chain().focus().addColumnBefore().run(), icon: <Columns2 size={15} /> },
        { label: 'Spalte danach', action: () => editor.chain().focus().addColumnAfter().run(), icon: <Columns2 size={15} /> },
        { label: 'Spalte löschen', action: () => editor.chain().focus().deleteColumn().run(), icon: <Trash2 size={15} /> },
        { label: '', divider: true },
        { label: 'Zeile darüber', action: () => editor.chain().focus().addRowBefore().run(), icon: <Rows3 size={15} /> },
        { label: 'Zeile darunter', action: () => editor.chain().focus().addRowAfter().run(), icon: <Rows3 size={15} /> },
        { label: 'Zeile löschen', action: () => editor.chain().focus().deleteRow().run(), icon: <Trash2 size={15} /> },
        { label: '', divider: true },
        { label: 'Tabelle löschen', action: () => editor.chain().focus().deleteTable().run(), icon: <Trash2 size={15} /> },
        { label: 'Zellen verbinden', action: () => editor.chain().focus().mergeCells().run(), icon: <Merge size={15} /> },
        { label: 'Zellen teilen', action: () => editor.chain().focus().splitCell().run(), icon: <Split size={15} /> },
      ],
    },
    {
      label: 'Ansicht',
      items: [
        { label: 'Seitenleiste ein/aus', action: onToggleSidebar, icon: <PanelLeft size={15} /> },
        { label: 'Suchen & Ersetzen', action: onToggleFindReplace, shortcut: 'Ctrl+H', icon: <Search size={15} /> },
      ],
    },
  ]

  return (
    <div ref={menuRef} className="bg-[#f8f8f8] border-b border-[#e1dfdd] flex items-center h-[40px] select-none">
      {/* Logo + Document Name */}
      <div className="flex items-center gap-3 pl-4 pr-5 h-full">
        <div className="w-6 h-6 bg-[#185abd] rounded flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-[13px] leading-none">W</span>
        </div>
        <input
          type="text"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          className="text-[13px] font-semibold text-[#323130] bg-transparent border-none outline-none hover:bg-white focus:bg-white px-2 py-1 rounded w-[150px] transition-colors"
        />
      </div>

      {/* Vertical separator */}
      <div className="w-px h-5 bg-[#d2d0ce]" />

      {/* Menu Items */}
      <nav className="flex items-center h-full ml-3">
        {menus.map(menu => (
          <div key={menu.label} className="relative h-full flex items-center">
            <button
              className={`
                mx-[2px] px-4 py-[6px] text-[13px] rounded transition-colors duration-100
                ${activeMenu === menu.label
                  ? 'bg-white text-[#201f1e] shadow-sm'
                  : 'text-[#444] hover:bg-white/70 hover:text-[#201f1e]'
                }
              `}
              onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
              onMouseEnter={() => activeMenu && setActiveMenu(menu.label)}
            >
              {menu.label}
            </button>

            {activeMenu === menu.label && (
              <div className="absolute left-0 top-full mt-px bg-white border border-[#e1dfdd] rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] py-1.5 z-50 min-w-[260px]">
                {menu.items.map((item, i) => (
                  item.divider ? (
                    <div key={i} className="border-t border-[#f0f0f0] my-1.5 mx-3" />
                  ) : (
                    <button
                      key={i}
                      className="w-full text-left px-3 py-[7px] text-[13px] text-[#323130] hover:bg-[#f5f5f5] flex items-center transition-colors duration-75 cursor-pointer rounded-md mx-1.5 pr-4"
                      style={{ width: 'calc(100% - 12px)' }}
                      onClick={() => {
                        item.action?.()
                        setActiveMenu(null)
                      }}
                    >
                      <span className="w-6 h-5 flex items-center justify-center mr-3 text-[#605e5c] shrink-0">
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {item.shortcut && <span className="text-[11px] text-[#a19f9d] ml-6 shrink-0">{item.shortcut}</span>}
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}
