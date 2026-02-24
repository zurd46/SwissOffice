'use client'

// =============================================
// ImpulsTabulator — Ribbon Tab: Daten
// =============================================

import {
  ArrowUpNarrowWide, ArrowDownNarrowWide, Filter,
  Lock, Unlock,
} from 'lucide-react'
import { RibbonGroup, RibbonGroupLast } from '../RibbonGroup'
import { RibbonLargeButton } from '../../ToolbarButton'
import { useSpreadsheet, useActiveSheet } from '@/lib/spreadsheetContext'
import { normalizeRange } from '@/lib/engine/cellAddressUtils'

export function TabDaten() {
  const { state, dispatch } = useSpreadsheet()
  const sheet = useActiveSheet()

  const handleSort = (ascending: boolean) => {
    const range = state.selection.ranges[state.selection.ranges.length - 1]
    if (range) {
      dispatch({
        type: 'SORT_RANGE',
        range: normalizeRange(range),
        column: state.selection.activeCell.col,
        ascending,
      })
    }
  }

  return (
    <>
      <RibbonGroup label="Sortieren & Filtern">
        <RibbonLargeButton
          onClick={() => handleSort(true)}
          icon={<ArrowUpNarrowWide size={20} />}
          label="Aufsteigend"
        />
        <RibbonLargeButton
          onClick={() => handleSort(false)}
          icon={<ArrowDownNarrowWide size={20} />}
          label="Absteigend"
        />
        <RibbonLargeButton
          onClick={() => {}}
          icon={<Filter size={20} />}
          label="Filtern"
        />
      </RibbonGroup>

      <RibbonGroupLast label="Fixierung">
        <RibbonLargeButton
          onClick={() => {
            const { row, col } = state.selection.activeCell
            if (sheet.frozenRows > 0 || sheet.frozenCols > 0) {
              dispatch({ type: 'SET_FROZEN_PANES', rows: 0, cols: 0 })
            } else {
              dispatch({ type: 'SET_FROZEN_PANES', rows: row, cols: col })
            }
          }}
          icon={sheet.frozenRows > 0 || sheet.frozenCols > 0 ? <Unlock size={20} /> : <Lock size={20} />}
          label={sheet.frozenRows > 0 || sheet.frozenCols > 0 ? 'Fixierung aufheben' : 'Fenster fixieren'}
        />
        <RibbonLargeButton
          onClick={() => {
            const row = state.selection.activeCell.row
            dispatch({ type: 'SET_FROZEN_PANES', rows: row, cols: 0 })
          }}
          icon={<Lock size={20} />}
          label="Oberste Zeile"
        />
        <RibbonLargeButton
          onClick={() => {
            const col = state.selection.activeCell.col
            dispatch({ type: 'SET_FROZEN_PANES', rows: 0, cols: col })
          }}
          icon={<Lock size={20} />}
          label="Erste Spalte"
        />
      </RibbonGroupLast>
    </>
  )
}
