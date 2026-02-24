'use client'

import { Editor } from '@tiptap/react'
import {
  FileDown, FileImage, Link, Minus, Table, ImagePlus,
  Footprints, BookOpen, ListOrdered, Square, Type, Omega,
} from 'lucide-react'
import { RibbonLargeButton } from '../../ToolbarButton'
import { RibbonGroup, RibbonGroupLast } from '../RibbonGroup'
import { TableGridPicker } from '../TableGridPicker'
import { useState, useCallback } from 'react'

interface TabEinfuegenProps {
  editor: Editor
  onInsertFootnote?: () => void
  onInsertCitation?: () => void
  onInsertBibliography?: () => void
}

const SPECIAL_CHARS = [
  { char: '\u2014', label: 'Geviertstrich' },
  { char: '\u2013', label: 'Halbgeviertstrich' },
  { char: '\u00A0', label: 'Geschütztes Leerzeichen' },
  { char: '\u00A9', label: 'Copyright' },
  { char: '\u00AE', label: 'Registered' },
  { char: '\u2122', label: 'Trademark' },
  { char: '\u00B0', label: 'Grad' },
  { char: '\u00B1', label: 'Plus-Minus' },
  { char: '\u00D7', label: 'Multiplikation' },
  { char: '\u00F7', label: 'Division' },
  { char: '\u2026', label: 'Ellipse' },
  { char: '\u00AB', label: 'Guillemet links' },
  { char: '\u00BB', label: 'Guillemet rechts' },
  { char: '\u201E', label: 'Anführungszeichen unten' },
  { char: '\u201C', label: 'Anführungszeichen oben' },
  { char: '\u2039', label: 'Guillemet einfach links' },
  { char: '\u203A', label: 'Guillemet einfach rechts' },
  { char: '\u20AC', label: 'Euro' },
  { char: '\u00A3', label: 'Pfund' },
  { char: '\u00A5', label: 'Yen' },
  { char: '\u00A7', label: 'Paragraph' },
  { char: '\u2020', label: 'Kreuz' },
  { char: '\u2021', label: 'Doppelkreuz' },
  { char: '\u2022', label: 'Aufzählungszeichen' },
  { char: '\u2190', label: 'Pfeil links' },
  { char: '\u2192', label: 'Pfeil rechts' },
  { char: '\u2191', label: 'Pfeil oben' },
  { char: '\u2193', label: 'Pfeil unten' },
  { char: '\u00BC', label: '1/4' },
  { char: '\u00BD', label: '1/2' },
  { char: '\u00BE', label: '3/4' },
  { char: '\u221E', label: 'Unendlich' },
]

export function TabEinfuegen({ editor, onInsertFootnote, onInsertCitation, onInsertBibliography }: TabEinfuegenProps) {
  const [showTablePicker, setShowTablePicker] = useState(false)
  const [showCharPicker, setShowCharPicker] = useState(false)

  const insertImageFromFile = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const src = reader.result as string
        editor.chain().focus().setResizableImage({ src }).run()
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }, [editor])

  const insertImageFromUrl = useCallback(() => {
    const url = prompt('Bild-URL eingeben:')
    if (url) {
      editor.chain().focus().setResizableImage({ src: url }).run()
    }
  }, [editor])

  const insertLink = useCallback(() => {
    const url = prompt('URL eingeben:')
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }, [editor])

  const insertTable = useCallback((rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
  }, [editor])

  return (
    <>
      <RibbonGroup label="Seiten">
        <RibbonLargeButton
          onClick={() => editor.chain().focus().setPageBreak().run()}
          icon={<FileDown size={20} style={{ color: '#0078d4' }} />}
          label="Seitenumbruch"
        />
      </RibbonGroup>

      <RibbonGroup label="Tabellen">
        <div style={{ position: 'relative' }}>
          <RibbonLargeButton
            onClick={() => setShowTablePicker(!showTablePicker)}
            icon={<Table size={20} style={{ color: '#0078d4' }} />}
            label="Tabelle"
          />
          {showTablePicker && (
            <TableGridPicker
              onInsert={insertTable}
              onClose={() => setShowTablePicker(false)}
            />
          )}
        </div>
      </RibbonGroup>

      <RibbonGroup label="Medien">
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RibbonLargeButton
            onClick={insertImageFromFile}
            icon={<FileImage size={20} style={{ color: '#107c10' }} />}
            label="Bild"
          />
          <RibbonLargeButton
            onClick={insertImageFromUrl}
            icon={<ImagePlus size={20} style={{ color: '#107c10' }} />}
            label="Bild-URL"
          />
        </div>
      </RibbonGroup>

      <RibbonGroup label="Links">
        <RibbonLargeButton
          onClick={insertLink}
          icon={<Link size={20} style={{ color: '#0078d4' }} />}
          label="Hyperlink"
          isActive={editor.isActive('link')}
        />
      </RibbonGroup>

      <RibbonGroup label="Verweise">
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RibbonLargeButton
            onClick={onInsertFootnote ?? (() => {})}
            icon={<Footprints size={20} style={{ color: '#605e5c' }} />}
            label="Fussnote"
          />
          <RibbonLargeButton
            onClick={onInsertCitation ?? (() => {})}
            icon={<BookOpen size={20} style={{ color: '#605e5c' }} />}
            label="Zitat"
          />
          <RibbonLargeButton
            onClick={onInsertBibliography ?? (() => {})}
            icon={<ListOrdered size={20} style={{ color: '#605e5c' }} />}
            label="Bibliografie"
          />
        </div>
      </RibbonGroup>

      <RibbonGroup label="Objekte">
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RibbonLargeButton
            onClick={() => editor.chain().focus().insertTextBox().run()}
            icon={<Type size={20} style={{ color: '#605e5c' }} />}
            label="Textfeld"
          />
          <RibbonLargeButton
            onClick={() => editor.chain().focus().insertShape('rectangle').run()}
            icon={<Square size={20} style={{ color: '#4a90d9' }} />}
            label="Form"
          />
        </div>
      </RibbonGroup>

      <RibbonGroupLast label="Elemente">
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RibbonLargeButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            icon={<Minus size={20} style={{ color: '#605e5c' }} />}
            label="Linie"
          />
          <div style={{ position: 'relative' }}>
            <RibbonLargeButton
              onClick={() => setShowCharPicker(!showCharPicker)}
              icon={<Omega size={20} style={{ color: '#605e5c' }} />}
              label="Sonderzeichen"
            />
            {showCharPicker && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, zIndex: 100,
                backgroundColor: 'white', border: '1px solid #d2d0ce', borderRadius: 4,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', padding: 8, width: 280,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#323130', marginBottom: 6 }}>
                  Sonderzeichen einfügen
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2,
                }}>
                  {SPECIAL_CHARS.map(({ char, label }) => (
                    <button
                      key={label}
                      title={label}
                      onClick={() => {
                        editor.chain().focus().insertContent(char).run()
                        setShowCharPicker(false)
                      }}
                      style={{
                        width: 30, height: 30, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', border: '1px solid #e1dfdd', borderRadius: 3,
                        backgroundColor: 'transparent', cursor: 'pointer', fontSize: 15,
                        color: '#323130',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#e0f0ff'
                        e.currentTarget.style.borderColor = '#0078d4'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.borderColor = '#e1dfdd'
                      }}
                    >
                      {char === '\u00A0' ? '⎵' : char}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </RibbonGroupLast>
    </>
  )
}
