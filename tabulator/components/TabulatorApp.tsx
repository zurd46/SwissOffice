'use client'

// =============================================
// ImpulsTabulator — Hauptkomponente
// =============================================

import { useState, useCallback, useEffect } from 'react'
import { SpreadsheetProvider, useSpreadsheet } from '@/lib/spreadsheetContext'
import { RibbonToolbar } from '@/components/Toolbar/Ribbon/RibbonToolbar'
import { FormulaBar } from '@/components/FormulaBar/FormulaBar'
import { Grid } from '@/components/Grid/Grid'
import { SheetTabs } from '@/components/SheetTabs/SheetTabs'
import { StatusBar } from '@/components/StatusBar/StatusBar'
import { FindReplaceDialog } from '@/components/Dialogs/FindReplaceDialog'
import { FormatCellsDialog } from '@/components/Dialogs/FormatCellsDialog'
import { SortDialog } from '@/components/Dialogs/SortDialog'
import { CloudSaveDialog } from '@/components/Dialogs/CloudSaveDialog'
import { CloudOpenDialog } from '@/components/Dialogs/CloudOpenDialog'
import { saveDocument, loadDocument, exportCSV, importCSV, printDocument } from '@/lib/fileOperations'
import { loadCloudSpreadsheet } from '@/lib/cloud/cloudSpreadsheetService'
import { useAuth } from '@shared/contexts/AuthContext'
import { useCloud } from '@shared/contexts/CloudContext'

// Electron API Typen
declare global {
  interface Window {
    electronAPI?: {
      onMenuAction: (callback: (action: string) => void) => () => void
      setTitle: (title: string) => void
      setDocumentEdited: (edited: boolean) => void
      isElectron: boolean
      platform: string
    }
  }
}

/** Wrapper mit Provider */
export function TabulatorApp() {
  return (
    <SpreadsheetProvider>
      <TabulatorAppInner />
    </SpreadsheetProvider>
  )
}

/** Innere Hauptkomponente */
function TabulatorAppInner() {
  const { state, dispatch } = useSpreadsheet()
  const [zoom, setZoom] = useState(100)
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [showFormatCells, setShowFormatCells] = useState(false)
  const [showSortDialog, setShowSortDialog] = useState(false)
  const [cloudDocumentId, setCloudDocumentId] = useState<string | null>(null)
  const [showCloudSave, setShowCloudSave] = useState(false)
  const [showCloudOpen, setShowCloudOpen] = useState(false)

  const { isAuthenticated, apiClient } = useAuth()
  const { status: cloudStatus } = useCloud()
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.isElectron

  // Dokument-Titel aktualisieren
  useEffect(() => {
    const title = `${state.documentName}${state.isModified ? ' *' : ''} — ImpulsTabulator`
    document.title = title
    if (window.electronAPI) {
      window.electronAPI.setTitle(title)
      window.electronAPI.setDocumentEdited(state.isModified)
    }
  }, [state.documentName, state.isModified])

  // Speichern
  const handleSave = useCallback(() => {
    saveDocument(state.workbook, state.documentName)
    dispatch({ type: 'SET_MODIFIED', modified: false })
  }, [state.workbook, state.documentName, dispatch])

  // Laden
  const handleOpen = useCallback(() => {
    loadDocument((result) => {
      dispatch({
        type: 'LOAD_WORKBOOK',
        workbook: result.workbook,
        name: result.documentName,
      })
    })
  }, [dispatch])

  // Neues Dokument
  const handleNew = useCallback(() => {
    if (state.isModified) {
      if (!confirm('Das aktuelle Dokument wurde nicht gespeichert. Trotzdem fortfahren?')) return
    }
    dispatch({ type: 'NEW_WORKBOOK' })
  }, [dispatch, state.isModified])

  // CSV Export
  const handleExportCSV = useCallback(() => {
    exportCSV(state.workbook, state.workbook.activeSheetIndex, state.documentName)
  }, [state.workbook, state.documentName])

  // CSV Import
  const handleImportCSV = useCallback(() => {
    importCSV((result) => {
      dispatch({
        type: 'LOAD_WORKBOOK',
        workbook: result.workbook,
        name: result.documentName,
      })
    })
  }, [dispatch])

  // Drucken
  const handlePrint = useCallback(() => {
    printDocument(state.workbook, state.workbook.activeSheetIndex)
  }, [state.workbook])

  // Cloud öffnen
  const handleCloudOpen = useCallback(async (docId: string) => {
    const doc = await loadCloudSpreadsheet(apiClient, docId)
    if (doc?.content?.workbook) {
      dispatch({
        type: 'LOAD_WORKBOOK',
        workbook: doc.content.workbook,
        name: doc.title,
      })
      setCloudDocumentId(doc.id)
      setShowCloudOpen(false)
    }
  }, [apiClient, dispatch])

  // Cloud gespeichert
  const handleCloudSaved = useCallback((cloudId: string) => {
    setCloudDocumentId(cloudId)
    dispatch({ type: 'SET_MODIFIED', modified: false })
  }, [dispatch])

  // Tastatur-Shortcuts (Datei-Operationen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault()
        handleOpen()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        handleNew()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setShowFindReplace(prev => !prev)
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        handlePrint()
      } else if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault()
        setShowFormatCells(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave, handleOpen, handleNew, handlePrint])

  // Electron IPC Menu Actions
  useEffect(() => {
    if (!window.electronAPI) return
    const cleanup = window.electronAPI.onMenuAction((action: string) => {
      switch (action) {
        case 'new': handleNew(); break
        case 'open': handleOpen(); break
        case 'save': handleSave(); break
        case 'export-csv': handleExportCSV(); break
        case 'import-csv': handleImportCSV(); break
        case 'print': handlePrint(); break
        case 'format-cells': setShowFormatCells(true); break
        case 'undo': dispatch({ type: 'UNDO' }); break
        case 'redo': dispatch({ type: 'REDO' }); break
        case 'cloud-save': setShowCloudSave(true); break
        case 'cloud-open': setShowCloudOpen(true); break
      }
    })
    return cleanup
  }, [handleNew, handleOpen, handleSave, handleExportCSV, handleImportCSV, handlePrint, dispatch])

  // beforeunload Warnung
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (state.isModified) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [state.isModified])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Ribbon-Toolbar */}
      <RibbonToolbar
        isElectron={isElectron}
        onToggleFindReplace={() => setShowFindReplace(prev => !prev)}
        onPrint={handlePrint}
      />

      {/* Formelleiste */}
      <FormulaBar />

      {/* Spreadsheet-Grid */}
      <Grid onFormatCells={() => setShowFormatCells(true)} />

      {/* Sheet-Tabs */}
      <SheetTabs />

      {/* Statusleiste */}
      <StatusBar zoom={zoom} setZoom={setZoom} />

      {/* Suchen & Ersetzen */}
      {showFindReplace && (
        <FindReplaceDialog onClose={() => setShowFindReplace(false)} />
      )}

      {/* Zellen formatieren */}
      {showFormatCells && (
        <FormatCellsDialog onClose={() => setShowFormatCells(false)} />
      )}

      {/* Sortieren */}
      {showSortDialog && (
        <SortDialog onClose={() => setShowSortDialog(false)} />
      )}
    </div>
  )
}
