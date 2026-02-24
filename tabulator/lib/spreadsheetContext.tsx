'use client'

// =============================================
// ImpulsTabulator — Spreadsheet Context Provider
// =============================================

import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { WorkbookState, WorkbookAction } from '@/lib/state/workbookStore'
import { workbookReducer, createInitialState } from '@/lib/state/workbookStore'

interface SpreadsheetContextValue {
  state: WorkbookState
  dispatch: (action: WorkbookAction) => void
}

const SpreadsheetContext = createContext<SpreadsheetContextValue | null>(null)

export function SpreadsheetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workbookReducer, undefined, createInitialState)

  return (
    <SpreadsheetContext.Provider value={{ state, dispatch }}>
      {children}
    </SpreadsheetContext.Provider>
  )
}

export function useSpreadsheet(): SpreadsheetContextValue {
  const context = useContext(SpreadsheetContext)
  if (!context) {
    throw new Error('useSpreadsheet muss innerhalb von SpreadsheetProvider verwendet werden')
  }
  return context
}

/** Convenience-Hook: Gibt das aktive Sheet zurück */
export function useActiveSheet() {
  const { state } = useSpreadsheet()
  return state.workbook.sheets[state.workbook.activeSheetIndex]
}
