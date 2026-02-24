'use client'

import { ReactNode } from 'react'

interface RibbonGroupProps {
  label: string
  children: ReactNode
  className?: string
}

export function RibbonGroup({ label, children, className = '' }: RibbonGroupProps) {
  return (
    <>
      <div className={`flex flex-col items-center px-3 h-full min-w-0 ${className}`}>
        <div className="flex items-center gap-[3px] flex-1 py-[2px]">
          {children}
        </div>
        <span className="text-[10.5px] text-[#8a8886] mt-auto leading-none pb-[5px] select-none font-medium uppercase tracking-[0.04em]">
          {label}
        </span>
      </div>
      <div className="w-px bg-[#d2d0ce] mx-[2px] self-stretch my-[6px]" />
    </>
  )
}

export function RibbonGroupLast({ label, children, className = '' }: RibbonGroupProps) {
  return (
    <div className={`flex flex-col items-center px-3 h-full min-w-0 ${className}`}>
      <div className="flex items-center gap-[3px] flex-1 py-[2px]">
        {children}
      </div>
      <span className="text-[10.5px] text-[#8a8886] mt-auto leading-none pb-[5px] select-none font-medium uppercase tracking-[0.04em]">
        {label}
      </span>
    </div>
  )
}
