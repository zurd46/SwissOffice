// =============================================
// ImpulsTabulator — Formel-Evaluator
// =============================================

import type { CellValue, CellAddress, CellRange } from '@/lib/types/spreadsheet'
import type { FormulaNode } from './formulaParser'
import { parseFormula } from './formulaParser'
import { getFormulaFunction } from './formulaFunctions'
import { isCellError } from '@/lib/types/spreadsheet'
// cellAddressUtils used via getCellValue/getCellRange callbacks

export type CellValueGetter = (address: CellAddress) => CellValue
export type CellRangeGetter = (range: CellRange) => CellValue[]

/** Evaluiert einen AST-Knoten */
function evaluateNode(
  node: FormulaNode,
  getCellValue: CellValueGetter,
  getCellRange: CellRangeGetter,
): CellValue {
  switch (node.type) {
    case 'number':
      return node.value

    case 'string':
      return node.value

    case 'boolean':
      return node.value

    case 'cellRef':
      return getCellValue(node.address)

    case 'rangeRef':
      // Bereich wird bei Funktionsaufrufen direkt aufgelöst
      // Standalone-Bereich gibt den ersten Wert zurück
      return getCellValue(node.range.start)

    case 'unaryOp': {
      const val = evaluateNode(node.operand, getCellValue, getCellRange)
      if (isCellError(val)) return val
      if (node.op === '-') {
        if (typeof val === 'number') return -val
        return { type: '#VALUE!', message: 'Keine Zahl für Negation' }
      }
      return val
    }

    case 'binaryOp': {
      const left = evaluateNode(node.left, getCellValue, getCellRange)
      const right = evaluateNode(node.right, getCellValue, getCellRange)
      if (isCellError(left)) return left
      if (isCellError(right)) return right
      return evaluateBinaryOp(node.op, left, right)
    }

    case 'functionCall': {
      const func = getFormulaFunction(node.name)
      if (!func) {
        return { type: '#NAME?', message: `Unbekannte Funktion: ${node.name}` }
      }

      // Argumente auflösen — Bereiche werden abgeflacht
      const resolvedArgs: CellValue[] = []
      for (const arg of node.args) {
        if (arg.type === 'rangeRef') {
          const values = getCellRange(arg.range)
          resolvedArgs.push(...values)
        } else {
          const val = evaluateNode(arg, getCellValue, getCellRange)
          resolvedArgs.push(val)
        }
      }

      try {
        return func(resolvedArgs, getCellRange)
      } catch {
        return { type: '#VALUE!', message: `Fehler in ${node.name}` }
      }
    }

    default:
      return { type: '#VALUE!', message: 'Unbekannter Ausdruck' }
  }
}

/** Evaluiert einen binären Operator */
function evaluateBinaryOp(op: string, left: CellValue, right: CellValue): CellValue {
  // Konkatenation
  if (op === '&') {
    return String(left ?? '') + String(right ?? '')
  }

  // Vergleichsoperatoren
  if (['=', '<>', '<', '>', '<=', '>='].includes(op)) {
    return evaluateComparison(op, left, right)
  }

  // Arithmetische Operatoren
  const numLeft = toNumber(left)
  const numRight = toNumber(right)
  if (numLeft === null || numRight === null) {
    return { type: '#VALUE!', message: 'Keine Zahl' }
  }

  switch (op) {
    case '+': return numLeft + numRight
    case '-': return numLeft - numRight
    case '*': return numLeft * numRight
    case '/':
      if (numRight === 0) return { type: '#DIV/0!', message: 'Division durch 0' }
      return numLeft / numRight
    case '^': return Math.pow(numLeft, numRight)
    default: return { type: '#VALUE!', message: `Unbekannter Operator: ${op}` }
  }
}

/** Vergleichsoperator auswerten */
function evaluateComparison(op: string, left: CellValue, right: CellValue): boolean {
  // Gleiche Typen vergleichen
  if (typeof left === 'number' && typeof right === 'number') {
    switch (op) {
      case '=': return left === right
      case '<>': return left !== right
      case '<': return left < right
      case '>': return left > right
      case '<=': return left <= right
      case '>=': return left >= right
    }
  }

  // String-Vergleich
  const strLeft = String(left ?? '')
  const strRight = String(right ?? '')
  switch (op) {
    case '=': return strLeft.toLowerCase() === strRight.toLowerCase()
    case '<>': return strLeft.toLowerCase() !== strRight.toLowerCase()
    case '<': return strLeft.localeCompare(strRight) < 0
    case '>': return strLeft.localeCompare(strRight) > 0
    case '<=': return strLeft.localeCompare(strRight) <= 0
    case '>=': return strLeft.localeCompare(strRight) >= 0
  }
  return false
}

/** Konvertiert einen Wert zu einer Zahl */
function toNumber(v: CellValue): number | null {
  if (typeof v === 'number') return v
  if (typeof v === 'boolean') return v ? 1 : 0
  if (typeof v === 'string') {
    if (v.trim() === '') return 0
    const n = Number(v)
    return isNaN(n) ? null : n
  }
  if (v === null) return 0
  return null
}

/** Evaluiert eine Formel-Zeichenkette und gibt das Ergebnis zurück */
export function evaluateFormula(
  formula: string,
  getCellValue: CellValueGetter,
  getCellRange: CellRangeGetter,
): CellValue {
  try {
    const ast = parseFormula(formula)
    return evaluateNode(ast, getCellValue, getCellRange)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unbekannter Fehler'
    return { type: '#VALUE!', message }
  }
}
