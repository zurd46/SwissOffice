'use client'

import { Editor } from '@tiptap/react'
import {
  SpellCheck,
  BookCheck,
  Sparkles,
  FileText,
  Languages,
  MessageSquare,
  Settings,
  Loader2,
} from 'lucide-react'
import { RibbonLargeButton } from '../../ToolbarButton'
import { ToolbarSelect } from '../../ToolbarButton'
import { RibbonGroup, RibbonGroupLast } from '../RibbonGroup'
import { useAI } from '@/lib/ai/aiContext'
import { SUPPORTED_LANGUAGES } from '@/lib/ai/types'
import type { AIOperation } from '@/lib/ai/types'
import { useCallback, useState } from 'react'

interface TabKIProps {
  editor: Editor
  onToggleAIChat: () => void
  showAIChat: boolean
}

export function TabKI({ editor, onToggleAIChat, showAIChat }: TabKIProps) {
  const {
    settings,
    updateSettings,
    isConfigured,
    performOperation,
    isOperationLoading,
    setShowSettingsDialog,
  } = useAI()

  const [translateLanguage, setTranslateLanguage] = useState('Englisch')

  const getSelectedOrAllText = useCallback((): {
    text: string
    hasSelection: boolean
  } => {
    const { from, to, empty } = editor.state.selection
    if (!empty) {
      return {
        text: editor.state.doc.textBetween(from, to, ' '),
        hasSelection: true,
      }
    }
    return { text: editor.getText(), hasSelection: false }
  }, [editor])

  const handleOperation = useCallback(
    async (operation: AIOperation, language?: string) => {
      if (!isConfigured) {
        setShowSettingsDialog(true)
        return
      }

      const { text, hasSelection } = getSelectedOrAllText()
      if (!text.trim()) return

      const result = await performOperation({
        operation,
        text,
        language: language || settings.documentLanguage,
      })

      if (result.success && result.content) {
        if (hasSelection) {
          editor.chain().focus().insertContent(result.content).run()
        } else {
          editor.chain().focus().selectAll().insertContent(result.content).run()
        }
      }
    },
    [
      isConfigured,
      setShowSettingsDialog,
      getSelectedOrAllText,
      performOperation,
      settings.documentLanguage,
      editor,
    ],
  )

  const loadingIcon = (
    <Loader2
      size={20}
      style={{ color: '#0078d4', animation: 'spin 1s linear infinite' }}
    />
  )

  return (
    <>
      <RibbonGroup label="Sprache">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            padding: '4px 0',
          }}
        >
          <ToolbarSelect
            value={settings.documentLanguage}
            onChange={(value) => updateSettings({ documentLanguage: value })}
            options={SUPPORTED_LANGUAGES}
            title="Dokumentsprache"
            className="w-[120px]"
          />
        </div>
      </RibbonGroup>

      <RibbonGroup label="Korrektur">
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RibbonLargeButton
            onClick={() => handleOperation('correct')}
            icon={
              isOperationLoading ? (
                loadingIcon
              ) : (
                <SpellCheck size={20} style={{ color: '#107c10' }} />
              )
            }
            label="Korrektur"
            disabled={isOperationLoading}
          />
          <RibbonLargeButton
            onClick={() => handleOperation('grammar')}
            icon={
              isOperationLoading ? (
                loadingIcon
              ) : (
                <BookCheck size={20} style={{ color: '#107c10' }} />
              )
            }
            label="Grammatik"
            disabled={isOperationLoading}
          />
        </div>
      </RibbonGroup>

      <RibbonGroup label="Bearbeiten">
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RibbonLargeButton
            onClick={() => handleOperation('improve')}
            icon={
              isOperationLoading ? (
                loadingIcon
              ) : (
                <Sparkles size={20} style={{ color: '#8764b8' }} />
              )
            }
            label="Verbessern"
            disabled={isOperationLoading}
          />
          <RibbonLargeButton
            onClick={() => handleOperation('summarize')}
            icon={
              isOperationLoading ? (
                loadingIcon
              ) : (
                <FileText size={20} style={{ color: '#0078d4' }} />
              )
            }
            label="Zusammenfassen"
            disabled={isOperationLoading}
          />
        </div>
      </RibbonGroup>

      <RibbonGroup label="Übersetzen">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              padding: '4px 0',
            }}
          >
            <ToolbarSelect
              value={translateLanguage}
              onChange={setTranslateLanguage}
              options={SUPPORTED_LANGUAGES}
              title="Zielsprache"
              className="w-[120px]"
            />
          </div>
          <RibbonLargeButton
            onClick={() => handleOperation('translate', translateLanguage)}
            icon={
              isOperationLoading ? (
                loadingIcon
              ) : (
                <Languages size={20} style={{ color: '#0078d4' }} />
              )
            }
            label="Übersetzen"
            disabled={isOperationLoading}
          />
        </div>
      </RibbonGroup>

      <RibbonGroupLast label="AI-Chat">
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RibbonLargeButton
            onClick={onToggleAIChat}
            icon={<MessageSquare size={20} style={{ color: '#0078d4' }} />}
            label="Chat"
            isActive={showAIChat}
          />
          <RibbonLargeButton
            onClick={() => setShowSettingsDialog(true)}
            icon={<Settings size={20} style={{ color: '#605e5c' }} />}
            label="Einstellungen"
          />
        </div>
      </RibbonGroupLast>
    </>
  )
}
