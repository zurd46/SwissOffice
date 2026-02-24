'use client'

// =============================================
// ImpulsTabulator — Filter-Dropdown (Spaltenfilter)
// =============================================

import { useState, useCallback, useRef, useEffect } from 'react'

interface FilterDropdownProps {
  column: number
  values: string[]
  selectedValues: Set<string>
  position: { x: number; y: number }
  onApply: (selectedValues: Set<string>) => void
  onClose: () => void
}

export function FilterDropdown({
  values,
  selectedValues,
  position,
  onApply,
  onClose,
}: FilterDropdownProps) {
  const [localSelected, setLocalSelected] = useState<Set<string>>(() => new Set(selectedValues))
  const [searchText, setSearchText] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Fokus auf Suchfeld
  useEffect(() => {
    searchRef.current?.focus()
  }, [])

  // Klick ausserhalb schliesst den Dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // Gefilterte Werte basierend auf Suchtext
  const filteredValues = searchText
    ? values.filter((v) => v.toLowerCase().includes(searchText.toLowerCase()))
    : values

  // Alle auswählen / abwählen
  const allSelected = filteredValues.length > 0 && filteredValues.every((v) => localSelected.has(v))

  const handleToggleAll = useCallback(() => {
    setLocalSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        // Alle gefilterten abwählen
        for (const v of filteredValues) {
          next.delete(v)
        }
      } else {
        // Alle gefilterten auswählen
        for (const v of filteredValues) {
          next.add(v)
        }
      }
      return next
    })
  }, [allSelected, filteredValues])

  const handleToggleValue = useCallback((value: string) => {
    setLocalSelected((prev) => {
      const next = new Set(prev)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return next
    })
  }, [])

  const handleApply = useCallback(() => {
    onApply(localSelected)
  }, [onApply, localSelected])

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 100,
        background: 'white',
        border: '1px solid #dadce0',
        borderRadius: 8,
        boxShadow: '0 4px 28px rgba(0,0,0,0.12), 0 1px 6px rgba(0,0,0,0.08)',
        width: 240,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Suchfeld */}
      <div style={{ padding: '8px 8px 4px 8px' }}>
        <input
          ref={searchRef}
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Suchen..."
          style={{
            width: '100%',
            height: 30,
            border: '1px solid #dadce0',
            borderRadius: 4,
            padding: '0 8px',
            fontSize: 12,
            outline: 'none',
            color: '#202124',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Alle auswählen */}
      <div
        style={{
          padding: '4px 8px',
          borderBottom: '1px solid #dadce0',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: '#202124',
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleToggleAll}
            style={{ accentColor: '#1a73e8' }}
          />
          Alle auswählen
        </label>
      </div>

      {/* Werte-Liste */}
      <div
        style={{
          maxHeight: 240,
          overflowY: 'auto',
          padding: '4px 8px',
        }}
      >
        {filteredValues.length === 0 ? (
          <div
            style={{
              fontSize: 12,
              color: '#5f6368',
              padding: '8px 0',
              textAlign: 'center',
            }}
          >
            Keine Werte gefunden
          </div>
        ) : (
          filteredValues.map((value) => (
            <label
              key={value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: '#202124',
                cursor: 'pointer',
                padding: '3px 0',
              }}
            >
              <input
                type="checkbox"
                checked={localSelected.has(value)}
                onChange={() => handleToggleValue(value)}
                style={{ accentColor: '#1a73e8' }}
              />
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {value || '(Leer)'}
              </span>
            </label>
          ))
        )}
      </div>

      {/* Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          padding: '8px',
          borderTop: '1px solid #dadce0',
        }}
      >
        <button
          onClick={onClose}
          style={{
            height: 30,
            padding: '0 14px',
            fontSize: 12,
            borderRadius: 4,
            border: '1px solid #dadce0',
            background: 'white',
            color: '#202124',
            cursor: 'pointer',
          }}
        >
          Abbrechen
        </button>
        <button
          onClick={handleApply}
          style={{
            height: 30,
            padding: '0 14px',
            fontSize: 12,
            borderRadius: 4,
            border: 'none',
            background: '#1a73e8',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          OK
        </button>
      </div>
    </div>
  )
}
