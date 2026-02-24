'use client'

import type { PresenceStatus } from '@/lib/types'
import { cn } from '@/lib/utils/cn'

interface AvatarProps {
  src?: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  presence?: PresenceStatus
  showPresence?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const presenceDotSize = {
  sm: 'w-2.5 h-2.5 border-[1.5px]',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
  xl: 'w-4 h-4 border-2',
}

const presenceColors: Record<PresenceStatus, string> = {
  online: 'bg-[#92c353]',
  away: 'bg-[#f8d22a]',
  busy: 'bg-[#c4314b]',
  dnd: 'bg-[#c4314b]',
  offline: 'bg-[#8a8886]',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const avatarColors = [
  'bg-[#0078d4]', 'bg-[#00b7c3]', 'bg-[#8764b8]', 'bg-[#e3008c]',
  'bg-[#ca5010]', 'bg-[#498205]', 'bg-[#986f0b]', 'bg-[#004e8c]',
]

function getColorForName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export function Avatar({ src, name, size = 'md', presence, showPresence = true, className }: AvatarProps) {
  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            'rounded-full object-cover',
            sizeClasses[size]
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center text-white font-semibold',
            sizeClasses[size],
            getColorForName(name)
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {showPresence && presence && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-white',
            presenceDotSize[size],
            presenceColors[presence]
          )}
        />
      )}
    </div>
  )
}
