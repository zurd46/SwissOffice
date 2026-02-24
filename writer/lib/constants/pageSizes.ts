import type { PageSize, MarginPreset } from '../types/document'

export const PAGE_SIZES: PageSize[] = [
  { name: 'A4', width: 210, height: 297 },
  { name: 'A5', width: 148, height: 210 },
  { name: 'A3', width: 297, height: 420 },
  { name: 'Letter', width: 215.9, height: 279.4 },
  { name: 'Legal', width: 215.9, height: 355.6 },
  { name: 'B5', width: 176, height: 250 },
]

export const MARGIN_PRESETS: MarginPreset[] = [
  { name: 'Normal', margins: { top: 25, right: 25, bottom: 25, left: 25 } },
  { name: 'Schmal', margins: { top: 12.7, right: 12.7, bottom: 12.7, left: 12.7 } },
  { name: 'Breit', margins: { top: 25.4, right: 31.7, bottom: 25.4, left: 31.7 } },
  { name: 'Mittel', margins: { top: 25.4, right: 19.1, bottom: 25.4, left: 19.1 } },
  { name: 'Gespiegelt', margins: { top: 25.4, right: 25.4, bottom: 25.4, left: 31.7 } },
]

export const DEFAULT_PAGE_SIZE: PageSize = PAGE_SIZES[0] // A4
