'use client'

// =============================================
// ImpulsTabulator — Formelleiste
// =============================================

import { useCallback, useRef } from 'react'
import { FunctionSquare } from 'lucide-react'
import { useSpreadsheet, useActiveSheet } from '@/lib/spreadsheetContext'
import { cellAddressToString } from '@/lib/engine/cellAddressUtils'

export function FormulaBar() {
  const { state, dispatch } = useSpreadsheet()
  const sheet = useActiveSheet()
  const inputRef = useRef<HTMLInputElement>(null)

  const activeAddr = cellAddressToString(state.selection.activeCell)
  const activeCell = sheet.cells[activeAddr]
  const displayValue = state.editingCell
    ? state.editValue
    : (activeCell?.formula || (activeCell?.value != null ? String(activeCell.value) : ''))

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!state.editingCell) {
      dispatch({ type: 'START_EDITING', initialValue: e.target.value })
    } else {
      dispatch({ type: 'UPDATE_EDIT_VALUE', value: e.target.value })
    }
  }, [dispatch, state.editingCell])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (state.editingCell) {
        dispatch({ type: 'COMMIT_EDIT' })
      }
      // Fokus zurück zum Grid
      inputRef.current?.blur()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      dispatch({ type: 'CANCEL_EDIT' })
      inputRef.current?.blur()
    }
  }, [dispatch, state.editingCell])

  const handleFocus = useCallback(() => {
    if (!state.editingCell) {
      dispatch({ type: 'START_EDITING' })
    }
  }, [dispatch, state.editingCell])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 28,
        borderBottom: '1px solid #dadce0',
        background: '#fff',
        flexShrink: 0,
      }}
    >
      {/* Zell-Referenz */}
      <div
        style={{
          width: 80,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '1px solid #dadce0',
          fontSize: 12,
          fontWeight: 600,
          color: '#202124',
          padding: '0 4px',
        }}
      >
        {activeAddr}
      </div>

      {/* fx Button */}
      <div
        style={{
          width: 28,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '1px solid #dadce0',
          cursor: 'pointer',
          color: '#5f6368',
        }}
        title="Funktion einfügen"
      >
        <FunctionSquare size={14} />
      </div>

      {/* Formel-Eingabe */}
      <input
        ref={inputRef}
        className="formula-bar-input"
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder=""
      />
    </div>
  )
}
