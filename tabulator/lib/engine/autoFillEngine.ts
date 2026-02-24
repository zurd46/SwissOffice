// =============================================
// ImpulsTabulator — Auto-Fill Pattern Detection Engine
// =============================================

import type { CellData, CellValue } from '@/lib/types/spreadsheet'

export interface AutoFillResult {
  cells: Record<string, CellData>
}

/** Prüft ob ein Wert eine Zahl ist */
function isNumber(value: CellValue): value is number {
  return typeof value === 'number'
}

/** Extrahiert Text-Präfix und Zahlensuffix: "Item12" → ["Item", 12] */
function extractTextWithNumber(value: string): { prefix: string; number: number; suffix: string } | null {
  const match = value.match(/^(.*?)(\d+)(\s*)$/)
  if (!match) return null
  return {
    prefix: match[1],
    number: parseInt(match[2], 10),
    suffix: match[3],
  }
}

/**
 * Erkennt Muster in Quellzellen und füllt den Zielbereich.
 * Unterstützt:
 * - Zahlenfolgen (1,2,3 -> 4,5,6 oder 2,4,6 -> 8,10,12)
 * - Konstante Werte (Kopie)
 * - Formel-Kopie (Text wird kopiert)
 * - Text mit Nummern (Item1, Item2 -> Item3, Item4)
 * - Einzelne Werte (Kopie auf alle Zielzellen)
 */
export function autoFill(
  sourceCells: { address: string; data: CellData }[],
  targetAddresses: string[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  direction: 'down' | 'right' | 'up' | 'left' = 'down'
): AutoFillResult {
  const result: Record<string, CellData> = {}

  if (sourceCells.length === 0 || targetAddresses.length === 0) {
    return { cells: result }
  }

  // Einzelne Quellzelle: einfach kopieren
  if (sourceCells.length === 1) {
    const sourceData = sourceCells[0].data
    for (const addr of targetAddresses) {
      result[addr] = {
        value: sourceData.value,
        formula: sourceData.formula,
        style: sourceData.style ? { ...sourceData.style } : undefined,
      }
    }
    return { cells: result }
  }

  // Prüfe ob alle Quellwerte Zahlen sind
  const numericValues: number[] = []
  let allNumbers = true

  for (const source of sourceCells) {
    if (isNumber(source.data.value)) {
      numericValues.push(source.data.value)
    } else {
      allNumbers = false
      break
    }
  }

  // Zahlenfolge mit arithmetischer Progression
  if (allNumbers && numericValues.length >= 2) {
    const step = computeArithmeticStep(numericValues)
    const lastValue = numericValues[numericValues.length - 1]
    const sourceStyle = sourceCells[0].data.style

    for (let i = 0; i < targetAddresses.length; i++) {
      const newValue = lastValue + step * (i + 1)
      result[targetAddresses[i]] = {
        value: newValue,
        style: sourceStyle ? { ...sourceStyle } : undefined,
      }
    }

    return { cells: result }
  }

  // Prüfe ob Text mit Nummern vorliegt (z.B. "Item1", "Item2")
  const textNumberParts: { prefix: string; number: number; suffix: string }[] = []
  let allTextWithNumbers = true

  for (const source of sourceCells) {
    if (typeof source.data.value === 'string') {
      const parsed = extractTextWithNumber(source.data.value)
      if (parsed) {
        textNumberParts.push(parsed)
      } else {
        allTextWithNumbers = false
        break
      }
    } else {
      allTextWithNumbers = false
      break
    }
  }

  if (allTextWithNumbers && textNumberParts.length >= 2) {
    // Prüfe ob alle denselben Präfix haben
    const prefix = textNumberParts[0].prefix
    const suffix = textNumberParts[0].suffix
    const samePrefix = textNumberParts.every(p => p.prefix === prefix && p.suffix === suffix)

    if (samePrefix) {
      const numbers = textNumberParts.map(p => p.number)
      const step = computeArithmeticStep(numbers)
      const lastNumber = numbers[numbers.length - 1]
      const sourceStyle = sourceCells[0].data.style

      for (let i = 0; i < targetAddresses.length; i++) {
        const newNumber = lastNumber + step * (i + 1)
        result[targetAddresses[i]] = {
          value: `${prefix}${newNumber}${suffix}`,
          style: sourceStyle ? { ...sourceStyle } : undefined,
        }
      }

      return { cells: result }
    }
  }

  // Formeln: Kopie des Formel-Texts (Referenz-Anpassung ist komplex)
  const hasFormulas = sourceCells.some(s => s.data.formula)
  if (hasFormulas) {
    const sourceCount = sourceCells.length
    for (let i = 0; i < targetAddresses.length; i++) {
      const sourceIdx = i % sourceCount
      const sourceData = sourceCells[sourceIdx].data
      result[targetAddresses[i]] = {
        value: sourceData.value,
        formula: sourceData.formula,
        style: sourceData.style ? { ...sourceData.style } : undefined,
      }
    }
    return { cells: result }
  }

  // Fallback: Zyklische Kopie der Quellwerte
  const sourceCount = sourceCells.length
  for (let i = 0; i < targetAddresses.length; i++) {
    const sourceIdx = i % sourceCount
    const sourceData = sourceCells[sourceIdx].data
    result[targetAddresses[i]] = {
      value: sourceData.value,
      formula: sourceData.formula,
      style: sourceData.style ? { ...sourceData.style } : undefined,
    }
  }

  return { cells: result }
}

/**
 * Berechnet den Schritt einer arithmetischen Folge.
 * Bei konstanter Differenz wird diese zurückgegeben.
 * Bei unterschiedlichen Differenzen wird der Durchschnitt verwendet.
 */
function computeArithmeticStep(values: number[]): number {
  if (values.length < 2) return 0

  const diffs: number[] = []
  for (let i = 1; i < values.length; i++) {
    diffs.push(values[i] - values[i - 1])
  }

  // Prüfe ob alle Differenzen gleich sind
  const allSame = diffs.every(d => Math.abs(d - diffs[0]) < 1e-10)
  if (allSame) {
    return diffs[0]
  }

  // Durchschnitt als Fallback
  const sum = diffs.reduce((a, b) => a + b, 0)
  return sum / diffs.length
}
