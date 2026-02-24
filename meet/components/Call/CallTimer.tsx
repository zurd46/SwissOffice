'use client'

import { useState, useEffect } from 'react'
import { formatCallDuration } from '@/lib/utils/formatDate'

interface CallTimerProps {
  startedAt: string
}

export function CallTimer({ startedAt }: CallTimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const startTime = new Date(startedAt).getTime()
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  return (
    <span className="text-xs text-[#a19f9d] font-mono">
      {formatCallDuration(elapsed)}
    </span>
  )
}
