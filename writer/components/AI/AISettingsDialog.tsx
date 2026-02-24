'use client'

import { X, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useState, useCallback } from 'react'
import { useAI } from '@/lib/ai/aiContext'
import { createAIProvider } from '@/lib/ai/AIService'

export function AISettingsDialog() {
  const { settings, updateSettings, showSettingsDialog, setShowSettingsDialog } =
    useAI()

  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [model, setModel] = useState(settings.model)
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl)
  const [testStatus, setTestStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')

  const handleSave = useCallback(() => {
    updateSettings({ apiKey, model, baseUrl })
    setShowSettingsDialog(false)
  }, [apiKey, model, baseUrl, updateSettings, setShowSettingsDialog])

  const handleTest = useCallback(async () => {
    if (!apiKey) return
    setTestStatus('loading')
    try {
      const provider = createAIProvider('openai', {
        apiKey,
        model,
        baseUrl,
      })
      const success = await provider.testConnection()
      setTestStatus(success ? 'success' : 'error')
    } catch {
      setTestStatus('error')
    }
  }, [apiKey, model, baseUrl])

  if (!showSettingsDialog) return null

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
      onClick={() => setShowSettingsDialog(false)}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          width: 420,
          maxWidth: '90vw',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: '#323130' }}>
            KI-Einstellungen
          </span>
          <button
            onClick={() => setShowSettingsDialog(false)}
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              backgroundColor: 'transparent',
              borderRadius: 4,
              cursor: 'pointer',
              color: '#605e5c',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {/* API Key */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#323130',
                marginBottom: 4,
              }}
            >
              API-Schlüssel
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                setTestStatus('idle')
              }}
              placeholder="sk-..."
              style={{
                width: '100%',
                height: 32,
                padding: '0 10px',
                border: '1px solid #c8c6c4',
                borderRadius: 4,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Model */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#323130',
                marginBottom: 4,
              }}
            >
              Modell
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o-mini"
              style={{
                width: '100%',
                height: 32,
                padding: '0 10px',
                border: '1px solid #c8c6c4',
                borderRadius: 4,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Base URL */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#323130',
                marginBottom: 4,
              }}
            >
              API-URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              style={{
                width: '100%',
                height: 32,
                padding: '0 10px',
                border: '1px solid #c8c6c4',
                borderRadius: 4,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <span
              style={{ fontSize: 11, color: '#a19f9d', marginTop: 2, display: 'block' }}
            >
              Funktioniert auch mit lokalen LLMs (LM Studio, Ollama)
            </span>
          </div>

          {/* Test Connection */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20,
            }}
          >
            <button
              onClick={handleTest}
              disabled={!apiKey || testStatus === 'loading'}
              style={{
                padding: '6px 16px',
                fontSize: 12,
                border: '1px solid #c8c6c4',
                borderRadius: 4,
                backgroundColor: 'white',
                cursor: !apiKey || testStatus === 'loading' ? 'not-allowed' : 'pointer',
                color: '#323130',
                opacity: !apiKey ? 0.5 : 1,
              }}
            >
              {testStatus === 'loading' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Loader2
                    size={14}
                    style={{ animation: 'spin 1s linear infinite' }}
                  />
                  Teste...
                </span>
              ) : (
                'Verbindung testen'
              )}
            </button>
            {testStatus === 'success' && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  color: '#107c10',
                  fontSize: 12,
                }}
              >
                <CheckCircle size={14} />
                Verbindung erfolgreich
              </span>
            )}
            {testStatus === 'error' && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  color: '#d13438',
                  fontSize: 12,
                }}
              >
                <XCircle size={14} />
                Verbindung fehlgeschlagen
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            padding: '12px 20px',
            borderTop: '1px solid #e5e5e5',
            backgroundColor: '#fafafa',
          }}
        >
          <button
            onClick={() => setShowSettingsDialog(false)}
            style={{
              padding: '6px 20px',
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
              padding: '6px 20px',
              fontSize: 13,
              border: 'none',
              borderRadius: 4,
              backgroundColor: '#0078d4',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  )
}
