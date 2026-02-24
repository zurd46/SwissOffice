'use client'

import { useCall } from '@/lib/contexts/CallContext'
import { CallView } from './CallView'

export function CallOverlay() {
  const { activeCall } = useCall()
  if (!activeCall) return null
  return <CallView />
}
