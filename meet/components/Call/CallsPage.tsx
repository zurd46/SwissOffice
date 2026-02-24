'use client'

import { useState } from 'react'
import { Phone, Video, PhoneIncoming, PhoneMissed, PhoneOutgoing, Clock, Plus } from 'lucide-react'
import { Avatar } from '@/components/Shared/Avatar'
import { Tabs } from '@/components/Shared/Tabs'
import { EmptyState } from '@/components/Shared/EmptyState'
import { Tooltip } from '@/components/Shared/Tooltip'
import { SearchInput } from '@/components/Shared/SearchInput'
import { useCall } from '@/lib/contexts/CallContext'
import { formatRelativeTime, formatCallDuration } from '@/lib/utils/formatDate'
import { cn } from '@/lib/utils/cn'
import type { Call } from '@/lib/types'

// Demo-Anrufverlauf
const demoCallHistory: (Call & { displayName: string })[] = [
  {
    id: 'call-1',
    type: 'video',
    status: 'ended',
    initiatorId: 'user-1',
    participants: [],
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    endedAt: new Date(Date.now() - 3600000).toISOString(),
    duration: 3600,
    displayName: 'Anna Müller',
  },
  {
    id: 'call-2',
    type: 'audio',
    status: 'missed',
    initiatorId: 'user-3',
    participants: [],
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    displayName: 'Max Weber',
  },
  {
    id: 'call-3',
    type: 'video',
    status: 'ended',
    initiatorId: 'user-1',
    participants: [],
    startedAt: new Date(Date.now() - 172800000).toISOString(),
    endedAt: new Date(Date.now() - 172800000 + 1800000).toISOString(),
    duration: 1800,
    displayName: 'Projektteam Alpha',
  },
  {
    id: 'call-4',
    type: 'audio',
    status: 'ended',
    initiatorId: 'user-4',
    participants: [],
    startedAt: new Date(Date.now() - 259200000).toISOString(),
    endedAt: new Date(Date.now() - 259200000 + 600000).toISOString(),
    duration: 600,
    displayName: 'Lisa Schmidt',
  },
]

const callStatusIcons: Record<string, React.ReactNode> = {
  ended: <PhoneOutgoing size={14} className="text-[#498205]" />,
  missed: <PhoneMissed size={14} className="text-[#c4314b]" />,
}

export function CallsPage() {
  const [activeTab, setActiveTab] = useState('history')
  const [searchQuery, setSearchQuery] = useState('')
  const { startCall } = useCall()

  const tabs = [
    { id: 'history', label: 'Verlauf' },
    { id: 'speed-dial', label: 'Kurzwahl' },
    { id: 'voicemail', label: 'Voicemail' },
  ]

  const filteredHistory = demoCallHistory.filter(call =>
    !searchQuery || call.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStartCall = (type: 'audio' | 'video', name: string) => {
    startCall({
      id: `call-${Date.now()}`,
      type,
      status: 'active',
      initiatorId: 'user-1',
      participants: [{
        id: 'p-1',
        userId: 'user-1',
        displayName: 'Daniel Zurmühle',
        mediaState: { audioEnabled: true, videoEnabled: type === 'video', screenSharing: false, handRaised: false },
        joinedAt: new Date().toISOString(),
      }],
      startedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="flex h-full">
      <div className="w-80 border-r border-[#e1dfdd] flex flex-col bg-white">
        <div className="px-4 py-3 border-b border-[#edebe9]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[#242424]">Anrufe</h2>
            <Tooltip content="Neuer Anruf">
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-[#605e5c]">
                <Plus size={18} />
              </button>
            </Tooltip>
          </div>
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Anrufe suchen..." />
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'history' && (
            filteredHistory.length === 0 ? (
              <EmptyState icon={<Phone size={36} />} title="Keine Anrufe" description="Starte einen neuen Anruf" />
            ) : (
              filteredHistory.map(call => (
                <div key={call.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#f3f2f1] transition-colors group">
                  <Avatar name={call.displayName} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-sm font-medium',
                        call.status === 'missed' ? 'text-[#c4314b]' : 'text-[#242424]'
                      )}>
                        {call.displayName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#605e5c]">
                      {callStatusIcons[call.status]}
                      <span>{call.type === 'video' ? 'Video' : 'Audio'}</span>
                      <span>·</span>
                      <span>{formatRelativeTime(call.startedAt)}</span>
                      {call.duration && (
                        <>
                          <span>·</span>
                          <Clock size={10} />
                          <span>{formatCallDuration(call.duration)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip content="Audioanruf">
                      <button
                        onClick={() => handleStartCall('audio', call.displayName)}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#e8e6e4] text-[#605e5c]"
                      >
                        <Phone size={16} />
                      </button>
                    </Tooltip>
                    <Tooltip content="Videoanruf">
                      <button
                        onClick={() => handleStartCall('video', call.displayName)}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#e8e6e4] text-[#605e5c]"
                      >
                        <Video size={16} />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              ))
            )
          )}

          {activeTab === 'speed-dial' && (
            <EmptyState
              icon={<Phone size={36} />}
              title="Kurzwahl"
              description="Füge häufig angerufene Kontakte hinzu"
            />
          )}

          {activeTab === 'voicemail' && (
            <EmptyState
              icon={<PhoneIncoming size={36} />}
              title="Keine Sprachnachrichten"
              description="Hier erscheinen deine Sprachnachrichten"
            />
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-[#f5f5f5]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#0078d4] flex items-center justify-center">
            <Phone size={36} className="text-white" />
          </div>
          <h3 className="text-lg font-semibold text-[#242424] mb-2">Anruf starten</h3>
          <p className="text-sm text-[#605e5c] mb-6 max-w-sm">
            Starte einen Audio- oder Videoanruf mit deinen Kontakten
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handleStartCall('audio', 'Neuer Anruf')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#8a8886] rounded text-sm hover:bg-[#f3f2f1] transition-colors"
            >
              <Phone size={16} />
              Audioanruf
            </button>
            <button
              onClick={() => handleStartCall('video', 'Neuer Anruf')}
              className="flex items-center gap-2 px-4 py-2 bg-[#0078d4] text-white rounded text-sm hover:bg-[#106ebe] transition-colors"
            >
              <Video size={16} />
              Videoanruf
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
