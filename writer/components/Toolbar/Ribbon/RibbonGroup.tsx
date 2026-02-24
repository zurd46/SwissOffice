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
      <div className={`flex flex-col px-2 h-full ${className}`}>
        <div className="flex items-start gap-[2px] pt-[4px] pb-[2px]">
          {children}
        </div>
        <span className="text-[9px] text-[#a19f9d] leading-none pb-[3px] mt-auto text-center select-none tracking-[0.05em] uppercase">
          {label}
        </span>
      </div>
      <div className="w-px bg-[#e1dfdd] self-stretch my-[4px]" />
    </>
  )
}

export function RibbonGroupLast({ label, children, className = '' }: RibbonGroupProps) {
  return (
    <div className={`flex flex-col px-2 h-full ${className}`}>
      <div className="flex items-start gap-[2px] pt-[4px] pb-[2px]">
        {children}
      </div>
      <span className="text-[9px] text-[#a19f9d] leading-none pb-[3px] mt-auto text-center select-none tracking-[0.05em] uppercase">
        {label}
      </span>
    </div>
  )
}
