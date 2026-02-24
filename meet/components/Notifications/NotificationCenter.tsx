'use client'

import { useEffect, useRef } from 'react'
import { Check, X, MessageSquare, AtSign, Phone, Calendar, Bell } from 'lucide-react'
import { useNotifications } from '@/lib/contexts/NotificationContext'
import { formatRelativeTime } from '@/lib/utils/formatDate'
import { cn } from '@/lib/utils/cn'
import type { NotificationType } from '@/lib/types'

interface NotificationCenterProps {
  onClose: () => void
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  new_message: <MessageSquare size={14} />,
  mention: <AtSign size={14} />,
  reaction: <span className="text-sm">👍</span>,
  call_incoming: <Phone size={14} />,
  call_missed: <Phone size={14} className="text-[#c4314b]" />,
  meeting_reminder: <Calendar size={14} />,
  team_invite: <Bell size={14} />,
  channel_invite: <Bell size={14} />,
  file_shared: <Bell size={14} />,
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-[#e1dfdd] z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#edebe9]">
        <h3 className="font-semibold text-[#242424]">Benachrichtigungen</h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-[#0078d4] hover:underline flex items-center gap-1"
            >
              <Check size={12} />
              Alle gelesen
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded hover:bg-[#f3f2f1] text-[#605e5c]">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="px-4 py-8 text-sm text-[#a19f9d] text-center">Keine Benachrichtigungen</p>
        ) : (
          notifications.map(notification => (
            <button
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={cn(
                'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#f3f2f1] transition-colors',
                !notification.isRead && 'bg-[#f0f6ff]'
              )}
            >
              <div className="w-8 h-8 rounded-full bg-[#e8e6e4] flex items-center justify-center text-[#605e5c] shrink-0 mt-0.5">
                {notificationIcons[notification.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#242424] truncate">{notification.title}</p>
                <p className="text-xs text-[#605e5c] truncate">{notification.body}</p>
                <p className="text-xs text-[#a19f9d] mt-0.5">{formatRelativeTime(notification.createdAt)}</p>
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 rounded-full bg-[#0078d4] shrink-0 mt-2" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
