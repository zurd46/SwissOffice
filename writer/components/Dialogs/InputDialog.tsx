'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface InputDialogField {
  label: string
  key: string
  defaultValue?: string
  placeholder?: string
  required?: boolean
}

interface InputDialogProps {
  title: string
  fields: InputDialogField[]
  onConfirm: (values: Record<string, string>) => void
  onCancel: () => void
  confirmLabel?: string
}

export function InputDialog({ title, fields, onConfirm, onCancel, confirmLabel = 'OK' }: InputDialogProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    fields.forEach(f => { initial[f.key] = f.defaultValue || '' })
    return initial
  })
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstInputRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Check required fields
    const allRequired = fields.filter(f => f.required).every(f => values[f.key]?.trim())
    if (!allRequired) return
    onConfirm(values)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div style={{
        backgroundColor: 'white', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        width: 400, maxWidth: '90vw',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderBottom: '1px solid #e5e5e5',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#323130', margin: 0 }}>{title}</h3>
          <button
            onClick={onCancel}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, color: '#605e5c' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {fields.map((field, i) => (
              <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: '#605e5c', fontWeight: 500 }}>
                  {field.label}{field.required ? ' *' : ''}
                </label>
                <input
                  ref={i === 0 ? firstInputRef : undefined}
                  type="text"
                  value={values[field.key] || ''}
                  onChange={(e) => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  style={{
                    border: '1px solid #c8c6c4', borderRadius: 4, padding: '6px 10px',
                    fontSize: 13, outline: 'none',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#0078d4' }}
                  onBlur={(e) => { e.target.style.borderColor = '#c8c6c4' }}
                />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 8,
            padding: '12px 16px', borderTop: '1px solid #e5e5e5',
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '6px 16px', borderRadius: 4, fontSize: 13,
                border: '1px solid #c8c6c4', backgroundColor: 'white', cursor: 'pointer',
                color: '#323130',
              }}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              style={{
                padding: '6px 16px', borderRadius: 4, fontSize: 13,
                border: 'none', backgroundColor: '#0078d4', color: 'white', cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Simple alert replacement
interface AlertDialogProps {
  title: string
  message: string
  onClose: () => void
}

export function AlertDialog({ title, message, onClose }: AlertDialogProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Enter') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        backgroundColor: 'white', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        width: 360, maxWidth: '90vw',
      }}>
        <div style={{ padding: '16px 16px 8px', borderBottom: 'none' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#323130', margin: 0 }}>{title}</h3>
        </div>
        <div style={{ padding: '8px 16px 16px' }}>
          <p style={{ fontSize: 13, color: '#605e5c', margin: 0, whiteSpace: 'pre-line' }}>{message}</p>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'flex-end', padding: '8px 16px 12px',
        }}>
          <button
            onClick={onClose}
            autoFocus
            style={{
              padding: '6px 20px', borderRadius: 4, fontSize: 13,
              border: 'none', backgroundColor: '#0078d4', color: 'white', cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
