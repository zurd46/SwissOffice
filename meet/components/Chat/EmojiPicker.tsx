'use client'

import { useEffect, useRef } from 'react'

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

const emojiCategories = [
  {
    name: 'Häufig',
    emojis: ['👍', '❤️', '😂', '😊', '🎉', '🔥', '👏', '💪', '✅', '👀', '🙏', '💯'],
  },
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯'],
  },
  {
    name: 'Gesten',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  },
  {
    name: 'Objekte',
    emojis: ['💼', '📁', '📂', '📄', '📝', '✏️', '📌', '📎', '🔗', '📊', '📈', '📉', '🗓️', '📅', '⏰', '🔔', '💡', '🔑', '🔒', '🔓'],
  },
  {
    name: 'Symbole',
    emojis: ['✅', '❌', '⚠️', '❓', '❗', '💬', '🔵', '🟢', '🟡', '🔴', '⭐', '🏆', '🎯', '🚀', '💰', '📢', '🔊'],
  },
]

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-lg shadow-xl border border-[#e1dfdd] z-50"
    >
      <div className="max-h-72 overflow-y-auto p-3">
        {emojiCategories.map(category => (
          <div key={category.name} className="mb-3">
            <h4 className="text-xs font-semibold text-[#605e5c] mb-1.5">{category.name}</h4>
            <div className="flex flex-wrap gap-0.5">
              {category.emojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => onSelect(emoji)}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
