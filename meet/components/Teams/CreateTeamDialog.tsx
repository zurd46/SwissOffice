'use client'

import { useState } from 'react'
import { Dialog, DialogButton } from '@/components/Shared/Dialog'

interface CreateTeamDialogProps {
  onClose: () => void
}

export function CreateTeamDialog({ onClose }: CreateTeamDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  const handleCreate = () => {
    if (!name.trim()) return
    // TODO: API-Call zum Erstellen
    onClose()
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="Team erstellen"
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
          <label className="block text-sm font-medium text-[#242424] mb-1">Team-Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Produktentwicklung"
            className="w-full h-9 px-3 rounded border border-[#8a8886] text-sm focus:border-[#0078d4] focus:outline-none"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#242424] mb-1">Beschreibung</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Worum geht es in diesem Team?"
            rows={3}
            className="w-full px-3 py-2 rounded border border-[#8a8886] text-sm focus:border-[#0078d4] focus:outline-none resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#242424] mb-2">Sichtbarkeit</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
                className="accent-[#0078d4]"
              />
              <span className="text-sm">Öffentlich</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
                className="accent-[#0078d4]"
              />
              <span className="text-sm">Privat</span>
            </label>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
