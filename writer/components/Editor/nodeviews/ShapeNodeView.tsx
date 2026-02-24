'use client'

import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'

function renderSvgContent(shapeType: string, w: number, h: number, fill: string, stroke: string) {
  switch (shapeType) {
    case 'ellipse':
      return <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 2} ry={h / 2 - 2} fill={fill} stroke={stroke} strokeWidth={2} />
    case 'arrow-right':
      return <polygon points={`0,${h * 0.25} ${w * 0.65},${h * 0.25} ${w * 0.65},0 ${w},${h / 2} ${w * 0.65},${h} ${w * 0.65},${h * 0.75} 0,${h * 0.75}`} fill={fill} stroke={stroke} strokeWidth={2} />
    case 'line':
      return <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke={stroke} strokeWidth={3} />
    default: // rectangle
      return <rect x={1} y={1} width={w - 2} height={h - 2} rx={3} fill={fill} stroke={stroke} strokeWidth={2} />
  }
}

export function ShapeNodeView({ node, selected }: NodeViewProps) {
  const { shapeType, width, height, fillColor, strokeColor } = node.attrs

  return (
    <NodeViewWrapper
      className="shape-node"
      style={{
        display: 'inline-block',
        margin: '8px 0',
        outline: selected ? '2px solid #0078d4' : 'none',
        outlineOffset: 2,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {renderSvgContent(shapeType, width, height, fillColor, strokeColor)}
      </svg>
    </NodeViewWrapper>
  )
}
