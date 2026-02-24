'use client'

import { useState } from 'react'
import { X, FileText, Briefcase, GraduationCap, User } from 'lucide-react'
import { DEFAULT_TEMPLATES, type DocumentTemplate } from '../../lib/templates/defaultTemplates'

interface TemplateChooserDialogProps {
  onSelect: (template: DocumentTemplate) => void
  onClose: () => void
}

const CATEGORY_ICONS = {
  allgemein: FileText,
  geschaeftlich: Briefcase,
  akademisch: GraduationCap,
  persoenlich: User,
}

const CATEGORY_LABELS = {
  allgemein: 'Allgemein',
  geschaeftlich: 'Geschaeftlich',
  akademisch: 'Akademisch',
  persoenlich: 'Persoenlich',
}

export function TemplateChooserDialog({ onSelect, onClose }: TemplateChooserDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('alle')

  const categories = ['alle', ...new Set(DEFAULT_TEMPLATES.map(t => t.category))]
  const filtered = selectedCategory === 'alle'
    ? DEFAULT_TEMPLATES
    : DEFAULT_TEMPLATES.filter(t => t.category === selectedCategory)

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white', borderRadius: 8, width: 640, maxHeight: '80vh',
        display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid #e5e5e5',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#323130' }}>
            Vorlage waehlen
          </h2>
          <button onClick={onClose} style={{
            border: 'none', background: 'none', cursor: 'pointer', padding: 4,
          }}>
            <X size={18} color="#605e5c" />
          </button>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '8px 20px', borderBottom: '1px solid #f0f0f0' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '4px 12px', fontSize: 12, borderRadius: 4,
                border: '1px solid',
                borderColor: selectedCategory === cat ? '#0078d4' : '#e0e0e0',
                backgroundColor: selectedCategory === cat ? '#e8f0fe' : 'white',
                color: selectedCategory === cat ? '#0078d4' : '#605e5c',
                cursor: 'pointer', fontWeight: selectedCategory === cat ? 600 : 400,
              }}
            >
              {cat === 'alle' ? 'Alle' : CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat}
            </button>
          ))}
        </div>

        {/* Templates grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
          padding: 20, overflowY: 'auto', flex: 1,
        }}>
          {filtered.map(template => {
            const Icon = CATEGORY_ICONS[template.category] || FileText
            return (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 8, padding: 16, border: '1px solid #e0e0e0', borderRadius: 6,
                  backgroundColor: 'white', cursor: 'pointer', transition: 'all 0.15s',
                  textAlign: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0078d4'
                  e.currentTarget.style.backgroundColor = '#f8faff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0'
                  e.currentTarget.style.backgroundColor = 'white'
                }}
              >
                <div style={{
                  width: 48, height: 64, border: '1px solid #d0d0d0', borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: '#fafafa',
                }}>
                  <Icon size={24} color="#0078d4" />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#323130' }}>{template.name}</span>
                <span style={{ fontSize: 10, color: '#a19f9d', lineHeight: 1.3 }}>{template.description}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
