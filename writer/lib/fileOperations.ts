import { Editor } from '@tiptap/react'
import { saveAs } from 'file-saver'
import type { DocumentSettings, ImpulsDocument } from './types/document'
import { defaultDocumentSettings } from './documentContext'
import type { Footnote } from './types/footnotes'
import type { BibEntry } from './types/bibliography'

const CURRENT_VERSION = 2

interface SaveOptions {
  footnotes?: Footnote[]
  bibliography?: BibEntry[]
  citationStyle?: 'apa' | 'mla' | 'chicago'
}

export function saveDocument(
  editor: Editor,
  filename: string = 'dokument',
  settings?: DocumentSettings,
  options?: SaveOptions
) {
  const doc: ImpulsDocument = {
    version: CURRENT_VERSION,
    settings: settings ?? { ...defaultDocumentSettings },
    content: editor.getJSON(),
    footnotes: options?.footnotes?.map(f => ({ id: f.id, number: f.number, content: f.content })),
    bibliography: options?.bibliography as unknown as Array<Record<string, unknown>>,
    citationStyle: options?.citationStyle,
  }
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
  saveAs(blob, `${filename}.impuls`)
}

export function saveAsHTML(editor: Editor, filename: string = 'dokument') {
  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>
    body { font-family: 'Times New Roman', serif; max-width: 210mm; margin: 0 auto; padding: 25mm; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #ccc; padding: 8px; }
    img { max-width: 100%; }
  </style>
</head>
<body>
${editor.getHTML()}
</body>
</html>`
  const blob = new Blob([html], { type: 'text/html' })
  saveAs(blob, `${filename}.html`)
}

export interface LoadResult {
  settings: DocumentSettings
  documentName?: string
  footnotes?: Footnote[]
  bibliography?: BibEntry[]
  citationStyle?: 'apa' | 'mla' | 'chicago'
}

function migrateDocument(json: Record<string, unknown>): LoadResult & { content: Record<string, unknown> } {
  // Version 2+: new format with settings and content
  if ('version' in json && 'settings' in json && 'content' in json) {
    const doc = json as unknown as ImpulsDocument
    return {
      content: doc.content,
      settings: { ...defaultDocumentSettings, ...doc.settings },
      footnotes: doc.footnotes as Footnote[] | undefined,
      bibliography: doc.bibliography as unknown as BibEntry[] | undefined,
      citationStyle: doc.citationStyle,
    }
  }

  // Version 1 / legacy: raw Tiptap JSON (has "type": "doc")
  if ('type' in json && json.type === 'doc') {
    return {
      content: json,
      settings: { ...defaultDocumentSettings },
    }
  }

  // Unknown format, try as content
  return {
    content: json,
    settings: { ...defaultDocumentSettings },
  }
}

export function loadDocument(
  editor: Editor,
  onSettingsLoaded?: (result: LoadResult) => void
): Promise<void> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.impuls,.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return resolve()
      const text = await file.text()
      try {
        const json = JSON.parse(text)
        const { content, settings, footnotes, bibliography, citationStyle } = migrateDocument(json)
        editor.commands.setContent(content)
        const docName = file.name.replace(/\.(impuls|json)$/, '')
        onSettingsLoaded?.({ settings, documentName: docName, footnotes, bibliography, citationStyle })
      } catch {
        alert('Ungültige Datei')
      }
      resolve()
    }
    input.click()
  })
}

export function newDocument(editor: Editor) {
  editor.commands.setContent({
    type: 'doc',
    content: [{ type: 'paragraph', content: [] }],
  })
}

export function printDocument(settings?: DocumentSettings) {
  const s = settings ?? defaultDocumentSettings
  const orientation = s.orientation ?? 'portrait'
  const pageSize = s.pageSize ?? { width: 210, height: 297 }
  const effectiveWidth = orientation === 'landscape' ? pageSize.height : pageSize.width
  const effectiveHeight = orientation === 'landscape' ? pageSize.width : pageSize.height

  // Inject dynamic @page rule matching document settings
  const styleId = 'impuls-print-page-style'
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = styleId
    document.head.appendChild(styleEl)
  }

  styleEl.textContent = `
    @page {
      size: ${effectiveWidth}mm ${effectiveHeight}mm;
      margin: ${s.margins.top}mm ${s.margins.right}mm ${s.margins.bottom}mm ${s.margins.left}mm;
    }
  `

  window.print()
}
