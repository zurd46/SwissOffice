'use client'

// =============================================
// ImpulsTabulator — Ribbon Tab: Einfügen
// =============================================

import {
  FunctionSquare, Minus, Columns, Rows,
} from 'lucide-react'
import { RibbonGroup, RibbonGroupLast } from '../RibbonGroup'
import { RibbonLargeButton } from '../../ToolbarButton'
import { useSpreadsheet } from '@/lib/spreadsheetContext'

export function TabEinfuegen() {
  const { state, dispatch } = useSpreadsheet()

  return (
    <>
      <RibbonGroup label="Zellen">
        <RibbonLargeButton
          onClick={() => dispatch({ type: 'INSERT_ROWS', at: state.selection.activeCell.row, count: 1 })}
          icon={<Rows size={20} />}
          label="Zeile einfügen"
        />
        <RibbonLargeButton
          onClick={() => dispatch({ type: 'INSERT_COLUMNS', at: state.selection.activeCell.col, count: 1 })}
          icon={<Columns size={20} />}
          label="Spalte einfügen"
        />
        <RibbonLargeButton
          onClick={() => dispatch({ type: 'DELETE_ROWS', at: state.selection.activeCell.row, count: 1 })}
          icon={<Minus size={20} />}
          label="Zeile löschen"
        />
        <RibbonLargeButton
          onClick={() => dispatch({ type: 'DELETE_COLUMNS', at: state.selection.activeCell.col, count: 1 })}
          icon={<Minus size={20} />}
          label="Spalte löschen"
        />
      </RibbonGroup>

      <RibbonGroupLast label="Funktionen">
        <RibbonLargeButton
          onClick={() => dispatch({ type: 'START_EDITING', initialValue: '=SUM(' })}
          icon={<FunctionSquare size={20} />}
          label="SUMME"
        />
        <RibbonLargeButton
          onClick={() => dispatch({ type: 'START_EDITING', initialValue: '=AVERAGE(' })}
          icon={<FunctionSquare size={20} />}
          label="MITTELWERT"
        />
        <RibbonLargeButton
          onClick={() => dispatch({ type: 'START_EDITING', initialValue: '=COUNT(' })}
          icon={<FunctionSquare size={20} />}
          label="ANZAHL"
        />
        <RibbonLargeButton
          onClick={() => dispatch({ type: 'START_EDITING', initialValue: '=IF(' })}
          icon={<FunctionSquare size={20} />}
          label="WENN"
        />
      </RibbonGroupLast>
    </>
  )
}
