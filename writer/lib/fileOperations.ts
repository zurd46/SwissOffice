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
  const editorEl = document.querySelector('.ProseMirror')
  if (!editorEl) return

  const s = settings ?? defaultDocumentSettings
  const orientation = s.orientation ?? 'portrait'
  const pageSize = s.pageSize ?? { width: 210, height: 297 }
  const w = orientation === 'landscape' ? pageSize.height : pageSize.width
  const h = orientation === 'landscape' ? pageSize.width : pageSize.height
  const m = s.margins

  // Print via a hidden iframe so the content is fully isolated
  // from the app's complex DOM (transforms, absolute positioning, etc.)
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;right:-10000px;bottom:-10000px;width:0;height:0;border:none'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument || iframe.contentWindow?.document
  if (!doc) { document.body.removeChild(iframe); return }

  doc.open()
  doc.write(`<!DOCTYPE html>
<html lang="de">
<head><style>
@page { size: ${w}mm ${h}mm; margin: ${m.top}mm ${m.right}mm ${m.bottom}mm ${m.left}mm; }
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: white; }
.ProseMirror {
  font-family: 'Times New Roman', Georgia, serif;
  font-size: 12pt;
  line-height: 1.5;
  color: #000;
}
.ProseMirror p { margin-bottom: 0.5em; orphans: 2; widows: 2; }
.ProseMirror h1 { font-size: 24pt; font-weight: 700; margin-top: 0.5em; margin-bottom: 0.3em; line-height: 1.2; break-after: avoid; }
.ProseMirror h2 { font-size: 18pt; font-weight: 700; margin-top: 0.5em; margin-bottom: 0.3em; line-height: 1.3; break-after: avoid; }
.ProseMirror h3 { font-size: 14pt; font-weight: 600; margin-top: 0.5em; margin-bottom: 0.3em; line-height: 1.3; break-after: avoid; }
.ProseMirror h4 { font-size: 12pt; font-weight: 600; margin-top: 0.5em; margin-bottom: 0.3em; break-after: avoid; }
.ProseMirror h5 { font-size: 11pt; font-weight: 600; margin-top: 0.5em; margin-bottom: 0.3em; break-after: avoid; }
.ProseMirror h6 { font-size: 10pt; font-weight: 600; margin-top: 0.5em; margin-bottom: 0.3em; break-after: avoid; }
.ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.5em; }
.ProseMirror ul ul { list-style-type: circle; }
.ProseMirror ul ul ul { list-style-type: square; }
.ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.5em; }
.ProseMirror ol ol { list-style-type: lower-alpha; }
.ProseMirror ol ol ol { list-style-type: lower-roman; }
.ProseMirror li { margin-bottom: 0.15em; break-inside: avoid; }
.ProseMirror li > p { margin-bottom: 0; }
.ProseMirror ul[data-type="taskList"] { list-style: none; padding-left: 0; }
.ProseMirror ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.5em; }
.ProseMirror ul[data-type="taskList"] li label { flex-shrink: 0; margin-top: 0.2em; }
.ProseMirror ul[data-type="taskList"] li > div { flex: 1; }
.ProseMirror blockquote { border-left: 3px solid #d1d5db; padding-left: 1em; margin-left: 0; margin-bottom: 0.5em; color: #4b5563; font-style: italic; break-inside: avoid; }
.ProseMirror hr { border: none; border-top: 1px solid #d1d5db; margin: 1em 0; }
.ProseMirror table { border-collapse: collapse; width: 100%; margin: 0.5em 0; table-layout: fixed; page-break-inside: auto; }
.ProseMirror td, .ProseMirror th { border: 1px solid #d1d5db; padding: 6px 10px; vertical-align: top; min-width: 80px; position: relative; }
.ProseMirror th { background-color: #f3f4f6; font-weight: 600; }
.ProseMirror tr { break-inside: avoid; page-break-inside: avoid; }
.ProseMirror thead { display: table-header-group; }
.ProseMirror img { max-width: 100%; height: auto; display: block; margin: 0.5em 0; break-inside: avoid; }
.ProseMirror a { color: #2563eb; text-decoration: underline; }
.ProseMirror code { background-color: #f3f4f6; padding: 0.15em 0.3em; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 0.9em; }
.ProseMirror pre { background-color: #1f2937; color: #f9fafb; padding: 1em; border-radius: 6px; overflow-x: auto; margin: 0.5em 0; }
.ProseMirror pre code { background: none; color: inherit; padding: 0; }
.ProseMirror div[data-page-break] { page-break-after: always; break-after: page; height: 0; margin: 0; border: none; }
.ProseMirror div[data-page-break]::after { display: none; }
.ProseMirror div[data-section-break] { page-break-after: always; break-after: page; height: 0; margin: 0; border: none; }
.ProseMirror div[data-section-break]::after { display: none; }
.ProseMirror .text-box { border: 1px solid #333; padding: 8px; margin: 8px 0; min-height: 40px; }
.ProseMirror .footnote-ref { color: #000; font-size: 0.75em; vertical-align: super; }
.ProseMirror .citation-ref { color: #000; }
.ProseMirror .bibliography-block { border-top: 2px solid #d1d5db; margin-top: 2em; padding-top: 1em; }
.ProseMirror .merge-field { background-color: #e0f2fe; color: #0369a1; padding: 1px 6px; border-radius: 3px; font-size: 0.9em; border: 1px solid #7dd3fc; }
.ProseMirror .comment-highlight { background-color: transparent; border: none; }
.ProseMirror .track-insert { color: inherit; background-color: transparent; text-decoration: none; border: none; }
.ProseMirror .track-delete { display: none; }
.ProseMirror .column-resize-handle { display: none; }
</style></head>
<body><div class="ProseMirror">${editorEl.innerHTML}</div></body>
</html>`)
  doc.close()

  // Let the iframe render, then print (print() is synchronous — blocks until dialog closes)
  setTimeout(() => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    document.body.removeChild(iframe)
  }, 300)
}
