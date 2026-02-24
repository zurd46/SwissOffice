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
      <div className={`flex flex-col items-center px-1.5 h-full ${className}`}>
        <div className="flex items-center gap-0.5 flex-1 py-1">
          {children}
        </div>
        <span className="text-[10px] text-gray-500 mt-auto leading-none pb-1 select-none tracking-wide">
          {label}
        </span>
      </div>
      <div className="w-px bg-gray-300 mx-1 self-stretch my-2" />
    </>
  )
}

export function RibbonGroupLast({ label, children, className = '' }: RibbonGroupProps) {
  return (
    <div className={`flex flex-col items-center px-1.5 h-full ${className}`}>
      <div className="flex items-center gap-0.5 flex-1 py-1">
        {children}
      </div>
      <span className="text-[10px] text-gray-500 mt-auto leading-none pb-1 select-none tracking-wide">
        {label}
      </span>
    </div>
  )
}
