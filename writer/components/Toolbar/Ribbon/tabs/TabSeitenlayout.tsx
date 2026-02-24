'use client'

import { useState } from 'react'
import { Editor } from '@tiptap/react'
import {
  Indent, Outdent, FileText, RectangleVertical, RectangleHorizontal,
  Ruler, Settings, Columns2,
  PanelTop, PanelBottom, Hash, SeparatorHorizontal,
} from 'lucide-react'
import { ToolbarButton, ToolbarSelect, RibbonLargeButton } from '../../ToolbarButton'
import { RibbonGroup, RibbonGroupLast } from '../RibbonGroup'
import { LINE_HEIGHTS, PARAGRAPH_SPACINGS } from '../constants'
import { useDocumentSettings } from '../../../../lib/documentContext'
import { PAGE_SIZES, MARGIN_PRESETS } from '../../../../lib/constants/pageSizes'
import type { Orientation } from '../../../../lib/types/document'
import { PageSetupDialog } from '../../../Dialogs/PageSetupDialog'
import { HeaderFooterEditor } from '../../../Editor/HeaderFooterEditor'

interface TabSeitenlayoutProps {
  editor: Editor
}

export function TabSeitenlayout({ editor }: TabSeitenlayoutProps) {
  const { settings, updateOrientation, updatePageSize, updateMargins, updateHeaderContent, updateFooterContent, togglePageNumbers } = useDocumentSettings()
  const [showPageSetup, setShowPageSetup] = useState(false)
  const [showHeaderEditor, setShowHeaderEditor] = useState(false)
  const [showFooterEditor, setShowFooterEditor] = useState(false)

  const cycleOrientation = () => {
    const next: Orientation = settings.orientation === 'portrait' ? 'landscape' : 'portrait'
    updateOrientation(next)
  }

  const cyclePageSize = () => {
    const currentIndex = PAGE_SIZES.findIndex(s => s.name === settings.pageSize.name)
    const nextIndex = (currentIndex + 1) % PAGE_SIZES.length
    updatePageSize(PAGE_SIZES[nextIndex])
  }

  const cycleMargins = () => {
    const currentPreset = MARGIN_PRESETS.findIndex(p =>
      p.margins.top === settings.margins.top &&
      p.margins.right === settings.margins.right &&
      p.margins.bottom === settings.margins.bottom &&
      p.margins.left === settings.margins.left
    )
    const nextIndex = (currentPreset + 1) % MARGIN_PRESETS.length
    updateMargins(MARGIN_PRESETS[nextIndex].margins)
  }

  const currentMarginName = MARGIN_PRESETS.find(p =>
    p.margins.top === settings.margins.top &&
    p.margins.right === settings.margins.right &&
    p.margins.bottom === settings.margins.bottom &&
    p.margins.left === settings.margins.left
  )?.name || `${settings.margins.top}mm`

  return (
    <>
      <RibbonGroup label="Seite einrichten">
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RibbonLargeButton
            onClick={cycleOrientation}
            icon={settings.orientation === 'portrait'
              ? <RectangleVertical size={20} style={{ color: '#0078d4' }} />
              : <RectangleHorizontal size={20} style={{ color: '#0078d4' }} />
            }
            label={settings.orientation === 'portrait' ? 'Hochformat' : 'Querformat'}
            isActive={settings.orientation === 'landscape'}
          />
          <RibbonLargeButton
            onClick={cyclePageSize}
            icon={<FileText size={20} style={{ color: '#0078d4' }} />}
            label={settings.pageSize.name}
          />
          <RibbonLargeButton
            onClick={cycleMargins}
            icon={<Ruler size={20} style={{ color: '#605e5c' }} />}
            label={currentMarginName}
          />
          <RibbonLargeButton
            onClick={() => setShowPageSetup(true)}
            icon={<Settings size={20} style={{ color: '#605e5c' }} />}
            label="Einrichten..."
          />
        </div>
      </RibbonGroup>

      <RibbonGroup label="Kopf- & Fusszeile">
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RibbonLargeButton
            onClick={() => {
              if (settings.headerContent.enabled) {
                updateHeaderContent({ ...settings.headerContent, enabled: false })
              } else {
                setShowHeaderEditor(true)
              }
            }}
            icon={<PanelTop size={20} style={{ color: settings.headerContent.enabled ? '#0078d4' : '#605e5c' }} />}
            label="Kopfzeile"
            isActive={settings.headerContent.enabled}
          />
          <RibbonLargeButton
            onClick={() => {
              if (settings.footerContent.enabled) {
                updateFooterContent({ ...settings.footerContent, enabled: false })
              } else {
                setShowFooterEditor(true)
              }
            }}
            icon={<PanelBottom size={20} style={{ color: settings.footerContent.enabled ? '#0078d4' : '#605e5c' }} />}
            label="Fusszeile"
            isActive={settings.footerContent.enabled}
          />
          <RibbonLargeButton
            onClick={() => {
              togglePageNumbers(!settings.showPageNumbers)
            }}
            icon={<Hash size={20} style={{ color: settings.showPageNumbers ? '#0078d4' : '#605e5c' }} />}
            label="Seitenzahl"
            isActive={settings.showPageNumbers}
          />
        </div>
      </RibbonGroup>

      <RibbonGroup label="Umbrueche">
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RibbonLargeButton
            onClick={() => editor.chain().focus().setPageBreak().run()}
            icon={<SeparatorHorizontal size={20} style={{ color: '#605e5c' }} />}
            label="Seitenumbruch"
          />
          <RibbonLargeButton
            onClick={() => editor.chain().focus().setSectionBreak('nextPage').run()}
            icon={<Columns2 size={20} style={{ color: '#605e5c' }} />}
            label="Abschnitt"
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
            }} title="Einzug vergroessern">
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

      {/* Dialogs */}
      {showPageSetup && <PageSetupDialog onClose={() => setShowPageSetup(false)} />}
      {showHeaderEditor && (
        <HeaderFooterEditor
          title="Kopfzeile bearbeiten"
          initialContent={settings.headerContent.html}
          onSave={(html) => {
            updateHeaderContent({ html, enabled: true })
            setShowHeaderEditor(false)
          }}
          onClose={() => setShowHeaderEditor(false)}
        />
      )}
      {showFooterEditor && (
        <HeaderFooterEditor
          title="Fusszeile bearbeiten"
          initialContent={settings.footerContent.html}
          onSave={(html) => {
            updateFooterContent({ html, enabled: true })
            setShowFooterEditor(false)
          }}
          onClose={() => setShowFooterEditor(false)}
        />
      )}
    </>
  )
}
