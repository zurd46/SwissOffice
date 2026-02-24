'use client'

import { useState, useCallback, type FormEvent } from 'react'
import { X, Cloud, Save } from 'lucide-react'
import { useAuth } from '@shared/contexts/AuthContext'
import { saveSpreadsheetToCloud, updateCloudSpreadsheet } from '@/lib/cloud/cloudSpreadsheetService'
import type { WorkbookData } from '@/lib/types/spreadsheet'
import type { TabulatorSettings } from '@/lib/types/document'

interface CloudSaveDialogProps {
  documentTitle: string
  workbook: WorkbookData
  settings?: TabulatorSettings
  existingCloudId: string | null
  onSaved: (cloudId: string) => void
  onClose: () => void
}

export function CloudSaveDialog({
  documentTitle,
  workbook,
  settings,
  existingCloudId,
  onSaved,
  onClose,
}: CloudSaveDialogProps) {
  const { apiClient } = useAuth()
  const [title, setTitle] = useState(documentTitle || 'Unbenannte Tabelle')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSaveNew = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      const cloudId = await saveSpreadsheetToCloud(apiClient, title, workbook, settings)
      if (cloudId) {
        onSaved(cloudId)
        onClose()
      } else {
        setError('Speichern fehlgeschlagen')
      }
    } catch {
      setError('Netzwerkfehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }, [apiClient, title, workbook, settings, onSaved, onClose])

  const handleOverwrite = useCallback(async () => {
    if (!existingCloudId) return
    setError(null)
    setIsSaving(true)

    try {
      const success = await updateCloudSpreadsheet(apiClient, existingCloudId, {
        title,
        workbook,
        settings,
      })
      if (success) {
        onSaved(existingCloudId)
        onClose()
      } else {
        setError('Aktualisieren fehlgeschlagen')
      }
    } catch {
      setError('Netzwerkfehler beim Aktualisieren')
    } finally {
      setIsSaving(false)
    }
  }, [apiClient, existingCloudId, title, workbook, settings, onSaved, onClose])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          width: '440px',
          maxWidth: '90vw',
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cloud size={20} color="#16a34a" />
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>In der Cloud speichern</h2>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={18} color="#666" />
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '10px',
            marginBottom: '16px',
            color: '#dc2626',
            fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSaveNew}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '6px' }}>
              Tabellenname
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            {existingCloudId && (
              <button
                type="button"
                onClick={handleOverwrite}
                disabled={isSaving}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Save size={14} />
                Überschreiben
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#16a34a',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Cloud size={14} />
              {isSaving ? 'Speichern...' : 'Neu speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
