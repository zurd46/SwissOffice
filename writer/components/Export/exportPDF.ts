import { Editor } from '@tiptap/react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { DocumentSettings } from '../../lib/types/document'

export async function exportPDF(editor: Editor, filename: string = 'dokument', settings?: DocumentSettings) {
  const editorElement = document.querySelector('.ProseMirror') as HTMLElement
  if (!editorElement) return

  // Default to A4 with 25mm margins
  const pageWidthMm = settings
    ? (settings.orientation === 'landscape' ? settings.pageSize.height : settings.pageSize.width)
    : 210
  const pageHeightMm = settings
    ? (settings.orientation === 'landscape' ? settings.pageSize.width : settings.pageSize.height)
    : 297
  const marginTop = settings?.margins.top ?? 25
  const marginBottom = settings?.margins.bottom ?? 25
  const marginLeft = settings?.margins.left ?? 25
  const marginRight = settings?.margins.right ?? 25

  // Clone the element for clean rendering
  const clone = editorElement.cloneNode(true) as HTMLElement
  clone.style.width = `${pageWidthMm}mm`
  clone.style.padding = `${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm`
  clone.style.background = 'white'
  clone.style.position = 'absolute'
  clone.style.left = '-9999px'
  clone.style.top = '0'
  clone.style.fontFamily = "'Times New Roman', Georgia, serif"
  clone.style.fontSize = '12pt'
  clone.style.lineHeight = '1.5'
  clone.style.color = '#000'
  // Remove any transforms from zoom
  clone.style.transform = 'none'

  // Hide page break visual indicators but preserve break positions
  clone.querySelectorAll('[data-page-break]').forEach(el => {
    const htmlEl = el as HTMLElement
    htmlEl.style.borderTop = 'none'
    htmlEl.style.margin = '0'
    htmlEl.style.height = '0'
    // Remove the ::after pseudo-element text
    htmlEl.style.setProperty('--hide-label', 'none')
  })

  clone.querySelectorAll('[data-section-break]').forEach(el => {
    const htmlEl = el as HTMLElement
    htmlEl.style.borderTop = 'none'
    htmlEl.style.margin = '0'
    htmlEl.style.height = '0'
  })

  document.body.appendChild(clone)

  try {
    const orientation = settings?.orientation === 'landscape' ? 'l' : 'p'
    const pdf = new jsPDF(orientation, 'mm', [pageWidthMm, pageHeightMm])
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // Render clone to canvas at high resolution
    const pixelRatio = 2
    const canvas = await html2canvas(clone, {
      scale: pixelRatio,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')
    const canvasWidthPx = canvas.width
    const canvasHeightPx = canvas.height

    // Calculate how many PDF mm correspond to the canvas
    const pxPerMm = canvasWidthPx / pageWidthMm
    const contentAreaHeight = pdfHeight // Full page height (padding is already in the clone)
    const pageHeightPx = contentAreaHeight * pxPerMm

    // Split canvas into pages
    const totalPages = Math.max(1, Math.ceil(canvasHeightPx / pageHeightPx))

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage()

      // Create a temporary canvas for this page slice
      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvasWidthPx
      const sliceHeight = Math.min(pageHeightPx, canvasHeightPx - page * pageHeightPx)
      pageCanvas.height = sliceHeight

      const ctx = pageCanvas.getContext('2d')
      if (ctx) {
        // Fill white background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)

        // Draw the slice from the source canvas
        ctx.drawImage(
          canvas,
          0, page * pageHeightPx,           // source x, y
          canvasWidthPx, sliceHeight,         // source width, height
          0, 0,                               // dest x, y
          canvasWidthPx, sliceHeight          // dest width, height
        )
      }

      const pageImgData = pageCanvas.toDataURL('image/png')
      const sliceHeightMm = sliceHeight / pxPerMm

      pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, sliceHeightMm)

      // Add header text if enabled
      if (settings?.headerContent?.enabled && settings.headerContent.html) {
        pdf.setFontSize(8)
        pdf.setTextColor(120, 120, 120)
        const headerY = marginTop * 0.4
        if (settings.pageNumberPosition === 'left') {
          pdf.text(settings.headerContent.html, marginLeft, headerY)
        } else if (settings.pageNumberPosition === 'right') {
          pdf.text(settings.headerContent.html, pdfWidth - marginRight, headerY, { align: 'right' })
        } else {
          pdf.text(settings.headerContent.html, pdfWidth / 2, headerY, { align: 'center' })
        }
      }

      // Add page numbers if enabled
      if (settings?.showPageNumbers) {
        pdf.setFontSize(8)
        pdf.setTextColor(120, 120, 120)
        const footerY = pdfHeight - marginBottom * 0.4
        const pageNumText = `${page + 1} / ${totalPages}`
        if (settings.pageNumberPosition === 'left') {
          pdf.text(pageNumText, marginLeft, footerY)
        } else if (settings.pageNumberPosition === 'right') {
          pdf.text(pageNumText, pdfWidth - marginRight, footerY, { align: 'right' })
        } else {
          pdf.text(pageNumText, pdfWidth / 2, footerY, { align: 'center' })
        }
      }

      // Add watermark (not passed here, would need extra param)
    }

    pdf.save(`${filename}.pdf`)
  } finally {
    document.body.removeChild(clone)
  }
}
