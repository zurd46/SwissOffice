'use client'

import { useState, useEffect } from 'react'
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  PhoneOff, Hand, MessageSquare, Users, MoreHorizontal,
  Maximize2, Grid3X3,
} from 'lucide-react'
import { useCall } from '@/lib/contexts/CallContext'
import { Avatar } from '@/components/Shared/Avatar'
import { Tooltip } from '@/components/Shared/Tooltip'
import { CallTimer } from './CallTimer'
import { cn } from '@/lib/utils/cn'

export function CallView() {
  const {
    activeCall,
    localMediaState,
    endCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleHandRaise,
  } = useCall()
  const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid')
  const [showParticipants, setShowParticipants] = useState(false)
  const [showChat, setShowChat] = useState(false)

  if (!activeCall) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#1b1a19] flex flex-col">
      {/* Top Bar */}
      <div className="h-12 flex items-center justify-between px-4 bg-[#292827]">
        <div className="flex items-center gap-3 text-white">
          <span className="text-sm font-medium">Anruf aktiv</span>
          <CallTimer startedAt={activeCall.startedAt} />
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content={viewMode === 'grid' ? 'Sprecheransicht' : 'Rasteransicht'}>
            <button
              onClick={() => setViewMode(v => v === 'grid' ? 'speaker' : 'grid')}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-white"
            >
              {viewMode === 'grid' ? <Maximize2 size={16} /> : <Grid3X3 size={16} />}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3 max-w-4xl w-full">
            {/* Local Video */}
            <div className="relative aspect-video bg-[#323130] rounded-xl overflow-hidden flex items-center justify-center">
              {localMediaState.videoEnabled ? (
                <div className="w-full h-full bg-gradient-to-br from-[#0078d4] to-[#6264a7] flex items-center justify-center">
                  <span className="text-white/60 text-sm">Kamera-Vorschau</span>
                </div>
              ) : (
                <Avatar name="Daniel Zurmühle" size="xl" showPresence={false} />
              )}
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/50 rounded text-white text-xs">
                {!localMediaState.audioEnabled && <MicOff size={12} />}
                <span>Du</span>
              </div>
              {localMediaState.handRaised && (
                <div className="absolute top-2 right-2 w-8 h-8 bg-[#f8d22a] rounded-full flex items-center justify-center">
                  <Hand size={16} />
                </div>
              )}
            </div>

            {/* Remote Participants */}
            {activeCall.participants.filter(p => p.userId !== 'user-1').map(participant => (
              <div key={participant.id} className="relative aspect-video bg-[#323130] rounded-xl overflow-hidden flex items-center justify-center">
                <Avatar name={participant.displayName} size="xl" showPresence={false} />
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/50 rounded text-white text-xs">
                  {!participant.mediaState.audioEnabled && <MicOff size={12} />}
                  <span>{participant.displayName}</span>
                </div>
              </div>
            ))}

            {/* Placeholder if alone */}
            {activeCall.participants.length <= 1 && (
              <div className="aspect-video bg-[#252423] rounded-xl flex items-center justify-center">
                <p className="text-[#a19f9d] text-sm">Warte auf Teilnehmer...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl w-full">
            {/* Speaker View */}
            <div className="relative aspect-video bg-[#323130] rounded-xl overflow-hidden flex items-center justify-center mb-3">
              <Avatar name="Daniel Zurmühle" size="xl" showPresence={false} />
            </div>
            <div className="flex gap-2 justify-center">
              {activeCall.participants.map(p => (
                <div key={p.id} className="w-24 h-16 bg-[#323130] rounded-lg flex items-center justify-center">
                  <Avatar name={p.displayName} size="sm" showPresence={false} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Side Panels */}
      {showParticipants && (
        <div className="absolute right-0 top-12 bottom-20 w-72 bg-[#292827] border-l border-[#484644] overflow-y-auto">
          <div className="p-4">
            <h3 className="text-white font-semibold mb-3">Teilnehmer ({activeCall.participants.length + 1})</h3>
            <div className="flex items-center gap-2 py-2">
              <Avatar name="Daniel Zurmühle" size="sm" showPresence={false} />
              <span className="text-white text-sm">Du</span>
            </div>
            {activeCall.participants.map(p => (
              <div key={p.id} className="flex items-center gap-2 py-2">
                <Avatar name={p.displayName} size="sm" showPresence={false} />
                <span className="text-white text-sm">{p.displayName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="h-20 flex items-center justify-center gap-2 bg-[#292827]">
        <Tooltip content={localMediaState.audioEnabled ? 'Stummschalten' : 'Mikrofon aktivieren'}>
          <button
            onClick={toggleAudio}
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
              localMediaState.audioEnabled ? 'bg-[#3b3a39] text-white hover:bg-[#484644]' : 'bg-[#c4314b] text-white hover:bg-[#a4262c]'
            )}
          >
            {localMediaState.audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
        </Tooltip>
        <Tooltip content={localMediaState.videoEnabled ? 'Kamera ausschalten' : 'Kamera einschalten'}>
          <button
            onClick={toggleVideo}
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
              localMediaState.videoEnabled ? 'bg-[#3b3a39] text-white hover:bg-[#484644]' : 'bg-[#c4314b] text-white hover:bg-[#a4262c]'
            )}
          >
            {localMediaState.videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
        </Tooltip>
        <Tooltip content={localMediaState.screenSharing ? 'Freigabe beenden' : 'Bildschirm teilen'}>
          <button
            onClick={toggleScreenShare}
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
              localMediaState.screenSharing ? 'bg-[#0078d4] text-white hover:bg-[#106ebe]' : 'bg-[#3b3a39] text-white hover:bg-[#484644]'
            )}
          >
            {localMediaState.screenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
          </button>
        </Tooltip>
        <Tooltip content={localMediaState.handRaised ? 'Hand senken' : 'Hand heben'}>
          <button
            onClick={toggleHandRaise}
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
              localMediaState.handRaised ? 'bg-[#f8d22a] text-[#242424] hover:bg-[#e5c019]' : 'bg-[#3b3a39] text-white hover:bg-[#484644]'
            )}
          >
            <Hand size={20} />
          </button>
        </Tooltip>

        <div className="w-px h-8 bg-[#484644] mx-2" />

        <Tooltip content="Chat">
          <button
            onClick={() => setShowChat(!showChat)}
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
              showChat ? 'bg-[#0078d4] text-white' : 'bg-[#3b3a39] text-white hover:bg-[#484644]'
            )}
          >
            <MessageSquare size={20} />
          </button>
        </Tooltip>
        <Tooltip content="Teilnehmer">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
              showParticipants ? 'bg-[#0078d4] text-white' : 'bg-[#3b3a39] text-white hover:bg-[#484644]'
            )}
          >
            <Users size={20} />
          </button>
        </Tooltip>
        <Tooltip content="Mehr">
          <button className="w-12 h-12 rounded-full flex items-center justify-center bg-[#3b3a39] text-white hover:bg-[#484644] transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </Tooltip>

        <div className="w-px h-8 bg-[#484644] mx-2" />

        <Tooltip content="Auflegen">
          <button
            onClick={endCall}
            className="w-14 h-12 rounded-full flex items-center justify-center bg-[#c4314b] text-white hover:bg-[#a4262c] transition-colors"
          >
            <PhoneOff size={20} />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
