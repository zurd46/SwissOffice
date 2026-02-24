// =============================================
// ImpulsTabulator — Datenvalidierung
// =============================================

import type { CellValue } from '@/lib/types/spreadsheet'

export type ValidationType = 'list' | 'wholeNumber' | 'decimal' | 'date' | 'textLength' | 'custom'
export type ValidationOperator =
  | 'between' | 'notBetween'
  | 'equal' | 'notEqual'
  | 'greaterThan' | 'lessThan'
  | 'greaterThanOrEqual' | 'lessThanOrEqual'

export interface ValidationRule {
  id: string
  type: ValidationType
  operator?: ValidationOperator
  value1?: string | number
  value2?: string | number
  listValues?: string[]
  allowBlank: boolean
  showInputMessage: boolean
  inputTitle?: string
  inputMessage?: string
  showErrorMessage: boolean
  errorTitle?: string
  errorMessage?: string
  errorStyle: 'stop' | 'warning' | 'information'
}

export interface ValidationResult {
  valid: boolean
  errorTitle?: string
  errorMessage?: string
  errorStyle: 'stop' | 'warning' | 'information'
}

/** Erfolgreiche Validierung */
function validResult(): ValidationResult {
  return { valid: true, errorStyle: 'stop' }
}

/** Fehlgeschlagene Validierung */
function invalidResult(rule: ValidationRule): ValidationResult {
  return {
    valid: false,
    errorTitle: rule.showErrorMessage ? rule.errorTitle : undefined,
    errorMessage: rule.showErrorMessage ? rule.errorMessage : undefined,
    errorStyle: rule.errorStyle,
  }
}

/** Hilfsfunktion: Wert als Zahl interpretieren */
function toNumber(value: string | number | undefined): number | null {
  if (value === undefined || value === null) return null
  if (typeof value === 'number') return value
  const n = parseFloat(value)
  return isNaN(n) ? null : n
}

/** Hilfsfunktion: Prueft ob ein Wert leer ist */
function isBlank(value: CellValue): boolean {
  return value === null || value === undefined || value === ''
}

/** Hilfsfunktion: Operator-Vergleich durchfuehren */
function compareWithOperator(
  actual: number,
  operator: ValidationOperator | undefined,
  val1: number | null,
  val2: number | null,
): boolean {
  if (!operator || val1 === null) return true

  switch (operator) {
    case 'equal':
      return actual === val1
    case 'notEqual':
      return actual !== val1
    case 'greaterThan':
      return actual > val1
    case 'lessThan':
      return actual < val1
    case 'greaterThanOrEqual':
      return actual >= val1
    case 'lessThanOrEqual':
      return actual <= val1
    case 'between':
      return val2 !== null && actual >= val1 && actual <= val2
    case 'notBetween':
      return val2 !== null && (actual < val1 || actual > val2)
    default:
      return true
  }
}

/** Validiert den Typ 'list': Wert muss in der Liste enthalten sein */
function validateList(value: CellValue, rule: ValidationRule): boolean {
  if (!rule.listValues || rule.listValues.length === 0) return true
  const strValue = String(value)
  return rule.listValues.includes(strValue)
}

/** Validiert den Typ 'wholeNumber': Wert muss eine Ganzzahl sein */
function validateWholeNumber(value: CellValue, rule: ValidationRule): boolean {
  const num = typeof value === 'number' ? value : parseFloat(String(value))
  if (isNaN(num)) return false
  if (!Number.isInteger(num)) return false
  const val1 = toNumber(rule.value1)
  const val2 = toNumber(rule.value2)
  return compareWithOperator(num, rule.operator, val1, val2)
}

/** Validiert den Typ 'decimal': Wert muss eine Zahl sein */
function validateDecimal(value: CellValue, rule: ValidationRule): boolean {
  const num = typeof value === 'number' ? value : parseFloat(String(value))
  if (isNaN(num)) return false
  const val1 = toNumber(rule.value1)
  const val2 = toNumber(rule.value2)
  return compareWithOperator(num, rule.operator, val1, val2)
}

/** Validiert den Typ 'date': Wert muss ein gueltiges Datums-Serial sein */
function validateDate(value: CellValue, rule: ValidationRule): boolean {
  const num = typeof value === 'number' ? value : parseFloat(String(value))
  if (isNaN(num)) return false
  // Datums-Serials sind positive Zahlen (Excel-Konvention: Tage seit 1.1.1900)
  if (num < 1) return false
  const val1 = toNumber(rule.value1)
  const val2 = toNumber(rule.value2)
  return compareWithOperator(num, rule.operator, val1, val2)
}

/** Validiert den Typ 'textLength': Laenge des Textwerts */
function validateTextLength(value: CellValue, rule: ValidationRule): boolean {
  const length = String(value).length
  const val1 = toNumber(rule.value1)
  const val2 = toNumber(rule.value2)
  return compareWithOperator(length, rule.operator, val1, val2)
}

/**
 * Validiert einen Zellwert gegen eine Validierungsregel.
 */
export function validateCellValue(value: CellValue, rule: ValidationRule): ValidationResult {
  // Leere Werte: wenn erlaubt, immer gueltig
  if (isBlank(value)) {
    if (rule.allowBlank) return validResult()
    return invalidResult(rule)
  }

  switch (rule.type) {
    case 'list':
      return validateList(value, rule) ? validResult() : invalidResult(rule)

    case 'wholeNumber':
      return validateWholeNumber(value, rule) ? validResult() : invalidResult(rule)

    case 'decimal':
      return validateDecimal(value, rule) ? validResult() : invalidResult(rule)

    case 'date':
      return validateDate(value, rule) ? validResult() : invalidResult(rule)

    case 'textLength':
      return validateTextLength(value, rule) ? validResult() : invalidResult(rule)

    case 'custom':
      // Benutzerdefinierte Validierung: immer gueltig (Platzhalter)
      return validResult()

    default:
      return validResult()
  }
}
