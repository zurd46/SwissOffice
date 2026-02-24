'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Cloud, FileText, Search, Trash2 } from 'lucide-react'
import { useAuth } from '@shared/contexts/AuthContext'
import { listCloudDocuments, deleteCloudDocument, type CloudDocumentMeta } from '@/lib/cloud/cloudDocumentService'

interface CloudOpenDialogProps {
  onOpen: (documentId: string) => void
  onClose: () => void
}

export function CloudOpenDialog({ onOpen, onClose }: CloudOpenDialogProps) {
  const { apiClient } = useAuth()
  const [documents, setDocuments] = useState<CloudDocumentMeta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loadDocuments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await listCloudDocuments(apiClient, {
        search: searchQuery || undefined,
        limit: 50,
      })
      setDocuments(result.documents)
    } catch {
      setError('Dokumente konnten nicht geladen werden')
    } finally {
      setIsLoading(false)
    }
  }, [apiClient, searchQuery])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const handleDelete = useCallback(async (docId: string) => {
    if (!confirm('Dokument wirklich löschen?')) return
    const success = await deleteCloudDocument(apiClient, docId)
    if (success) {
      setDocuments(prev => prev.filter(d => d.id !== docId))
    }
  }, [apiClient])

  function formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

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
          width: '560px',
          maxWidth: '90vw',
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cloud size={20} color="#2563eb" />
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Aus der Cloud öffnen</h2>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={18} color="#666" />
          </button>
        </div>

        {/* Suche */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={16} color="#999" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Dokument suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '10px',
            marginBottom: '12px',
            color: '#dc2626',
            fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        {/* Dokument-Liste */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '14px' }}>
              Laden...
            </div>
          )}

          {!isLoading && documents.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '14px' }}>
              {searchQuery ? 'Keine Dokumente gefunden' : 'Noch keine Cloud-Dokumente vorhanden'}
            </div>
          )}

          {documents.map(doc => (
            <div
              key={doc.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                borderBottom: '1px solid #f3f4f6',
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb' }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              onDoubleClick={() => onOpen(doc.id)}
            >
              <FileText size={20} color="#2563eb" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.title}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  Zuletzt bearbeitet: {formatDate(doc.updatedAt)}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onOpen(doc.id) }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Öffnen
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(doc.id) }}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: '#999',
                }}
                title="Löschen"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
