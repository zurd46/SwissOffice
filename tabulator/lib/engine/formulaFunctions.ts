// =============================================
// ImpulsTabulator — Formel-Funktionen
// =============================================

import type { CellValue, CellRange } from '@/lib/types/spreadsheet'
import { isCellError } from '@/lib/types/spreadsheet'

type RangeResolver = (range: CellRange) => CellValue[]

export interface RangeArg {
  argIndex: number
  cols: number
  rows: number
  values: CellValue[]
}

export type FormulaFunction = (
  args: CellValue[],
  resolveRange: RangeResolver,
  rangeArgs?: RangeArg[]
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

// Statistik — Kriterien-basiert
function matchesCriteria(value: CellValue, criteria: string): boolean {
  const trimmed = criteria.trim()
  const numVal = typeof value === 'number' ? value : null

  if (trimmed.startsWith('>=')) {
    const n = Number(trimmed.slice(2))
    return numVal !== null && !isNaN(n) && numVal >= n
  }
  if (trimmed.startsWith('<=')) {
    const n = Number(trimmed.slice(2))
    return numVal !== null && !isNaN(n) && numVal <= n
  }
  if (trimmed.startsWith('<>')) {
    const cmp = trimmed.slice(2)
    const n = Number(cmp)
    if (!isNaN(n) && numVal !== null) return numVal !== n
    return String(value ?? '').toLowerCase() !== cmp.toLowerCase()
  }
  if (trimmed.startsWith('>')) {
    const n = Number(trimmed.slice(1))
    return numVal !== null && !isNaN(n) && numVal > n
  }
  if (trimmed.startsWith('<')) {
    const n = Number(trimmed.slice(1))
    return numVal !== null && !isNaN(n) && numVal < n
  }
  if (trimmed.startsWith('=')) {
    const cmp = trimmed.slice(1)
    const n = Number(cmp)
    if (!isNaN(n) && numVal !== null) return numVal === n
    return String(value ?? '').toLowerCase() === cmp.toLowerCase()
  }
  // Direkte Übereinstimmung
  const n = Number(trimmed)
  if (!isNaN(n) && trimmed !== '' && numVal !== null) return numVal === n
  return String(value ?? '').toLowerCase() === trimmed.toLowerCase()
}

functions.set('SUMIF', (args) => {
  // args: range_values..., criteria, [sum_range_values...]
  // Vereinfachte Version: Erste Hälfte = Bereich, Mitte = Kriterium
  const criteria = String(args[args.length - 1] ?? '')
  const rangeValues = args.slice(0, -1)
  let sum = 0
  for (const v of rangeValues) {
    if (matchesCriteria(v, criteria) && typeof v === 'number') {
      sum += v
    }
  }
  return sum
})

functions.set('COUNTIF', (args) => {
  const criteria = String(args[args.length - 1] ?? '')
  const rangeValues = args.slice(0, -1)
  let count = 0
  for (const v of rangeValues) {
    if (matchesCriteria(v, criteria)) count++
  }
  return count
})

// Mathe — zusätzlich
functions.set('CEILING', (args) => {
  const n = toNumber(args[0])
  const sig = toNumber(args[1]) ?? 1
  if (n === null) return { type: '#VALUE!', message: 'Keine Zahl' }
  if (sig === 0) return 0
  return Math.ceil(n / sig) * sig
})

functions.set('FLOOR', (args) => {
  const n = toNumber(args[0])
  const sig = toNumber(args[1]) ?? 1
  if (n === null) return { type: '#VALUE!', message: 'Keine Zahl' }
  if (sig === 0) return 0
  return Math.floor(n / sig) * sig
})

functions.set('RAND', () => Math.random())
functions.set('RANDBETWEEN', (args) => {
  const low = toNumber(args[0]) ?? 0
  const high = toNumber(args[1]) ?? 1
  return Math.floor(Math.random() * (high - low + 1)) + low
})

functions.set('LOG', (args) => {
  const n = toNumber(args[0])
  const base = toNumber(args[1]) ?? 10
  if (n === null || n <= 0) return { type: '#NUM!', message: 'Ungültige Zahl' }
  return Math.log(n) / Math.log(base)
})

functions.set('LOG10', (args) => {
  const n = toNumber(args[0])
  if (n === null || n <= 0) return { type: '#NUM!', message: 'Ungültige Zahl' }
  return Math.log10(n)
})

functions.set('EXP', (args) => {
  const n = toNumber(args[0])
  if (n === null) return { type: '#VALUE!', message: 'Keine Zahl' }
  return Math.exp(n)
})

functions.set('PI', () => Math.PI)
functions.set('SIN', (args) => { const n = toNumber(args[0]); return n === null ? { type: '#VALUE!', message: 'Keine Zahl' } : Math.sin(n) })
functions.set('COS', (args) => { const n = toNumber(args[0]); return n === null ? { type: '#VALUE!', message: 'Keine Zahl' } : Math.cos(n) })
functions.set('TAN', (args) => { const n = toNumber(args[0]); return n === null ? { type: '#VALUE!', message: 'Keine Zahl' } : Math.tan(n) })

// Statistik — zusätzlich
functions.set('MEDIAN', (args) => {
  const nums = extractNumbers(args).sort((a, b) => a - b)
  if (nums.length === 0) return { type: '#NUM!', message: 'Keine Zahlen' }
  const mid = Math.floor(nums.length / 2)
  return nums.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
})

functions.set('STDEV', (args) => {
  const nums = extractNumbers(args)
  if (nums.length < 2) return { type: '#DIV/0!', message: 'Zu wenige Werte' }
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length
  const variance = nums.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (nums.length - 1)
  return Math.sqrt(variance)
})

functions.set('LARGE', (args) => {
  const nums = extractNumbers(args.slice(0, -1)).sort((a, b) => b - a)
  const k = toNumber(args[args.length - 1]) ?? 1
  if (k < 1 || k > nums.length) return { type: '#NUM!', message: 'k ausserhalb Bereich' }
  return nums[k - 1]
})

functions.set('SMALL', (args) => {
  const nums = extractNumbers(args.slice(0, -1)).sort((a, b) => a - b)
  const k = toNumber(args[args.length - 1]) ?? 1
  if (k < 1 || k > nums.length) return { type: '#NUM!', message: 'k ausserhalb Bereich' }
  return nums[k - 1]
})

// Text — zusätzlich
functions.set('FIND', (args) => {
  const findText = String(args[0] ?? '')
  const withinText = String(args[1] ?? '')
  const startPos = (toNumber(args[2]) ?? 1) - 1
  const idx = withinText.indexOf(findText, startPos)
  if (idx === -1) return { type: '#VALUE!', message: 'Nicht gefunden' }
  return idx + 1
})

functions.set('SEARCH', (args) => {
  const findText = String(args[0] ?? '').toLowerCase()
  const withinText = String(args[1] ?? '').toLowerCase()
  const startPos = (toNumber(args[2]) ?? 1) - 1
  const idx = withinText.indexOf(findText, startPos)
  if (idx === -1) return { type: '#VALUE!', message: 'Nicht gefunden' }
  return idx + 1
})

functions.set('REPLACE', (args) => {
  const text = String(args[0] ?? '')
  const start = (toNumber(args[1]) ?? 1) - 1
  const count = toNumber(args[2]) ?? 0
  const newText = String(args[3] ?? '')
  return text.slice(0, start) + newText + text.slice(start + count)
})

functions.set('REPT', (args) => {
  const text = String(args[0] ?? '')
  const times = toNumber(args[1]) ?? 1
  return text.repeat(Math.max(0, times))
})

functions.set('PROPER', (args) => {
  const text = String(args[0] ?? '')
  return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
})

functions.set('EXACT', (args) => {
  return String(args[0] ?? '') === String(args[1] ?? '')
})

functions.set('VALUE', (args) => {
  const n = Number(String(args[0] ?? ''))
  if (isNaN(n)) return { type: '#VALUE!', message: 'Keine Zahl' }
  return n
})

// Datum
functions.set('TODAY', () => {
  const now = new Date()
  return Math.floor((now.getTime() - new Date(1899, 11, 30).getTime()) / 86400000)
})

functions.set('NOW', () => {
  const now = new Date()
  return (now.getTime() - new Date(1899, 11, 30).getTime()) / 86400000
})

functions.set('DATE', (args) => {
  const year = toNumber(args[0]) ?? 1900
  const month = toNumber(args[1]) ?? 1
  const day = toNumber(args[2]) ?? 1
  const d = new Date(year, month - 1, day)
  return Math.floor((d.getTime() - new Date(1899, 11, 30).getTime()) / 86400000)
})

functions.set('YEAR', (args) => {
  const serial = toNumber(args[0])
  if (serial === null) return { type: '#VALUE!', message: 'Keine Zahl' }
  const d = new Date(new Date(1899, 11, 30).getTime() + serial * 86400000)
  return d.getFullYear()
})

functions.set('MONTH', (args) => {
  const serial = toNumber(args[0])
  if (serial === null) return { type: '#VALUE!', message: 'Keine Zahl' }
  const d = new Date(new Date(1899, 11, 30).getTime() + serial * 86400000)
  return d.getMonth() + 1
})

functions.set('DAY', (args) => {
  const serial = toNumber(args[0])
  if (serial === null) return { type: '#VALUE!', message: 'Keine Zahl' }
  const d = new Date(new Date(1899, 11, 30).getTime() + serial * 86400000)
  return d.getDate()
})

functions.set('WEEKDAY', (args) => {
  const serial = toNumber(args[0])
  if (serial === null) return { type: '#VALUE!', message: 'Keine Zahl' }
  const d = new Date(new Date(1899, 11, 30).getTime() + serial * 86400000)
  return d.getDay() + 1
})

// Info-Funktionen
functions.set('ISBLANK', (args) => args[0] === null || args[0] === undefined || args[0] === '')
functions.set('ISNUMBER', (args) => typeof args[0] === 'number')
functions.set('ISTEXT', (args) => typeof args[0] === 'string' && args[0] !== '')
functions.set('ISERROR', (args) => isCellError(args[0]))

// VLOOKUP - Sucht einen Wert in der ersten Spalte eines Bereichs und gibt einen Wert aus derselben Zeile zurück
functions.set('VLOOKUP', (args, _resolveRange, rangeArgs) => {
  if (!rangeArgs || rangeArgs.length === 0) {
    return { type: '#N/A', message: 'VLOOKUP benötigt Bereichsreferenzen' }
  }
  const searchValue = args[0]
  const tableRange = rangeArgs[0]
  const { cols, rows, values: tableValues } = tableRange
  // colIndex und rangeLookup sind die args nach dem Bereich
  const afterRange = args.slice(tableRange.argIndex + tableValues.length)
  const colIndex = toNumber(afterRange[0])
  if (colIndex === null || colIndex < 1 || colIndex > cols) {
    return { type: '#VALUE!', message: 'Spaltenindex ungültig' }
  }
  const rangeLookup = afterRange.length > 1 ? afterRange[1] !== false : true

  // Suche in der ersten Spalte (Spalte 0 des Bereichs)
  for (let r = 0; r < rows; r++) {
    const cellVal = tableValues[r * cols]
    let match = false

    if (rangeLookup) {
      // Ungefähre Übereinstimmung (sortierte Daten)
      // Finde den grössten Wert <= searchValue
      if (r === rows - 1) match = true
      else {
        const nextVal = tableValues[(r + 1) * cols]
        if (typeof searchValue === 'number' && typeof cellVal === 'number') {
          if (typeof nextVal === 'number' && nextVal > searchValue && cellVal <= searchValue) match = true
          else if (r === rows - 1 && cellVal <= searchValue) match = true
        }
      }
    } else {
      // Exakte Übereinstimmung
      if (typeof searchValue === 'number' && typeof cellVal === 'number') {
        match = searchValue === cellVal
      } else {
        match = String(searchValue).toLowerCase() === String(cellVal ?? '').toLowerCase()
      }
    }

    if (match) {
      return tableValues[r * cols + (colIndex - 1)] ?? null
    }
  }

  return { type: '#N/A', message: 'Wert nicht gefunden' }
})

// HLOOKUP - Horizontale Suche
functions.set('HLOOKUP', (args, _resolveRange, rangeArgs) => {
  if (!rangeArgs || rangeArgs.length === 0) {
    return { type: '#N/A', message: 'HLOOKUP benötigt Bereichsreferenzen' }
  }
  const searchValue = args[0]
  const tableRange = rangeArgs[0]
  const { cols, values: tableValues } = tableRange
  const afterRange = args.slice(tableRange.argIndex + tableValues.length)
  const rowIndex = toNumber(afterRange[0])
  if (rowIndex === null || rowIndex < 1) {
    return { type: '#VALUE!', message: 'Zeilenindex ungültig' }
  }
  const rangeLookup = afterRange.length > 1 ? afterRange[1] !== false : true

  // Suche in der ersten Zeile
  for (let c = 0; c < cols; c++) {
    const cellVal = tableValues[c]
    let match = false

    if (!rangeLookup) {
      if (typeof searchValue === 'number' && typeof cellVal === 'number') {
        match = searchValue === cellVal
      } else {
        match = String(searchValue).toLowerCase() === String(cellVal ?? '').toLowerCase()
      }
    } else {
      match = String(searchValue).toLowerCase() === String(cellVal ?? '').toLowerCase()
    }

    if (match) {
      return tableValues[(rowIndex - 1) * cols + c] ?? null
    }
  }

  return { type: '#N/A', message: 'Wert nicht gefunden' }
})

// INDEX - Gibt einen Wert aus einem Bereich zurück
functions.set('INDEX', (args, _resolveRange, rangeArgs) => {
  if (!rangeArgs || rangeArgs.length === 0) {
    return { type: '#VALUE!', message: 'INDEX benötigt Bereichsreferenz' }
  }
  const tableRange = rangeArgs[0]
  const { cols, rows, values: tableValues } = tableRange
  const afterRange = args.slice(tableRange.argIndex + tableValues.length)
  const rowNum = toNumber(afterRange[0]) ?? 1
  const colNum = toNumber(afterRange[1]) ?? 1

  if (rowNum < 1 || rowNum > rows || colNum < 1 || colNum > cols) {
    return { type: '#REF!', message: 'Index ausserhalb des Bereichs' }
  }
  return tableValues[(rowNum - 1) * cols + (colNum - 1)] ?? null
})

// MATCH - Sucht einen Wert in einem Bereich und gibt die Position zurück
functions.set('MATCH', (args, _resolveRange, rangeArgs) => {
  if (!rangeArgs || rangeArgs.length === 0) {
    return { type: '#VALUE!', message: 'MATCH benötigt Bereichsreferenz' }
  }
  const searchValue = args[0]
  const tableRange = rangeArgs[0]
  const { values: tableValues } = tableRange
  const afterRange = args.slice(tableRange.argIndex + tableValues.length)
  const matchType = toNumber(afterRange[0]) ?? 1

  if (matchType === 0) {
    // Exakte Übereinstimmung
    for (let i = 0; i < tableValues.length; i++) {
      const v = tableValues[i]
      if (typeof searchValue === 'number' && typeof v === 'number') {
        if (searchValue === v) return i + 1
      } else if (String(searchValue).toLowerCase() === String(v ?? '').toLowerCase()) {
        return i + 1
      }
    }
  } else if (matchType === 1) {
    // Grösster Wert <= Suchwert
    let bestIdx = -1
    for (let i = 0; i < tableValues.length; i++) {
      const v = tableValues[i]
      if (typeof v === 'number' && typeof searchValue === 'number' && v <= searchValue) {
        bestIdx = i
      }
    }
    if (bestIdx >= 0) return bestIdx + 1
  } else if (matchType === -1) {
    // Kleinster Wert >= Suchwert
    let bestIdx = -1
    for (let i = 0; i < tableValues.length; i++) {
      const v = tableValues[i]
      if (typeof v === 'number' && typeof searchValue === 'number' && v >= searchValue) {
        bestIdx = i
      }
    }
    if (bestIdx >= 0) return bestIdx + 1
  }

  return { type: '#N/A', message: 'Wert nicht gefunden' }
})

/** Registrierte Funktion abrufen */
export function getFormulaFunction(name: string): FormulaFunction | undefined {
  return functions.get(name.toUpperCase())
}

/** Alle verfügbaren Funktionsnamen */
export function getAvailableFunctions(): string[] {
  return Array.from(functions.keys()).sort()
}
