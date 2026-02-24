'use client'

import { Editor } from '@tiptap/react'
import {
  Indent, Outdent, FileText, RectangleVertical, Ruler,
} from 'lucide-react'
import { ToolbarButton, ToolbarSelect } from '../../ToolbarButton'
import { RibbonGroup, RibbonGroupLast } from '../RibbonGroup'
import { LINE_HEIGHTS } from '../constants'

interface TabSeitenlayoutProps {
  editor: Editor
}

export function TabSeitenlayout({ editor }: TabSeitenlayoutProps) {
  return (
    <>
      {/* Seite einrichten (Page Setup) */}
      <RibbonGroup label="Seite einrichten">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded border border-gray-200">
              <RectangleVertical size={14} className="text-gray-500" />
              <span className="text-xs text-gray-600">Hochformat</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded border border-gray-200">
              <FileText size={14} className="text-gray-500" />
              <span className="text-xs text-gray-600">A4</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded border border-gray-200">
            <Ruler size={14} className="text-gray-500" />
            <span className="text-xs text-gray-600">Ränder: 25mm</span>
          </div>
        </div>
      </RibbonGroup>

      {/* Absatz (Paragraph) */}
      <RibbonGroupLast label="Absatz">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-gray-500 w-14">Einzug:</span>
            <ToolbarButton onClick={() => editor.chain().focus().liftListItem('listItem').run()} title="Einzug verkleinern" disabled={!editor.can().liftListItem('listItem')}>
              <Outdent size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().sinkListItem('listItem').run()} title="Einzug vergrössern" disabled={!editor.can().sinkListItem('listItem')}>
              <Indent size={16} />
            </ToolbarButton>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-gray-500 w-14">Abstand:</span>
            <ToolbarSelect
              value="1.5"
              onChange={(v) => editor.chain().focus().setLineHeight(v).run()}
              options={LINE_HEIGHTS}
              title="Zeilenabstand"
              className="w-16 h-7 text-xs"
            />
          </div>
        </div>
      </RibbonGroupLast>
    </>
  )
}
