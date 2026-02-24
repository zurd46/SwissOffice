// =============================================
// ImpulsTabulator — Bedingte Formatierung
// =============================================

import type { CellValue, CellStyle } from '@/lib/types/spreadsheet'

export type ConditionType =
  | 'greaterThan' | 'lessThan' | 'equalTo' | 'between' | 'notBetween'
  | 'textContains' | 'textStartsWith' | 'textEndsWith'
  | 'duplicateValues' | 'uniqueValues'
  | 'top10' | 'bottom10'
  | 'aboveAverage' | 'belowAverage'
  | 'colorScale2' | 'colorScale3'
  | 'dataBar'

export interface ConditionalFormatRule {
  id: string
  type: ConditionType
  range: { start: { col: number; row: number }; end: { col: number; row: number } }
  values: (string | number)[]
  style: Partial<CellStyle>
  priority: number
  minColor?: string
  midColor?: string
  maxColor?: string
}

/** Hilfsfunktion: Zellwert als Zahl interpretieren */
function toNumber(value: CellValue): number | null {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const n = parseFloat(value)
    return isNaN(n) ? null : n
  }
  if (typeof value === 'boolean') return value ? 1 : 0
  return null
}

/** Hilfsfunktion: Zellwert als String interpretieren */
function toStr(value: CellValue): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object' && 'type' in value) return value.type
  return String(value)
}

/** Hilfsfunktion: Numerische Werte aus einem Array extrahieren */
function numericValues(values: CellValue[]): number[] {
  const result: number[] = []
  for (const v of values) {
    const n = toNumber(v)
    if (n !== null) result.push(n)
  }
  return result
}

/** Hilfsfunktion: Durchschnitt berechnen */
function average(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((sum, n) => sum + n, 0) / nums.length
}

/** Hilfsfunktion: Hex-Farbe in RGB-Komponenten zerlegen */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  }
}

/** Hilfsfunktion: RGB-Werte zu Hex-Farbe zusammensetzen */
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return '#' + [clamp(r), clamp(g), clamp(b)]
    .map(c => c.toString(16).padStart(2, '0'))
    .join('')
}

/** Hilfsfunktion: Zwei Farben interpolieren */
function interpolateColor(color1: string, color2: string, ratio: number): string {
  const c1 = hexToRgb(color1)
  const c2 = hexToRgb(color2)
  return rgbToHex(
    c1.r + (c2.r - c1.r) * ratio,
    c1.g + (c2.g - c1.g) * ratio,
    c1.b + (c2.b - c1.b) * ratio,
  )
}

/** Hilfsfunktion: Position eines Werts im Bereich [min, max] als Ratio 0..1 */
function normalizePosition(value: number, min: number, max: number): number {
  if (max === min) return 0.5
  return Math.max(0, Math.min(1, (value - min) / (max - min)))
}

/** Prüft ob eine Zelladresse innerhalb des Regel-Bereichs liegt */
function isInRange(
  cellAddress: { col: number; row: number },
  range: { start: { col: number; row: number }; end: { col: number; row: number } },
): boolean {
  return (
    cellAddress.col >= range.start.col &&
    cellAddress.col <= range.end.col &&
    cellAddress.row >= range.start.row &&
    cellAddress.row <= range.end.row
  )
}

