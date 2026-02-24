'use client'

import { Editor } from '@tiptap/react'
import {
  Indent, Outdent, FileText, RectangleVertical, Ruler,
} from 'lucide-react'
import { ToolbarButton, ToolbarSelect, RibbonLargeButton } from '../../ToolbarButton'
import { RibbonGroup, RibbonGroupLast } from '../RibbonGroup'
import { LINE_HEIGHTS } from '../constants'

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
            <ToolbarButton onClick={() => editor.chain().focus().liftListItem('listItem').run()} title="Einzug verkleinern" disabled={!editor.can().liftListItem('listItem')}>
              <Outdent size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().sinkListItem('listItem').run()} title="Einzug vergrössern" disabled={!editor.can().sinkListItem('listItem')}>
              <Indent size={14} />
            </ToolbarButton>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#605e5c', width: 42 }}>Abstand:</span>
            <ToolbarSelect
              value="1.5"
              onChange={(v) => editor.chain().focus().setLineHeight(v).run()}
              options={LINE_HEIGHTS}
              title="Zeilenabstand"
              className="w-[54px]"
            />
          </div>
        </div>
      </RibbonGroupLast>
    </>
  )
}
