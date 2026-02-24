// =============================================
// ImpulsTabulator — Formel-Parser
// =============================================

import type { CellAddress, CellRange } from '@/lib/types/spreadsheet'
import { parseCellRef, parseRangeRef } from './cellAddressUtils'

// ---- Token Types ----

export type TokenType =
  | 'NUMBER' | 'STRING' | 'BOOLEAN' | 'CELL_REF' | 'RANGE_REF'
  | 'FUNCTION_NAME' | 'OPERATOR' | 'LPAREN' | 'RPAREN'
  | 'COMMA' | 'COLON' | 'EOF'

export interface Token {
  type: TokenType
  value: string
  position: number
}

// ---- AST Node Types ----

export type FormulaNode =
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'cellRef'; address: CellAddress; raw: string }
  | { type: 'rangeRef'; range: CellRange; raw: string }
  | { type: 'binaryOp'; op: string; left: FormulaNode; right: FormulaNode }
  | { type: 'unaryOp'; op: string; operand: FormulaNode }
  | { type: 'functionCall'; name: string; args: FormulaNode[] }

// ---- Tokenizer ----

export function tokenize(formula: string): Token[] {
  const tokens: Token[] = []
  let pos = 0
  const src = formula.startsWith('=') ? formula.slice(1) : formula

  while (pos < src.length) {
    const ch = src[pos]

    // Whitespace überspringen
    if (ch === ' ' || ch === '\t') {
      pos++
      continue
    }

    // Zahl
    if (ch >= '0' && ch <= '9' || (ch === '.' && pos + 1 < src.length && src[pos + 1] >= '0' && src[pos + 1] <= '9')) {
      const start = pos
      while (pos < src.length && (src[pos] >= '0' && src[pos] <= '9' || src[pos] === '.')) pos++
      tokens.push({ type: 'NUMBER', value: src.slice(start, pos), position: start })
      continue
    }

    // String
    if (ch === '"') {
      const start = pos
      pos++ // Skip opening quote
      let str = ''
      while (pos < src.length && src[pos] !== '"') {
        if (src[pos] === '\\' && pos + 1 < src.length) {
          pos++
          str += src[pos]
        } else {
          str += src[pos]
        }
        pos++
      }
      pos++ // Skip closing quote
      tokens.push({ type: 'STRING', value: str, position: start })
      continue
    }

    // Identifier (Funktionsname, Zell-Referenz, Boolean)
    if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') || ch === '_') {
      const start = pos
      while (pos < src.length && ((src[pos] >= 'A' && src[pos] <= 'Z') || (src[pos] >= 'a' && src[pos] <= 'z') || (src[pos] >= '0' && src[pos] <= '9') || src[pos] === '_')) {
        pos++
      }
      const word = src.slice(start, pos)
      const upper = word.toUpperCase()

      // Boolean
      if (upper === 'TRUE' || upper === 'WAHR') {
        tokens.push({ type: 'BOOLEAN', value: 'true', position: start })
        continue
      }
      if (upper === 'FALSE' || upper === 'FALSCH') {
        tokens.push({ type: 'BOOLEAN', value: 'false', position: start })
        continue
      }

      // Zell-Referenz prüfen (z.B. A1, BC123)
      // Check for range: A1:B5
      if (pos < src.length && src[pos] === ':') {
        const colonPos = pos
        pos++ // skip colon
        const rangeStart2 = pos
        while (pos < src.length && ((src[pos] >= 'A' && src[pos] <= 'Z') || (src[pos] >= 'a' && src[pos] <= 'z') || (src[pos] >= '0' && src[pos] <= '9'))) {
          pos++
        }
        const rangeStr = word + ':' + src.slice(rangeStart2, pos)
        const range = parseRangeRef(rangeStr)
        if (range) {
          tokens.push({ type: 'RANGE_REF', value: rangeStr.toUpperCase(), position: start })
          continue
        }
        // Nicht gültig als Range, rollback
        pos = colonPos
      }

      // Einzelne Zell-Referenz
      const cellRef = parseCellRef(word)
      if (cellRef) {
        tokens.push({ type: 'CELL_REF', value: word.toUpperCase(), position: start })
        continue
      }

      // Funktionsname (gefolgt von Klammer)
      tokens.push({ type: 'FUNCTION_NAME', value: upper, position: start })
      continue
    }

    // Operatoren
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^' || ch === '&') {
      tokens.push({ type: 'OPERATOR', value: ch, position: pos })
      pos++
      continue
    }

    // Vergleichsoperatoren
    if (ch === '=' || ch === '<' || ch === '>') {
      const start = pos
      pos++
      if (pos < src.length) {
        if ((ch === '<' && src[pos] === '>') || (ch === '<' && src[pos] === '=') || (ch === '>' && src[pos] === '=')) {
          pos++
        }
      }
      tokens.push({ type: 'OPERATOR', value: src.slice(start, pos), position: start })
      continue
    }

    // Klammern
    if (ch === '(') { tokens.push({ type: 'LPAREN', value: '(', position: pos }); pos++; continue }
    if (ch === ')') { tokens.push({ type: 'RPAREN', value: ')', position: pos }); pos++; continue }
    if (ch === ',') { tokens.push({ type: 'COMMA', value: ',', position: pos }); pos++; continue }
    if (ch === ';') { tokens.push({ type: 'COMMA', value: ';', position: pos }); pos++; continue } // Semikolon als Komma (deutsche Notation)
    if (ch === ':') { tokens.push({ type: 'COLON', value: ':', position: pos }); pos++; continue }

    // Unbekanntes Zeichen überspringen
    pos++
  }

  tokens.push({ type: 'EOF', value: '', position: pos })
  return tokens
}

