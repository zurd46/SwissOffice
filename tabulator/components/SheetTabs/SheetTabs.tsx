'use client'

// =============================================
// ImpulsTabulator — Sheet-Tab-Leiste
// =============================================

import { Plus } from 'lucide-react'
import { useSpreadsheet } from '@/lib/spreadsheetContext'
import { SheetTab } from './SheetTab'

export function SheetTabs() {
  const { state, dispatch } = useSpreadsheet()
  const { sheets, activeSheetIndex } = state.workbook

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        height: 30,
        borderTop: '1px solid #d6d6d6',
        background: '#f0f0f0',
        paddingLeft: 4,
        gap: 0,
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Neues Blatt */}
      <button
        title="Neues Tabellenblatt"
        onClick={() => dispatch({ type: 'ADD_SHEET' })}
        style={{
          width: 28,
          height: 26,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          color: '#616161',
          borderRadius: 4,
          marginRight: 4,
        }}
      >
        <Plus size={14} />
      </button>

      {/* Tab-Liste */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0, overflow: 'auto', flex: 1 }}>
        {sheets.map((sheet, i) => (
          <SheetTab
            key={i}
            name={sheet.name}
            isActive={i === activeSheetIndex}
            onClick={() => dispatch({ type: 'SET_ACTIVE_SHEET', index: i })}
            onRename={(name) => dispatch({ type: 'RENAME_SHEET', index: i, name })}
            onDelete={() => dispatch({ type: 'DELETE_SHEET', index: i })}
            onDuplicate={() => dispatch({ type: 'DUPLICATE_SHEET', index: i })}
            canDelete={sheets.length > 1}
          />
        ))}
      </div>
    </div>
  )
}
