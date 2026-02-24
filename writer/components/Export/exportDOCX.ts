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

function processTextRuns(content: JSONContent[]): TextRun[] {
  return content.map(node => {
    if (node.type === 'text' && node.text) {
      const marks = node.marks || []
      return new TextRun({
        text: node.text,
        bold: marks.some(m => m.type === 'bold'),
        italics: marks.some(m => m.type === 'italic'),
        underline: marks.some(m => m.type === 'underline') ? {} : undefined,
        strike: marks.some(m => m.type === 'strike'),
        superScript: marks.some(m => m.type === 'superscript'),
        subScript: marks.some(m => m.type === 'subscript'),
        color: marks.find(m => m.type === 'textStyle')?.attrs?.color as string || undefined,
        font: marks.find(m => m.type === 'textStyle')?.attrs?.fontFamily as string || undefined,
        size: marks.find(m => m.type === 'textStyle')?.attrs?.fontSize
          ? parseInt(marks.find(m => m.type === 'textStyle')!.attrs!.fontSize as string) * 2
          : undefined,
      })
    }
    return new TextRun({ text: '' })
  })
}

function processNode(node: JSONContent): (Paragraph | DocxTable)[] {
  const results: (Paragraph | DocxTable)[] = []

  switch (node.type) {
    case 'paragraph': {
      const alignment = node.attrs?.textAlign as string
      results.push(new Paragraph({
        children: node.content ? processTextRuns(node.content) : [],
        alignment: alignment ? getAlignment(alignment) : undefined,
      }))
      break
    }
    case 'heading': {
      const level = (node.attrs?.level as number) || 1
      const alignment = node.attrs?.textAlign as string
      results.push(new Paragraph({
        children: node.content ? processTextRuns(node.content) : [],
        heading: getHeadingLevel(level),
        alignment: alignment ? getAlignment(alignment) : undefined,
      }))
      break
    }
    case 'bulletList': {
      node.content?.forEach(listItem => {
        listItem.content?.forEach(child => {
          if (child.type === 'paragraph') {
            results.push(new Paragraph({
              children: child.content ? processTextRuns(child.content) : [],
              bullet: { level: 0 },
            }))
          }
        })
      })
      break
    }
    case 'orderedList': {
      node.content?.forEach((listItem, index) => {
        listItem.content?.forEach(child => {
          if (child.type === 'paragraph') {
            results.push(new Paragraph({
              children: [
                new TextRun({ text: `${index + 1}. ` }),
                ...(child.content ? processTextRuns(child.content) : []),
              ],
            }))
          }
        })
      })
      break
    }
    case 'table': {
      if (node.content) {
        const rows = node.content.map(row => {
          const cells = (row.content || []).map(cell => {
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
            })
          })
          return new DocxTableRow({ children: cells })
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
    case 'image': {
      // Images need special handling - skip for now in basic export
      results.push(new Paragraph({
        children: [new TextRun({ text: `[Bild: ${node.attrs?.src || ''}]` })],
      }))
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
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440,  // 1 inch
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
      },
      children,
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${filename}.docx`)
}
