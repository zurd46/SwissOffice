'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Call, CallSettings, MediaState } from '@/lib/types'

interface CallContextValue {
  activeCall: Call | null
  localMediaState: MediaState
  callSettings: CallSettings
  startCall: (call: Call) => void
  endCall: () => void
  toggleAudio: () => void
  toggleVideo: () => void
  toggleScreenShare: () => void
  toggleHandRaise: () => void
  updateCallSettings: (settings: Partial<CallSettings>) => void
}

const CallContext = createContext<CallContextValue | null>(null)

const defaultMediaState: MediaState = {
  audioEnabled: true,
  videoEnabled: false,
  screenSharing: false,
  handRaised: false,
}

const defaultCallSettings: CallSettings = {
  noiseSuppression: true,
  virtualBackground: 'none',
}

export function CallProvider({ children }: { children: ReactNode }) {
  const [activeCall, setActiveCall] = useState<Call | null>(null)
  const [localMediaState, setLocalMediaState] = useState<MediaState>(defaultMediaState)
  const [callSettings, setCallSettings] = useState<CallSettings>(defaultCallSettings)

  const startCall = useCallback((call: Call) => {
    setActiveCall(call)
    setLocalMediaState({
      audioEnabled: true,
      videoEnabled: call.type === 'video',
      screenSharing: false,
      handRaised: false,
    })
  }, [])

  const endCall = useCallback(() => {
    setActiveCall(null)
    setLocalMediaState(defaultMediaState)
  }, [])

  const toggleAudio = useCallback(() => {
    setLocalMediaState(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }))
  }, [])

  const toggleVideo = useCallback(() => {
    setLocalMediaState(prev => ({ ...prev, videoEnabled: !prev.videoEnabled }))
  }, [])

  const toggleScreenShare = useCallback(() => {
    setLocalMediaState(prev => ({ ...prev, screenSharing: !prev.screenSharing }))
  }, [])

  const toggleHandRaise = useCallback(() => {
    setLocalMediaState(prev => ({ ...prev, handRaised: !prev.handRaised }))
  }, [])

  const updateCallSettings = useCallback((settings: Partial<CallSettings>) => {
    setCallSettings(prev => ({ ...prev, ...settings }))
  }, [])

  return (
    <CallContext.Provider value={{
      activeCall,
      localMediaState,
      callSettings,
      startCall,
      endCall,
      toggleAudio,
      toggleVideo,
      toggleScreenShare,
      toggleHandRaise,
      updateCallSettings,
    }}>
      {children}
    </CallContext.Provider>
  )
}

export function useCall(): CallContextValue {
  const context = useContext(CallContext)
  if (!context) throw new Error('useCall muss innerhalb von CallProvider verwendet werden')
  return context
}
