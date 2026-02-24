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
    <div ref={menuRef} style={{ display: 'flex', alignItems: 'center', height: 38, backgroundColor: '#f9f9f9', borderBottom: '1px solid #e5e5e5', userSelect: 'none' }}>
      {/* Logo + Document Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 14, paddingRight: 20, height: '100%' }}>
        <div style={{ width: 24, height: 24, backgroundColor: '#185abd', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 13, lineHeight: 1 }}>W</span>
        </div>
        <input
          type="text"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          style={{ fontSize: 13, fontWeight: 500, color: '#242424', backgroundColor: 'transparent', border: 'none', outline: 'none', padding: '3px 8px', borderRadius: 4, width: 150 }}
        />
      </div>

      {/* Vertical separator */}
      <div style={{ width: 1, height: 18, backgroundColor: '#d9d9d9' }} />

      {/* Menu Items */}
      <nav style={{ display: 'flex', alignItems: 'center', height: '100%', marginLeft: 12, gap: 4 }}>
        {menus.map(menu => (
          <div key={menu.label} style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
            <button
              style={{
                padding: '5px 14px',
                fontSize: 13,
                borderRadius: 5,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.1s',
                backgroundColor: activeMenu === menu.label ? 'white' : 'transparent',
                color: activeMenu === menu.label ? '#242424' : '#505050',
                boxShadow: activeMenu === menu.label ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
              onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
              onMouseEnter={() => activeMenu && setActiveMenu(menu.label)}
            >
              {menu.label}
            </button>

            {activeMenu === menu.label && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: '100%',
                marginTop: 2,
                backgroundColor: 'white',
                border: '1px solid #d6d6d6',
                borderRadius: 8,
                boxShadow: '0 6px 24px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)',
                padding: '6px 0',
                zIndex: 50,
                minWidth: 260,
              }}>
                {menu.items.map((item, i) => (
                  item.divider ? (
                    <div key={i} style={{ height: 1, backgroundColor: '#e8e6e4', margin: '6px 12px' }} />
                  ) : (
                    <button
                      key={i}
                      className="menu-dropdown-item"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: 'calc(100% - 12px)',
                        margin: '0 6px',
                        padding: '7px 12px',
                        fontSize: 13,
                        color: '#242424',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: 5,
                        cursor: 'pointer',
                        transition: 'background-color 0.075s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#eff6fc' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      onClick={() => {
                        item.action?.()
                        setActiveMenu(null)
                      }}
                    >
                      <span style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10, color: '#616161', flexShrink: 0 }}>
                        {item.icon}
                      </span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.shortcut && (
                        <span style={{ fontSize: 11, color: '#adadad', marginLeft: 20, flexShrink: 0, fontWeight: 300, letterSpacing: '0.03em' }}>
                          {item.shortcut}
                        </span>
                      )}
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
