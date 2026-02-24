'use client'

import { useChat } from '@/lib/contexts/ChatContext'
import { ChatList } from './ChatList'
import { ChatView } from './ChatView'
import { EmptyState } from '@/components/Shared/EmptyState'
import { MessageSquare } from 'lucide-react'

export function ChatPage() {
  const { activeConversationId } = useChat()

  return (
    <div className="flex h-full">
      <ChatList />
      {activeConversationId ? (
        <ChatView />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#f5f5f5]">
          <EmptyState
            icon={<MessageSquare size={48} />}
            title="Willkommen bei ImpulsMeet"
            description="Wähle einen Chat aus oder starte eine neue Unterhaltung"
          />
        </div>
      )}
    </div>
  )
}
