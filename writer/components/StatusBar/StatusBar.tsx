'use client'

import { Editor } from '@tiptap/react'
import { ZoomIn, ZoomOut } from 'lucide-react'

interface StatusBarProps {
  editor: Editor
  zoom: number
  setZoom: (zoom: number) => void
  lastSaved?: number | null
}

export function StatusBar({ editor, zoom, setZoom, lastSaved }: StatusBarProps) {
  const characterCount = editor.storage.characterCount
  const words = characterCount?.words?.() ?? 0
  const characters = characterCount?.characters?.() ?? 0

  // Estimate pages (A4 ~250 words per page)
  const pages = Math.max(1, Math.ceil(words / 250))

  const savedText = lastSaved
    ? `Gespeichert ${new Date(lastSaved).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}`
    : ''

  return (
    <div style={{
      height: 28,
      backgroundColor: '#0078d4',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      fontSize: 11,
      userSelect: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span>Seite {pages} von {pages}</span>
        <span>{words} Woerter</span>
        <span>{characters} Zeichen</span>
        {savedText && (
          <span style={{ opacity: 0.7 }}>{savedText}</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => setZoom(Math.max(25, zoom - 10))}
          style={{ border: 'none', background: 'none', color: 'white', cursor: 'pointer', padding: 2, borderRadius: 2 }}
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
          className="ribbon-zoom-slider"
          style={{ width: 96 }}
          title={`${zoom}%`}
        />
        <span style={{ width: 36, textAlign: 'center' }}>{zoom}%</span>
        <button
          onClick={() => setZoom(Math.min(200, zoom + 10))}
          style={{ border: 'none', background: 'none', color: 'white', cursor: 'pointer', padding: 2, borderRadius: 2 }}
          title="Vergroessern"
        >
          <ZoomIn size={14} />
        </button>
      </div>
    </div>
  )
}
