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
      <div className={`flex flex-col px-3 h-full ${className}`}>
        <div className="flex items-start gap-[3px] pt-[6px] pb-[2px]">
          {children}
        </div>
        <span className="text-[9px] text-[#a19f9d] leading-none pb-[4px] mt-auto text-center select-none tracking-[0.05em] uppercase">
          {label}
        </span>
      </div>
      <div className="w-px bg-[#d2d0ce] self-stretch my-[6px]" />
    </>
  )
}

export function RibbonGroupLast({ label, children, className = '' }: RibbonGroupProps) {
  return (
    <div className={`flex flex-col px-3 h-full ${className}`}>
      <div className="flex items-start gap-[3px] pt-[6px] pb-[2px]">
        {children}
      </div>
      <span className="text-[9px] text-[#a19f9d] leading-none pb-[4px] mt-auto text-center select-none tracking-[0.05em] uppercase">
        {label}
      </span>
    </div>
  )
}
