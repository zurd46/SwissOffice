import * as pdfjsLib from 'pdfjs-dist'
import type { PDFPageProxy } from 'pdfjs-dist'
import type { AISettings, OCRImportResult } from './types'
import { SYSTEM_PROMPTS } from './prompts'

const MAX_PDF_PAGES = 20
const MAX_IMAGE_SIZE_MB = 20
const MAX_PDF_SIZE_MB = 50
const OCR_MAX_TOKENS = 16384
const OCR_TEMPERATURE = 0.1
const PDF_RENDER_SCALE = 2.0

const VISION_CAPABLE_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo']

type VisionContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string; detail: 'high' | 'low' | 'auto' } }

function isVisionCapableModel(model: string): boolean {
  return VISION_CAPABLE_MODELS.some((m) => model.includes(m))
}

function getVisionModel(settings: AISettings): string {
  if (isVisionCapableModel(settings.model)) {
    return settings.model
  }
  return 'gpt-4o-mini'
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'))
    reader.readAsDataURL(file)
  })
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'))
    reader.readAsArrayBuffer(file)
  })
}

async function renderPDFPageToImage(page: PDFPageProxy): Promise<string> {
  const viewport = page.getViewport({ scale: PDF_RENDER_SCALE })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas-Kontext konnte nicht erstellt werden.')
  }
  await page.render({ canvasContext: ctx, viewport, canvas }).promise
  return canvas.toDataURL('image/png')
}

async function callVisionAPI(
  images: string[],
  settings: AISettings,
): Promise<string> {
  const model = getVisionModel(settings)
  const systemPrompt = SYSTEM_PROMPTS.ocr(settings.documentLanguage)

  const imageDescription =
    images.length === 1
      ? 'diesem Bild'
      : `diesen ${images.length} Seiten`

  const userContent: VisionContentPart[] = [
    {
      type: 'text',
      text: `Extrahiere den gesamten Text aus ${imageDescription} und formatiere ihn als HTML. Dokumentsprache: ${settings.documentLanguage}.`,
    },
    ...images.map(
      (img): VisionContentPart => ({
        type: 'image_url',
        image_url: { url: img, detail: 'high' },
      }),
    ),
  ]

  const response = await fetch(`${settings.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      max_tokens: OCR_MAX_TOKENS,
      temperature: OCR_TEMPERATURE,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const message =
      (errorData as { error?: { message?: string } })?.error?.message ||
      `API-Fehler: ${response.status}`
    throw new Error(message)
  }

  const data = await response.json()
  const content =
    (data as { choices?: { message?: { content?: string } }[] })?.choices?.[0]
      ?.message?.content?.trim() || ''

  if (!content) {
    throw new Error('Es konnte kein Text erkannt werden.')
  }

  // Entferne mögliche Code-Block-Wrapper (```html ... ```)
  return content
    .replace(/^```html?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim()
}

async function processImageForOCR(
  file: File,
  settings: AISettings,
): Promise<OCRImportResult> {
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > MAX_IMAGE_SIZE_MB) {
    return {
      success: false,
      html: '',
      error: `Die Datei ist zu gross (${fileSizeMB.toFixed(1)} MB). Maximum: ${MAX_IMAGE_SIZE_MB} MB.`,
    }
  }

  const base64 = await readFileAsBase64(file)
  const html = await callVisionAPI([base64], settings)
  return { success: true, html, pageCount: 1 }
}

async function processPDFForOCR(
  file: File,
  settings: AISettings,
): Promise<OCRImportResult> {
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > MAX_PDF_SIZE_MB) {
    return {
      success: false,
      html: '',
      error: `Die PDF-Datei ist zu gross (${fileSizeMB.toFixed(1)} MB). Maximum: ${MAX_PDF_SIZE_MB} MB.`,
    }
  }

  // PDF.js Worker konfigurieren
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

  const arrayBuffer = await readFileAsArrayBuffer(file)
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const totalPages = pdf.numPages

  const pagesToProcess = Math.min(totalPages, MAX_PDF_PAGES)
  const pageImages: string[] = []

  for (let i = 1; i <= pagesToProcess; i++) {
    const page = await pdf.getPage(i)
    const image = await renderPDFPageToImage(page)
    pageImages.push(image)
  }

  const html = await callVisionAPI(pageImages, settings)

  const result: OCRImportResult = {
    success: true,
    html,
    pageCount: totalPages,
  }

  if (totalPages > MAX_PDF_PAGES) {
    result.error = `Das PDF hat ${totalPages} Seiten. Es wurden nur die ersten ${MAX_PDF_PAGES} Seiten verarbeitet.`
  }

  return result
}

export async function processFileForOCR(
  file: File,
  settings: AISettings,
): Promise<OCRImportResult> {
  const isImage = file.type.startsWith('image/')
  const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

  if (!isImage && !isPDF) {
    return {
      success: false,
      html: '',
      error: 'Nicht unterstütztes Dateiformat. Bitte wähle ein Bild oder eine PDF-Datei.',
    }
  }

  try {
    if (isPDF) {
      return await processPDFForOCR(file, settings)
    }
    return await processImageForOCR(file, settings)
  } catch (error) {
    return {
      success: false,
      html: '',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler bei der OCR-Verarbeitung.',
    }
  }
}
