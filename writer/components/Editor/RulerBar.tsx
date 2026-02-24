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
        height: 14,
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
              top: 0,
              width: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            {tick.label && (
              <span
                style={{
                  fontSize: 7 * Math.min(scale, 1),
                  lineHeight: 1,
                  color: '#999',
                  fontFamily: 'system-ui',
                  position: 'absolute',
                  top: 0,
                  left: 2,
                }}
              >
                {tick.label}
              </span>
            )}
            <div
              style={{
                width: 1,
                height: tick.major ? 5 : 3,
                backgroundColor: '#b0b0b0',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
