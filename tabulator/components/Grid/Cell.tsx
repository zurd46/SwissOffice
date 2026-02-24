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
function formatCellValue(data: CellData | undefined): string {
  if (!data || data.value === null || data.value === undefined) return ''

  const value = data.value

  if (isCellError(value)) {
    return value.type
  }

  if (typeof value === 'boolean') {
    return value ? 'WAHR' : 'FALSCH'
  }

  if (typeof value === 'number') {
    const format = data.style?.numberFormat || 'general'
    switch (format) {
      case 'number':
        return value.toLocaleString('de-CH', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      case 'currency':
        return value.toLocaleString('de-CH', {
          style: 'currency',
          currency: 'CHF',
        })
      case 'percentage':
        return (value * 100).toLocaleString('de-CH', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }) + '%'
      case 'date': {
        const d = new Date(Math.round((value - 25569) * 86400 * 1000))
        return d.toLocaleDateString('de-CH')
      }
      default:
        // Allgemein: Ganzzahlen ohne Dezimalstellen, Dezimalzahlen mit bis zu 10
        if (Number.isInteger(value)) return value.toString()
        return value.toLocaleString('de-CH', { maximumFractionDigits: 10 })
    }
  }

  return String(value)
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
  const displayValue = formatCellValue(data)
  const isError = data?.value && isCellError(data.value)
  const cellStyles = buildCellStyles(data?.style)

  // Standard-Ausrichtung: Zahlen rechts, Text links
  if (!data?.style?.horizontalAlign || data.style.horizontalAlign === 'general') {
    if (typeof data?.value === 'number') {
      cellStyles.justifyContent = 'flex-end'
    }
  }

  return (
    <div
      className="spreadsheet-cell"
      style={{
        width,
        height,
        ...cellStyles,
        ...(isError ? { color: '#c00' } : {}),
        ...(isSelected && !isActive ? { backgroundColor: cellStyles.backgroundColor ? undefined : 'rgba(0, 120, 212, 0.08)' } : {}),
      }}
    >
      {displayValue}
    </div>
  )
})
