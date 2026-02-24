import { Editor } from '@tiptap/react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function exportPDF(editor: Editor, filename: string = 'dokument') {
  const editorElement = document.querySelector('.ProseMirror') as HTMLElement
  if (!editorElement) return

  // Clone the element for PDF rendering
  const clone = editorElement.cloneNode(true) as HTMLElement
  clone.style.width = '210mm'
  clone.style.padding = '25mm'
  clone.style.background = 'white'
  clone.style.position = 'absolute'
  clone.style.left = '-9999px'
  clone.style.fontFamily = "'Times New Roman', serif"
  document.body.appendChild(clone)

  try {
    // Find page break positions in the cloned DOM
    const pageBreaks = clone.querySelectorAll('[data-page-break]')
    const breakPositions: number[] = []

    pageBreaks.forEach(el => {
      const htmlEl = el as HTMLElement
      breakPositions.push(htmlEl.offsetTop)
      // Hide the visual page break indicator in PDF
      htmlEl.style.display = 'none'
    })

    const canvas = await html2canvas(clone, {
      scale: 3,
      useCORS: true,
      logging: false,
      width: 794, // A4 width in px at 96dpi
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * pdfWidth) / canvas.width

    // Calculate scale factor from DOM pixels to PDF mm
    const domToCanvasScale = canvas.width / clone.offsetWidth
    const canvasToPdfScale = pdfWidth / canvas.width

    if (breakPositions.length > 0) {
      // Use explicit page breaks for splitting
      const pdfBreakPositions = breakPositions.map(
        pos => pos * domToCanvasScale * canvasToPdfScale
      )

      let currentY = 0
      const allBreaks = [...pdfBreakPositions, imgHeight]

      allBreaks.forEach((breakPos, index) => {
        if (index > 0) pdf.addPage()

        // Clip the canvas region for this page
        const offset = -currentY
        pdf.addImage(imgData, 'PNG', 0, offset, imgWidth, imgHeight)
        currentY = breakPos
      })
    } else {
      // No explicit page breaks — split at fixed A4 page height
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
      }
    }

    pdf.save(`${filename}.pdf`)
  } finally {
    document.body.removeChild(clone)
  }
}
