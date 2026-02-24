export interface PageSize {
  name: string
  width: number  // mm
  height: number // mm
}

export interface Margins {
  top: number    // mm
  right: number  // mm
  bottom: number // mm
  left: number   // mm
}

export interface MarginPreset {
  name: string
  margins: Margins
}

export type Orientation = 'portrait' | 'landscape'
export type PageNumberPosition = 'left' | 'center' | 'right'

export interface HeaderFooterContent {
  html: string
  enabled: boolean
}

export interface SectionSettings {
  pageSize: PageSize
  orientation: Orientation
  margins: Margins
  columns: number
  columnSpacing: number // mm
  headerContent: HeaderFooterContent
  footerContent: HeaderFooterContent
  showPageNumbers: boolean
  pageNumberPosition: PageNumberPosition
  firstPageDifferent: boolean
  firstPageHeaderContent: HeaderFooterContent
  firstPageFooterContent: HeaderFooterContent
}

export interface DocumentSettings {
  pageSize: PageSize
  orientation: Orientation
  margins: Margins
  headerContent: HeaderFooterContent
  footerContent: HeaderFooterContent
  showPageNumbers: boolean
  pageNumberPosition: PageNumberPosition
  firstPageDifferent: boolean
  firstPageHeaderContent: HeaderFooterContent
  firstPageFooterContent: HeaderFooterContent
}

export interface ImpulsDocument {
  version: number
  settings: DocumentSettings
  content: Record<string, unknown>
  footnotes?: Array<{ id: string; number: number; content: string }>
  bibliography?: Array<Record<string, unknown>>
  citationStyle?: 'apa' | 'mla' | 'chicago'
}

export function getEffectivePageDimensions(settings: DocumentSettings): { width: number; height: number } {
  const { pageSize, orientation } = settings
  if (orientation === 'landscape') {
    return { width: pageSize.height, height: pageSize.width }
  }
  return { width: pageSize.width, height: pageSize.height }
}

export function getContentArea(settings: DocumentSettings): { width: number; height: number } {
  const page = getEffectivePageDimensions(settings)
  return {
    width: page.width - settings.margins.left - settings.margins.right,
    height: page.height - settings.margins.top - settings.margins.bottom,
  }
}
