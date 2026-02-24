'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Check } from 'lucide-react'

interface HeaderFooterEditorProps {
  title: string
  initialContent: string
  onSave: (html: string) => void
  onClose: () => void
}

export function HeaderFooterEditor({ title, initialContent, onSave, onClose }: HeaderFooterEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isEmpty, setIsEmpty] = useState(!initialContent.trim())

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent
    }
  }, [initialContent])

  const handleInput = () => {
    if (editorRef.current) {
      setIsEmpty(!editorRef.current.textContent?.trim())
    }
  }

  const handleSave = () => {
    if (editorRef.current) {
      onSave(editorRef.current.innerHTML)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        width: 500,
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Dialog Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#323130' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              color: '#605e5c',
              borderRadius: 4,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Editor Area */}
        <div style={{ padding: 20 }}>
          <p style={{ fontSize: 12, color: '#605e5c', marginBottom: 8 }}>
            Geben Sie den Inhalt fuer die {title.toLowerCase()} ein:
          </p>
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            style={{
              minHeight: 80,
              maxHeight: 200,
              overflowY: 'auto',
              padding: 12,
              border: '1px solid #c8c6c4',
              borderRadius: 4,
              fontFamily: 'Times New Roman, serif',
              fontSize: '10pt',
              lineHeight: 1.5,
              outline: 'none',
              color: '#323130',
            }}
            suppressContentEditableWarning
          />
          {isEmpty && (
            <p style={{ fontSize: 11, color: '#a19f9d', marginTop: 4, fontStyle: 'italic' }}>
              Tipp: Verwenden Sie Text, Datum oder Dokumenttitel
            </p>
          )}
        </div>

        {/* Preset Buttons */}
        <div style={{ padding: '0 20px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <PresetButton label="Dokumenttitel" onClick={() => {
            if (editorRef.current) {
              editorRef.current.innerHTML = '<span style="font-style: italic;">Dokumenttitel</span>'
              setIsEmpty(false)
            }
          }} />
          <PresetButton label="Datum" onClick={() => {
            if (editorRef.current) {
              const date = new Date().toLocaleDateString('de-CH')
              editorRef.current.innerHTML = date
              setIsEmpty(false)
            }
          }} />
          <PresetButton label="Seite X von Y" onClick={() => {
            if (editorRef.current) {
              editorRef.current.innerHTML = 'Seite {seite} von {gesamt}'
              setIsEmpty(false)
            }
          }} />
          <PresetButton label="Vertraulich" onClick={() => {
            if (editorRef.current) {
              editorRef.current.innerHTML = '<span style="color: #dc2626; font-weight: bold;">VERTRAULICH</span>'
              setIsEmpty(false)
            }
          }} />
        </div>

        {/* Actions */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #e5e5e5',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              fontSize: 13,
              border: '1px solid #c8c6c4',
              borderRadius: 4,
              backgroundColor: 'white',
              cursor: 'pointer',
              color: '#323130',
            }}
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '6px 16px',
              fontSize: 13,
              border: 'none',
              borderRadius: 4,
              backgroundColor: '#0078d4',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Check size={14} />
            Uebernehmen
          </button>
        </div>
      </div>
    </div>
  )
}

function PresetButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '3px 10px',
        fontSize: 11,
        border: '1px solid #d2d0ce',
        borderRadius: 3,
        backgroundColor: '#f9f9f9',
        cursor: 'pointer',
        color: '#605e5c',
      }}
    >
      {label}
    </button>
  )
}
