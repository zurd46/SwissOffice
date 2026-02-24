'use client'

import { Editor } from '@tiptap/react'
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
  const handleAddComment = () => {
    const { from, to } = editor.state.selection
    if (from === to) {
      alert('Bitte markieren Sie zuerst Text, um einen Kommentar hinzuzufügen.')
      return
    }
    const commentId = generateCommentId()
    editor.chain().focus().setComment(commentId).run()
    onAddComment(commentId)
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
          <RibbonLargeButton
            onClick={() => {}}
            icon={<Languages size={20} style={{ color: '#605e5c' }} />}
            label="Sprache"
          />
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
