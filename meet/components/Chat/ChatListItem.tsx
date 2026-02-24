'use client'

import type { Conversation } from '@/lib/types'
import { Avatar } from '@/components/Shared/Avatar'
import { Badge } from '@/components/Shared/Badge'
import { ContextMenu } from '@/components/Shared/ContextMenu'
import { formatChatListTime } from '@/lib/utils/formatDate'
import { cn } from '@/lib/utils/cn'
import { Pin, BellOff, Trash2, Volume2 } from 'lucide-react'
import { useChat } from '@/lib/contexts/ChatContext'

interface ChatListItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}

export function ChatListItem({ conversation, isActive, onClick }: ChatListItemProps) {
  const { updateConversation } = useChat()
  const lastMessage = conversation.lastMessage

  const contextMenuItems = [
    {
      label: conversation.isPinned ? 'Lösen' : 'Anheften',
      icon: <Pin size={14} />,
      onClick: () => updateConversation(conversation.id, { isPinned: !conversation.isPinned }),
    },
    {
      label: conversation.isMuted ? 'Stummschaltung aufheben' : 'Stummschalten',
      icon: conversation.isMuted ? <Volume2 size={14} /> : <BellOff size={14} />,
      onClick: () => updateConversation(conversation.id, { isMuted: !conversation.isMuted }),
    },
    { label: '', divider: true, onClick: () => {} },
    {
      label: 'Chat löschen',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: () => {},
    },
  ]

  return (
    <ContextMenu items={contextMenuItems}>
      <button
        onClick={onClick}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
          isActive
            ? 'bg-[#e8e6e4]'
            : 'hover:bg-[#f3f2f1]'
        )}
      >
        <Avatar
          name={conversation.name ?? 'Chat'}
          size="md"
          presence={conversation.type === 'direct' ? 'online' : undefined}
          showPresence={conversation.type === 'direct'}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className={cn(
              'text-sm truncate',
              conversation.unreadCount > 0 ? 'font-semibold text-[#242424]' : 'text-[#242424]'
            )}>
              {conversation.name ?? 'Chat'}
            </span>
            {lastMessage && (
              <span className="text-xs text-[#a19f9d] shrink-0 ml-2">
                {formatChatListTime(lastMessage.createdAt)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <p className={cn(
              'text-xs truncate',
              conversation.unreadCount > 0 ? 'text-[#242424]' : 'text-[#605e5c]'
            )}>
              {conversation.type === 'group' && lastMessage && (
                <span className="text-[#605e5c]">{lastMessage.senderName.split(' ')[0]}: </span>
              )}
              {lastMessage?.content ?? 'Keine Nachrichten'}
            </p>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {conversation.isPinned && <Pin size={12} className="text-[#a19f9d]" />}
              {conversation.isMuted && <BellOff size={12} className="text-[#a19f9d]" />}
              {conversation.unreadCount > 0 && <Badge count={conversation.unreadCount} />}
            </div>
          </div>
        </div>
      </button>
    </ContextMenu>
  )
}
