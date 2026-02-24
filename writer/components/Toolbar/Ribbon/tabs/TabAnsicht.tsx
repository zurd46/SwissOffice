'use client'

import {
  PanelLeft, ZoomIn, ZoomOut, RotateCcw, Ruler,
} from 'lucide-react'
import { ToolbarButton, RibbonLargeButton } from '../../ToolbarButton'
import { RibbonGroup, RibbonGroupLast } from '../RibbonGroup'

interface TabAnsichtProps {
  onToggleSidebar: () => void
  showSidebar: boolean
  zoom: number
  setZoom: (zoom: number) => void
  showRuler?: boolean
  onToggleRuler?: () => void
}

export function TabAnsicht({ onToggleSidebar, showSidebar, zoom, setZoom, showRuler = true, onToggleRuler }: TabAnsichtProps) {
  return (
    <>
      <RibbonGroup label="Anzeigen">
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RibbonLargeButton
            onClick={onToggleSidebar}
            isActive={showSidebar}
            icon={<PanelLeft size={20} style={{ color: '#0078d4' }} />}
            label="Seitenleiste"
          />
          <RibbonLargeButton
            onClick={onToggleRuler ?? (() => {})}
            isActive={showRuler}
            icon={<Ruler size={20} style={{ color: showRuler ? '#0078d4' : '#605e5c' }} />}
            label="Lineal"
          />
        </div>
      </RibbonGroup>

      <RibbonGroupLast label="Zoom">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ToolbarButton onClick={() => setZoom(Math.max(25, zoom - 10))} title="Verkleinern" disabled={zoom <= 25}>
              <ZoomOut size={14} />
            </ToolbarButton>
            <div style={{ width: 38, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', border: '1px solid #c8c6c4', borderRadius: 2 }}>
              <span style={{ fontSize: 11, color: '#323130', fontWeight: 500 }}>{zoom}%</span>
            </div>
            <ToolbarButton onClick={() => setZoom(Math.min(200, zoom + 10))} title="Vergrössern" disabled={zoom >= 200}>
              <ZoomIn size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => setZoom(100)} title="Zoom zurücksetzen">
              <RotateCcw size={12} />
            </ToolbarButton>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 9, color: '#a19f9d' }}>25</span>
            <input
              type="range"
              min={25}
              max={200}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="ribbon-zoom-slider"
              style={{ width: 100 }}
              title={`Zoom: ${zoom}%`}
            />
            <span style={{ fontSize: 9, color: '#a19f9d' }}>200</span>
          </div>
        </div>
      </RibbonGroupLast>
    </>
  )
}
