'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Notification } from '@/lib/types'

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

const demoNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'new_message',
    title: 'Anna Müller',
    body: 'Hast du die Präsentation fertig?',
    isRead: false,
    createdAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'notif-2',
    type: 'mention',
    title: 'Projektteam Alpha',
    body: 'Max Weber hat dich erwähnt',
    isRead: false,
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'notif-3',
    type: 'meeting_reminder',
    title: 'Sprint Planning',
    body: 'Beginnt in 15 Minuten',
    isRead: true,
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
]

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev])
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotifications muss innerhalb von NotificationProvider verwendet werden')
  return context
}
