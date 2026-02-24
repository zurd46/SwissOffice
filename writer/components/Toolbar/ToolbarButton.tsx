'use client'

import { ReactNode } from 'react'

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
        p-1.5 rounded hover:bg-blue-100 transition-colors duration-150
        ${isActive ? 'bg-blue-200 text-blue-800' : 'text-gray-700'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
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
      className={`h-8 px-2 text-sm border border-gray-300 rounded bg-white hover:border-blue-400 focus:outline-none focus:border-blue-500 ${className}`}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

export function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-300 mx-1" />
}

interface ToolbarColorInputProps {
  value: string
  onChange: (color: string) => void
  title: string
}

export function ToolbarColorInput({ value, onChange, title }: ToolbarColorInputProps) {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      title={title}
      className="w-8 h-8 p-0.5 border border-gray-300 rounded cursor-pointer"
    />
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
        flex flex-col items-center gap-1 px-3 py-1.5 rounded hover:bg-blue-50 transition-colors duration-150
        text-[11px] leading-tight min-w-[56px]
        ${isActive ? 'bg-blue-100 text-blue-800' : 'text-gray-700'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  )
}
