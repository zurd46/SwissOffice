'use client'

// =============================================
// ImpulsTabulator — Ribbon-Toolbar
// =============================================

import { useState } from 'react'
import { RibbonTabStrip } from './RibbonTabStrip'
import { RibbonPanel } from './RibbonPanel'
import { TabStart } from './tabs/TabStart'
import { TabEinfuegen } from './tabs/TabEinfuegen'
import { TabSeitenlayout } from './tabs/TabSeitenlayout'
import { TabDaten } from './tabs/TabDaten'
import { TabFormeln } from './tabs/TabFormeln'

interface RibbonToolbarProps {
  isElectron?: boolean
  onToggleFindReplace: () => void
  onPrint: () => void
}

export function RibbonToolbar({
  isElectron,
  onToggleFindReplace,
  onPrint,
}: RibbonToolbarProps) {
  const [activeTab, setActiveTab] = useState('start')

  return (
    <div style={{ backgroundColor: '#f3f3f3', userSelect: 'none', flexShrink: 0 }}>
      <RibbonTabStrip activeTab={activeTab} onTabChange={setActiveTab} isElectron={isElectron} />
      <RibbonPanel>
        {activeTab === 'start' && (
          <TabStart onToggleFindReplace={onToggleFindReplace} />
        )}
        {activeTab === 'einfuegen' && (
          <TabEinfuegen />
        )}
        {activeTab === 'seitenlayout' && (
          <TabSeitenlayout onPrint={onPrint} />
        )}
        {activeTab === 'daten' && (
          <TabDaten />
        )}
        {activeTab === 'formeln' && (
          <TabFormeln />
        )}
      </RibbonPanel>
    </div>
  )
}
