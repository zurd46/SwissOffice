'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { EditorContent, type Editor } from '@tiptap/react'
import { useDocumentSettings } from '../../lib/documentContext'
import { getEffectivePageDimensions } from '../../lib/types/document'
import { PageOverlay } from './PageOverlay'

interface PageViewProps {
  editor: Editor
  zoom: number
}

// Convert mm to px (at 96 DPI: 1mm ≈ 3.7795px)
const MM_TO_PX = 3.7795275591

export function PageView({ editor, zoom }: PageViewProps) {
  const { settings } = useDocumentSettings()
  const containerRef = useRef<HTMLDivElement>(null)
  const editorWrapperRef = useRef<HTMLDivElement>(null)
  const [pageCount, setPageCount] = useState(1)

  const pageDimensions = getEffectivePageDimensions(settings)
  const pageHeightPx = pageDimensions.height * MM_TO_PX
  const marginTopPx = settings.margins.top * MM_TO_PX
  const marginBottomPx = settings.margins.bottom * MM_TO_PX

  // Usable content height per page (excluding header/footer space)
  const headerFooterReserved = 15 * MM_TO_PX // 15mm reserved for header+footer
  const contentHeightPerPage = pageHeightPx - marginTopPx - marginBottomPx - (
    (settings.headerContent.enabled || settings.showPageNumbers ? headerFooterReserved / 2 : 0) +
    (settings.footerContent.enabled || settings.showPageNumbers ? headerFooterReserved / 2 : 0)
  )

  const calculatePageCount = useCallback(() => {
    if (!editorWrapperRef.current) return

    const proseMirrorEl = editorWrapperRef.current.querySelector('.ProseMirror')
    if (!proseMirrorEl) return

    const contentHeight = proseMirrorEl.scrollHeight
    const effectiveContentHeight = contentHeightPerPage > 0 ? contentHeightPerPage : pageHeightPx - marginTopPx - marginBottomPx
    const pages = Math.max(1, Math.ceil(contentHeight / effectiveContentHeight))

    if (pages !== pageCount) {
      setPageCount(pages)
    }
  }, [contentHeightPerPage, pageHeightPx, marginTopPx, marginBottomPx, pageCount])

  // Recalculate on editor updates
  useEffect(() => {
    calculatePageCount()

    const handleUpdate = () => {
      requestAnimationFrame(calculatePageCount)
    }

    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor, calculatePageCount])

  // Recalculate on resize
  useEffect(() => {
    if (!editorWrapperRef.current) return

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(calculatePageCount)
    })
    observer.observe(editorWrapperRef.current)
    return () => observer.disconnect()
  }, [calculatePageCount])

  const scale = zoom / 100
  const scaledPageWidth = pageDimensions.width * scale
  const totalHeight = pageCount * pageHeightPx + (pageCount - 1) * (10 * MM_TO_PX) // 10mm gap between pages

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflow: 'auto',
        backgroundColor: '#e5e5e5',
        padding: '32px 0',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: `${scaledPageWidth}mm`,
          minHeight: `${totalHeight * scale}px`,
        }}
      >
        {/* Page backgrounds and overlays */}
        {Array.from({ length: pageCount }, (_, i) => (
          <div
            key={i}
            className="page-background"
            style={{
              position: 'absolute',
              top: `${i * (pageDimensions.height + 10) * scale}mm`,
              left: 0,
              width: `${scaledPageWidth}mm`,
              height: `${pageDimensions.height * scale}mm`,
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              border: '1px solid #d0d0d0',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            <PageOverlay
              pageNumber={i + 1}
              totalPages={pageCount}
              settings={settings}
              scale={scale}
            />
          </div>
        ))}

        {/* Editor content layer */}
        <div
          ref={editorWrapperRef}
          className="editor-page-wrapper"
          style={{
            position: 'relative',
            zIndex: 1,
            width: `${scaledPageWidth}mm`,
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
