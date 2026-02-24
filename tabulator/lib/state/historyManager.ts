// =============================================
// ImpulsTabulator — Undo/Redo History Manager
// =============================================

import type { CellData } from '@/lib/types/spreadsheet'

/** Patch für eine einzelne Zelle */
export interface CellPatch {
  sheetIndex: number
  address: string
  oldValue: CellData | undefined
  newValue: CellData | undefined
}

/** Ein Eintrag in der History */
export interface HistoryEntry {
  description: string
  patches: CellPatch[]
  inversePatches: CellPatch[]
}

/** History-State */
export interface HistoryState {
  entries: HistoryEntry[]
  currentIndex: number
  maxEntries: number
}

/** Erstellt eine leere History */
export function createHistory(maxEntries: number = 100): HistoryState {
  return {
    entries: [],
    currentIndex: -1,
    maxEntries,
  }
}

/** Fügt einen neuen Eintrag hinzu (löscht Redo-Einträge) */
export function pushHistory(
  history: HistoryState,
  entry: HistoryEntry
): HistoryState {
  const newEntries = history.entries.slice(0, history.currentIndex + 1)
  newEntries.push(entry)

  // Max-Einträge begrenzen
  if (newEntries.length > history.maxEntries) {
    newEntries.shift()
    return {
      ...history,
      entries: newEntries,
      currentIndex: newEntries.length - 1,
    }
  }

  return {
    ...history,
    entries: newEntries,
    currentIndex: newEntries.length - 1,
  }
}

/** Kann undo? */
export function canUndo(history: HistoryState): boolean {
  return history.currentIndex >= 0
}

/** Kann redo? */
export function canRedo(history: HistoryState): boolean {
  return history.currentIndex < history.entries.length - 1
}

/** Gibt den aktuellen Undo-Eintrag zurück und bewegt den Index */
export function undo(history: HistoryState): { history: HistoryState; entry: HistoryEntry | null } {
  if (!canUndo(history)) return { history, entry: null }
  const entry = history.entries[history.currentIndex]
  return {
    history: { ...history, currentIndex: history.currentIndex - 1 },
    entry,
  }
}

/** Gibt den nächsten Redo-Eintrag zurück und bewegt den Index */
export function redo(history: HistoryState): { history: HistoryState; entry: HistoryEntry | null } {
  if (!canRedo(history)) return { history, entry: null }
  const entry = history.entries[history.currentIndex + 1]
  return {
    history: { ...history, currentIndex: history.currentIndex + 1 },
    entry,
  }
}
