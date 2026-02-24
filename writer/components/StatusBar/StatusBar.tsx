'use client'

import { Editor } from '@tiptap/react'
import { ZoomIn, ZoomOut } from 'lucide-react'

interface StatusBarProps {
  editor: Editor
  zoom: number
  setZoom: (zoom: number) => void
}

export function StatusBar({ editor, zoom, setZoom }: StatusBarProps) {
  const characterCount = editor.storage.characterCount
  const words = characterCount?.words?.() ?? 0
  const characters = characterCount?.characters?.() ?? 0

  // Estimate pages (A4 ~250 words per page)
  const pages = Math.max(1, Math.ceil(words / 250))

  return (
    <div className="h-7 bg-blue-600 text-white flex items-center justify-between px-4 text-xs select-none">
      <div className="flex items-center gap-4">
        <span>Seite {pages} von {pages}</span>
        <span>{words} Wörter</span>
        <span>{characters} Zeichen</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setZoom(Math.max(25, zoom - 10))}
          className="hover:bg-blue-500 p-0.5 rounded"
          title="Verkleinern"
        >
          <ZoomOut size={14} />
        </button>
        <input
          type="range"
          min="25"
          max="200"
          value={zoom}
          onChange={(e) => setZoom(parseInt(e.target.value))}
          className="w-24 h-1 accent-white"
          title={`${zoom}%`}
        />
        <span className="w-10 text-center">{zoom}%</span>
        <button
          onClick={() => setZoom(Math.min(200, zoom + 10))}
          className="hover:bg-blue-500 p-0.5 rounded"
          title="Vergrössern"
        >
          <ZoomIn size={14} />
        </button>
      </div>
    </div>
  )
}
