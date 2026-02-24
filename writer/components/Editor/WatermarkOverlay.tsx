'use client'

interface WatermarkOverlayProps {
  text: string
  fontSize?: number
  color?: string
  opacity?: number
  rotation?: number
  scale: number
}

export function WatermarkOverlay({
  text,
  fontSize = 72,
  color = '#cccccc',
  opacity = 0.15,
  rotation = -45,
  scale,
}: WatermarkOverlayProps) {
  if (!text) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          fontSize: fontSize * scale,
          fontWeight: 700,
          color,
          opacity,
          transform: `rotate(${rotation}deg)`,
          whiteSpace: 'nowrap',
          userSelect: 'none',
          fontFamily: 'Arial, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {text}
      </span>
    </div>
  )
}
