'use client'

import { useEffect, useCallback, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Dialog({ open, onClose, title, children, footer, size = 'md', className }: DialogProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cn(
          'relative w-full mx-4 bg-white rounded-lg shadow-2xl',
          sizeClasses[size],
          className
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#edebe9]">
          <h2 className="text-lg font-semibold text-[#242424]">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#f3f2f1] text-[#605e5c] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#edebe9]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

interface DialogButtonProps {
  onClick: () => void
  children: ReactNode
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export function DialogButton({ onClick, children, variant = 'secondary', disabled }: DialogButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-2 rounded text-sm font-medium transition-colors',
        variant === 'primary'
          ? 'bg-[#0078d4] text-white hover:bg-[#106ebe] disabled:opacity-50'
          : 'bg-white text-[#242424] border border-[#8a8886] hover:bg-[#f3f2f1] disabled:opacity-50'
      )}
    >
      {children}
    </button>
  )
}
