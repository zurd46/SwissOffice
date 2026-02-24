'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronRight, Hash, Lock, Megaphone, Settings, UserPlus } from 'lucide-react'
import type { Team, Channel } from '@/lib/types'
import { Avatar } from '@/components/Shared/Avatar'
import { Tooltip } from '@/components/Shared/Tooltip'
import { Dropdown } from '@/components/Shared/Dropdown'
import { SearchInput } from '@/components/Shared/SearchInput'
import { Badge } from '@/components/Shared/Badge'
import { EmptyState } from '@/components/Shared/EmptyState'
import { CreateTeamDialog } from './CreateTeamDialog'
import { CreateChannelDialog } from './CreateChannelDialog'
import { ChannelView } from './ChannelView'
import { cn } from '@/lib/utils/cn'
import { Users } from 'lucide-react'

// Demo-Daten
const demoTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Produktentwicklung',
    description: 'Hauptteam für Produktentwicklung',
    isPublic: true,
    memberCount: 12,
    createdAt: new Date().toISOString(),
    createdBy: 'user-1',
    channels: [
      { id: 'ch-1', teamId: 'team-1', name: 'Allgemein', type: 'public', isDefault: true, memberCount: 12, unreadCount: 3, createdAt: '', createdBy: 'user-1' },
      { id: 'ch-2', teamId: 'team-1', name: 'Design', type: 'public', isDefault: false, memberCount: 5, unreadCount: 0, createdAt: '', createdBy: 'user-1' },
      { id: 'ch-3', teamId: 'team-1', name: 'Backend', type: 'public', isDefault: false, memberCount: 4, unreadCount: 7, createdAt: '', createdBy: 'user-1' },
      { id: 'ch-4', teamId: 'team-1', name: 'Führungskräfte', type: 'private', isDefault: false, memberCount: 3, unreadCount: 0, createdAt: '', createdBy: 'user-1' },
      { id: 'ch-5', teamId: 'team-1', name: 'Ankündigungen', type: 'announcement', isDefault: false, memberCount: 12, unreadCount: 1, createdAt: '', createdBy: 'user-1' },
    ],
  },
  {
    id: 'team-2',
    name: 'Marketing',
    description: 'Marketing und Kommunikation',
    isPublic: true,
    memberCount: 8,
    createdAt: new Date().toISOString(),
    createdBy: 'user-1',
    channels: [
      { id: 'ch-6', teamId: 'team-2', name: 'Allgemein', type: 'public', isDefault: true, memberCount: 8, unreadCount: 0, createdAt: '', createdBy: 'user-1' },
      { id: 'ch-7', teamId: 'team-2', name: 'Social Media', type: 'public', isDefault: false, memberCount: 4, unreadCount: 2, createdAt: '', createdBy: 'user-1' },
      { id: 'ch-8', teamId: 'team-2', name: 'Kampagnen', type: 'public', isDefault: false, memberCount: 6, unreadCount: 0, createdAt: '', createdBy: 'user-1' },
    ],
  },
]

const channelIcons: Record<string, React.ReactNode> = {
  public: <Hash size={16} />,
  private: <Lock size={16} />,
  announcement: <Megaphone size={16} />,
}

export function TeamsPage() {
  const [teams] = useState<Team[]>(demoTeams)
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set(['team-1', 'team-2']))
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showCreateChannel, setShowCreateChannel] = useState<string | null>(null)

  const toggleTeam = (teamId: string) => {
    setExpandedTeams(prev => {
      const next = new Set(prev)
      if (next.has(teamId)) next.delete(teamId)
      else next.add(teamId)
      return next
    })
  }

  const filteredTeams = teams.filter(t =>
    !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.channels.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="flex h-full">
      {/* Team/Channel List */}
      <div className="w-72 border-r border-[#e1dfdd] flex flex-col bg-white">
        <div className="px-4 py-3 border-b border-[#edebe9]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[#242424]">Teams</h2>
            <Tooltip content="Team erstellen">
              <button
                onClick={() => setShowCreateTeam(true)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-[#605e5c]"
              >
                <Plus size={18} />
              </button>
            </Tooltip>
          </div>
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Teams suchen..." />
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {filteredTeams.map(team => (
            <div key={team.id}>
              {/* Team Header */}
              <div className="flex items-center gap-1 px-3 py-1.5 group">
                <button
                  onClick={() => toggleTeam(team.id)}
                  className="p-0.5 rounded hover:bg-[#e8e6e4] text-[#605e5c]"
                >
                  {expandedTeams.has(team.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <Avatar name={team.name} size="sm" showPresence={false} />
                <span className="flex-1 text-sm font-semibold text-[#242424] truncate ml-1">{team.name}</span>
                <Dropdown
                  trigger={
                    <button className="p-1 rounded hover:bg-[#e8e6e4] text-[#605e5c] opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={14} />
                    </button>
                  }
                  items={[
                    { label: 'Channel erstellen', icon: <Hash size={14} />, onClick: () => setShowCreateChannel(team.id) },
                    { label: 'Mitglied einladen', icon: <UserPlus size={14} />, onClick: () => {} },
                    { label: 'Team-Einstellungen', icon: <Settings size={14} />, onClick: () => {} },
                  ]}
                  align="right"
                />
              </div>

              {/* Channels */}
              {expandedTeams.has(team.id) && (
                <div className="ml-4">
                  {team.channels.map(channel => (
                    <button
                      key={channel.id}
                      onClick={() => setActiveChannel(channel)}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-1.5 text-left rounded-sm transition-colors',
                        activeChannel?.id === channel.id
                          ? 'bg-[#e8e6e4]'
                          : 'hover:bg-[#f3f2f1]'
                      )}
                    >
                      <span className="text-[#605e5c]">{channelIcons[channel.type]}</span>
                      <span className={cn(
                        'text-sm truncate flex-1',
                        channel.unreadCount > 0 ? 'font-semibold text-[#242424]' : 'text-[#605e5c]'
                      )}>
                        {channel.name}
                      </span>
                      {channel.unreadCount > 0 && <Badge count={channel.unreadCount} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Channel Content */}
      {activeChannel ? (
        <ChannelView key={activeChannel.id} channel={activeChannel} />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#f5f5f5]">
          <EmptyState
            icon={<Users size={48} />}
            title="Wähle einen Channel"
            description="Wähle einen Channel aus oder erstelle ein neues Team"
          />
        </div>
      )}

      {showCreateTeam && <CreateTeamDialog onClose={() => setShowCreateTeam(false)} />}
      {showCreateChannel && <CreateChannelDialog teamId={showCreateChannel} onClose={() => setShowCreateChannel(null)} />}
    </div>
  )
}
