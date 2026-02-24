'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { useDocumentSettings } from '../../lib/documentContext'
import type { Margins, Orientation } from '../../lib/types/document'
import { PAGE_SIZES, MARGIN_PRESETS } from '../../lib/constants/pageSizes'

interface PageSetupDialogProps {
  onClose: () => void
}

export function PageSetupDialog({ onClose }: PageSetupDialogProps) {
  const { settings, setSettings } = useDocumentSettings()

  const [pageSize, setPageSize] = useState(settings.pageSize.name)
  const [orientation, setOrientation] = useState<Orientation>(settings.orientation)
  const [margins, setMargins] = useState<Margins>({ ...settings.margins })
  const [marginPreset, setMarginPreset] = useState('Benutzerdefiniert')

  const handleMarginPreset = (presetName: string) => {
    const preset = MARGIN_PRESETS.find(p => p.name === presetName)
    if (preset) {
      setMargins({ ...preset.margins })
      setMarginPreset(presetName)
    }
  }

  const handleMarginChange = (side: keyof Margins, value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num) && num >= 0) {
      setMargins(prev => ({ ...prev, [side]: num }))
      setMarginPreset('Benutzerdefiniert')
    }
  }

  const handleApply = () => {
    const selectedSize = PAGE_SIZES.find(s => s.name === pageSize) ?? PAGE_SIZES[0]
    setSettings({
      ...settings,
      pageSize: selectedSize,
      orientation,
      margins,
    })
    onClose()
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
        width: 480,
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#323130' }}>Seite einrichten</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#605e5c', borderRadius: 4,
          }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Page Size */}
          <fieldset style={{ border: '1px solid #e5e5e5', borderRadius: 6, padding: '12px 16px' }}>
            <legend style={{ fontSize: 12, fontWeight: 600, color: '#323130', padding: '0 4px' }}>
              Seitengroesse
            </legend>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PAGE_SIZES.map(size => (
                <button
                  key={size.name}
                  onClick={() => setPageSize(size.name)}
                  style={{
                    padding: '6px 14px',
                    fontSize: 12,
                    border: `1px solid ${pageSize === size.name ? '#0078d4' : '#c8c6c4'}`,
                    borderRadius: 4,
                    backgroundColor: pageSize === size.name ? '#e1f0ff' : 'white',
                    color: pageSize === size.name ? '#0078d4' : '#323130',
                    cursor: 'pointer',
                    fontWeight: pageSize === size.name ? 600 : 400,
                  }}
                >
                  {size.name}
                  <span style={{ fontSize: 10, color: '#a19f9d', display: 'block' }}>
                    {size.width} × {size.height} mm
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Orientation */}
          <fieldset style={{ border: '1px solid #e5e5e5', borderRadius: 6, padding: '12px 16px' }}>
            <legend style={{ fontSize: 12, fontWeight: 600, color: '#323130', padding: '0 4px' }}>
              Ausrichtung
            </legend>
            <div style={{ display: 'flex', gap: 12 }}>
              <OrientationButton
                label="Hochformat"
                selected={orientation === 'portrait'}
                onClick={() => setOrientation('portrait')}
                icon={<div style={{ width: 24, height: 32, border: '2px solid currentColor', borderRadius: 2 }} />}
              />
              <OrientationButton
                label="Querformat"
                selected={orientation === 'landscape'}
                onClick={() => setOrientation('landscape')}
                icon={<div style={{ width: 32, height: 24, border: '2px solid currentColor', borderRadius: 2 }} />}
              />
            </div>
          </fieldset>

          {/* Margins */}
          <fieldset style={{ border: '1px solid #e5e5e5', borderRadius: 6, padding: '12px 16px' }}>
            <legend style={{ fontSize: 12, fontWeight: 600, color: '#323130', padding: '0 4px' }}>
              Seitenraender
            </legend>

            {/* Presets */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {MARGIN_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => handleMarginPreset(preset.name)}
                  style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    border: `1px solid ${marginPreset === preset.name ? '#0078d4' : '#d2d0ce'}`,
                    borderRadius: 3,
                    backgroundColor: marginPreset === preset.name ? '#e1f0ff' : '#f9f9f9',
                    color: marginPreset === preset.name ? '#0078d4' : '#605e5c',
                    cursor: 'pointer',
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Custom margins */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              {(['top', 'bottom', 'left', 'right'] as const).map(side => (
                <div key={side} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <label style={{ fontSize: 12, color: '#605e5c', width: 50 }}>
                    {{ top: 'Oben', bottom: 'Unten', left: 'Links', right: 'Rechts' }[side]}:
                  </label>
                  <input
                    type="number"
                    value={margins[side]}
                    onChange={(e) => handleMarginChange(side, e.target.value)}
                    min={0}
                    max={100}
                    step={0.1}
                    style={{
                      width: 70,
                      padding: '4px 6px',
                      fontSize: 12,
                      border: '1px solid #c8c6c4',
                      borderRadius: 3,
                      textAlign: 'right',
                    }}
                  />
                  <span style={{ fontSize: 11, color: '#a19f9d' }}>mm</span>
                </div>
              ))}
            </div>
          </fieldset>
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
            onClick={handleApply}
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

function OrientationButton({ label, selected, onClick, icon }: {
  label: string
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '10px 20px',
        border: `2px solid ${selected ? '#0078d4' : '#d2d0ce'}`,
        borderRadius: 6,
        backgroundColor: selected ? '#e1f0ff' : 'white',
        color: selected ? '#0078d4' : '#605e5c',
        cursor: 'pointer',
      }}
    >
      {icon}
      <span style={{ fontSize: 11, fontWeight: selected ? 600 : 400 }}>{label}</span>
    </button>
  )
}
