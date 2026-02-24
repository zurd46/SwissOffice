'use client'

import { useState, useRef, useEffect } from 'react'
import { Hash, Lock, Megaphone, Users, Pin, Settings } from 'lucide-react'
import type { Channel, Message } from '@/lib/types'
import { useAuth } from '@/lib/contexts/AuthContext'
import { MessageBubble } from '@/components/Chat/MessageBubble'
import { MessageInput } from '@/components/Chat/MessageInput'
import { Tooltip } from '@/components/Shared/Tooltip'

interface ChannelViewProps {
  channel: Channel
}

const channelIcons: Record<string, React.ReactNode> = {
  public: <Hash size={18} />,
  private: <Lock size={18} />,
  announcement: <Megaphone size={18} />,
}

// Demo-Nachrichten pro Channel
const channelMessages: Map<string, Message[]> = new Map([
  ['ch-1', [
    {
      id: 'cmsg-1',
      conversationId: 'ch-1',
      senderId: 'user-3',
      senderName: 'Max Weber',
      type: 'text',
      content: 'Guten Morgen zusammen! Das Sprint Review ist heute um 14 Uhr.',
      attachments: [],
      reactions: [{ emoji: '👍', count: 4, userIds: ['user-1', 'user-2', 'user-4', 'user-5'], hasReacted: true }],
      isEdited: false,
      isPinned: true,
      readBy: [],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'cmsg-2',
      conversationId: 'ch-1',
      senderId: 'user-2',
      senderName: 'Anna Müller',
      type: 'text',
      content: 'Perfekt, bin dabei! Wer präsentiert den Design-Teil?',
      attachments: [],
      reactions: [],
      isEdited: false,
      isPinned: false,
      readBy: [],
      createdAt: new Date(Date.now() - 3000000).toISOString(),
    },
    {
      id: 'cmsg-3',
      conversationId: 'ch-1',
      senderId: 'user-5',
      senderName: 'Julia Koch',
      type: 'text',
      content: 'Ich übernehme das! Habe die Slides schon vorbereitet. 🎨',
      attachments: [],
      reactions: [{ emoji: '🎉', count: 2, userIds: ['user-2', 'user-3'], hasReacted: false }],
      isEdited: false,
      isPinned: false,
      readBy: [],
      createdAt: new Date(Date.now() - 2400000).toISOString(),
    },
  ]],
])

export function ChannelView({ channel }: ChannelViewProps) {
  const { currentUser } = useAuth()
  const [messages, setMessages] = useState<Message[]>(channelMessages.get(channel.id) ?? [])
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(channelMessages.get(channel.id) ?? [])
  }, [channel.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = (content: string) => {
    if (!content.trim() || !currentUser) return
    const newMessage: Message = {
      id: `cmsg-${Date.now()}`,
      conversationId: channel.id,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
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
    setMessages(prev => [...prev, newMessage])
    setReplyTo(null)
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Channel Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[#edebe9] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[#605e5c]">{channelIcons[channel.type]}</span>
          <div>
            <h3 className="text-sm font-semibold text-[#242424]">{channel.name}</h3>
            {channel.topic && <p className="text-xs text-[#605e5c]">{channel.topic}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip content="Mitglieder">
            <button className="flex items-center gap-1 px-2 h-8 rounded hover:bg-[#f3f2f1] text-[#605e5c] text-sm">
              <Users size={16} />
              <span>{channel.memberCount}</span>
            </button>
          </Tooltip>
          <Tooltip content="Angepinnte Nachrichten">
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-[#605e5c]">
              <Pin size={16} />
            </button>
          </Tooltip>
          <Tooltip content="Channel-Einstellungen">
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-[#605e5c]">
              <Settings size={16} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-1">
          {messages.map((message, index) => {
            const prevMessage = messages[index - 1]
            const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId
            const isOwn = message.senderId === currentUser?.id

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
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        placeholder={`Nachricht an #${channel.name}...`}
      />
    </div>
  )
}
