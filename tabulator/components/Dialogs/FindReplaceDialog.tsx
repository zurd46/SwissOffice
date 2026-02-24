'use client'

// =============================================
// ImpulsTabulator — Suchen & Ersetzen Dialog
// =============================================

import { useState, useCallback, useRef, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { useSpreadsheet, useActiveSheet } from '@/lib/spreadsheetContext'
import type { CellAddress } from '@/lib/types/spreadsheet'

interface FindReplaceDialogProps {
  onClose: () => void
}

export function FindReplaceDialog({ onClose }: FindReplaceDialogProps) {
  const { state, dispatch } = useSpreadsheet()
  const sheet = useActiveSheet()
  const [searchText, setSearchText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [matchCount, setMatchCount] = useState<number | null>(null)
  const [currentMatch, setCurrentMatch] = useState(0)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    searchRef.current?.focus()
  }, [])

  // Alle passenden Zellen finden
  const findMatches = useCallback((): { address: CellAddress; key: string }[] => {
    if (!searchText) return []
    const matches: { address: CellAddress; key: string }[] = []
    const searchVal = caseSensitive ? searchText : searchText.toLowerCase()

    for (const [key, cell] of Object.entries(sheet.cells)) {
      if (!cell || cell.value === null || cell.value === undefined) continue
      let cellText = String(cell.value)
      if (!caseSensitive) cellText = cellText.toLowerCase()

      if (wholeWord) {
        if (cellText === searchVal) {
          const match = key.match(/^([A-Z]+)(\d+)$/)
          if (match) {
            const col = match[1].split('').reduce((acc, c) => acc * 26 + c.charCodeAt(0) - 64, 0) - 1
            const row = parseInt(match[2], 10) - 1
            matches.push({ address: { col, row }, key })
          }
        }
      } else {
        if (cellText.includes(searchVal)) {
          const match = key.match(/^([A-Z]+)(\d+)$/)
          if (match) {
            const col = match[1].split('').reduce((acc, c) => acc * 26 + c.charCodeAt(0) - 64, 0) - 1
            const row = parseInt(match[2], 10) - 1
            matches.push({ address: { col, row }, key })
          }
        }
      }
    }

    // Sortiere nach Zeile, dann Spalte
    matches.sort((a, b) => a.address.row - b.address.row || a.address.col - b.address.col)
    return matches
  }, [searchText, caseSensitive, wholeWord, sheet.cells])

  // Weitersuchen
  const handleFindNext = useCallback(() => {
    const matches = findMatches()
    setMatchCount(matches.length)
    if (matches.length === 0) return

    const nextIndex = currentMatch % matches.length
    const match = matches[nextIndex]

    dispatch({
      type: 'SET_SELECTION',
      selection: {
        ...state.selection,
        activeCell: match.address,
        ranges: [{ start: match.address, end: match.address }],
      },
    })

    setCurrentMatch(nextIndex + 1)
  }, [findMatches, currentMatch, dispatch, state.selection])

  // Einzeln ersetzen
  const handleReplace = useCallback(() => {
    const matches = findMatches()
    if (matches.length === 0) return

    const idx = Math.max(0, currentMatch - 1) % matches.length
    const match = matches[idx]
    const cell = sheet.cells[match.key]
    if (!cell) return

    const oldValue = String(cell.value ?? '')
    let newValue: string

    if (wholeWord) {
      newValue = replaceText
    } else {
      if (caseSensitive) {
        newValue = oldValue.replace(searchText, replaceText)
      } else {
        newValue = oldValue.replace(new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), replaceText)
      }
    }

    dispatch({
      type: 'SET_CELL_VALUE',
      address: match.key,
      rawValue: newValue,
    })

    // Zum nächsten Treffer
    handleFindNext()
  }, [findMatches, currentMatch, sheet.cells, searchText, replaceText, caseSensitive, wholeWord, dispatch, handleFindNext])

  // Alle ersetzen
  const handleReplaceAll = useCallback(() => {
    const matches = findMatches()
    if (matches.length === 0) return

    for (const match of matches) {
      const cell = sheet.cells[match.key]
      if (!cell) continue

      const oldValue = String(cell.value ?? '')
      let newValue: string

      if (wholeWord) {
        newValue = replaceText
      } else {
        if (caseSensitive) {
          newValue = oldValue.replaceAll(searchText, replaceText)
        } else {
          newValue = oldValue.replace(new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), replaceText)
        }
      }

      dispatch({
        type: 'SET_CELL_VALUE',
        address: match.key,
        rawValue: newValue,
      })
    }

    setMatchCount(0)
    setCurrentMatch(0)
  }, [findMatches, sheet.cells, searchText, replaceText, caseSensitive, wholeWord, dispatch])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleFindNext()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [handleFindNext, onClose])

  return (
    <div
      style={{
        position: 'fixed',
        top: 60,
        right: 20,
        zIndex: 50,
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 4px 28px rgba(0,0,0,0.12), 0 1px 6px rgba(0,0,0,0.08)',
        padding: 16,
        width: 340,
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#202124' }}>Suchen und Ersetzen</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', display: 'flex', alignItems: 'center', borderRadius: 4, padding: 2 }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Suchen */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Search size={14} style={{ color: '#5f6368', flexShrink: 0 }} />
        <input
          ref={searchRef}
          type="text"
          value={searchText}
          onChange={(e) => { setSearchText(e.target.value); setMatchCount(null); setCurrentMatch(0) }}
          placeholder="Suchen..."
          style={{
            flex: 1,
            height: 32,
            border: '1px solid #dadce0',
            borderRadius: 4,
            padding: '0 8px',
            fontSize: 13,
            outline: 'none',
            color: '#202124',
          }}
        />
      </div>

      {/* Ersetzen */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 14 }} />
        <input
          type="text"
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
          placeholder="Ersetzen durch..."
          style={{
            flex: 1,
            height: 32,
            border: '1px solid #dadce0',
            borderRadius: 4,
            padding: '0 8px',
            fontSize: 13,
            outline: 'none',
            color: '#202124',
          }}
        />
      </div>

      {/* Optionen */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, paddingLeft: 22 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#5f6368', cursor: 'pointer' }}>
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
          Gross-/Kleinschreibung
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#5f6368', cursor: 'pointer' }}>
          <input type="checkbox" checked={wholeWord} onChange={(e) => setWholeWord(e.target.checked)} />
          Ganzes Wort
        </label>
      </div>

      {/* Status */}
      {matchCount !== null && (
        <div style={{ fontSize: 12, color: '#5f6368', marginBottom: 8, paddingLeft: 22 }}>
          {matchCount === 0
            ? 'Keine Treffer gefunden'
            : `${currentMatch} von ${matchCount} Treffer(n)`
          }
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={handleFindNext}
          disabled={!searchText}
          style={{
            height: 32,
            padding: '0 16px',
            fontSize: 13,
            borderRadius: 4,
            border: '1px solid #dadce0',
            background: 'white',
            color: '#202124',
            cursor: searchText ? 'pointer' : 'default',
            opacity: searchText ? 1 : 0.5,
          }}
        >
          Weitersuchen
        </button>
        <button
          onClick={handleReplace}
          disabled={!searchText}
          style={{
            height: 32,
            padding: '0 16px',
            fontSize: 13,
            borderRadius: 4,
            border: '1px solid #dadce0',
            background: 'white',
            color: '#202124',
            cursor: searchText ? 'pointer' : 'default',
            opacity: searchText ? 1 : 0.5,
          }}
        >
          Ersetzen
        </button>
        <button
          onClick={handleReplaceAll}
          disabled={!searchText}
          style={{
            height: 32,
            padding: '0 16px',
            fontSize: 13,
            borderRadius: 4,
            border: 'none',
            background: '#1a73e8',
            color: 'white',
            cursor: searchText ? 'pointer' : 'default',
            opacity: searchText ? 1 : 0.5,
          }}
        >
          Alle ersetzen
        </button>
      </div>
    </div>
  )
}
