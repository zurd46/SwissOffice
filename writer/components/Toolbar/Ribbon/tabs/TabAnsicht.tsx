'use client'

import {
  PanelLeft, ZoomIn, ZoomOut, RotateCcw,
} from 'lucide-react'
import { ToolbarButton, RibbonLargeButton } from '../../ToolbarButton'
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
      <RibbonGroup label="Anzeigen">
        <RibbonLargeButton
          onClick={onToggleSidebar}
          isActive={showSidebar}
          icon={<PanelLeft size={20} className="text-[#0078d4]" />}
          label="Seitenleiste"
        />
      </RibbonGroup>

      <RibbonGroupLast label="Zoom">
        <div className="flex flex-col gap-[3px]">
          <div className="flex items-center gap-[2px]">
            <ToolbarButton onClick={() => setZoom(Math.max(25, zoom - 10))} title="Verkleinern" disabled={zoom <= 25}>
              <ZoomOut size={14} />
            </ToolbarButton>
            <div className="w-[38px] h-[24px] flex items-center justify-center bg-white border border-[#c8c6c4] rounded-sm">
              <span className="text-[11px] text-[#323130] font-medium">{zoom}%</span>
            </div>
            <ToolbarButton onClick={() => setZoom(Math.min(200, zoom + 10))} title="Vergrössern" disabled={zoom >= 200}>
              <ZoomIn size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => setZoom(100)} title="Zoom zurücksetzen">
              <RotateCcw size={12} />
            </ToolbarButton>
          </div>
          <div className="flex items-center gap-[4px]">
            <span className="text-[9px] text-[#a19f9d]">25</span>
            <input
              type="range"
              min={25}
              max={200}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="ribbon-zoom-slider w-[100px]"
              title={`Zoom: ${zoom}%`}
            />
            <span className="text-[9px] text-[#a19f9d]">200</span>
          </div>
        </div>
      </RibbonGroupLast>
    </>
  )
}
