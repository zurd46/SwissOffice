'use client'

import { useState, useEffect } from 'react'
import { X, RotateCcw, Trash2, Clock } from 'lucide-react'
import { getVersions, deleteVersion } from '../../lib/versionHistory'
import type { DocumentVersion } from '../../lib/types/version'

interface VersionHistoryDialogProps {
  documentName: string
  onRestore: (content: unknown) => void
  onClose: () => void
}

export function VersionHistoryDialog({ documentName, onRestore, onClose }: VersionHistoryDialogProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([])

  useEffect(() => {
    setVersions(getVersions(documentName))
  }, [documentName])

  const handleDelete = (id: string) => {
    deleteVersion(id)
    setVersions(getVersions(documentName))
  }

  const handleRestore = (version: DocumentVersion) => {
    if (confirm(`Version "${version.label}" wiederherstellen? Der aktuelle Inhalt geht verloren.`)) {
      onRestore(version.content)
      onClose()
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white', borderRadius: 8, width: 480, maxHeight: '70vh',
        display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid #e5e5e5',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} color="#0078d4" />
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#323130' }}>
              Versionsprotokoll
            </h2>
          </div>
          <button onClick={onClose} style={{
            border: 'none', background: 'none', cursor: 'pointer', padding: 4,
          }}>
            <X size={18} color="#605e5c" />
          </button>
        </div>

        {/* Version list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {versions.length === 0 ? (
            <p style={{
              padding: '24px 20px', textAlign: 'center', color: '#a19f9d',
              fontSize: 13, fontStyle: 'italic',
            }}>
              Keine Versionen vorhanden. Versionen werden beim Speichern automatisch erstellt.
            </p>
          ) : (
            versions.map(version => (
              <div
                key={version.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 20px', borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#323130' }}>
                    {version.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#a19f9d', marginTop: 2 }}>
                    {new Date(version.timestamp).toLocaleString('de-CH')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => handleRestore(version)}
                    title="Wiederherstellen"
                    style={{
                      border: 'none', background: '#e8f0fe', borderRadius: 4,
                      padding: '4px 8px', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', gap: 4, fontSize: 11, color: '#0078d4',
                    }}
                  >
                    <RotateCcw size={12} /> Wiederherstellen
                  </button>
                  <button
                    onClick={() => handleDelete(version.id)}
                    title="Loeschen"
                    style={{
                      border: 'none', background: '#fee2e2', borderRadius: 4,
                      padding: '4px 6px', cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={12} color="#dc2626" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
