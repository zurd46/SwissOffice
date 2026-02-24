'use client'

import { Editor } from '@tiptap/react'
import {
  Indent, Outdent, FileText, RectangleVertical, Ruler,
} from 'lucide-react'
import { ToolbarButton, ToolbarSelect, RibbonLargeButton } from '../../ToolbarButton'
import { RibbonGroup, RibbonGroupLast } from '../RibbonGroup'
import { LINE_HEIGHTS, PARAGRAPH_SPACINGS } from '../constants'

interface TabSeitenlayoutProps {
  editor: Editor
}

export function TabSeitenlayout({ editor }: TabSeitenlayoutProps) {
  return (
    <>
      <RibbonGroup label="Seite einrichten">
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RibbonLargeButton
            onClick={() => {}}
            icon={<RectangleVertical size={20} style={{ color: '#0078d4' }} />}
            label="Hochformat"
          />
          <RibbonLargeButton
            onClick={() => {}}
            icon={<FileText size={20} style={{ color: '#0078d4' }} />}
            label="A4"
          />
          <RibbonLargeButton
            onClick={() => {}}
            icon={<Ruler size={20} style={{ color: '#605e5c' }} />}
            label="25mm Rand"
          />
        </div>
      </RibbonGroup>

      <RibbonGroupLast label="Absatz">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#605e5c', width: 42 }}>Einzug:</span>
            <ToolbarButton onClick={() => {
              if (editor.can().liftListItem('listItem')) {
                editor.chain().focus().liftListItem('listItem').run()
              } else {
                editor.chain().focus().decreaseIndent().run()
              }
            }} title="Einzug verkleinern">
              <Outdent size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => {
              if (editor.can().sinkListItem('listItem')) {
                editor.chain().focus().sinkListItem('listItem').run()
              } else {
                editor.chain().focus().increaseIndent().run()
              }
            }} title="Einzug vergrössern">
              <Indent size={14} />
            </ToolbarButton>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#605e5c', width: 42 }}>Zeile:</span>
            <ToolbarSelect
              value={editor.getAttributes('paragraph').lineHeight || '1.5'}
              onChange={(v) => editor.chain().focus().setLineHeight(v).run()}
              options={LINE_HEIGHTS}
              title="Zeilenabstand"
              className="w-[54px]"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#605e5c', width: 42 }}>Davor:</span>
            <ToolbarSelect
              value={editor.getAttributes('paragraph').spaceBefore || '0pt'}
              onChange={(v) => editor.chain().focus().setSpaceBefore(v).run()}
              options={PARAGRAPH_SPACINGS}
              title="Abstand davor"
              className="w-[54px]"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#605e5c', width: 42 }}>Danach:</span>
            <ToolbarSelect
              value={editor.getAttributes('paragraph').spaceAfter || '8pt'}
              onChange={(v) => editor.chain().focus().setSpaceAfter(v).run()}
              options={PARAGRAPH_SPACINGS}
              title="Abstand danach"
              className="w-[54px]"
            />
          </div>
        </div>
      </RibbonGroupLast>
    </>
  )
}
