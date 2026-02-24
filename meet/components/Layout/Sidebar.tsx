'use client'

import {
  MessageSquare,
  Users,
  Phone,
  Calendar,
  FolderOpen,
  Settings,
  MoreHorizontal,
} from 'lucide-react'
import { NavigationItem } from './NavigationItem'
import { Avatar } from '@/components/Shared/Avatar'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useChat } from '@/lib/contexts/ChatContext'

export type NavPage = 'chat' | 'teams' | 'calls' | 'calendar' | 'files' | 'settings'

interface SidebarProps {
  activePage: NavPage
  onPageChange: (page: NavPage) => void
}

export function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const { currentUser } = useAuth()
  const { conversations } = useChat()

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <div className="w-16 bg-[#f0eeec] flex flex-col items-center py-2 border-r border-[#e1dfdd]">
      <div className="flex flex-col items-center gap-1 flex-1">
        <NavigationItem
          icon={<MessageSquare size={22} />}
          label="Chat"
          isActive={activePage === 'chat'}
          badge={totalUnread}
          onClick={() => onPageChange('chat')}
        />
        <NavigationItem
          icon={<Users size={22} />}
          label="Teams"
          isActive={activePage === 'teams'}
          onClick={() => onPageChange('teams')}
        />
        <NavigationItem
          icon={<Phone size={22} />}
          label="Anrufe"
          isActive={activePage === 'calls'}
          onClick={() => onPageChange('calls')}
        />
        <NavigationItem
          icon={<Calendar size={22} />}
          label="Kalender"
          isActive={activePage === 'calendar'}
          onClick={() => onPageChange('calendar')}
        />
        <NavigationItem
          icon={<FolderOpen size={22} />}
          label="Dateien"
          isActive={activePage === 'files'}
          onClick={() => onPageChange('files')}
        />

        <div className="h-px w-8 bg-[#d2d0ce] my-2" />

        <NavigationItem
          icon={<MoreHorizontal size={22} />}
          label="Mehr"
          isActive={false}
          onClick={() => {}}
        />
      </div>

      <div className="flex flex-col items-center gap-2 pb-2">
        <NavigationItem
          icon={<Settings size={20} />}
          label="Einstellungen"
          isActive={activePage === 'settings'}
          onClick={() => onPageChange('settings')}
        />
        {currentUser && (
          <button className="mt-1" onClick={() => onPageChange('settings')}>
            <Avatar
              name={currentUser.displayName}
              size="sm"
              presence={currentUser.presence}
            />
          </button>
        )}
      </div>
    </div>
  )
}
