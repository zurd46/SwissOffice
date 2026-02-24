import { Editor } from '@tiptap/react'
import { saveAs } from 'file-saver'

export function saveDocument(editor: Editor, filename: string = 'dokument') {
  const json = editor.getJSON()
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
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

export function loadDocument(editor: Editor): Promise<void> {
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
        editor.commands.setContent(json)
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

export function printDocument() {
  window.print()
}
