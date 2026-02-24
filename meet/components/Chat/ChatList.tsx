'use client'

import { useState } from 'react'
import { Plus, Filter } from 'lucide-react'
import { useChat } from '@/lib/contexts/ChatContext'
import { ChatListItem } from './ChatListItem'
import { SearchInput } from '@/components/Shared/SearchInput'
import { NewChatDialog } from './NewChatDialog'
import { Tooltip } from '@/components/Shared/Tooltip'

export function ChatList() {
  const { conversations, activeConversationId, setActiveConversation } = useChat()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'pinned'>('all')

  const filteredConversations = conversations
    .filter(c => {
      if (searchQuery) {
        return c.name?.toLowerCase().includes(searchQuery.toLowerCase())
      }
      if (filter === 'unread') return c.unreadCount > 0
      if (filter === 'pinned') return c.isPinned
      return true
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

  return (
    <div className="w-80 border-r border-[#e1dfdd] flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#edebe9]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#242424]">Chat</h2>
          <div className="flex items-center gap-1">
            <Tooltip content="Filtern">
              <button
                onClick={() => setFilter(f => f === 'all' ? 'unread' : f === 'unread' ? 'pinned' : 'all')}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-[#605e5c] transition-colors"
              >
                <Filter size={16} />
              </button>
            </Tooltip>
            <Tooltip content="Neuer Chat">
              <button
                onClick={() => setShowNewChat(true)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-[#605e5c] transition-colors"
              >
                <Plus size={18} />
              </button>
            </Tooltip>
          </div>
        </div>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Chats durchsuchen..."
        />
        {filter !== 'all' && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#e8e6e4] text-[#605e5c]">
              {filter === 'unread' ? 'Ungelesen' : 'Angepinnt'}
            </span>
            <button
              onClick={() => setFilter('all')}
              className="text-xs text-[#0078d4] hover:underline"
            >
              Filter zurücksetzen
            </button>
          </div>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <p className="px-4 py-8 text-sm text-[#a19f9d] text-center">
            {searchQuery ? 'Keine Chats gefunden' : 'Keine Chats'}
          </p>
        ) : (
          filteredConversations.map(conversation => (
            <ChatListItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onClick={() => setActiveConversation(conversation.id)}
            />
          ))
        )}
      </div>

      {showNewChat && <NewChatDialog onClose={() => setShowNewChat(false)} />}
    </div>
  )
}
