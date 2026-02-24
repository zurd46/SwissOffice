'use client'

import { Editor } from '@tiptap/react'
import { useState } from 'react'
import { RibbonTabStrip } from './RibbonTabStrip'
import { RibbonPanel } from './RibbonPanel'
import { TabStart } from './tabs/TabStart'
import { TabEinfuegen } from './tabs/TabEinfuegen'
import { TabSeitenlayout } from './tabs/TabSeitenlayout'
import { TabUeberpruefen } from './tabs/TabUeberpruefen'
import { TabSendungen } from './tabs/TabSendungen'
import { TabAnsicht } from './tabs/TabAnsicht'
import { TabKI } from './tabs/TabKI'

interface RibbonToolbarProps {
  editor: Editor
  onToggleFindReplace: () => void
  onToggleSidebar: () => void
  showSidebar: boolean
  onToggleAIChat: () => void
  showAIChat: boolean
  zoom: number
  setZoom: (zoom: number) => void
  isElectron?: boolean
  onAddComment?: (commentId: string) => void
  trackingEnabled?: boolean
  onToggleTracking?: () => void
  onAcceptAll?: () => void
  onRejectAll?: () => void
  spellCheckEnabled?: boolean
  onToggleSpellCheck?: () => void
  onInsertFootnote?: () => void
  onInsertCitation?: () => void
  onInsertBibliography?: () => void
  watermarkText?: string
  onSetWatermark?: (text: string) => void
  showRuler?: boolean
  onToggleRuler?: () => void
}

export function RibbonToolbar({
  editor,
  onToggleFindReplace,
  onToggleSidebar,
  showSidebar,
  onToggleAIChat,
  showAIChat,
  zoom,
  setZoom,
  isElectron,
  onAddComment,
  trackingEnabled = false,
  onToggleTracking,
  onAcceptAll,
  onRejectAll,
  spellCheckEnabled = false,
  onToggleSpellCheck,
  onInsertFootnote,
  onInsertCitation,
  onInsertBibliography,
  watermarkText = '',
  onSetWatermark,
  showRuler = true,
  onToggleRuler,
}: RibbonToolbarProps) {
  const [activeTab, setActiveTab] = useState('start')

  return (
    <div style={{ backgroundColor: '#f3f3f3', userSelect: 'none' }}>
      <RibbonTabStrip activeTab={activeTab} onTabChange={setActiveTab} isElectron={isElectron} />
      <RibbonPanel>
        {activeTab === 'start' && (
          <TabStart editor={editor} onToggleFindReplace={onToggleFindReplace} />
        )}
        {activeTab === 'einfuegen' && (
          <TabEinfuegen
            editor={editor}
            onInsertFootnote={onInsertFootnote}
            onInsertCitation={onInsertCitation}
            onInsertBibliography={onInsertBibliography}
          />
        )}
        {activeTab === 'seitenlayout' && (
          <TabSeitenlayout
            editor={editor}
            watermarkText={watermarkText}
            onSetWatermark={onSetWatermark}
          />
        )}
        {activeTab === 'ueberpruefen' && (
          <TabUeberpruefen
            editor={editor}
            onAddComment={onAddComment ?? (() => {})}
            trackingEnabled={trackingEnabled}
            onToggleTracking={onToggleTracking ?? (() => {})}
            onAcceptAll={onAcceptAll ?? (() => {})}
            onRejectAll={onRejectAll ?? (() => {})}
            spellCheckEnabled={spellCheckEnabled}
            onToggleSpellCheck={onToggleSpellCheck ?? (() => {})}
          />
        )}
        {activeTab === 'sendungen' && (
          <TabSendungen editor={editor} />
        )}
        {activeTab === 'ansicht' && (
          <TabAnsicht
            onToggleSidebar={onToggleSidebar}
            showSidebar={showSidebar}
            zoom={zoom}
            setZoom={setZoom}
            showRuler={showRuler}
            onToggleRuler={onToggleRuler}
          />
        )}
        {activeTab === 'ki' && (
          <TabKI
            editor={editor}
            onToggleAIChat={onToggleAIChat}
            showAIChat={showAIChat}
          />
        )}
      </RibbonPanel>
    </div>
  )
}
