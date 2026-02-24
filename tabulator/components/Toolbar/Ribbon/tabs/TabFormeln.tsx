'use client'

// =============================================
// ImpulsTabulator — Ribbon Tab: Formeln
// =============================================

import { FunctionSquare, Calculator, Sigma } from 'lucide-react'
import { RibbonGroup, RibbonGroupLast } from '../RibbonGroup'
import { RibbonLargeButton } from '../../ToolbarButton'
import { useSpreadsheet } from '@/lib/spreadsheetContext'

export function TabFormeln() {
  const { dispatch } = useSpreadsheet()

  const insertFormula = (formula: string) => {
    dispatch({ type: 'START_EDITING', initialValue: formula })
  }

  return (
    <>
      <RibbonGroup label="Mathematik">
        <RibbonLargeButton onClick={() => insertFormula('=SUM(')} icon={<Sigma size={20} />} label="SUMME" />
        <RibbonLargeButton onClick={() => insertFormula('=AVERAGE(')} icon={<Calculator size={20} />} label="MITTELWERT" />
        <RibbonLargeButton onClick={() => insertFormula('=MIN(')} icon={<FunctionSquare size={20} />} label="MIN" />
        <RibbonLargeButton onClick={() => insertFormula('=MAX(')} icon={<FunctionSquare size={20} />} label="MAX" />
      </RibbonGroup>

      <RibbonGroup label="Statistik">
        <RibbonLargeButton onClick={() => insertFormula('=COUNT(')} icon={<FunctionSquare size={20} />} label="ANZAHL" />
        <RibbonLargeButton onClick={() => insertFormula('=COUNTA(')} icon={<FunctionSquare size={20} />} label="ANZAHL2" />
        <RibbonLargeButton onClick={() => insertFormula('=ROUND(')} icon={<FunctionSquare size={20} />} label="RUNDEN" />
        <RibbonLargeButton onClick={() => insertFormula('=ABS(')} icon={<FunctionSquare size={20} />} label="ABS" />
      </RibbonGroup>

      <RibbonGroupLast label="Logik">
        <RibbonLargeButton onClick={() => insertFormula('=IF(')} icon={<FunctionSquare size={20} />} label="WENN" />
        <RibbonLargeButton onClick={() => insertFormula('=AND(')} icon={<FunctionSquare size={20} />} label="UND" />
        <RibbonLargeButton onClick={() => insertFormula('=OR(')} icon={<FunctionSquare size={20} />} label="ODER" />
        <RibbonLargeButton onClick={() => insertFormula('=IFERROR(')} icon={<FunctionSquare size={20} />} label="WENNFEHLER" />
      </RibbonGroupLast>
    </>
  )
}
