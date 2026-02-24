'use client'

import { Editor } from '@tiptap/react'
import { useState, useCallback } from 'react'
import {
  Upload, MailPlus, Eye, Play, Tag,
} from 'lucide-react'
import { RibbonLargeButton } from '../../ToolbarButton'
import { RibbonGroup, RibbonGroupLast } from '../RibbonGroup'
import { parseCSV, type MailMergeDataSource } from '../../../../lib/mailMerge/types'

interface TabSendungenProps {
  editor: Editor
}

export function TabSendungen({ editor }: TabSendungenProps) {
  const [dataSource, setDataSource] = useState<MailMergeDataSource | null>(null)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [isPreview, setIsPreview] = useState(false)
  const [originalContent, setOriginalContent] = useState<unknown>(null)

  const loadDataSource = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.txt'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      const ds = parseCSV(text)
      if (ds.fields.length === 0) {
        alert('Keine Felder in der CSV-Datei gefunden.')
        return
      }
      setDataSource(ds)
      alert(`${ds.records.length} Datensaetze mit ${ds.fields.length} Feldern geladen:\n${ds.fields.join(', ')}`)
    }
    input.click()
  }, [])

  const insertField = useCallback(() => {
    if (!dataSource) {
      alert('Bitte laden Sie zuerst eine Datenquelle (CSV).')
      return
    }
    const field = prompt(`Feldname eingeben:\n\nVerfuegbare Felder: ${dataSource.fields.join(', ')}`)
    if (field && dataSource.fields.includes(field)) {
      editor.chain().focus().insertMergeField(field).run()
    } else if (field) {
      alert(`Feld "${field}" nicht in der Datenquelle gefunden.`)
    }
  }, [editor, dataSource])

  const togglePreview = useCallback(() => {
    if (!dataSource || dataSource.records.length === 0) {
      alert('Keine Daten zum Vorschauen. Laden Sie zuerst eine CSV-Datei.')
      return
    }

    if (!isPreview) {
      // Save original and replace fields
      setOriginalContent(editor.getJSON())
      const html = editor.getHTML()
      const record = dataSource.records[previewIndex]
      let replaced = html
      for (const [field, value] of Object.entries(record)) {
        const regex = new RegExp(`\\u00AB${field}\\u00BB`, 'g')
        replaced = replaced.replace(regex, `<strong style="color: #059669">${value}</strong>`)
        // Also replace the merge field nodes
        const nodeRegex = new RegExp(`<span[^>]*data-merge-field="${field}"[^>]*>[^<]*</span>`, 'g')
        replaced = replaced.replace(nodeRegex, `<strong style="color: #059669">${value}</strong>`)
      }
      editor.commands.setContent(replaced)
      setIsPreview(true)
    } else {
      // Restore original
      if (originalContent) {
        editor.commands.setContent(originalContent as Parameters<typeof editor.commands.setContent>[0])
      }
      setIsPreview(false)
    }
  }, [editor, dataSource, previewIndex, isPreview, originalContent])

  const nextPreview = useCallback(() => {
    if (!dataSource) return
    const next = (previewIndex + 1) % dataSource.records.length
    setPreviewIndex(next)
    if (isPreview) {
      // Re-render with new record
      if (originalContent) {
        editor.commands.setContent(originalContent as Parameters<typeof editor.commands.setContent>[0])
      }
      setIsPreview(false)
      // Trigger preview again in next tick
      setTimeout(() => {
        setPreviewIndex(next)
        togglePreview()
      }, 50)
    }
  }, [dataSource, previewIndex, isPreview, originalContent, editor, togglePreview])

  return (
    <>
      <RibbonGroup label="Datenquelle">
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RibbonLargeButton
            onClick={loadDataSource}
            icon={<Upload size={20} style={{ color: '#0078d4' }} />}
            label="CSV laden"
            isActive={!!dataSource}
          />
          {dataSource && (
            <div style={{ fontSize: 10, color: '#605e5c', padding: '0 4px' }}>
              {dataSource.records.length} Eintraege
            </div>
          )}
        </div>
      </RibbonGroup>

      <RibbonGroup label="Felder">
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RibbonLargeButton
            onClick={insertField}
            icon={<Tag size={20} style={{ color: '#0078d4' }} />}
            label="Feld einfuegen"
          />
          {dataSource && dataSource.fields.slice(0, 3).map(field => (
            <button
              key={field}
              onClick={() => editor.chain().focus().insertMergeField(field).run()}
              style={{
                fontSize: 10, padding: '3px 6px', borderRadius: 3,
                border: '1px solid #c8c6c4', backgroundColor: '#e0f2fe',
                color: '#0369a1', cursor: 'pointer',
              }}
            >
              {field}
            </button>
          ))}
        </div>
      </RibbonGroup>

      <RibbonGroupLast label="Vorschau & Zusammenfuehren">
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RibbonLargeButton
            onClick={togglePreview}
            icon={<Eye size={20} style={{ color: isPreview ? '#059669' : '#605e5c' }} />}
            label={isPreview ? 'Beenden' : 'Vorschau'}
            isActive={isPreview}
          />
          {isPreview && dataSource && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, color: '#605e5c' }}>
                {previewIndex + 1}/{dataSource.records.length}
              </span>
              <button
                onClick={nextPreview}
                style={{
                  fontSize: 10, padding: '2px 6px', border: '1px solid #c8c6c4',
                  borderRadius: 3, backgroundColor: 'white', cursor: 'pointer',
                }}
              >
                Naechster
              </button>
            </div>
          )}
          <RibbonLargeButton
            onClick={() => alert('Serienbrief-Generierung ist noch in Entwicklung.')}
            icon={<Play size={20} style={{ color: '#605e5c' }} />}
            label="Zusammenfuehren"
          />
        </div>
      </RibbonGroupLast>
    </>
  )
}
