import { Editor } from '@tiptap/react'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table as DocxTable,
  TableRow as DocxTableRow,
  TableCell as DocxTableCell,
  WidthType,
  BorderStyle,
  ImageRun,
  LevelFormat,
  ShadingType,
} from 'docx'
import { saveAs } from 'file-saver'

type JSONContent = {
  type?: string
  attrs?: Record<string, unknown>
  content?: JSONContent[]
  text?: string
  marks?: { type: string; attrs?: Record<string, unknown> }[]
}

function getHeadingLevel(level: number): (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined {
  const map: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
    5: HeadingLevel.HEADING_5,
    6: HeadingLevel.HEADING_6,
  }
  return map[level]
}

function getAlignment(align: string): (typeof AlignmentType)[keyof typeof AlignmentType] {
  const map: Record<string, (typeof AlignmentType)[keyof typeof AlignmentType]> = {
    left: AlignmentType.LEFT,
    center: AlignmentType.CENTER,
    right: AlignmentType.RIGHT,
    justify: AlignmentType.JUSTIFIED,
  }
  return map[align] || AlignmentType.LEFT
}

function parsePtToHalfPt(value: string): number | undefined {
  const num = parseFloat(value.replace('pt', ''))
  return isNaN(num) ? undefined : Math.round(num * 2)
}

function parsePtToTwips(value: string): number | undefined {
  const num = parseFloat(value.replace('pt', ''))
  return isNaN(num) ? undefined : Math.round(num * 20)
}

function getLineSpacing(lineHeight: string | undefined): number | undefined {
  if (!lineHeight) return undefined
  const num = parseFloat(lineHeight)
  if (isNaN(num)) return undefined
  // DOCX line spacing: 240 twips = single spacing (1.0)
  return Math.round(num * 240)
}

function processTextRuns(content: JSONContent[]): TextRun[] {
  return content.map(node => {
    if (node.type === 'text' && node.text) {
      const marks = node.marks || []
      const textStyle = marks.find(m => m.type === 'textStyle')?.attrs
      const highlightMark = marks.find(m => m.type === 'highlight')
      const highlightColor = highlightMark?.attrs?.color as string | undefined

      return new TextRun({
        text: node.text,
        bold: marks.some(m => m.type === 'bold'),
        italics: marks.some(m => m.type === 'italic'),
        underline: marks.some(m => m.type === 'underline') ? {} : undefined,
        strike: marks.some(m => m.type === 'strike'),
        superScript: marks.some(m => m.type === 'superscript'),
        subScript: marks.some(m => m.type === 'subscript'),
        color: textStyle?.color as string || undefined,
        font: textStyle?.fontFamily as string || undefined,
        size: textStyle?.fontSize ? parsePtToHalfPt(textStyle.fontSize as string) : undefined,
        shading: highlightColor ? {
          type: ShadingType.SOLID,
          color: highlightColor.replace('#', ''),
          fill: highlightColor.replace('#', ''),
        } : undefined,
      })
    }
    return new TextRun({ text: '' })
  })
}

function getParagraphSpacing(node: JSONContent): { before?: number; after?: number; line?: number } | undefined {
  const lineHeight = node.attrs?.lineHeight as string | undefined
  const spaceBefore = node.attrs?.spaceBefore as string | undefined
  const spaceAfter = node.attrs?.spaceAfter as string | undefined

  const line = getLineSpacing(lineHeight)
  const before = spaceBefore ? parsePtToTwips(spaceBefore) : undefined
  const after = spaceAfter ? parsePtToTwips(spaceAfter) : undefined

  if (!line && !before && !after) return undefined
  return { before, after, line }
}

