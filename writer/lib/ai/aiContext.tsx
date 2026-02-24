'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import type {
  AISettings,
  AIMessage,
  AIProvider,
  AIOperationOptions,
  AIOperationResult,
  OCRImportResult,
} from './types'
import { DEFAULT_AI_SETTINGS } from './types'
import { createAIProvider } from './AIService'
import { processFileForOCR } from './ocrImport'

interface AIContextValue {
  settings: AISettings
  updateSettings: (settings: Partial<AISettings>) => void
  isConfigured: boolean

  chatMessages: AIMessage[]
  addUserMessage: (content: string, documentContent?: string) => Promise<void>
  clearChat: () => void
  isChatLoading: boolean

  performOperation: (options: AIOperationOptions) => Promise<AIOperationResult>
  isOperationLoading: boolean

  performOCRImport: (file: File) => Promise<OCRImportResult>
  isOCRLoading: boolean

  showSettingsDialog: boolean
  setShowSettingsDialog: (show: boolean) => void
}

const AIContext = createContext<AIContextValue | null>(null)

const STORAGE_KEY = 'impulsoffice-ai-settings'

function loadSettings(): AISettings {
  if (typeof window === 'undefined') return DEFAULT_AI_SETTINGS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(stored) }
  } catch {
    /* ignore */
  }
  return DEFAULT_AI_SETTINGS
}

function saveSettings(settings: AISettings) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

interface AIProviderWrapperProps {
  children: ReactNode
}

export function AIContextProvider({ children }: AIProviderWrapperProps) {
  const [settings, setSettings] = useState<AISettings>(loadSettings)
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([])
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isOperationLoading, setIsOperationLoading] = useState(false)
  const [isOCRLoading, setIsOCRLoading] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const providerRef = useRef<AIProvider | null>(null)

  const isConfigured = !!settings.apiKey

  const getProvider = useCallback((): AIProvider => {
    if (!settings.apiKey) {
      throw new Error(
        'API-Schlüssel nicht konfiguriert. Bitte öffne die AI-Einstellungen.',
      )
    }
    providerRef.current = createAIProvider(settings.provider, {
      apiKey: settings.apiKey,
      model: settings.model,
      baseUrl: settings.baseUrl,
    })
    return providerRef.current
  }, [settings])

  const updateSettings = useCallback((partial: Partial<AISettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial }
      saveSettings(updated)
      providerRef.current = null
      return updated
    })
  }, [])

  const addUserMessage = useCallback(
    async (content: string, documentContent?: string) => {
      const userMsg: AIMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: Date.now(),
      }

      setChatMessages((prev) => [...prev, userMsg])
      setIsChatLoading(true)

      try {
        const provider = getProvider()
        const allMessages = [...chatMessages, userMsg]
        const result = await provider.chat({
          messages: allMessages,
          documentContent,
        })

        const assistantMsg: AIMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result.success
            ? result.content
            : `Fehler: ${result.error}`,
          timestamp: Date.now(),
        }
        setChatMessages((prev) => [...prev, assistantMsg])
      } catch (error) {
        const errorMsg: AIMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
          timestamp: Date.now(),
        }
        setChatMessages((prev) => [...prev, errorMsg])
      } finally {
        setIsChatLoading(false)
      }
    },
    [chatMessages, getProvider],
  )

  const clearChat = useCallback(() => {
    setChatMessages([])
  }, [])

  const performOperation = useCallback(
    async (options: AIOperationOptions): Promise<AIOperationResult> => {
      setIsOperationLoading(true)
      try {
        const provider = getProvider()
        return await provider.performOperation(options)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unbekannter Fehler'
        return { success: false, content: '', error: message }
      } finally {
        setIsOperationLoading(false)
      }
    },
    [getProvider],
  )

  const performOCRImport = useCallback(
    async (file: File): Promise<OCRImportResult> => {
      if (!settings.apiKey) {
        return { success: false, html: '', error: 'API-Schlüssel nicht konfiguriert.' }
      }
      setIsOCRLoading(true)
      try {
        return await processFileForOCR(file, settings)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unbekannter Fehler'
        return { success: false, html: '', error: message }
      } finally {
        setIsOCRLoading(false)
      }
    },
    [settings],
  )

  return (
    <AIContext.Provider
      value={{
        settings,
        updateSettings,
        isConfigured,
        chatMessages,
        addUserMessage,
        clearChat,
        isChatLoading,
        performOperation,
        isOperationLoading,
        performOCRImport,
        isOCRLoading,
        showSettingsDialog,
        setShowSettingsDialog,
      }}
    >
      {children}
    </AIContext.Provider>
  )
}

export function useAI(): AIContextValue {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error('useAI muss innerhalb eines AIContextProvider verwendet werden')
  }
  return context
}
