'use client'

// =============================================
// ImpulsTabulator — Zellen formatieren Dialog
// =============================================

import { useState, useCallback, useEffect, useMemo } from 'react'
import { X } from 'lucide-react'
import { useSpreadsheet, useActiveSheet } from '@/lib/spreadsheetContext'
import { cellAddressToString, normalizeRange, iterateRange } from '@/lib/engine/cellAddressUtils'
import type {
  CellStyle,
  NumberFormat,
  HorizontalAlign,
  VerticalAlign,
  CellBorder,
  CellBorders,
} from '@/lib/types/spreadsheet'

interface FormatCellsDialogProps {
  onClose: () => void
}

type TabId = 'numbers' | 'alignment' | 'font' | 'borders' | 'fill'

const TABS: { id: TabId; label: string }[] = [
  { id: 'numbers', label: 'Zahlen' },
  { id: 'alignment', label: 'Ausrichtung' },
  { id: 'font', label: 'Schrift' },
  { id: 'borders', label: 'Rahmen' },
  { id: 'fill', label: 'Fuellung' },
]

const NUMBER_CATEGORIES: { id: NumberFormat; label: string }[] = [
  { id: 'general', label: 'Standard' },
  { id: 'number', label: 'Zahl' },
  { id: 'currency', label: 'Waehrung' },
  { id: 'percentage', label: 'Prozent' },
  { id: 'date', label: 'Datum' },
  { id: 'text', label: 'Text' },
]

const FONT_FAMILIES = [
  'Calibri',
  'Arial',
  'Times New Roman',
  'Helvetica',
  'Verdana',
  'Courier New',
  'Georgia',
]

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36]

const CURRENCY_SYMBOLS = ['CHF', 'EUR', 'USD']

const BORDER_STYLES: { value: CellBorder['style']; label: string }[] = [
  { value: 'thin', label: 'Duenn' },
  { value: 'medium', label: 'Mittel' },
  { value: 'thick', label: 'Dick' },
  { value: 'dashed', label: 'Gestrichelt' },
  { value: 'dotted', label: 'Gepunktet' },
]