function processNode(node: JSONContent): (Paragraph | DocxTable)[] {
  const results: (Paragraph | DocxTable)[] = []

  switch (node.type) {
    case 'paragraph': {
      const alignment = node.attrs?.textAlign as string
      const spacing = getParagraphSpacing(node)
      results.push(new Paragraph({
        children: node.content ? processTextRuns(node.content) : [],
        alignment: alignment ? getAlignment(alignment) : undefined,
        spacing,
      }))
      break
    }
    case 'heading': {
      const level = (node.attrs?.level as number) || 1
      const alignment = node.attrs?.textAlign as string
      const spacing = getParagraphSpacing(node)
      results.push(new Paragraph({
        children: node.content ? processTextRuns(node.content) : [],
        heading: getHeadingLevel(level),
        alignment: alignment ? getAlignment(alignment) : undefined,
        spacing,
        keepNext: true,
        keepLines: true,
      }))
      break
    }
    case 'bulletList': {
      processList(node, results, 'bullet', 0)
      break
    }
    case 'orderedList': {
      processList(node, results, 'numbered', 0)
      break
    }
    case 'table': {
      if (node.content) {
        const rows = node.content.map((row, rowIndex) => {
          const cells = (row.content || []).map(cell => {
            const isHeader = cell.type === 'tableHeader'
            const cellContent: Paragraph[] = []
            cell.content?.forEach(child => {
              if (child.type === 'paragraph') {
                cellContent.push(new Paragraph({
                  children: child.content ? processTextRuns(child.content) : [],
                }))
              }
            })
            return new DocxTableCell({
              children: cellContent.length > 0 ? cellContent : [new Paragraph({})],
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
              },
              shading: isHeader ? { type: ShadingType.SOLID, color: 'F3F4F6', fill: 'F3F4F6' } : undefined,
            })
          })
          return new DocxTableRow({
            children: cells,
            tableHeader: rowIndex === 0,
          })
        })
        results.push(new DocxTable({
          rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        }))
      }
      break
    }
    case 'blockquote': {
      node.content?.forEach(child => {
        if (child.type === 'paragraph') {
          results.push(new Paragraph({
            children: child.content ? processTextRuns(child.content) : [],
            indent: { left: 720 },
          }))
        }
      })
      break
    }
    case 'horizontalRule': {
      results.push(new Paragraph({
        children: [new TextRun({ text: '___________________________________' })],
      }))
      break
    }
    case 'pageBreak': {
      results.push(new Paragraph({
        children: [],
        pageBreakBefore: true,
      }))
      break
    }
    case 'image': {
      const src = node.attrs?.src as string
      if (src?.startsWith('data:image')) {
        try {
          const base64Data = src.split(',')[1]
          const byteString = atob(base64Data)
          const bytes = new Uint8Array(byteString.length)
          for (let i = 0; i < byteString.length; i++) {
            bytes[i] = byteString.charCodeAt(i)
          }
          const isPng = src.includes('image/png')
          const width = (node.attrs?.width as number) || 400
          const height = (node.attrs?.height as number) || Math.round(width * 0.75)
          results.push(new Paragraph({
            children: [new ImageRun({
              data: bytes,
              transformation: { width, height },
              type: isPng ? 'png' : 'jpg',
            })],
          }))
        } catch {
          results.push(new Paragraph({
            children: [new TextRun({ text: '[Bild konnte nicht exportiert werden]' })],
          }))
        }
      } else if (src) {
        results.push(new Paragraph({
          children: [new TextRun({ text: `[Bild: ${src}]` })],
        }))
      }
      break
    }
    case 'taskList': {
      node.content?.forEach(taskItem => {
        const checked = taskItem.attrs?.checked as boolean
        const prefix = checked ? '[\u2713] ' : '[ ] '
        taskItem.content?.forEach(child => {
          if (child.type === 'paragraph') {
            results.push(new Paragraph({
              children: [
                new TextRun({ text: prefix }),
                ...(child.content ? processTextRuns(child.content) : []),
              ],
            }))
          }
        })
      })
      break
    }
    default: {
      if (node.content) {
        node.content.forEach(child => {
          results.push(...processNode(child))
        })
      }
    }
  }

  return results
}

function processList(node: JSONContent, results: (Paragraph | DocxTable)[], type: 'bullet' | 'numbered', level: number): void {
  node.content?.forEach(listItem => {
    listItem.content?.forEach(child => {
      if (child.type === 'paragraph') {
        if (type === 'bullet') {
          results.push(new Paragraph({
            children: child.content ? processTextRuns(child.content) : [],
            bullet: { level },
          }))
        } else {
          results.push(new Paragraph({
            children: child.content ? processTextRuns(child.content) : [],
            numbering: { reference: 'default-numbering', level },
          }))
        }
      } else if (child.type === 'bulletList') {
        processList(child, results, 'bullet', level + 1)
      } else if (child.type === 'orderedList') {
        processList(child, results, 'numbered', level + 1)
      }
    })
  })
}

export async function exportDOCX(editor: Editor, filename: string = 'dokument') {
  const json = editor.getJSON()
  const children: (Paragraph | DocxTable)[] = []

  json.content?.forEach(node => {
    children.push(...processNode(node))
  })

  if (children.length === 0) {
    children.push(new Paragraph({}))
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'default-numbering',
          levels: [
            { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.START },
            { level: 1, format: LevelFormat.LOWER_LETTER, text: '%2.', alignment: AlignmentType.START },
            { level: 2, format: LevelFormat.LOWER_ROMAN, text: '%3.', alignment: AlignmentType.START },
          ],
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1418,   // 25mm in twips
            right: 1418,
            bottom: 1418,
            left: 1418,
          },
        },
      },
      children,
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${filename}.docx`)
}
