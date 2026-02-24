'use client'

import { X, Globe, Type, Save, SpellCheck } from 'lucide-react'
import { useState, useCallback, useRef } from 'react'
import {
  type AppSettings,
  AVAILABLE_LANGUAGES,
  AVAILABLE_FONTS,
  AVAILABLE_FONT_SIZES,
  loadAppSettings,
  saveAppSettings,
} from '@/lib/appSettings'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

const sectionTitleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 13,
  fontWeight: 600,
  color: '#323130',
  marginBottom: 12,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: '#605e5c',
  marginBottom: 4,
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  height: 32,
  padding: '0 10px',
  border: '1px solid #c8c6c4',
  borderRadius: 4,
  fontSize: 13,
  color: '#323130',
  backgroundColor: 'white',
  outline: 'none',
  boxSizing: 'border-box' as const,
  cursor: 'pointer',
}

const toggleRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 0',
  borderBottom: '1px solid #f0f0f0',
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const [settings, setSettings] = useState<AppSettings>(loadAppSettings)
  const [saved, setSaved] = useState(false)
  const prevOpenRef = useRef(false)

  // Reload settings from localStorage when dialog opens
  if (open && !prevOpenRef.current) {
    setSettings(loadAppSettings())
    setSaved(false)
  }
  prevOpenRef.current = open

  const updateField = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }, [])

  const handleSave = useCallback(() => {
    saveAppSettings(settings)
    setSaved(true)
    setTimeout(() => onClose(), 400)
  }, [settings, onClose])

  if (!open) return null

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
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          width: 480,
          maxWidth: '90vw',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
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
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: '#323130' }}>
            Einstellungen
          </span>
          <button
            onClick={onClose}
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
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {/* Sprache */}
          <div style={{ marginBottom: 24 }}>
            <div style={sectionTitleStyle}>
              <Globe size={16} color="#0078d4" />
              Sprache
            </div>
            <div>
              <label style={labelStyle}>Anzeigesprache</label>
              <select
                value={settings.language}
                onChange={(e) => updateField('language', e.target.value)}
                style={selectStyle}
              >
                {AVAILABLE_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Schrift */}
          <div style={{ marginBottom: 24 }}>
            <div style={sectionTitleStyle}>
              <Type size={16} color="#0078d4" />
              Schrift
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Standard-Schriftart</label>
                <select
                  value={settings.defaultFontFamily}
                  onChange={(e) => updateField('defaultFontFamily', e.target.value)}
                  style={selectStyle}
                >
                  {AVAILABLE_FONTS.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Standard-Schriftgrösse</label>
                <select
                  value={settings.defaultFontSize}
                  onChange={(e) => updateField('defaultFontSize', e.target.value)}
                  style={selectStyle}
                >
                  {AVAILABLE_FONT_SIZES.map(size => (
                    <option key={size} value={size}>{size} pt</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Speichern */}
          <div style={{ marginBottom: 24 }}>
            <div style={sectionTitleStyle}>
              <Save size={16} color="#0078d4" />
              Speichern
            </div>
            <div style={toggleRowStyle}>
              <div>
                <div style={{ fontSize: 13, color: '#323130', fontWeight: 500 }}>Automatisches Speichern</div>
                <div style={{ fontSize: 11, color: '#a19f9d', marginTop: 2 }}>Dokument automatisch in regelmässigen Abständen speichern</div>
              </div>
              <button
                onClick={() => updateField('autoSave', !settings.autoSave)}
                style={{
                  width: 40,
                  height: 20,
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: settings.autoSave ? '#0078d4' : '#c8c6c4',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    position: 'absolute',
                    top: 2,
                    left: settings.autoSave ? 22 : 2,
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            </div>
            {settings.autoSave && (
              <div style={{ marginTop: 10 }}>
                <label style={labelStyle}>Intervall (Sekunden)</label>
                <select
                  value={settings.autoSaveInterval}
                  onChange={(e) => updateField('autoSaveInterval', Number(e.target.value))}
                  style={{ ...selectStyle, width: 160 }}
                >
                  <option value={30}>30 Sekunden</option>
                  <option value={60}>1 Minute</option>
                  <option value={120}>2 Minuten</option>
                  <option value={300}>5 Minuten</option>
                  <option value={600}>10 Minuten</option>
                </select>
              </div>
            )}
          </div>

          {/* Rechtschreibung */}
          <div style={{ marginBottom: 8 }}>
            <div style={sectionTitleStyle}>
              <SpellCheck size={16} color="#0078d4" />
              Rechtschreibung
            </div>
            <div style={toggleRowStyle}>
              <div>
                <div style={{ fontSize: 13, color: '#323130', fontWeight: 500 }}>Rechtschreibprüfung</div>
                <div style={{ fontSize: 11, color: '#a19f9d', marginTop: 2 }}>Rechtschreibfehler im Editor markieren</div>
              </div>
              <button
                onClick={() => updateField('spellCheck', !settings.spellCheck)}
                style={{
                  width: 40,
                  height: 20,
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: settings.spellCheck ? '#0078d4' : '#c8c6c4',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    position: 'absolute',
                    top: 2,
                    left: settings.spellCheck ? 22 : 2,
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 8,
            padding: '12px 20px',
            borderTop: '1px solid #e5e5e5',
            backgroundColor: '#fafafa',
            flexShrink: 0,
          }}
        >
          {saved && (
            <span style={{ fontSize: 12, color: '#107c10', marginRight: 'auto' }}>
              Gespeichert
            </span>
          )}
          <button
            onClick={onClose}
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
