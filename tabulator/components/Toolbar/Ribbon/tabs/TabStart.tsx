'use client'

// =============================================
// ImpulsTabulator — Ribbon Tab: Start
// =============================================

import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  Clipboard, ClipboardPaste, Scissors,
  Undo2, Redo2, Search, WrapText,
  ArrowUpNarrowWide, ArrowDownNarrowWide,
  Merge, SplitSquareHorizontal,
} from 'lucide-react'
import { RibbonGroup, RibbonGroupLast } from '../RibbonGroup'
import { ToolbarButton, ToolbarSelect, ToolbarColorButton, ToolbarDivider } from '../../ToolbarButton'
import { useSpreadsheet, useActiveSheet } from '@/lib/spreadsheetContext'
import { cellAddressToString, normalizeRange, iterateRange } from '@/lib/engine/cellAddressUtils'
import { useCallback } from 'react'
import type { CellStyle, NumberFormat } from '@/lib/types/spreadsheet'

const FONT_FAMILIES = [
  { label: 'Calibri', value: 'Calibri' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Georgia', value: 'Georgia' },
]

const FONT_SIZES = [
  { label: '8', value: '8' }, { label: '9', value: '9' }, { label: '10', value: '10' },
  { label: '11', value: '11' }, { label: '12', value: '12' }, { label: '14', value: '14' },
  { label: '16', value: '16' }, { label: '18', value: '18' }, { label: '20', value: '20' },
  { label: '24', value: '24' }, { label: '28', value: '28' }, { label: '36', value: '36' },
]

const NUMBER_FORMATS = [
  { label: 'Standard', value: 'general' },
  { label: 'Zahl', value: 'number' },
  { label: 'Währung', value: 'currency' },
  { label: 'Prozent', value: 'percentage' },
  { label: 'Datum', value: 'date' },
  { label: 'Text', value: 'text' },
]

interface TabStartProps {
  onToggleFindReplace: () => void
}

export function TabStart({ onToggleFindReplace }: TabStartProps) {
  const { state, dispatch } = useSpreadsheet()
  const sheet = useActiveSheet()

  const getSelectedAddresses = useCallback((): string[] => {
    const addresses: string[] = []
    for (const range of state.selection.ranges) {
      for (const addr of iterateRange(normalizeRange(range))) {
        addresses.push(cellAddressToString(addr))
      }
    }
    return addresses
  }, [state.selection.ranges])

  const activeAddr = cellAddressToString(state.selection.activeCell)
  const activeStyle = sheet.cells[activeAddr]?.style || {} as CellStyle

  const setStyle = useCallback((style: Partial<CellStyle>) => {
    dispatch({ type: 'SET_CELL_STYLE', addresses: getSelectedAddresses(), style })
  }, [dispatch, getSelectedAddresses])

  return (
    <>
      <RibbonGroup label="Zwischenablage">
        <ToolbarButton title="Ausschneiden (Ctrl+X)" onClick={() => {}}>
          <Scissors size={14} />
        </ToolbarButton>
        <ToolbarButton title="Kopieren (Ctrl+C)" onClick={() => {}}>
          <Clipboard size={14} />
        </ToolbarButton>
        <ToolbarButton title="Einfügen (Ctrl+V)" onClick={() => {}}>
          <ClipboardPaste size={14} />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton title="Rückgängig (Ctrl+Z)" onClick={() => dispatch({ type: 'UNDO' })}>
          <Undo2 size={14} />
        </ToolbarButton>
        <ToolbarButton title="Wiederholen (Ctrl+Y)" onClick={() => dispatch({ type: 'REDO' })}>
          <Redo2 size={14} />
        </ToolbarButton>
      </RibbonGroup>

      <RibbonGroup label="Schriftart">
        <ToolbarSelect
          value={activeStyle.fontFamily || 'Calibri'}
          onChange={(v) => setStyle({ fontFamily: v })}
          options={FONT_FAMILIES}
          title="Schriftart"
          className="w-[120px]"
        />
        <ToolbarSelect
          value={String(activeStyle.fontSize || 11)}
          onChange={(v) => setStyle({ fontSize: parseInt(v) })}
          options={FONT_SIZES}
          title="Schriftgröße"
          className="w-[50px]"
        />
        <ToolbarDivider />
        <ToolbarButton title="Fett (Ctrl+B)" onClick={() => setStyle({ bold: !activeStyle.bold })} isActive={activeStyle.bold}>
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton title="Kursiv (Ctrl+I)" onClick={() => setStyle({ italic: !activeStyle.italic })} isActive={activeStyle.italic}>
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton title="Unterstrichen (Ctrl+U)" onClick={() => setStyle({ underline: !activeStyle.underline })} isActive={activeStyle.underline}>
          <Underline size={14} />
        </ToolbarButton>
        <ToolbarButton title="Durchgestrichen" onClick={() => setStyle({ strikethrough: !activeStyle.strikethrough })} isActive={activeStyle.strikethrough}>
          <Strikethrough size={14} />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarColorButton
          value={activeStyle.textColor || '#000000'}
          onChange={(color) => setStyle({ textColor: color })}
          title="Schriftfarbe"
          icon="text"
        />
        <ToolbarColorButton
          value={activeStyle.backgroundColor || '#ffffff'}
          onChange={(color) => setStyle({ backgroundColor: color })}
          title="Füllfarbe"
          icon="highlight"
        />
      </RibbonGroup>

      <RibbonGroup label="Ausrichtung">
        <ToolbarButton title="Linksbündig" onClick={() => setStyle({ horizontalAlign: 'left' })} isActive={activeStyle.horizontalAlign === 'left'}>
          <AlignLeft size={14} />
        </ToolbarButton>
        <ToolbarButton title="Zentriert" onClick={() => setStyle({ horizontalAlign: 'center' })} isActive={activeStyle.horizontalAlign === 'center'}>
          <AlignCenter size={14} />
        </ToolbarButton>
        <ToolbarButton title="Rechtsbündig" onClick={() => setStyle({ horizontalAlign: 'right' })} isActive={activeStyle.horizontalAlign === 'right'}>
          <AlignRight size={14} />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton title="Textumbruch" onClick={() => setStyle({ wrapText: !activeStyle.wrapText })} isActive={activeStyle.wrapText}>
          <WrapText size={14} />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton title="Zellen verbinden" onClick={() => {
          const range = state.selection.ranges[state.selection.ranges.length - 1]
          if (range) dispatch({ type: 'MERGE_CELLS', range })
        }}>
          <Merge size={14} />
        </ToolbarButton>
        <ToolbarButton title="Verbindung aufheben" onClick={() => {
          const range = state.selection.ranges[state.selection.ranges.length - 1]
          if (range) dispatch({ type: 'UNMERGE_CELLS', range })
        }}>
          <SplitSquareHorizontal size={14} />
        </ToolbarButton>
      </RibbonGroup>

      <RibbonGroup label="Zahlenformat">
        <ToolbarSelect
          value={activeStyle.numberFormat || 'general'}
          onChange={(v) => setStyle({ numberFormat: v as NumberFormat })}
          options={NUMBER_FORMATS}
          title="Zahlenformat"
          className="w-[100px]"
        />
      </RibbonGroup>

      <RibbonGroupLast label="Bearbeiten">
        <ToolbarButton title="Aufsteigend sortieren" onClick={() => {
          const range = state.selection.ranges[state.selection.ranges.length - 1]
          if (range) {
            dispatch({
              type: 'SORT_RANGE',
              range: normalizeRange(range),
              column: state.selection.activeCell.col,
              ascending: true,
            })
          }
        }}>
          <ArrowUpNarrowWide size={14} />
        </ToolbarButton>
        <ToolbarButton title="Absteigend sortieren" onClick={() => {
          const range = state.selection.ranges[state.selection.ranges.length - 1]
          if (range) {
            dispatch({
              type: 'SORT_RANGE',
              range: normalizeRange(range),
              column: state.selection.activeCell.col,
              ascending: false,
            })
          }
        }}>
          <ArrowDownNarrowWide size={14} />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton title="Suchen & Ersetzen (Ctrl+H)" onClick={onToggleFindReplace}>
          <Search size={14} />
        </ToolbarButton>
      </RibbonGroupLast>
    </>
  )
}
