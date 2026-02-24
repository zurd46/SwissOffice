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
    const canvas = await html2canvas(clone, {
      scale: 2,
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

    pdf.save(`${filename}.pdf`)
  } finally {
    document.body.removeChild(clone)
  }
}
