'use client'

import { useState } from 'react'
import {
  CornerUpLeft,
  MoreHorizontal,
  Pencil,
  Trash2,
  Pin,
  Bookmark,
  Copy,
  SmilePlus,
} from 'lucide-react'
import type { Message } from '@/lib/types'
import { Avatar } from '@/components/Shared/Avatar'
import { Dropdown } from '@/components/Shared/Dropdown'
import { ReactionBar } from './ReactionBar'
import { formatMessageTime } from '@/lib/utils/formatDate'
import { cn } from '@/lib/utils/cn'
import { useChat } from '@/lib/contexts/ChatContext'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar: boolean
  onReply: () => void
}

export function MessageBubble({ message, isOwn, showAvatar, onReply }: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { updateMessage, deleteMessage } = useChat()

  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🎉']

  const handleReaction = (emoji: string) => {
    const existing = message.reactions.find(r => r.emoji === emoji)
    if (existing?.hasReacted) {
      updateMessage(message.conversationId, message.id, {
        reactions: message.reactions.map(r =>
          r.emoji === emoji
            ? { ...r, count: r.count - 1, hasReacted: false }
            : r
        ).filter(r => r.count > 0),
      })
    } else if (existing) {
      updateMessage(message.conversationId, message.id, {
        reactions: message.reactions.map(r =>
          r.emoji === emoji
            ? { ...r, count: r.count + 1, hasReacted: true }
            : r
        ),
      })
    } else {
      updateMessage(message.conversationId, message.id, {
        reactions: [...message.reactions, { emoji, count: 1, userIds: ['user-1'], hasReacted: true }],
      })
    }
  }

  const menuItems = [
    { label: 'Antworten', icon: <CornerUpLeft size={14} />, onClick: onReply },
    { label: 'Reaktion', icon: <SmilePlus size={14} />, onClick: () => handleReaction('👍') },
    { label: 'Kopieren', icon: <Copy size={14} />, onClick: () => navigator.clipboard.writeText(message.content) },
    { label: message.isPinned ? 'Lösen' : 'Anheften', icon: <Pin size={14} />, onClick: () => updateMessage(message.conversationId, message.id, { isPinned: !message.isPinned }) },
    { label: 'Speichern', icon: <Bookmark size={14} />, onClick: () => {} },
    ...(isOwn ? [
      { label: '', divider: true, onClick: () => {} },
      { label: 'Bearbeiten', icon: <Pencil size={14} />, onClick: () => {} },
      { label: 'Löschen', icon: <Trash2 size={14} />, danger: true, onClick: () => deleteMessage(message.conversationId, message.id) },
    ] : []),
  ]

  return (
    <div
      className={cn('group relative', showAvatar ? 'mt-4' : 'mt-0.5')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Reply indicator */}
      {message.replyTo && (
        <div className="flex items-center gap-2 ml-12 mb-1 text-xs text-[#605e5c]">
          <CornerUpLeft size={12} />
          <span className="font-medium">{message.replyTo.senderName}</span>
          <span className="truncate max-w-[200px]">{message.replyTo.content}</span>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-9 shrink-0">
          {showAvatar && (
            <Avatar name={message.senderName} src={message.senderAvatar} size="sm" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {showAvatar && (
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-sm font-semibold text-[#242424]">{message.senderName}</span>
              <span className="text-xs text-[#a19f9d]">{formatMessageTime(message.createdAt)}</span>
              {message.isEdited && <span className="text-xs text-[#a19f9d]">(bearbeitet)</span>}
            </div>
          )}

          {/* Message text */}
          <div className="message-content text-sm text-[#242424] whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Attachments */}
          {message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.attachments.map(att => (
                <div key={att.id} className="rounded-lg overflow-hidden border border-[#e1dfdd]">
                  {att.mimeType.startsWith('image/') ? (
                    <img
                      src={att.url}
                      alt={att.fileName}
                      className="max-w-sm max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  ) : att.mimeType.startsWith('video/') ? (
                    <video
                      src={att.url}
                      controls
                      className="max-w-sm max-h-64"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#f5f5f5]">
                      <span className="text-sm text-[#0078d4]">{att.fileName}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reactions */}
          {message.reactions.length > 0 && (
            <ReactionBar reactions={message.reactions} onReaction={handleReaction} />
          )}
        </div>

        {/* Hover Actions */}
        {isHovered && (
          <div className="absolute top-0 right-0 flex items-center gap-0.5 bg-white border border-[#e1dfdd] rounded shadow-sm px-1 py-0.5 -mt-3">
            {quickReactions.slice(0, 3).map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-sm"
              >
                {emoji}
              </button>
            ))}
            <Dropdown trigger={
              <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-[#605e5c]">
                <MoreHorizontal size={16} />
              </button>
            } items={menuItems} align="right" />
          </div>
        )}
      </div>
    </div>
  )
}
