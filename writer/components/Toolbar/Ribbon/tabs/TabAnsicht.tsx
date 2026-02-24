'use client'

import {
  PanelLeft, ZoomIn, ZoomOut, RotateCcw,
} from 'lucide-react'
import { ToolbarButton } from '../../ToolbarButton'
import { RibbonGroup, RibbonGroupLast } from '../RibbonGroup'

interface TabAnsichtProps {
  onToggleSidebar: () => void
  showSidebar: boolean
  zoom: number
  setZoom: (zoom: number) => void
}

export function TabAnsicht({ onToggleSidebar, showSidebar, zoom, setZoom }: TabAnsichtProps) {
  return (
    <>
      {/* Anzeigen (Show) */}
      <RibbonGroup label="Anzeigen">
        <div className="flex flex-col gap-0.5">
          <ToolbarButton onClick={onToggleSidebar} isActive={showSidebar} title="Seitenleiste (Inhaltsverzeichnis)">
            <PanelLeft size={16} />
          </ToolbarButton>
          <span className="text-[11px] text-gray-500 text-center">Seitenleiste</span>
        </div>
      </RibbonGroup>

      {/* Zoom */}
      <RibbonGroupLast label="Zoom">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => setZoom(Math.max(25, zoom - 10))} title="Verkleinern" disabled={zoom <= 25}>
              <ZoomOut size={16} />
            </ToolbarButton>
            <span className="text-sm text-gray-700 w-12 text-center font-medium">{zoom}%</span>
            <ToolbarButton onClick={() => setZoom(Math.min(200, zoom + 10))} title="Vergrössern" disabled={zoom >= 200}>
              <ZoomIn size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => setZoom(100)} title="Zoom zurücksetzen">
              <RotateCcw size={14} />
            </ToolbarButton>
          </div>
          <input
            type="range"
            min={25}
            max={200}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-32 h-1.5 accent-blue-600 cursor-pointer"
            title={`Zoom: ${zoom}%`}
          />
        </div>
      </RibbonGroupLast>
    </>
  )
}
