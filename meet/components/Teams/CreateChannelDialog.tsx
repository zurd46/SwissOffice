'use client'

import { useState } from 'react'
import { Dialog, DialogButton } from '@/components/Shared/Dialog'
import type { ChannelType } from '@/lib/types'

interface CreateChannelDialogProps {
  teamId: string
  onClose: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CreateChannelDialog({ teamId, onClose }: CreateChannelDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ChannelType>('public')

  const handleCreate = () => {
    if (!name.trim()) return
    // TODO: API-Call zum Erstellen
    onClose()
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="Channel erstellen"
      size="sm"
      footer={
        <>
          <DialogButton onClick={onClose}>Abbrechen</DialogButton>
          <DialogButton onClick={handleCreate} variant="primary" disabled={!name.trim()}>
            Erstellen
          </DialogButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-[#242424] mb-1">Channel-Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. design-reviews"
            className="w-full h-9 px-3 rounded border border-[#8a8886] text-sm focus:border-[#0078d4] focus:outline-none"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#242424] mb-1">Beschreibung</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Worum geht es in diesem Channel?"
            rows={2}
            className="w-full px-3 py-2 rounded border border-[#8a8886] text-sm focus:border-[#0078d4] focus:outline-none resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#242424] mb-2">Typ</label>
          <div className="flex flex-col gap-2">
            {([
              { value: 'public', label: 'Öffentlich', desc: 'Jedes Teammitglied kann beitreten' },
              { value: 'private', label: 'Privat', desc: 'Nur eingeladene Mitglieder' },
              { value: 'announcement', label: 'Ankündigungen', desc: 'Nur Admins können schreiben' },
            ] as const).map(option => (
              <label key={option.value} className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={type === option.value}
                  onChange={() => setType(option.value)}
                  className="accent-[#0078d4] mt-1"
                />
                <div>
                  <span className="text-sm font-medium">{option.label}</span>
                  <p className="text-xs text-[#605e5c]">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  )
}
