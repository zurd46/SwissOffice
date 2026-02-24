'use client'

import { Editor } from '@tiptap/react'
import { useDocumentSettings } from '../../lib/documentContext'
import { getEffectivePageDimensions } from '../../lib/types/document'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { TabStopDefinition } from './extensions/TabStop'

interface RulerBarProps {
  zoom: number
  editor?: Editor | null
}

const TAB_STOP_SYMBOLS: Record<string, string> = {
  left: '┗',
  center: '┻',
  right: '┛',
  decimal: '⌐',
}

export function RulerBar({ zoom, editor }: RulerBarProps) {
  const { settings } = useDocumentSettings()
  const pageDims = getEffectivePageDimensions(settings)
  const scale = zoom / 100
  const widthMm = pageDims.width
  const marginLeft = settings.margins.left
  const marginRight = settings.margins.right
  const contentWidthMm = widthMm - marginLeft - marginRight
  const rulerRef = useRef<HTMLDivElement>(null)
  const [tabStops, setTabStops] = useState<TabStopDefinition[]>([])
  const [nextAlignment, setNextAlignment] = useState<'left' | 'center' | 'right' | 'decimal'>('left')
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  // Read tab stops from the current paragraph
  useEffect(() => {
    if (!editor) return
    const updateTabStops = () => {
      const { from } = editor.state.selection
      const $pos = editor.state.doc.resolve(from)
      const node = $pos.parent
      if (node && ['paragraph', 'heading'].includes(node.type.name)) {
        setTabStops(node.attrs.tabStops || [])
      } else {
        setTabStops([])
      }
    }
    updateTabStops()
    editor.on('selectionUpdate', updateTabStops)
    editor.on('update', updateTabStops)
    return () => {
      editor.off('selectionUpdate', updateTabStops)
      editor.off('update', updateTabStops)
    }
  }, [editor])

  // Generate tick marks — every 5mm, labels every 10mm relative to left margin
  const ticks: { pos: number; major: boolean; label?: string }[] = []
  for (let mm = 0; mm <= contentWidthMm; mm += 5) {
    const isMajor = mm % 10 === 0
    ticks.push({
      pos: mm,
      major: isMajor,
      label: isMajor ? `${mm / 10}` : undefined,
    })
  }

  const pixelsToMmFromMargin = useCallback((px: number) => {
    if (!rulerRef.current) return 0
    const rect = rulerRef.current.getBoundingClientRect()
    const totalWidth = rect.width
    const clickMm = ((px - rect.left) / totalWidth) * widthMm
    // Convert to mm from left margin
    return Math.round((clickMm - marginLeft) * 2) / 2 // Snap to 0.5mm
  }, [widthMm, marginLeft])

  const handleRulerClick = useCallback((e: React.MouseEvent) => {
    if (!editor || !rulerRef.current || dragIndex !== null) return
    const mm = pixelsToMmFromMargin(e.clientX)
    if (mm < 0 || mm > contentWidthMm) return

    // Check if clicking on an existing tab stop (within 2mm)
    const existingIdx = tabStops.findIndex(t => Math.abs(t.position - mm) < 2)
    if (existingIdx >= 0) return // Handled by the tab stop element itself

    editor.commands.addTabStop(mm, nextAlignment)
  }, [editor, pixelsToMmFromMargin, contentWidthMm, tabStops, nextAlignment, dragIndex])

  const handleTabStopDoubleClick = useCallback((position: number) => {
    if (!editor) return
    editor.commands.removeTabStop(position)
  }, [editor])

  const handleDragStart = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    setDragIndex(index)
  }, [])

  // Handle drag
  useEffect(() => {
    if (dragIndex === null || !editor) return

    const handleMouseMove = (e: MouseEvent) => {
      const mm = pixelsToMmFromMargin(e.clientX)
      if (mm < 0 || mm > contentWidthMm) return
      const snapped = Math.round(mm * 2) / 2
      setTabStops(prev => {
        const updated = [...prev]
        if (updated[dragIndex]) {
          updated[dragIndex] = { ...updated[dragIndex], position: snapped }
        }
        return updated
      })
    }

    const handleMouseUp = (e: MouseEvent) => {
      const mm = pixelsToMmFromMargin(e.clientX)
      // If dragged off the ruler (too far above/below), remove it
      if (!rulerRef.current) {
        setDragIndex(null)
        return
      }
      const rect = rulerRef.current.getBoundingClientRect()
      const isOutside = e.clientY < rect.top - 20 || e.clientY > rect.bottom + 20

      // First remove old tab stop
      const oldStop = tabStops[dragIndex]
      if (oldStop) {
        editor.commands.removeTabStop(oldStop.position)
      }

      if (!isOutside && mm >= 0 && mm <= contentWidthMm) {
        const snapped = Math.round(mm * 2) / 2
        editor.commands.addTabStop(snapped, tabStops[dragIndex]?.alignment || 'left')
      }
      setDragIndex(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragIndex, editor, pixelsToMmFromMargin, contentWidthMm, tabStops])

  const cycleAlignment = useCallback(() => {
    const order: Array<'left' | 'center' | 'right' | 'decimal'> = ['left', 'center', 'right', 'decimal']
    const idx = order.indexOf(nextAlignment)
    setNextAlignment(order[(idx + 1) % order.length])
  }, [nextAlignment])

  return (
    <div
      style={{
        height: 20,
        backgroundColor: '#fafafa',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'center',
        overflow: 'visible',
        userSelect: 'none',
      }}
    >
      {/* Tab stop type selector */}
      <div
        onClick={cycleAlignment}
        title={`Tabstopp-Typ: ${nextAlignment === 'left' ? 'Links' : nextAlignment === 'center' ? 'Zentriert' : nextAlignment === 'right' ? 'Rechts' : 'Dezimal'} (Klicken zum Wechseln)`}
        style={{
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 'bold',
          color: '#605e5c',
          borderRight: '1px solid #e0e0e0',
          flexShrink: 0,
        }}
      >
        {TAB_STOP_SYMBOLS[nextAlignment]}
      </div>

      <div
        ref={rulerRef}
        style={{
          position: 'relative',
          width: `${widthMm * scale}mm`,
          height: '100%',
          cursor: 'crosshair',
        }}
        onClick={handleRulerClick}
      >
        {/* Left margin area */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${marginLeft * scale}mm`,
            height: '100%',
            backgroundColor: '#e8e8e8',
          }}
        />
        {/* Right margin area */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            width: `${marginRight * scale}mm`,
            height: '100%',
            backgroundColor: '#e8e8e8',
          }}
        />

        {/* Tick marks in the content area */}
        {ticks.map(tick => (
          <div
            key={tick.pos}
            style={{
              position: 'absolute',
              left: `${(marginLeft + tick.pos) * scale}mm`,
              bottom: 0,
              width: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              pointerEvents: 'none',
            }}
          >
            {tick.label && (
              <span
                style={{
                  fontSize: 8 * Math.min(scale, 1),
                  lineHeight: 1,
                  color: '#999',
                  fontFamily: 'system-ui',
                  position: 'absolute',
                  top: 1,
                  left: 2,
                }}
              >
                {tick.label}
              </span>
            )}
            <div
              style={{
                width: 1,
                height: tick.major ? 6 : 3,
                backgroundColor: '#b0b0b0',
              }}
            />
          </div>
        ))}

        {/* Tab stop markers */}
        {tabStops.map((stop, i) => (
          <div
            key={`tab-${i}`}
            onMouseDown={(e) => handleDragStart(e, i)}
            onDoubleClick={(e) => {
              e.stopPropagation()
              handleTabStopDoubleClick(stop.position)
            }}
            title={`${stop.alignment === 'left' ? 'Links' : stop.alignment === 'center' ? 'Zentriert' : stop.alignment === 'right' ? 'Rechts' : 'Dezimal'}-Tabstopp bei ${stop.position}mm (Doppelklick zum Entfernen)`}
            style={{
              position: 'absolute',
              left: `${(marginLeft + stop.position) * scale}mm`,
              bottom: 0,
              transform: 'translateX(-6px)',
              width: 12,
              height: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: dragIndex === i ? 'grabbing' : 'grab',
              fontSize: 11,
              fontWeight: 'bold',
              color: '#0078d4',
              zIndex: 10,
              pointerEvents: 'auto',
            }}
          >
            {TAB_STOP_SYMBOLS[stop.alignment]}
          </div>
        ))}

        {/* Margin drag handles */}
        <div
          title="Linker Rand"
          style={{
            position: 'absolute',
            left: `${marginLeft * scale}mm`,
            top: 0,
            width: 3,
            height: '100%',
            backgroundColor: '#0078d4',
            cursor: 'col-resize',
            opacity: 0.6,
            transform: 'translateX(-1px)',
          }}
        />
        <div
          title="Rechter Rand"
          style={{
            position: 'absolute',
            right: `${marginRight * scale}mm`,
            top: 0,
            width: 3,
            height: '100%',
            backgroundColor: '#0078d4',
            cursor: 'col-resize',
            opacity: 0.6,
            transform: 'translateX(1px)',
          }}
        />
      </div>
    </div>
  )
}
