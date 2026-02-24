'use client'

interface TypingIndicatorProps {
  userNames: string[]
}

export function TypingIndicator({ userNames }: TypingIndicatorProps) {
  if (userNames.length === 0) return null

  const text = userNames.length === 1
    ? `${userNames[0]} tippt gerade...`
    : userNames.length === 2
      ? `${userNames[0]} und ${userNames[1]} tippen gerade...`
      : `${userNames[0]} und ${userNames.length - 1} weitere tippen gerade...`

  return (
    <div className="flex items-center gap-2 px-12 py-1">
      <div className="flex gap-0.5">
        <span className="w-1.5 h-1.5 bg-[#605e5c] rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-[#605e5c] rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-[#605e5c] rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-[#605e5c]">{text}</span>
    </div>
  )
}