export function FormatCellsDialog({ onClose }: FormatCellsDialogProps) {
  const { state, dispatch } = useSpreadsheet()
  const sheet = useActiveSheet()
  const [activeTab, setActiveTab] = useState<TabId>('numbers')

  // Compute initial style from active cell
  const initStyle = useMemo((): CellStyle => {
    const addr = cellAddressToString(state.selection.activeCell)
    return sheet.cells[addr]?.style || {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only compute once on mount

  // Parse initial decimal places and currency from pattern
  const initDecimalPlaces = useMemo(() => {
    if (initStyle.numberFormatPattern) {
      const m = initStyle.numberFormatPattern.match(/\.(\d+)/)
      if (m) return m[1].length
    }
    return 2
  }, [initStyle])

  const initCurrency = useMemo(() => {
    if (initStyle.numberFormatPattern) {
      for (const sym of CURRENCY_SYMBOLS) {
        if (initStyle.numberFormatPattern.includes(sym)) return sym
      }
    }
    return 'CHF'
  }, [initStyle])

  const initBorderInfo = useMemo(() => {
    const b = initStyle.borders
    if (!b) return { top: false, bottom: false, left: false, right: false, style: 'thin' as CellBorder['style'], color: '#000000' }
    const firstBorder = b.top || b.bottom || b.left || b.right
    return {
      top: !!b.top && b.top.style !== 'none',
      bottom: !!b.bottom && b.bottom.style !== 'none',
      left: !!b.left && b.left.style !== 'none',
      right: !!b.right && b.right.style !== 'none',
      style: (firstBorder?.style === 'none' ? 'thin' : firstBorder?.style ?? 'thin') as CellBorder['style'],
      color: firstBorder?.color || '#000000',
    }
  }, [initStyle])

  // --- Style state (initialized from active cell) ---
  const [numberFormat, setNumberFormat] = useState<NumberFormat>(initStyle.numberFormat ?? 'general')
  const [decimalPlaces, setDecimalPlaces] = useState(initDecimalPlaces)
  const [currencySymbol, setCurrencySymbol] = useState(initCurrency)

  const [horizontalAlign, setHorizontalAlign] = useState<HorizontalAlign>(initStyle.horizontalAlign ?? 'general')
  const [verticalAlign, setVerticalAlign] = useState<VerticalAlign>(initStyle.verticalAlign ?? 'bottom')
  const [wrapText, setWrapText] = useState(initStyle.wrapText ?? false)

  const [fontFamily, setFontFamily] = useState(initStyle.fontFamily ?? 'Calibri')
  const [fontSize, setFontSize] = useState(initStyle.fontSize ?? 11)
  const [bold, setBold] = useState(initStyle.bold ?? false)
  const [italic, setItalic] = useState(initStyle.italic ?? false)
  const [underline, setUnderline] = useState(initStyle.underline ?? false)
  const [strikethrough, setStrikethrough] = useState(initStyle.strikethrough ?? false)
  const [textColor, setTextColor] = useState(initStyle.textColor ?? '#000000')

  const [borderStyle, setBorderStyle] = useState<CellBorder['style']>(initBorderInfo.style)
  const [borderColor, setBorderColor] = useState(initBorderInfo.color)
  const [borderTop, setBorderTop] = useState(initBorderInfo.top)
  const [borderBottom, setBorderBottom] = useState(initBorderInfo.bottom)
  const [borderLeft, setBorderLeft] = useState(initBorderInfo.left)
  const [borderRight, setBorderRight] = useState(initBorderInfo.right)

  const [backgroundColor, setBackgroundColor] = useState(initStyle.backgroundColor ?? '#ffffff')
  const [hasFill, setHasFill] = useState(!!initStyle.backgroundColor)

  // Collect all selected cell address strings
  const selectedAddresses = useMemo((): string[] => {
    const addresses: string[] = []
    for (const range of state.selection.ranges) {
      const normalized = normalizeRange(range)
      for (const addr of iterateRange(normalized)) {
        addresses.push(cellAddressToString(addr))
      }
    }
    return addresses
  }, [state.selection.ranges])

  // Escape key and click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Build the format preview for the Numbers tab
  const formatPreview = useMemo(() => {
    const activeCellAddr = cellAddressToString(state.selection.activeCell)
    const cellData = sheet.cells[activeCellAddr]
    const rawValue = cellData?.value
    const num = typeof rawValue === 'number' ? rawValue : 1234.56

    switch (numberFormat) {
      case 'general':
        return String(rawValue ?? '')
      case 'number':
        return num.toFixed(decimalPlaces)
      case 'currency': {
        const formatted = num.toFixed(decimalPlaces)
        return `${currencySymbol} ${formatted}`
      }
      case 'percentage':
        return `${(num * 100).toFixed(decimalPlaces)}%`
      case 'date':
        return '24.02.2026'
      case 'text':
        return String(rawValue ?? '')
      default:
        return String(rawValue ?? '')
    }
  }, [numberFormat, decimalPlaces, currencySymbol, state.selection.activeCell, sheet.cells])

  // Build number format pattern string
  const buildNumberFormatPattern = useCallback((): string | undefined => {
    switch (numberFormat) {
      case 'number': {
        const decimals = '0'.repeat(decimalPlaces)
        return decimalPlaces > 0 ? `#,##0.${decimals}` : '#,##0'
      }
      case 'currency': {
        const decimals = '0'.repeat(decimalPlaces)
        return decimalPlaces > 0 ? `${currencySymbol} #,##0.${decimals}` : `${currencySymbol} #,##0`
      }
      case 'percentage': {
        const decimals = '0'.repeat(decimalPlaces)
        return decimalPlaces > 0 ? `0.${decimals}%` : '0%'
      }
      case 'date':
        return 'DD.MM.YYYY'
      default:
        return undefined
    }
  }, [numberFormat, decimalPlaces, currencySymbol])

  // Apply handler
  const handleApply = useCallback(() => {
    const borders: CellBorders = {}
    const makeBorder = (): CellBorder => ({ style: borderStyle, color: borderColor })

    if (borderTop) borders.top = makeBorder()
    if (borderBottom) borders.bottom = makeBorder()
    if (borderLeft) borders.left = makeBorder()
    if (borderRight) borders.right = makeBorder()

    const style: Partial<CellStyle> = {
      numberFormat,
      numberFormatPattern: buildNumberFormatPattern(),
      horizontalAlign,
      verticalAlign,
      wrapText,
      fontFamily,
      fontSize,
      bold,
      italic,
      underline,
      strikethrough,
      textColor,
      backgroundColor: hasFill ? backgroundColor : undefined,
      borders: (borderTop || borderBottom || borderLeft || borderRight) ? borders : undefined,
    }

    dispatch({ type: 'SET_CELL_STYLE', addresses: selectedAddresses, style })
    onClose()
  }, [
    numberFormat, buildNumberFormatPattern,
    horizontalAlign, verticalAlign, wrapText,
    fontFamily, fontSize, bold, italic, underline, strikethrough, textColor,
    backgroundColor, hasFill,
    borderStyle, borderColor, borderTop, borderBottom, borderLeft, borderRight,
    selectedAddresses, dispatch, onClose,
  ])

  // --- Shared styles ---
  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#5f6368',
    marginBottom: 4,
    display: 'block',
  }

  const selectStyle: React.CSSProperties = {
    height: 30,
    border: '1px solid #dadce0',
    borderRadius: 4,
    padding: '0 6px',
    fontSize: 13,
    color: '#202124',
    background: 'white',
    outline: 'none',
    width: '100%',
  }

  const inputStyle: React.CSSProperties = {
    height: 30,
    border: '1px solid #dadce0',
    borderRadius: 4,
    padding: '0 8px',
    fontSize: 13,
    color: '#202124',
    outline: 'none',
    width: '100%',
  }

  const checkboxLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#202124',
    cursor: 'pointer',
  }

  const buttonBase: React.CSSProperties = {
    height: 32,
    padding: '0 20px',
    fontSize: 13,
    borderRadius: 4,
    cursor: 'pointer',
    border: 'none',
  }

  // --- Border preset handlers ---
  const setBorderPresetNone = useCallback(() => {
    setBorderTop(false)
    setBorderBottom(false)
    setBorderLeft(false)
    setBorderRight(false)
  }, [])

  const setBorderPresetOutline = useCallback(() => {
    setBorderTop(true)
    setBorderBottom(true)
    setBorderLeft(true)
    setBorderRight(true)
  }, [])

  const setBorderPresetAll = useCallback(() => {
    setBorderTop(true)
    setBorderBottom(true)
    setBorderLeft(true)
    setBorderRight(true)
  }, [])

  // --- Render tab content ---
  const renderNumbersTab = () => (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      {/* Category list */}
      <div style={{
        width: 130,
        borderRight: '1px solid #dadce0',
        paddingRight: 12,
        overflowY: 'auto',
      }}>
        <div style={{ ...labelStyle, marginBottom: 8 }}>Kategorie</div>
        {NUMBER_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            onClick={() => setNumberFormat(cat.id)}
            style={{
              padding: '6px 10px',
              fontSize: 13,
              color: numberFormat === cat.id ? '#1a73e8' : '#202124',
              background: numberFormat === cat.id ? '#e8f0fe' : 'transparent',
              borderRadius: 4,
              cursor: 'pointer',
              marginBottom: 2,
              fontWeight: numberFormat === cat.id ? 500 : 400,
            }}
          >
            {cat.label}
          </div>
        ))}
      </div>

      {/* Options */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {(numberFormat === 'number' || numberFormat === 'currency' || numberFormat === 'percentage') && (
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Dezimalstellen</label>
            <input
              type="number"
              min={0}
              max={10}
              value={decimalPlaces}
              onChange={(e) => setDecimalPlaces(Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
              style={{ ...inputStyle, width: 80 }}
            />
          </div>
        )}

        {numberFormat === 'currency' && (
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Waehrungssymbol</label>
            <select
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              style={{ ...selectStyle, width: 120 }}
            >
              {CURRENCY_SYMBOLS.map((sym) => (
                <option key={sym} value={sym}>{sym}</option>
              ))}
            </select>
          </div>
        )}

        {/* Preview */}
        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #dadce0' }}>
          <div style={{ ...labelStyle, marginBottom: 4 }}>Vorschau</div>
          <div style={{
            padding: '8px 12px',
            background: '#f8f9fa',
            borderRadius: 4,
            fontSize: 14,
            color: '#202124',
            fontFamily: 'monospace',
            minHeight: 20,
          }}>
            {formatPreview}
          </div>
        </div>
      </div>
    </div>
  )

  const renderAlignmentTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Horizontal */}
      <div>
        <label style={labelStyle}>Horizontal</label>
        <select
          value={horizontalAlign}
          onChange={(e) => setHorizontalAlign(e.target.value as HorizontalAlign)}
          style={selectStyle}
        >
          <option value="general">Standard</option>
          <option value="left">Links</option>
          <option value="center">Zentriert</option>
          <option value="right">Rechts</option>
        </select>
      </div>

      {/* Vertical */}
      <div>
        <label style={labelStyle}>Vertikal</label>
        <select
          value={verticalAlign}
          onChange={(e) => setVerticalAlign(e.target.value as VerticalAlign)}
          style={selectStyle}
        >
          <option value="top">Oben</option>
          <option value="middle">Mitte</option>
          <option value="bottom">Unten</option>
        </select>
      </div>

      {/* Wrap text */}
      <div>
        <label style={checkboxLabelStyle}>
          <input
            type="checkbox"
            checked={wrapText}
            onChange={(e) => setWrapText(e.target.checked)}
          />
          Textumbruch
        </label>
      </div>
    </div>
  )

  const renderFontTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Font family */}
      <div>
        <label style={labelStyle}>Schriftart</label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          style={selectStyle}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
          ))}
        </select>
      </div>

      {/* Font size */}
      <div>
        <label style={labelStyle}>Schriftgroesse</label>
        <select
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
          style={{ ...selectStyle, width: 100 }}
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Style checkboxes */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" checked={bold} onChange={(e) => setBold(e.target.checked)} />
          <span style={{ fontWeight: 700 }}>Fett</span>
        </label>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" checked={italic} onChange={(e) => setItalic(e.target.checked)} />
          <span style={{ fontStyle: 'italic' }}>Kursiv</span>
        </label>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" checked={underline} onChange={(e) => setUnderline(e.target.checked)} />
          <span style={{ textDecoration: 'underline' }}>Unterstrichen</span>
        </label>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" checked={strikethrough} onChange={(e) => setStrikethrough(e.target.checked)} />
          <span style={{ textDecoration: 'line-through' }}>Durchgestrichen</span>
        </label>
      </div>

      {/* Text color */}
      <div>
        <label style={labelStyle}>Schriftfarbe</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            style={{ width: 36, height: 30, border: '1px solid #dadce0', borderRadius: 4, padding: 2, cursor: 'pointer' }}
          />
          <span style={{ fontSize: 12, color: '#5f6368' }}>{textColor}</span>
        </div>
      </div>

      {/* Preview */}
      <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #dadce0' }}>
        <div style={{ ...labelStyle, marginBottom: 4 }}>Vorschau</div>
        <div style={{
          padding: '8px 12px',
          background: '#f8f9fa',
          borderRadius: 4,
          fontSize: fontSize,
          fontFamily: fontFamily,
          fontWeight: bold ? 700 : 400,
          fontStyle: italic ? 'italic' : 'normal',
          textDecoration: [
            underline ? 'underline' : '',
            strikethrough ? 'line-through' : '',
          ].filter(Boolean).join(' ') || 'none',
          color: textColor,
          minHeight: 24,
        }}>
          Beispieltext AaBbCc 123
        </div>
      </div>
    </div>
  )

  const renderBordersTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Presets */}
      <div>
        <div style={{ ...labelStyle, marginBottom: 8 }}>Voreinstellungen</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'Keine', handler: setBorderPresetNone },
            { label: 'Umrandung', handler: setBorderPresetOutline },
            { label: 'Alle', handler: setBorderPresetAll },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={preset.handler}
              style={{
                ...buttonBase,
                background: '#f8f9fa',
                border: '1px solid #dadce0',
                color: '#202124',
                padding: '0 14px',
                height: 30,
                fontSize: 12,
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Individual borders */}
      <div>
        <div style={{ ...labelStyle, marginBottom: 8 }}>Einzelne Rahmen</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <label style={checkboxLabelStyle}>
            <input type="checkbox" checked={borderTop} onChange={(e) => setBorderTop(e.target.checked)} />
            Oben
          </label>
          <label style={checkboxLabelStyle}>
            <input type="checkbox" checked={borderBottom} onChange={(e) => setBorderBottom(e.target.checked)} />
            Unten
          </label>
          <label style={checkboxLabelStyle}>
            <input type="checkbox" checked={borderLeft} onChange={(e) => setBorderLeft(e.target.checked)} />
            Links
          </label>
          <label style={checkboxLabelStyle}>
            <input type="checkbox" checked={borderRight} onChange={(e) => setBorderRight(e.target.checked)} />
            Rechts
          </label>
        </div>
      </div>

      {/* Border style */}
      <div>
        <label style={labelStyle}>Rahmenart</label>
        <select
          value={borderStyle}
          onChange={(e) => setBorderStyle(e.target.value as CellBorder['style'])}
          style={{ ...selectStyle, width: 160 }}
        >
          {BORDER_STYLES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Border color */}
      <div>
        <label style={labelStyle}>Rahmenfarbe</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={borderColor}
            onChange={(e) => setBorderColor(e.target.value)}
            style={{ width: 36, height: 30, border: '1px solid #dadce0', borderRadius: 4, padding: 2, cursor: 'pointer' }}
          />
          <span style={{ fontSize: 12, color: '#5f6368' }}>{borderColor}</span>
        </div>
      </div>
    </div>
  )

  const renderFillTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Background color */}
      <div>
        <label style={labelStyle}>Hintergrundfarbe</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => { setBackgroundColor(e.target.value); setHasFill(true) }}
            style={{ width: 48, height: 36, border: '1px solid #dadce0', borderRadius: 4, padding: 2, cursor: 'pointer' }}
          />
          <span style={{ fontSize: 12, color: '#5f6368' }}>{hasFill ? backgroundColor : 'Keine Fuellung'}</span>
        </div>
      </div>

      {/* No fill button */}
      <div>
        <button
          onClick={() => { setHasFill(false); setBackgroundColor('#ffffff') }}
          style={{
            ...buttonBase,
            background: '#f8f9fa',
            border: '1px solid #dadce0',
            color: '#202124',
            height: 30,
            fontSize: 12,
          }}
        >
          Keine Fuellung
        </button>
      </div>

      {/* Preview */}
      <div style={{ marginTop: 16 }}>
        <div style={{ ...labelStyle, marginBottom: 4 }}>Vorschau</div>
        <div style={{
          width: '100%',
          height: 60,
          background: hasFill ? backgroundColor : 'white',
          border: '1px solid #dadce0',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          color: '#5f6368',
        }}>
          {hasFill ? '' : 'Keine Fuellung'}
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'numbers': return renderNumbersTab()
      case 'alignment': return renderAlignmentTab()
      case 'font': return renderFontTab()
      case 'borders': return renderBordersTab()
      case 'fill': return renderFillTab()
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.3)',
          zIndex: 999,
        }}
      />

      {/* Dialog */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          width: 500,
          height: 450,
          background: 'white',
          borderRadius: 8,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #dadce0',
          flexShrink: 0,
        }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: '#202124' }}>Zellen formatieren</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#5f6368',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 4,
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #dadce0',
          paddingLeft: 8,
          flexShrink: 0,
          background: '#f8f9fa',
        }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 16px',
                fontSize: 13,
                color: activeTab === tab.id ? '#1a73e8' : '#5f6368',
                fontWeight: activeTab === tab.id ? 500 : 400,
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #1a73e8' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{
          flex: 1,
          padding: 16,
          overflowY: 'auto',
        }}>
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          padding: '12px 16px',
          borderTop: '1px solid #dadce0',
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              ...buttonBase,
              background: 'white',
              border: '1px solid #dadce0',
              color: '#202124',
            }}
          >
            Abbrechen
          </button>
          <button
            onClick={handleApply}
            style={{
              ...buttonBase,
              background: '#1a73e8',
              color: 'white',
            }}
          >
            Uebernehmen
          </button>
        </div>
      </div>
    </>
  )
}
