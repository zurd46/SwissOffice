'use client'

import type { DocumentSettings } from '../../lib/types/document'

interface PageOverlayProps {
  pageNumber: number
  totalPages: number
  settings: DocumentSettings
  scale: number
}

export function PageOverlay({ pageNumber, totalPages, settings, scale }: PageOverlayProps) {
  const isFirstPage = pageNumber === 1
  const useFirstPageContent = isFirstPage && settings.firstPageDifferent

  const headerContent = useFirstPageContent
    ? settings.firstPageHeaderContent
    : settings.headerContent
  const footerContent = useFirstPageContent
    ? settings.firstPageFooterContent
    : settings.footerContent

  const showHeader = headerContent.enabled && headerContent.html.trim().length > 0
  const showFooter = footerContent.enabled && footerContent.html.trim().length > 0
  const showPageNumber = settings.showPageNumbers && !(isFirstPage && settings.firstPageDifferent)

  const marginLeft = settings.margins.left
  const marginRight = settings.margins.right
  const marginTop = settings.margins.top
  const marginBottom = settings.margins.bottom

  const pageNumberAlignment: Record<string, string> = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  }

  return (
    <>
      {/* Header area */}
      {showHeader && (
        <div
          className="page-header"
          style={{
            position: 'absolute',
            top: `${(marginTop * 0.3) * scale}mm`,
            left: `${marginLeft * scale}mm`,
            right: `${marginRight * scale}mm`,
            fontSize: `${9 * scale}pt`,
            color: '#666',
            fontFamily: 'Times New Roman, serif',
            pointerEvents: 'none',
            lineHeight: 1.4,
          }}
          dangerouslySetInnerHTML={{ __html: headerContent.html }}
        />
      )}

      {/* Footer area */}
      {showFooter && (
        <div
          className="page-footer"
          style={{
            position: 'absolute',
            bottom: `${(marginBottom * 0.3) * scale}mm`,
            left: `${marginLeft * scale}mm`,
            right: `${marginRight * scale}mm`,
            fontSize: `${9 * scale}pt`,
            color: '#666',
            fontFamily: 'Times New Roman, serif',
            pointerEvents: 'none',
            lineHeight: 1.4,
          }}
          dangerouslySetInnerHTML={{ __html: footerContent.html }}
        />
      )}

      {/* Page number */}
      {showPageNumber && (
        <div
          className="page-number"
          style={{
            position: 'absolute',
            bottom: `${(marginBottom * 0.15) * scale}mm`,
            left: `${marginLeft * scale}mm`,
            right: `${marginRight * scale}mm`,
            display: 'flex',
            justifyContent: pageNumberAlignment[settings.pageNumberPosition] || 'center',
            fontSize: `${10 * scale}pt`,
            color: '#444',
            fontFamily: 'Times New Roman, serif',
            pointerEvents: 'none',
          }}
        >
          <span>{pageNumber}</span>
        </div>
      )}

      {/* Page number indicator (small text bottom-right for reference) */}
      <div
        style={{
          position: 'absolute',
          bottom: `${2 * scale}mm`,
          right: `${3 * scale}mm`,
          fontSize: `${7 * scale}pt`,
          color: '#ccc',
          fontFamily: 'system-ui, sans-serif',
          pointerEvents: 'none',
        }}
      >
        Seite {pageNumber} von {totalPages}
      </div>
    </>
  )
}
