'use client'

import { Editor } from '@tiptap/react'
import { DEFAULT_STYLES } from '../../../lib/defaultStyles'
import type { StyleDefinition } from '../../../lib/types/styles'

interface StyleGalleryProps {
  editor: Editor
}

export function StyleGallery({ editor }: StyleGalleryProps) {
  const activeStyle = getActiveStyle(editor)

  const applyStyle = (style: StyleDefinition) => {
    const chain = editor.chain().focus()

    // Reset to paragraph if switching from heading to non-heading or vice versa
    if (style.isHeading && style.headingLevel) {
      chain.setHeading({ level: style.headingLevel })
    } else {
      // If currently a heading, convert to paragraph first
      if (editor.isActive('heading')) {
        chain.setParagraph()
      }
    }

    // Apply formatting from style
    if (style.fontFamily) {
      chain.setFontFamily(style.fontFamily)
    }
    if (style.fontSize) {
      chain.setFontSize(style.fontSize)
    }
    if (style.color) {
      chain.setColor(style.color)
    }
    if (style.textAlign) {
      chain.setTextAlign(style.textAlign)
    }
    if (style.lineHeight) {
      chain.setLineHeight(style.lineHeight)
    }
    if (style.spaceBefore) {
      chain.setSpaceBefore(style.spaceBefore)
    }
    if (style.spaceAfter) {
      chain.setSpaceAfter(style.spaceAfter)
    }

    chain.run()
  }

  return (
    <div style={{
      display: 'flex',
      gap: 4,
      overflowX: 'auto',
      maxWidth: 320,
      paddingTop: 2,
      paddingBottom: 2,
    }}>
      {DEFAULT_STYLES.filter(s =>
        s.name === 'normal' ||
        s.isHeading ||
        s.name === 'title' ||
        s.name === 'subtitle' ||
        s.name === 'quote' ||
        s.name === 'noSpacing'
      ).map(style => (
        <StyleButton
          key={style.name}
          style={style}
          isActive={activeStyle === style.name}
          onClick={() => applyStyle(style)}
        />
      ))}
    </div>
  )
}

function StyleButton({ style, isActive, onClick }: {
  style: StyleDefinition
  isActive: boolean
  onClick: () => void
}) {
  const previewFontSize = Math.min(parseInt(style.fontSize || '12') * 0.7, 14)

  return (
    <button
      onClick={onClick}
      title={style.displayName}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 56,
        height: 52,
        padding: '4px 6px',
        border: isActive ? '2px solid #0078d4' : '1px solid #d2d0ce',
        borderRadius: 4,
        backgroundColor: isActive ? '#e1f0ff' : 'white',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <span style={{
        fontFamily: style.fontFamily || 'Times New Roman',
        fontSize: `${previewFontSize}px`,
        fontWeight: style.fontWeight || 400,
        fontStyle: style.fontStyle || 'normal',
        color: style.color || '#000',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 50,
      }}>
        Aa
      </span>
      <span style={{
        fontSize: 8,
        color: isActive ? '#0078d4' : '#605e5c',
        fontWeight: isActive ? 600 : 400,
        marginTop: 2,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 54,
        fontFamily: 'system-ui, sans-serif',
      }}>
        {style.displayName}
      </span>
    </button>
  )
}

function getActiveStyle(editor: Editor): string {
  // Check headings
  for (let i = 1; i <= 6; i++) {
    if (editor.isActive('heading', { level: i })) {
      return `heading${i}`
    }
  }

  // Check blockquote
  if (editor.isActive('blockquote')) {
    return 'quote'
  }

  return 'normal'
}
