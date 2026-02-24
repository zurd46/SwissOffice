// Spiegelt writer/lib/types/document.ts

export interface PageSize {
  name: string
  width: number
  height: number
}

export interface Margins {
  top: number
  right: number
  bottom: number
  left: number
}

export type Orientation = 'portrait' | 'landscape'
export type PageNumberPosition = 'left' | 'center' | 'right'

export interface HeaderFooterContent {
  html: string
  enabled: boolean
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
