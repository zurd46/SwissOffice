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
      {/* Anzeigen (Show) */}
      <RibbonGroup label="Anzeigen">
        <RibbonLargeButton
          onClick={onToggleSidebar}
          isActive={showSidebar}
          icon={<PanelLeft size={22} className="text-[#0078d4]" />}
          label="Seitenleiste"
        />
      </RibbonGroup>

      {/* Zoom */}
      <RibbonGroupLast label="Zoom">
        <div className="flex flex-col gap-[6px] py-[2px]">
          <div className="flex items-center gap-[3px]">
            <ToolbarButton onClick={() => setZoom(Math.max(25, zoom - 10))} title="Verkleinern" disabled={zoom <= 25}>
              <ZoomOut size={15} />
            </ToolbarButton>
            <div className="w-[42px] h-[26px] flex items-center justify-center bg-white border border-[#c8c6c4] rounded-sm">
              <span className="text-[12px] text-[#323130] font-medium">{zoom}%</span>
            </div>
            <ToolbarButton onClick={() => setZoom(Math.min(200, zoom + 10))} title="Vergrössern" disabled={zoom >= 200}>
              <ZoomIn size={15} />
            </ToolbarButton>
            <ToolbarButton onClick={() => setZoom(100)} title="Zoom zurücksetzen">
              <RotateCcw size={13} />
            </ToolbarButton>
          </div>
          <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] text-[#8a8886]">25%</span>
            <input
              type="range"
              min={25}
              max={200}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="ribbon-zoom-slider flex-1 h-[4px] cursor-pointer"
              title={`Zoom: ${zoom}%`}
            />
            <span className="text-[10px] text-[#8a8886]">200%</span>
          </div>
        </div>
      </RibbonGroupLast>
    </>
  )
}
