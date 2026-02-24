'use client'

import { Editor } from '@tiptap/react'
import { useState } from 'react'
import {
  MessageSquarePlus, CheckCheck, GitCompareArrows,
  SpellCheck, Languages, BookCheck,
} from 'lucide-react'
import { RibbonLargeButton } from '../../ToolbarButton'
import { RibbonGroup, RibbonGroupLast } from '../RibbonGroup'
import { generateCommentId } from '../../../../lib/types/comments'

interface TabUeberpruefenProps {
  editor: Editor
  onAddComment: (commentId: string) => void
  trackingEnabled: boolean
  onToggleTracking: () => void
  onAcceptAll: () => void
  onRejectAll: () => void
  spellCheckEnabled: boolean
  onToggleSpellCheck: () => void
}

const LANGUAGES = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'es', label: 'Español' },
]

export function TabUeberpruefen({
  editor,
  onAddComment,
  trackingEnabled,
  onToggleTracking,
  onAcceptAll,
  onRejectAll,
  spellCheckEnabled,
  onToggleSpellCheck,
}: TabUeberpruefenProps) {
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [currentLang, setCurrentLang] = useState('de')

  const handleAddComment = () => {
    const { from, to } = editor.state.selection
    if (from === to) return
    const commentId = generateCommentId()
    editor.chain().focus().setComment(commentId).run()
    onAddComment(commentId)
  }

  const handleSetLanguage = (code: string) => {
    setCurrentLang(code)
    setShowLangMenu(false)
    const el = document.querySelector('.ProseMirror')
    if (el) el.setAttribute('lang', code)
  }

  return (
    <>
      <RibbonGroup label="Rechtschreibung">
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RibbonLargeButton
            onClick={onToggleSpellCheck}
            icon={<SpellCheck size={20} style={{ color: spellCheckEnabled ? '#0078d4' : '#605e5c' }} />}
            label="Rechtschreibung"
            isActive={spellCheckEnabled}
          />
          <div style={{ position: 'relative' }}>
            <RibbonLargeButton
              onClick={() => setShowLangMenu(!showLangMenu)}
              icon={<Languages size={20} style={{ color: '#605e5c' }} />}
              label={LANGUAGES.find(l => l.code === currentLang)?.label || 'Sprache'}
            />
            {showLangMenu && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, zIndex: 100,
                backgroundColor: 'white', border: '1px solid #d2d0ce', borderRadius: 4,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: 140, padding: 4,
              }}>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleSetLanguage(lang.code)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '6px 10px', fontSize: 12, border: 'none',
                      backgroundColor: currentLang === lang.code ? '#e0f0ff' : 'transparent',
                      color: '#323130', cursor: 'pointer', borderRadius: 3,
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </RibbonGroup>

      <RibbonGroup label="Kommentare">
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RibbonLargeButton
            onClick={handleAddComment}
            icon={<MessageSquarePlus size={20} style={{ color: '#0078d4' }} />}
            label="Kommentar"
          />
        </div>
      </RibbonGroup>

      <RibbonGroupLast label="Änderungen">
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RibbonLargeButton
            onClick={onToggleTracking}
            icon={<GitCompareArrows size={20} style={{ color: trackingEnabled ? '#dc2626' : '#605e5c' }} />}
            label={trackingEnabled ? 'Tracking An' : 'Tracking Aus'}
            isActive={trackingEnabled}
          />
          <RibbonLargeButton
            onClick={onAcceptAll}
            icon={<CheckCheck size={20} style={{ color: '#10b981' }} />}
            label="Alle annehmen"
          />
          <RibbonLargeButton
            onClick={onRejectAll}
            icon={<BookCheck size={20} style={{ color: '#dc2626' }} />}
            label="Alle ablehnen"
          />
        </div>
      </RibbonGroupLast>
    </>
  )
}
