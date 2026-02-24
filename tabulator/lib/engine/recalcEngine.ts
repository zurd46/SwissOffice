// =============================================
// ImpulsTabulator — Recalculation Engine
// =============================================

import type { CellValue, CellAddress, CellRange, SheetData } from '@/lib/types/spreadsheet'
import type { FormulaNode } from './formulaParser'
import { parseFormula } from './formulaParser'
import { evaluateFormula } from './formulaEvaluator'
import { DependencyGraph } from './dependencyGraph'
import { cellAddressToString, iterateRange } from './cellAddressUtils'

// Singleton Dependency Graph
const graph = new DependencyGraph()

/** Extrahiert alle Zellreferenzen aus einem Formel-AST */
function extractReferences(node: FormulaNode): string[] {
  const refs: string[] = []

  function walk(n: FormulaNode): void {
    switch (n.type) {
      case 'cellRef':
        refs.push(cellAddressToString(n.address))
        break
      case 'rangeRef':
        // Alle Zellen im Bereich als Abhängigkeiten
        for (const addr of iterateRange(n.range)) {
          refs.push(cellAddressToString(addr))
        }
        break
      case 'binaryOp':
        walk(n.left)
        walk(n.right)
        break
      case 'unaryOp':
        walk(n.operand)
        break
      case 'functionCall':
        for (const arg of n.args) {
          walk(arg)
        }
        break
      // number, string, boolean haben keine Referenzen
    }
  }

  walk(node)
  return refs
}

/** Erstellt getCellValue und getCellRange Callbacks für ein Sheet */
function createCallbacks(
  sheet: SheetData,
  computedValues: Map<string, CellValue>,
) {
  const getCellValue = (address: CellAddress): CellValue => {
    const key = cellAddressToString(address)
    // Zuerst in berechneten Werten suchen
    if (computedValues.has(key)) {
      return computedValues.get(key)!
    }
    const cell = sheet.cells[key]
    if (!cell) return null
    return cell.value ?? null
  }

  const getCellRange = (range: CellRange): CellValue[] => {
    const values: CellValue[] = []
    for (const addr of iterateRange(range)) {
      values.push(getCellValue(addr))
    }
    return values
  }

  return { getCellValue, getCellRange }
}

/** Evaluiert eine einzelne Zelle und gibt den berechneten Wert zurück */
function evaluateCell(
  address: string,
  sheet: SheetData,
  computedValues: Map<string, CellValue>,
): CellValue {
  const cell = sheet.cells[address]
  if (!cell || !cell.formula) return cell?.value ?? null

  try {
    const ast = parseFormula(cell.formula)
    const refs = extractReferences(ast)
    graph.setDependencies(address, refs)

    // Prüfe zirkuläre Abhängigkeiten
    if (graph.hasCircularDependency(address)) {
      return { type: '#CIRC!', message: 'Zirkuläre Referenz' }
    }

    const { getCellValue, getCellRange } = createCallbacks(sheet, computedValues)
    return evaluateFormula(cell.formula, getCellValue, getCellRange)
  } catch {
    return { type: '#VALUE!', message: 'Formelfehler' }
  }
}

/** Berechnet die geänderten Zellen und alle ihre Abhängigen neu */
export function recalculate(
  sheet: SheetData,
  changedAddresses: string[],
): Record<string, CellValue> {
  const results: Record<string, CellValue> = {}
  const computedValues = new Map<string, CellValue>()

  // Registriere Abhängigkeiten der geänderten Zellen
  for (const addr of changedAddresses) {
    const cell = sheet.cells[addr]
    if (cell?.formula) {
      try {
        const ast = parseFormula(cell.formula)
        const refs = extractReferences(ast)
        graph.setDependencies(addr, refs)
      } catch {
        // Ungültige Formel — Abhängigkeiten entfernen
        graph.removeDependencies(addr)
      }
    } else {
      // Keine Formel mehr — Abhängigkeiten entfernen
      graph.removeDependencies(addr)
    }
  }

  // Alle abhängigen Zellen finden
  const dependents = graph.getAllDependents(changedAddresses)

  // Geänderte Formelzellen auch in die Berechnung einbeziehen
  for (const addr of changedAddresses) {
    if (sheet.cells[addr]?.formula) {
      dependents.add(addr)
    }
  }

  if (dependents.size === 0) return results

  // Topologische Sortierung für korrekte Reihenfolge
  const order = graph.getRecalcOrder(dependents)

  // Zellen in Reihenfolge berechnen
  for (const addr of order) {
    const value = evaluateCell(addr, sheet, computedValues)
    computedValues.set(addr, value)
    results[addr] = value
  }

  return results
}

/** Berechnet alle Formeln in einem Sheet neu (für Laden/Initialisierung) */
export function recalcAll(sheet: SheetData): Record<string, CellValue> {
  // Graph zurücksetzen
  graph.clear()

  const results: Record<string, CellValue> = {}
  const computedValues = new Map<string, CellValue>()
  const formulaCells: string[] = []

  // Alle Formelzellen finden und Abhängigkeiten registrieren
  for (const [addr, cell] of Object.entries(sheet.cells)) {
    if (cell?.formula) {
      formulaCells.push(addr)
      try {
        const ast = parseFormula(cell.formula)
        const refs = extractReferences(ast)
        graph.setDependencies(addr, refs)
      } catch {
        graph.removeDependencies(addr)
      }
    }
  }

  if (formulaCells.length === 0) return results

  // Topologische Sortierung
  const cellSet = new Set(formulaCells)
  const order = graph.getRecalcOrder(cellSet)

  // Berechnung in Reihenfolge
  for (const addr of order) {
    const value = evaluateCell(addr, sheet, computedValues)
    computedValues.set(addr, value)
    results[addr] = value
  }

  return results
}

/** Dependency Graph leeren (z.B. bei Workbook-Wechsel) */
export function clearDependencyGraph(): void {
  graph.clear()
}
