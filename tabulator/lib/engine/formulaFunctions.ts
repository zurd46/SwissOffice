// =============================================
// ImpulsTabulator — Formel-Funktionen
// =============================================

import type { CellValue, CellRange } from '@/lib/types/spreadsheet'
import { isCellError } from '@/lib/types/spreadsheet'

type RangeResolver = (range: CellRange) => CellValue[]

export type FormulaFunction = (
  args: CellValue[],
  resolveRange: RangeResolver
) => CellValue

/** Extrahiert alle Zahlen aus den Argumenten (flacht Bereiche ab) */
function extractNumbers(values: CellValue[]): number[] {
  const nums: number[] = []
  for (const v of values) {
    if (typeof v === 'number') nums.push(v)
    else if (typeof v === 'boolean') nums.push(v ? 1 : 0)
    else if (typeof v === 'string') {
      const n = Number(v)
      if (!isNaN(n) && v.trim() !== '') nums.push(n)
    }
  }
  return nums
}

/** Konvertiert einen Wert zu einer Zahl */
function toNumber(v: CellValue): number | null {
  if (typeof v === 'number') return v
  if (typeof v === 'boolean') return v ? 1 : 0
  if (typeof v === 'string') {
    const n = Number(v)
    return isNaN(n) ? null : n
  }
  return null
}

// ---- Funktions-Registry ----

const functions = new Map<string, FormulaFunction>()

// Mathematik
functions.set('SUM', (args) => {
  const nums = extractNumbers(args)
  return nums.reduce((a, b) => a + b, 0)
})

functions.set('AVERAGE', (args) => {
  const nums = extractNumbers(args)
  if (nums.length === 0) return { type: '#DIV/0!', message: 'Keine Zahlen' }
  return nums.reduce((a, b) => a + b, 0) / nums.length
})

functions.set('MIN', (args) => {
  const nums = extractNumbers(args)
  if (nums.length === 0) return 0
  return Math.min(...nums)
})

functions.set('MAX', (args) => {
  const nums = extractNumbers(args)
  if (nums.length === 0) return 0
  return Math.max(...nums)
})

functions.set('COUNT', (args) => {
  return args.filter(v => typeof v === 'number').length
})

functions.set('COUNTA', (args) => {
  return args.filter(v => v !== null && v !== undefined && v !== '').length
})

functions.set('ABS', (args) => {
  const n = toNumber(args[0])
  if (n === null) return { type: '#VALUE!', message: 'Keine Zahl' }
  return Math.abs(n)
})

functions.set('ROUND', (args) => {
  const n = toNumber(args[0])
  const digits = toNumber(args[1]) ?? 0
  if (n === null) return { type: '#VALUE!', message: 'Keine Zahl' }
  const factor = Math.pow(10, digits)
  return Math.round(n * factor) / factor
})

functions.set('INT', (args) => {
  const n = toNumber(args[0])
  if (n === null) return { type: '#VALUE!', message: 'Keine Zahl' }
  return Math.floor(n)
})

functions.set('SQRT', (args) => {
  const n = toNumber(args[0])
  if (n === null) return { type: '#VALUE!', message: 'Keine Zahl' }
  if (n < 0) return { type: '#NUM!', message: 'Negative Zahl' }
  return Math.sqrt(n)
})

functions.set('POWER', (args) => {
  const base = toNumber(args[0])
  const exp = toNumber(args[1])
  if (base === null || exp === null) return { type: '#VALUE!', message: 'Keine Zahl' }
  return Math.pow(base, exp)
})

functions.set('MOD', (args) => {
  const n = toNumber(args[0])
  const d = toNumber(args[1])
  if (n === null || d === null) return { type: '#VALUE!', message: 'Keine Zahl' }
  if (d === 0) return { type: '#DIV/0!', message: 'Division durch 0' }
  return n % d
})

// Logik
functions.set('IF', (args) => {
  const condition = args[0]
  const trueVal = args.length > 1 ? args[1] : true
  const falseVal = args.length > 2 ? args[2] : false

  let isTrue = false
  if (typeof condition === 'boolean') isTrue = condition
  else if (typeof condition === 'number') isTrue = condition !== 0
  else if (typeof condition === 'string') isTrue = condition !== ''
  else isTrue = condition !== null

  return isTrue ? trueVal : falseVal
})

functions.set('AND', (args) => {
  for (const v of args) {
    if (typeof v === 'boolean' && !v) return false
    if (typeof v === 'number' && v === 0) return false
    if (v === null || v === '') return false
  }
  return true
})

functions.set('OR', (args) => {
  for (const v of args) {
    if (typeof v === 'boolean' && v) return true
    if (typeof v === 'number' && v !== 0) return true
    if (typeof v === 'string' && v !== '') return true
  }
  return false
})

functions.set('NOT', (args) => {
  const v = args[0]
  if (typeof v === 'boolean') return !v
  if (typeof v === 'number') return v === 0
  return true
})

functions.set('IFERROR', (args) => {
  const value = args[0]
  const fallback = args.length > 1 ? args[1] : ''
  if (isCellError(value)) return fallback
  return value
})

// Text
functions.set('LEN', (args) => {
  return String(args[0] ?? '').length
})

functions.set('LEFT', (args) => {
  const str = String(args[0] ?? '')
  const count = toNumber(args[1]) ?? 1
  return str.slice(0, count)
})

functions.set('RIGHT', (args) => {
  const str = String(args[0] ?? '')
  const count = toNumber(args[1]) ?? 1
  return str.slice(-count)
})

functions.set('MID', (args) => {
  const str = String(args[0] ?? '')
  const start = (toNumber(args[1]) ?? 1) - 1
  const count = toNumber(args[2]) ?? 1
  return str.slice(start, start + count)
})

functions.set('TRIM', (args) => {
  return String(args[0] ?? '').trim()
})

functions.set('UPPER', (args) => {
  return String(args[0] ?? '').toUpperCase()
})

functions.set('LOWER', (args) => {
  return String(args[0] ?? '').toLowerCase()
})

functions.set('CONCATENATE', (args) => {
  return args.map(v => String(v ?? '')).join('')
})

functions.set('TEXT', (args) => {
  const value = args[0]
  // Vereinfachte TEXT-Funktion
  return String(value ?? '')
})

functions.set('SUBSTITUTE', (args) => {
  const text = String(args[0] ?? '')
  const oldText = String(args[1] ?? '')
  const newText = String(args[2] ?? '')
  return text.split(oldText).join(newText)
})

// Statistik
functions.set('SUMIF', (args) => {
  // Vereinfachte Implementierung
  const rangeValues = args.slice(0, args.length >= 3 ? -1 : undefined)
  // Für jetzt nur als Alias für SUM
  return extractNumbers(rangeValues).reduce((a, b) => a + b, 0)
})

functions.set('COUNTIF', (args) => {
  // Vereinfacht
  return args.filter(v => v !== null && v !== '').length
})

/** Registrierte Funktion abrufen */
export function getFormulaFunction(name: string): FormulaFunction | undefined {
  return functions.get(name.toUpperCase())
}

/** Alle verfügbaren Funktionsnamen */
export function getAvailableFunctions(): string[] {
  return Array.from(functions.keys()).sort()
}
