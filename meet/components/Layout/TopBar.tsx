'use client'

import { Bell, Search } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/Shared/Badge'
import { useNotifications } from '@/lib/contexts/NotificationContext'
import { NotificationCenter } from '@/components/Notifications/NotificationCenter'

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const { unreadCount } = useNotifications()

  return (
    <div className="h-12 bg-[#6264a7] flex items-center px-4 gap-3 shrink-0">
      <div className="flex items-center gap-2 text-white">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.5 6.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM10 9c1.5 0 3 .75 3 1.5V12H7v-1.5c0-.75 1.5-1.5 3-1.5z" />
        </svg>
        <span className="font-semibold text-sm">ImpulsMeet</span>
      </div>

      <div className="flex-1 max-w-lg mx-auto">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Suchen..."
            className="w-full h-8 pl-9 pr-4 rounded bg-white/15 text-sm text-white placeholder-white/60 border border-transparent focus:bg-white/25 focus:border-white/30 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/15 text-white transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <Badge count={unreadCount} className="absolute -top-0.5 -right-0.5" />
            )}
          </button>
          {showNotifications && (
            <NotificationCenter onClose={() => setShowNotifications(false)} />
          )}
        </div>
      </div>
    </div>
  )
}
