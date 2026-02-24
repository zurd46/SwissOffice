'use client'

import { useState } from 'react'
import { Dialog, DialogButton } from '@/components/Shared/Dialog'
import { SearchInput } from '@/components/Shared/SearchInput'
import { Avatar } from '@/components/Shared/Avatar'
import { useChat } from '@/lib/contexts/ChatContext'
import type { User, Conversation } from '@/lib/types'

interface NewChatDialogProps {
  onClose: () => void
}

// Demo-Kontakte
const availableContacts: User[] = [
  { id: 'user-2', email: 'anna@example.com', displayName: 'Anna Müller', presence: 'online', createdAt: '' },
  { id: 'user-3', email: 'max@example.com', displayName: 'Max Weber', presence: 'away', createdAt: '' },
  { id: 'user-4', email: 'lisa@example.com', displayName: 'Lisa Schmidt', presence: 'offline', createdAt: '' },
  { id: 'user-5', email: 'julia@example.com', displayName: 'Julia Koch', presence: 'busy', createdAt: '' },
  { id: 'user-6', email: 'thomas@example.com', displayName: 'Thomas Wagner', presence: 'online', createdAt: '' },
  { id: 'user-7', email: 'sarah@example.com', displayName: 'Sarah Fischer', presence: 'dnd', createdAt: '' },
]

export function NewChatDialog({ onClose }: NewChatDialogProps) {
  const { addConversation, setActiveConversation } = useChat()
  const [search, setSearch] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])

  const filteredContacts = availableContacts.filter(c =>
    c.displayName.toLowerCase().includes(search.toLowerCase())
  )

  const toggleUser = (user: User) => {
    setSelectedUsers(prev =>
      prev.find(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    )
  }

  const handleCreate = () => {
    if (selectedUsers.length === 0) return

    const isGroup = selectedUsers.length > 1
    const conversation: Conversation = {
      id: `conv-${Date.now()}`,
      type: isGroup ? 'group' : 'direct',
      name: isGroup
        ? selectedUsers.map(u => u.displayName.split(' ')[0]).join(', ')
        : selectedUsers[0].displayName,
      members: [],
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addConversation(conversation)
    setActiveConversation(conversation.id)
    onClose()
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="Neuer Chat"
      size="sm"
      footer={
        <>
          <DialogButton onClick={onClose}>Abbrechen</DialogButton>
          <DialogButton onClick={handleCreate} variant="primary" disabled={selectedUsers.length === 0}>
            Chat starten
          </DialogButton>
        </>
      }
    >
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Kontakte suchen..."
        autoFocus
      />

      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {selectedUsers.map(user => (
            <span
              key={user.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-[#e8f0fe] text-[#0078d4] rounded-full text-xs cursor-pointer hover:bg-[#cce0f7]"
              onClick={() => toggleUser(user)}
            >
              {user.displayName}
              <span className="text-[10px]">✕</span>
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 max-h-60 overflow-y-auto">
        {filteredContacts.map(contact => {
          const isSelected = selectedUsers.some(u => u.id === contact.id)
          return (
            <button
              key={contact.id}
              onClick={() => toggleUser(contact)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-[#f3f2f1] transition-colors ${
                isSelected ? 'bg-[#f0f6ff]' : ''
              }`}
            >
              <Avatar name={contact.displayName} size="sm" presence={contact.presence} />
              <div className="flex-1 text-left">
                <span className="text-sm text-[#242424]">{contact.displayName}</span>
              </div>
              {isSelected && (
                <span className="text-[#0078d4] text-sm">✓</span>
              )}
            </button>
          )
        })}
      </div>
    </Dialog>
  )
}
