'use client'

import { useRef, useEffect, useState } from 'react'
import { Phone, Video, MoreHorizontal, Pin, Search, Users } from 'lucide-react'
import { useChat } from '@/lib/contexts/ChatContext'
import { useAuth } from '@/lib/contexts/AuthContext'
import { Avatar } from '@/components/Shared/Avatar'
import { Dropdown } from '@/components/Shared/Dropdown'
import { Tooltip } from '@/components/Shared/Tooltip'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'
import type { Message } from '@/lib/types'

export function ChatView() {
  const { activeConversation, messages, activeConversationId, addMessage, typingUsers } = useChat()
  const { currentUser } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [replyTo, setReplyTo] = useState<Message | null>(null)

  const conversationMessages = activeConversationId ? messages.get(activeConversationId) ?? [] : []
  const currentTypingUsers = activeConversationId ? typingUsers.get(activeConversationId) ?? [] : []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationMessages.length])

  if (!activeConversation || !currentUser) return null

  const handleSendMessage = (content: string, attachments?: File[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      senderAvatar: currentUser.avatarUrl,
      type: 'text',
      content: content.trim(),
      attachments: [],
      reactions: [],
      replyToId: replyTo?.id,
      replyTo: replyTo ?? undefined,
      isEdited: false,
      isPinned: false,
      readBy: [currentUser.id],
      createdAt: new Date().toISOString(),
    }

    addMessage(activeConversation.id, newMessage)
    setReplyTo(null)
  }

  const moreMenuItems = [
    { label: 'Angepinnte Nachrichten', icon: <Pin size={14} />, onClick: () => {} },
    { label: 'Nachrichten suchen', icon: <Search size={14} />, onClick: () => {} },
    { label: 'Mitglieder', icon: <Users size={14} />, onClick: () => {} },
  ]

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[#edebe9] shrink-0">
        <div className="flex items-center gap-3">
          <Avatar
            name={activeConversation.name ?? 'Chat'}
            size="md"
            presence={activeConversation.type === 'direct' ? 'online' : undefined}
            showPresence={activeConversation.type === 'direct'}
          />
          <div>
            <h3 className="text-sm font-semibold text-[#242424]">{activeConversation.name}</h3>
            <p className="text-xs text-[#605e5c]">
              {activeConversation.type === 'direct' ? 'Online' : `${activeConversation.members.length || 4} Mitglieder`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip content="Audioanruf">
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-[#605e5c]">
              <Phone size={18} />
            </button>
          </Tooltip>
          <Tooltip content="Videoanruf">
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-[#605e5c]">
              <Video size={18} />
            </button>
          </Tooltip>
          <Dropdown trigger={
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-[#605e5c]">
              <MoreHorizontal size={18} />
            </button>
          } items={moreMenuItems} align="right" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-1">
          {conversationMessages.map((message, index) => {
            const prevMessage = conversationMessages[index - 1]
            const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId
            const isOwn = message.senderId === currentUser.id

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
                onReply={() => setReplyTo(message)}
              />
            )
          })}
        </div>
        {currentTypingUsers.length > 0 && (
          <TypingIndicator userNames={currentTypingUsers} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSend={handleSendMessage}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  )
}
