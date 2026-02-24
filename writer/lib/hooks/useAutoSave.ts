'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import type { Editor } from '@tiptap/react'

interface AutoSaveOptions {
  editor: Editor | null
  documentName: string
  interval?: number // ms, default 30000
  storageKey?: string
}

interface AutoSaveState {
  lastSaved: number | null
  isSaving: boolean
}

export function useAutoSave({ editor, documentName, interval = 30000, storageKey }: AutoSaveOptions): AutoSaveState {
  const [lastSaved, setLastSaved] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const key = storageKey || `impuls-autosave-${documentName}`

  const save = useCallback(() => {
    if (!editor || typeof window === 'undefined') return

    try {
      setIsSaving(true)
      const content = editor.getJSON()
      const data = {
        content,
        documentName,
        timestamp: Date.now(),
      }
      localStorage.setItem(key, JSON.stringify(data))
      setLastSaved(Date.now())
    } catch {
      // localStorage might be full or unavailable
    } finally {
      setIsSaving(false)
    }
  }, [editor, documentName, key])

  // Auto-save on interval
  useEffect(() => {
    if (!editor) return

    timerRef.current = setInterval(save, interval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [editor, save, interval])

  // Save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => save()
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [save])

  return { lastSaved, isSaving }
}

export function loadAutoSave(documentName: string): { content: unknown; timestamp: number } | null {
  if (typeof window === 'undefined') return null

  const key = `impuls-autosave-${documentName}`
  try {
    const data = localStorage.getItem(key)
    if (!data) return null
    const parsed = JSON.parse(data)
    return { content: parsed.content, timestamp: parsed.timestamp }
  } catch {
    return null
  }
}

export function clearAutoSave(documentName: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(`impuls-autosave-${documentName}`)
}
