'use client'

import { Editor } from '@tiptap/react'
import { useState } from 'react'
import { RibbonTabStrip } from './RibbonTabStrip'
import { RibbonPanel } from './RibbonPanel'
import { TabStart } from './tabs/TabStart'
import { TabEinfuegen } from './tabs/TabEinfuegen'
import { TabSeitenlayout } from './tabs/TabSeitenlayout'
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
          <TabEinfuegen editor={editor} />
        )}
        {activeTab === 'seitenlayout' && (
          <TabSeitenlayout editor={editor} />
        )}
        {activeTab === 'ansicht' && (
          <TabAnsicht
            onToggleSidebar={onToggleSidebar}
            showSidebar={showSidebar}
            zoom={zoom}
            setZoom={setZoom}
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
