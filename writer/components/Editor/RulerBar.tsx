'use client'

import { useDocumentSettings } from '../../lib/documentContext'
import { getEffectivePageDimensions } from '../../lib/types/document'

interface RulerBarProps {
  zoom: number
}

export function RulerBar({ zoom }: RulerBarProps) {
  const { settings } = useDocumentSettings()
  const pageDims = getEffectivePageDimensions(settings)
  const scale = zoom / 100
  const widthMm = pageDims.width
  const marginLeft = settings.margins.left
  const marginRight = settings.margins.right

  // Generate tick marks every 5mm, labels every 10mm
  const ticks: { pos: number; major: boolean; label?: string }[] = []
  for (let mm = 0; mm <= widthMm; mm += 5) {
    const isMajor = mm % 10 === 0
    ticks.push({
      pos: mm,
      major: isMajor,
      label: isMajor ? `${mm / 10}` : undefined,
    })
  }

  return (
    <div
      style={{
        height: 22,
        backgroundColor: '#fafafa',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <div style={{ position: 'relative', width: `${widthMm * scale}mm`, height: '100%' }}>
        {/* Margin indicators */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${marginLeft * scale}mm`,
            height: '100%',
            backgroundColor: '#e8e8e8',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            width: `${marginRight * scale}mm`,
            height: '100%',
            backgroundColor: '#e8e8e8',
          }}
        />

        {/* Tick marks */}
        {ticks.map(tick => (
          <div
            key={tick.pos}
            style={{
              position: 'absolute',
              left: `${tick.pos * scale}mm`,
              bottom: 0,
              width: 1,
              height: tick.major ? 10 : 5,
              backgroundColor: '#b0b0b0',
            }}
          >
            {tick.label && (
              <span
                style={{
                  position: 'absolute',
                  bottom: 10,
                  left: -4,
                  fontSize: 8 * Math.min(scale, 1),
                  color: '#888',
                  fontFamily: 'system-ui',
                }}
              >
                {tick.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
