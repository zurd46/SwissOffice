'use client'

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface ContextMenuItem {
  label: string
  icon?: ReactNode
  onClick: () => void
  danger?: boolean
  divider?: boolean
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  children: ReactNode
}

export function ContextMenu({ items, children }: ContextMenuProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setPosition({ x: e.clientX, y: e.clientY })
  }, [])

  useEffect(() => {
    function handleClick() {
      setPosition(null)
    }
    if (position) {
      document.addEventListener('click', handleClick)
    }
    return () => document.removeEventListener('click', handleClick)
  }, [position])

  return (
    <>
      <div onContextMenu={handleContextMenu}>{children}</div>
      {position && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[180px] bg-white rounded-md shadow-lg border border-[#e1dfdd] py-1"
          style={{ left: position.x, top: position.y }}
        >
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="h-px bg-[#edebe9] my-1" />
            ) : (
              <button
                key={i}
                onClick={() => {
                  item.onClick()
                  setPosition(null)
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                  item.danger
                    ? 'text-[#a4262c] hover:bg-[#fde7e9]'
                    : 'text-[#242424] hover:bg-[#f3f2f1]'
                )}
              >
                {item.icon && <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </>
  )
}
