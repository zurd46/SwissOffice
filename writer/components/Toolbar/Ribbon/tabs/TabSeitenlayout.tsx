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
        <div className="flex items-center gap-[2px]">
          <RibbonLargeButton
            onClick={() => {}}
            icon={<RectangleVertical size={20} className="text-[#0078d4]" />}
            label="Hochformat"
          />
          <RibbonLargeButton
            onClick={() => {}}
            icon={<FileText size={20} className="text-[#0078d4]" />}
            label="A4"
          />
          <RibbonLargeButton
            onClick={() => {}}
            icon={<Ruler size={20} className="text-[#605e5c]" />}
            label="25mm Rand"
          />
        </div>
      </RibbonGroup>

      <RibbonGroupLast label="Absatz">
        <div className="flex flex-col gap-[3px]">
          <div className="flex items-center gap-[4px]">
            <span className="text-[11px] text-[#605e5c] w-[42px]">Einzug:</span>
            <ToolbarButton onClick={() => editor.chain().focus().liftListItem('listItem').run()} title="Einzug verkleinern" disabled={!editor.can().liftListItem('listItem')}>
              <Outdent size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().sinkListItem('listItem').run()} title="Einzug vergrössern" disabled={!editor.can().sinkListItem('listItem')}>
              <Indent size={14} />
            </ToolbarButton>
          </div>
          <div className="flex items-center gap-[4px]">
            <span className="text-[11px] text-[#605e5c] w-[42px]">Abstand:</span>
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
