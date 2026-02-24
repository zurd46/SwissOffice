'use client'

import { ReactNode, useRef } from 'react'
import { Type, Highlighter } from 'lucide-react'

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: ReactNode
  className?: string
}

export function ToolbarButton({ onClick, isActive, disabled, title, children, className = '' }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        w-[26px] h-[26px] flex items-center justify-center rounded-sm transition-all duration-100
        ${isActive
          ? 'bg-[#c7e0f4] text-[#1a5276] shadow-[inset_0_0_0_1px_rgba(26,82,118,0.25)]'
          : 'text-[#323130] hover:bg-[#e1dfdd]'
        }
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:bg-[#c8c6c4]'}
        ${className}
      `}
    >
      {children}
    </button>
  )
}

interface ToolbarSelectProps {
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  title: string
  className?: string
}

export function ToolbarSelect({ value, onChange, options, title, className = '' }: ToolbarSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      title={title}
      className={`
        h-[24px] px-[6px] text-[11px] border border-[#c8c6c4] rounded-sm bg-white
        hover:border-[#0078d4] focus:outline-none focus:border-[#0078d4] focus:shadow-[0_0_0_1px_rgba(0,120,212,0.3)]
        text-[#323130] cursor-pointer transition-all duration-100
        ${className}
      `}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

export function ToolbarDivider() {
  return <div className="w-px h-6 bg-[#d2d0ce] mx-1" />
}

interface ToolbarColorButtonProps {
  value: string
  onChange: (color: string) => void
  title: string
  icon: 'text' | 'highlight'
}

export function ToolbarColorButton({ value, onChange, title, icon }: ToolbarColorButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <button
      onClick={() => inputRef.current?.click()}
      title={title}
      className="w-[26px] h-[26px] flex flex-col items-center justify-center rounded-sm hover:bg-[#e1dfdd] cursor-pointer transition-all duration-100 relative"
    >
      {icon === 'text' ? <Type size={14} className="text-[#323130]" /> : <Highlighter size={14} className="text-[#323130]" />}
      <div className="w-4 h-[3px] rounded-full mt-px" style={{ backgroundColor: value }} />
      <input
        ref={inputRef}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        tabIndex={-1}
      />
    </button>
  )
}

interface RibbonLargeButtonProps {
  onClick: () => void
  icon: ReactNode
  label: string
  disabled?: boolean
  isActive?: boolean
}

export function RibbonLargeButton({ onClick, icon, label, disabled, isActive }: RibbonLargeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`
        flex flex-col items-center justify-center gap-[2px] px-[10px] py-[4px] rounded-sm transition-all duration-100
        text-[10px] leading-tight min-w-[48px]
        ${isActive
          ? 'bg-[#c7e0f4] text-[#1a5276]'
          : 'text-[#323130] hover:bg-[#e1dfdd]'
        }
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:bg-[#c8c6c4]'}
      `}
    >
      <div className="h-6 flex items-center justify-center">{icon}</div>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  )
}
