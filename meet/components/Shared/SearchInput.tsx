'use client'

import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

export function SearchInput({ value, onChange, placeholder = 'Suchen...', className, autoFocus }: SearchInputProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search size={16} className="absolute left-3 text-[#605e5c] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          'w-full h-8 pl-9 pr-8 rounded bg-[#f3f2f1] text-sm text-[#242424] placeholder-[#a19f9d]',
          'border border-transparent focus:border-[#0078d4] focus:bg-white focus:outline-none',
          'transition-colors'
        )}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 p-0.5 rounded hover:bg-[#e1dfdd] text-[#605e5c]"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