/** Evaluiert eine einzelne Bedingung */
function evaluateRule(
  rule: ConditionalFormatRule,
  cellValue: CellValue,
  allValues: CellValue[],
): Partial<CellStyle> | undefined {
  const num = toNumber(cellValue)
  const str = toStr(cellValue).toLowerCase()

  switch (rule.type) {
    // --- Numerische Vergleiche ---
    case 'greaterThan': {
      const threshold = toNumber(rule.values[0] ?? null)
      if (num !== null && threshold !== null && num > threshold) return rule.style
      return undefined
    }
    case 'lessThan': {
      const threshold = toNumber(rule.values[0] ?? null)
      if (num !== null && threshold !== null && num < threshold) return rule.style
      return undefined
    }
    case 'equalTo': {
      const threshold = rule.values[0]
      if (typeof threshold === 'number') {
        if (num !== null && num === threshold) return rule.style
      } else {
        if (toStr(cellValue) === String(threshold)) return rule.style
      }
      return undefined
    }
    case 'between': {
      const low = toNumber(rule.values[0] ?? null)
      const high = toNumber(rule.values[1] ?? null)
      if (num !== null && low !== null && high !== null && num >= low && num <= high) {
        return rule.style
      }
      return undefined
    }
    case 'notBetween': {
      const low = toNumber(rule.values[0] ?? null)
      const high = toNumber(rule.values[1] ?? null)
      if (num !== null && low !== null && high !== null && (num < low || num > high)) {
        return rule.style
      }
      return undefined
    }

    // --- Text-Operationen ---
    case 'textContains': {
      const search = String(rule.values[0] ?? '').toLowerCase()
      if (search && str.includes(search)) return rule.style
      return undefined
    }
    case 'textStartsWith': {
      const search = String(rule.values[0] ?? '').toLowerCase()
      if (search && str.startsWith(search)) return rule.style
      return undefined
    }
    case 'textEndsWith': {
      const search = String(rule.values[0] ?? '').toLowerCase()
      if (search && str.endsWith(search)) return rule.style
      return undefined
    }

    // --- Duplikate/Einzigartig ---
    case 'duplicateValues': {
      const cellStr = toStr(cellValue)
      if (cellStr === '') return undefined
      let count = 0
      for (const v of allValues) {
        if (toStr(v) === cellStr) count++
      }
      if (count > 1) return rule.style
      return undefined
    }
    case 'uniqueValues': {
      const cellStr = toStr(cellValue)
      if (cellStr === '') return undefined
      let count = 0
      for (const v of allValues) {
        if (toStr(v) === cellStr) count++
      }
      if (count === 1) return rule.style
      return undefined
    }

    // --- Top/Bottom ---
    case 'top10': {
      if (num === null) return undefined
      const nums = numericValues(allValues)
      nums.sort((a, b) => b - a)
      const n = Math.min(10, nums.length)
      const threshold = nums[n - 1]
      if (threshold !== undefined && num >= threshold) return rule.style
      return undefined
    }
    case 'bottom10': {
      if (num === null) return undefined
      const nums = numericValues(allValues)
      nums.sort((a, b) => a - b)
      const n = Math.min(10, nums.length)
      const threshold = nums[n - 1]
      if (threshold !== undefined && num <= threshold) return rule.style
      return undefined
    }

    // --- Durchschnitt ---
    case 'aboveAverage': {
      if (num === null) return undefined
      const avg = average(numericValues(allValues))
      if (num > avg) return rule.style
      return undefined
    }
    case 'belowAverage': {
      if (num === null) return undefined
      const avg = average(numericValues(allValues))
      if (num < avg) return rule.style
      return undefined
    }

    // --- Farbskala (2 Farben) ---
    case 'colorScale2': {
      if (num === null) return undefined
      const nums = numericValues(allValues)
      if (nums.length === 0) return undefined
      const min = Math.min(...nums)
      const max = Math.max(...nums)
      const ratio = normalizePosition(num, min, max)
      const minColor = rule.minColor ?? '#f8696b'
      const maxColor = rule.maxColor ?? '#63be7b'
      return { backgroundColor: interpolateColor(minColor, maxColor, ratio) }
    }

    // --- Farbskala (3 Farben) ---
    case 'colorScale3': {
      if (num === null) return undefined
      const nums = numericValues(allValues)
      if (nums.length === 0) return undefined
      const min = Math.min(...nums)
      const max = Math.max(...nums)
      const ratio = normalizePosition(num, min, max)
      const minColor = rule.minColor ?? '#f8696b'
      const midColor = rule.midColor ?? '#ffeb84'
      const maxColor = rule.maxColor ?? '#63be7b'
      if (ratio <= 0.5) {
        return { backgroundColor: interpolateColor(minColor, midColor, ratio * 2) }
      } else {
        return { backgroundColor: interpolateColor(midColor, maxColor, (ratio - 0.5) * 2) }
      }
    }

    // --- Datenbalken ---
    case 'dataBar': {
      if (num === null) return undefined
      const nums = numericValues(allValues)
      if (nums.length === 0) return undefined
      const min = Math.min(...nums)
      const max = Math.max(...nums)
      const percentage = Math.round(normalizePosition(num, min, max) * 100)
      return { numberFormatPattern: `bar:${percentage}` }
    }

    default:
      return undefined
  }
}

/**
 * Evaluiert alle bedingten Formatierungsregeln fuer eine Zelle.
 * Gibt den Style-Override zurueck, wenn eine Regel zutrifft, sonst undefined.
 */
export function evaluateConditionalFormat(
  rules: ConditionalFormatRule[],
  cellAddress: { col: number; row: number },
  cellValue: CellValue,
  allValues: CellValue[],
): Partial<CellStyle> | undefined {
  if (cellValue === null || cellValue === undefined) return undefined

  // Regeln nach Prioritaet sortieren (niedrigere Prioritaet = hoehere Wichtigkeit)
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority)

  // Zusammengesetzter Style aus allen zutreffenden Regeln
  let mergedStyle: Partial<CellStyle> = {}
  let hasMatch = false

  for (const rule of sortedRules) {
    // Nur Regeln pruefen, deren Bereich diese Zelle einschliesst
    if (!isInRange(cellAddress, rule.range)) continue

    const result = evaluateRule(rule, cellValue, allValues)
    if (result) {
      hasMatch = true
      mergedStyle = Object.assign({}, mergedStyle, result)
    }
  }

  return hasMatch ? mergedStyle : undefined
}
