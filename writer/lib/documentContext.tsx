'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { DocumentSettings, Margins, PageSize, Orientation, PageNumberPosition, HeaderFooterContent } from './types/document'
import { DEFAULT_PAGE_SIZE } from './constants/pageSizes'

export const defaultHeaderFooter: HeaderFooterContent = {
  html: '',
  enabled: false,
}

export const defaultDocumentSettings: DocumentSettings = {
  pageSize: DEFAULT_PAGE_SIZE,
  orientation: 'portrait' as Orientation,
  margins: { top: 25, right: 25, bottom: 25, left: 25 },
  headerContent: { ...defaultHeaderFooter },
  footerContent: { ...defaultHeaderFooter },
  showPageNumbers: false,
  pageNumberPosition: 'center' as PageNumberPosition,
  firstPageDifferent: false,
  firstPageHeaderContent: { ...defaultHeaderFooter },
  firstPageFooterContent: { ...defaultHeaderFooter },
}

interface DocumentContextValue {
  settings: DocumentSettings
  setSettings: (settings: DocumentSettings) => void
  updateMargins: (margins: Margins) => void
  updatePageSize: (pageSize: PageSize) => void
  updateOrientation: (orientation: Orientation) => void
  updateHeaderContent: (content: HeaderFooterContent) => void
  updateFooterContent: (content: HeaderFooterContent) => void
  togglePageNumbers: (show: boolean) => void
  setPageNumberPosition: (position: PageNumberPosition) => void
  toggleFirstPageDifferent: (different: boolean) => void
}

const DocumentContext = createContext<DocumentContextValue | null>(null)

interface DocumentProviderProps {
  children: ReactNode
  initialSettings?: DocumentSettings
}

export function DocumentProvider({ children, initialSettings }: DocumentProviderProps) {
  const [settings, setSettings] = useState<DocumentSettings>(
    initialSettings ?? { ...defaultDocumentSettings }
  )

  const updateMargins = useCallback((margins: Margins) => {
    setSettings(prev => ({ ...prev, margins }))
  }, [])

  const updatePageSize = useCallback((pageSize: PageSize) => {
    setSettings(prev => ({ ...prev, pageSize }))
  }, [])

  const updateOrientation = useCallback((orientation: Orientation) => {
    setSettings(prev => ({ ...prev, orientation }))
  }, [])

  const updateHeaderContent = useCallback((content: HeaderFooterContent) => {
    setSettings(prev => ({ ...prev, headerContent: content }))
  }, [])

  const updateFooterContent = useCallback((content: HeaderFooterContent) => {
    setSettings(prev => ({ ...prev, footerContent: content }))
  }, [])

  const togglePageNumbers = useCallback((show: boolean) => {
    setSettings(prev => ({ ...prev, showPageNumbers: show }))
  }, [])

  const setPageNumberPosition = useCallback((position: PageNumberPosition) => {
    setSettings(prev => ({ ...prev, pageNumberPosition: position }))
  }, [])

  const toggleFirstPageDifferent = useCallback((different: boolean) => {
    setSettings(prev => ({ ...prev, firstPageDifferent: different }))
  }, [])

  return (
    <DocumentContext.Provider value={{
      settings,
      setSettings,
      updateMargins,
      updatePageSize,
      updateOrientation,
      updateHeaderContent,
      updateFooterContent,
      togglePageNumbers,
      setPageNumberPosition,
      toggleFirstPageDifferent,
    }}>
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocumentSettings(): DocumentContextValue {
  const context = useContext(DocumentContext)
  if (!context) {
    throw new Error('useDocumentSettings must be used within a DocumentProvider')
  }
  return context
}
