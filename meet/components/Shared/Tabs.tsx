'use client'

import { cn } from '@/lib/utils/cn'

interface Tab {
  id: string
  label: string
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={cn('flex border-b border-[#edebe9]', className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors relative',
            activeTab === tab.id
              ? 'text-[#0078d4]'
              : 'text-[#605e5c] hover:text-[#242424]'
          )}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span className="ml-1.5 text-xs text-[#a19f9d]">({tab.count})</span>
          )}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0078d4] rounded-t" />
          )}
        </button>
      ))}
    </div>
  )
}
