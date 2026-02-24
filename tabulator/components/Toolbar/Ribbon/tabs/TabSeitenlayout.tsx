'use client'

// =============================================
// ImpulsTabulator — Ribbon Tab: Seitenlayout
// =============================================

import { Printer, FileText } from 'lucide-react'
import { RibbonGroupLast } from '../RibbonGroup'
import { RibbonLargeButton } from '../../ToolbarButton'

interface TabSeitenlayoutProps {
  onPrint: () => void
}

export function TabSeitenlayout({ onPrint }: TabSeitenlayoutProps) {
  return (
    <>
      <RibbonGroupLast label="Seite einrichten">
        <RibbonLargeButton
          onClick={onPrint}
          icon={<Printer size={20} />}
          label="Drucken"
        />
        <RibbonLargeButton
          onClick={() => {}}
          icon={<FileText size={20} />}
          label="Druckbereich"
        />
      </RibbonGroupLast>
    </>
  )
}
