'use client'

import { useState, useEffect } from 'react'
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
import { useAuth as useSharedAuth } from '@shared/contexts/AuthContext'
import { fetchTeams, type ApiTeam } from '@/lib/api/meetApi'

// API-Team → Frontend-Team mappen
function mapTeam(apiTeam: ApiTeam): Team {
  return {
    id: apiTeam.id,
    name: apiTeam.name,
    description: apiTeam.description ?? undefined,
    isPublic: apiTeam.isPublic,
    memberCount: 0,
    createdAt: apiTeam.createdAt,
    createdBy: apiTeam.createdBy,
    channels: apiTeam.channels.map(ch => ({
      id: ch.id,
      teamId: ch.teamId,
      name: ch.name,
      type: ch.type as Channel['type'],
      isDefault: ch.isDefault,
      memberCount: 0,
      unreadCount: 0,
      createdAt: ch.createdAt,
      createdBy: ch.createdBy,
      description: ch.description ?? undefined,
    })),
  }
}

const channelIcons: Record<string, React.ReactNode> = {
  public: <Hash size={16} />,
  private: <Lock size={16} />,
  announcement: <Megaphone size={16} />,
}

export function TeamsPage() {
  const { apiClient, user } = useSharedAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showCreateChannel, setShowCreateChannel] = useState<string | null>(null)

  // Teams vom Server laden
  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function loadTeams() {
      const apiTeams = await fetchTeams(apiClient)
      if (!cancelled) {
        const mapped = apiTeams.map(mapTeam)
        setTeams(mapped)
        // Alle Teams expanded
        setExpandedTeams(new Set(mapped.map(t => t.id)))
      }
    }

    loadTeams()
    return () => { cancelled = true }
  }, [apiClient, user])

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
          {filteredTeams.length === 0 && !searchQuery && (
            <div className="px-4 py-8 text-center text-sm text-[#605e5c]">
              Noch keine Teams. Erstelle dein erstes Team!
            </div>
          )}
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
