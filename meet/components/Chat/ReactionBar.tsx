'use client'

import type { ReactionGroup } from '@/lib/types'
import { cn } from '@/lib/utils/cn'

interface ReactionBarProps {
  reactions: ReactionGroup[]
  onReaction: (emoji: string) => void
}

export function ReactionBar({ reactions, onReaction }: ReactionBarProps) {
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {reactions.map(reaction => (
        <button
          key={reaction.emoji}
          onClick={() => onReaction(reaction.emoji)}
          className={cn(
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border transition-colors',
            reaction.hasReacted
              ? 'bg-[#e8f0fe] border-[#0078d4] text-[#0078d4]'
              : 'bg-[#f5f5f5] border-[#e1dfdd] text-[#605e5c] hover:bg-[#e8e6e4]'
          )}
        >
          <span>{reaction.emoji}</span>
          <span className="font-medium">{reaction.count}</span>
        </button>
      ))}
    </div>
  )
}