// ---- Parser (Recursive Descent) ----

class Parser {
  private tokens: Token[]
  private pos: number = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  private peek(): Token {
    return this.tokens[this.pos]
  }

  private consume(type?: TokenType): Token {
    const token = this.tokens[this.pos]
    if (type && token.type !== type) {
      throw new Error(`Erwartet ${type}, erhalten ${token.type} ("${token.value}") an Position ${token.position}`)
    }
    this.pos++
    return token
  }

  private match(type: TokenType, value?: string): boolean {
    const token = this.peek()
    if (token.type !== type) return false
    if (value !== undefined && token.value !== value) return false
    return true
  }

  parse(): FormulaNode {
    const result = this.expression()
    if (!this.match('EOF')) {
      throw new Error(`Unerwartetes Token: "${this.peek().value}"`)
    }
    return result
  }

  // Präzedenz (niedrigste zuerst):
  // 1. Vergleichsoperatoren: =, <>, <, >, <=, >=
  // 2. Konkatenation: &
  // 3. Addition/Subtraktion: +, -
  // 4. Multiplikation/Division: *, /
  // 5. Potenz: ^
  // 6. Unärer Minus: -
  // 7. Primärausdrücke: Zahlen, Strings, Referenzen, Funktionsaufrufe

  private expression(): FormulaNode {
    return this.comparison()
  }

  private comparison(): FormulaNode {
    let left = this.concatenation()
    while (this.match('OPERATOR') && ['=', '<>', '<', '>', '<=', '>='].includes(this.peek().value)) {
      const op = this.consume().value
      const right = this.concatenation()
      left = { type: 'binaryOp', op, left, right }
    }
    return left
  }

  private concatenation(): FormulaNode {
    let left = this.addSub()
    while (this.match('OPERATOR', '&')) {
      this.consume()
      const right = this.addSub()
      left = { type: 'binaryOp', op: '&', left, right }
    }
    return left
  }

  private addSub(): FormulaNode {
    let left = this.mulDiv()
    while (this.match('OPERATOR') && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.consume().value
      const right = this.mulDiv()
      left = { type: 'binaryOp', op, left, right }
    }
    return left
  }

  private mulDiv(): FormulaNode {
    let left = this.power()
    while (this.match('OPERATOR') && (this.peek().value === '*' || this.peek().value === '/')) {
      const op = this.consume().value
      const right = this.power()
      left = { type: 'binaryOp', op, left, right }
    }
    return left
  }

  private power(): FormulaNode {
    let left = this.unary()
    while (this.match('OPERATOR', '^')) {
      this.consume()
      const right = this.unary()
      left = { type: 'binaryOp', op: '^', left, right }
    }
    return left
  }

  private unary(): FormulaNode {
    if (this.match('OPERATOR', '-')) {
      this.consume()
      const operand = this.unary()
      return { type: 'unaryOp', op: '-', operand }
    }
    if (this.match('OPERATOR', '+')) {
      this.consume()
      return this.unary()
    }
    return this.primary()
  }

  private primary(): FormulaNode {
    const token = this.peek()

    // Zahl
    if (token.type === 'NUMBER') {
      this.consume()
      return { type: 'number', value: parseFloat(token.value) }
    }

    // String
    if (token.type === 'STRING') {
      this.consume()
      return { type: 'string', value: token.value }
    }

    // Boolean
    if (token.type === 'BOOLEAN') {
      this.consume()
      return { type: 'boolean', value: token.value === 'true' }
    }

    // Bereichs-Referenz
    if (token.type === 'RANGE_REF') {
      this.consume()
      const range = parseRangeRef(token.value)
      if (!range) throw new Error(`Ungültige Bereichsreferenz: ${token.value}`)
      return { type: 'rangeRef', range, raw: token.value }
    }

    // Zell-Referenz
    if (token.type === 'CELL_REF') {
      this.consume()
      const addr = parseCellRef(token.value)
      if (!addr) throw new Error(`Ungültige Zellreferenz: ${token.value}`)
      return { type: 'cellRef', address: addr, raw: token.value }
    }

    // Funktionsaufruf
    if (token.type === 'FUNCTION_NAME') {
      const name = this.consume().value
      this.consume('LPAREN')
      const args: FormulaNode[] = []
      if (!this.match('RPAREN')) {
        args.push(this.expression())
        while (this.match('COMMA')) {
          this.consume()
          args.push(this.expression())
        }
      }
      this.consume('RPAREN')
      return { type: 'functionCall', name, args }
    }

    // Geklammert
    if (token.type === 'LPAREN') {
      this.consume()
      const expr = this.expression()
      this.consume('RPAREN')
      return expr
    }

    throw new Error(`Unerwartetes Token: ${token.type} ("${token.value}") an Position ${token.position}`)
  }
}

/** Parst eine Formel-Zeichenkette in einen AST */
export function parseFormula(formula: string): FormulaNode {
  const tokens = tokenize(formula)
  const parser = new Parser(tokens)
  return parser.parse()
}
