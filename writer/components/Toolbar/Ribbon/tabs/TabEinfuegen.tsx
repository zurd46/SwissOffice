'use client'

import { Editor } from '@tiptap/react'
import {
  FileDown, FileImage, Link, Minus, Table, ImagePlus,
} from 'lucide-react'
import { RibbonLargeButton } from '../../ToolbarButton'
import { RibbonGroup, RibbonGroupLast } from '../RibbonGroup'
import { TableGridPicker } from '../TableGridPicker'
import { useState, useCallback } from 'react'

interface TabEinfuegenProps {
  editor: Editor
}

export function TabEinfuegen({ editor }: TabEinfuegenProps) {
  const [showTablePicker, setShowTablePicker] = useState(false)

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

      <RibbonGroupLast label="Elemente">
        <RibbonLargeButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={<Minus size={20} style={{ color: '#605e5c' }} />}
          label="Linie"
        />
      </RibbonGroupLast>
    </>
  )
}
