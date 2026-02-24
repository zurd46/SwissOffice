'use client'

// =============================================
// ImpulsTabulator — Zell-Renderer
// =============================================

import { memo } from 'react'
import type { CellData, CellStyle } from '@/lib/types/spreadsheet'
import { isCellError } from '@/lib/types/spreadsheet'

interface CellProps {
  data: CellData | undefined
  width: number
  height: number
  isActive: boolean
  isSelected: boolean
}

/** Formatiert einen Zellwert für die Anzeige */
function formatCellValue(data: CellData | undefined): { text: string; isNegative: boolean } {
  if (!data || data.value === null || data.value === undefined) return { text: '', isNegative: false }

  const value = data.value

  if (isCellError(value)) {
    return { text: value.type, isNegative: false }
  }

  if (typeof value === 'boolean') {
    return { text: value ? 'WAHR' : 'FALSCH', isNegative: false }
  }

  if (typeof value === 'number') {
    const isNeg = value < 0
    const format = data.style?.numberFormat || 'general'
    const pattern = data.style?.numberFormatPattern

    // Benutzerdefiniertes Format-Pattern
    if (pattern) {
      // Einfache Pattern-Unterstützung: #,##0.00 → Tausendertrennzeichen + 2 Dez.
      const decimals = (pattern.split('.')[1] || '').replace(/[^0#]/g, '').length
      return {
        text: value.toLocaleString('de-CH', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }),
        isNegative: isNeg,
      }
    }

    switch (format) {
      case 'number':
        return {
          text: value.toLocaleString('de-CH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          isNegative: isNeg,
        }
      case 'currency':
        return {
          text: value.toLocaleString('de-CH', {
            style: 'currency',
            currency: 'CHF',
          }),
          isNegative: isNeg,
        }
      case 'percentage':
        return {
          text: (value * 100).toLocaleString('de-CH', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }) + '%',
          isNegative: isNeg,
        }
      case 'date': {
        const d = new Date(Math.round((value - 25569) * 86400 * 1000))
        return { text: d.toLocaleDateString('de-CH'), isNegative: false }
      }
      default:
        // Allgemein: Ganzzahlen ohne Dezimalstellen, Dezimalzahlen mit bis zu 10
        if (Number.isInteger(value)) return { text: value.toString(), isNegative: isNeg }
        return {
          text: value.toLocaleString('de-CH', { maximumFractionDigits: 10 }),
          isNegative: isNeg,
        }
    }
  }

  return { text: String(value), isNegative: false }
}

/** Baut CSS-Styles aus CellStyle */
function buildCellStyles(style: CellStyle | undefined): React.CSSProperties {
  if (!style) return {}

  const css: React.CSSProperties = {}

  if (style.fontFamily) css.fontFamily = style.fontFamily
  if (style.fontSize) css.fontSize = `${style.fontSize}pt`
  if (style.bold) css.fontWeight = 'bold'
  if (style.italic) css.fontStyle = 'italic'
  if (style.underline) css.textDecoration = 'underline'
  if (style.strikethrough) {
    css.textDecoration = css.textDecoration ? `${css.textDecoration} line-through` : 'line-through'
  }
  if (style.textColor) css.color = style.textColor
  if (style.backgroundColor) css.backgroundColor = style.backgroundColor

  // Horizontale Ausrichtung
  switch (style.horizontalAlign) {
    case 'left': css.justifyContent = 'flex-start'; break
    case 'center': css.justifyContent = 'center'; break
    case 'right': css.justifyContent = 'flex-end'; break
  }

  // Vertikale Ausrichtung
  switch (style.verticalAlign) {
    case 'top': css.alignItems = 'flex-start'; break
    case 'middle': css.alignItems = 'center'; break
    case 'bottom': css.alignItems = 'flex-end'; break
  }

  // Rahmen
  if (style.borders) {
    const borderStr = (b: { style: string; color: string } | undefined) => {
      if (!b || b.style === 'none') return undefined
      const widths: Record<string, string> = { thin: '1px', medium: '2px', thick: '3px', dashed: '1px', dotted: '1px' }
      const styles: Record<string, string> = { thin: 'solid', medium: 'solid', thick: 'solid', dashed: 'dashed', dotted: 'dotted' }
      return `${widths[b.style]} ${styles[b.style]} ${b.color}`
    }
    if (style.borders.top) css.borderTop = borderStr(style.borders.top)
    if (style.borders.right) css.borderRight = borderStr(style.borders.right)
    if (style.borders.bottom) css.borderBottom = borderStr(style.borders.bottom)
    if (style.borders.left) css.borderLeft = borderStr(style.borders.left)
  }

  if (style.wrapText) {
    css.whiteSpace = 'normal'
    css.wordWrap = 'break-word'
  }

  return css
}

export const Cell = memo(function Cell({ data, width, height, isActive, isSelected }: CellProps) {
  const { text: displayValue, isNegative } = formatCellValue(data)
  const isError = data?.value && isCellError(data.value)
  const cellStyles = buildCellStyles(data?.style)

  // Standard-Ausrichtung: Zahlen rechts, Text links
  if (!data?.style?.horizontalAlign || data.style.horizontalAlign === 'general') {
    if (typeof data?.value === 'number') {
      cellStyles.justifyContent = 'flex-end'
    }
  }

  // Negative Zahlen in Rot (wenn keine explizite Textfarbe gesetzt)
  const negativeColor = isNegative && !data?.style?.textColor ? '#cc0000' : undefined

  const hasComment = !!data?.comment

  return (
    <div
      className="spreadsheet-cell"
      style={{
        width,
        height,
        position: 'relative',
        ...cellStyles,
        ...(isError ? { color: '#c00' } : negativeColor ? { color: negativeColor } : {}),
        ...(isSelected && !isActive ? { backgroundColor: cellStyles.backgroundColor ? undefined : 'rgba(0, 120, 212, 0.08)' } : {}),
      }}
      title={hasComment ? `${data.comment!.author ? data.comment!.author + ': ' : ''}${data.comment!.text}` : undefined}
    >
      {displayValue}
      {/* Kommentar-Indikator (rotes Dreieck) */}
      {hasComment && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderTop: '6px solid #ff6d00',
          }}
        />
      )}
    </div>
  )
})
