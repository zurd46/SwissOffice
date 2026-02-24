'use client'

import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { useState, useRef, useCallback, useEffect } from 'react'
import type { TextWrap } from '../extensions/ResizableImage'

export function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, title, width, height, textWrap, alignment } = node.attrs
  const imageRef = useRef<HTMLImageElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [showToolbar, setShowToolbar] = useState(false)
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 })

  const currentWidth = width || undefined
  const currentHeight = height || undefined

  const handleMouseDown = useCallback((e: React.MouseEvent, corner: string) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)

    const img = imageRef.current
    if (!img) return

    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: img.offsetWidth,
      height: img.offsetHeight,
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startPos.current.x
      const aspectRatio = startPos.current.width / startPos.current.height

      let newWidth: number
      if (corner === 'right' || corner === 'bottom-right') {
        newWidth = Math.max(50, startPos.current.width + deltaX)
      } else {
        newWidth = Math.max(50, startPos.current.width - deltaX)
      }

      const newHeight = Math.round(newWidth / aspectRatio)

      updateAttributes({
        width: Math.round(newWidth),
        height: newHeight,
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [updateAttributes])

  const setTextWrap = useCallback((wrap: TextWrap) => {
    updateAttributes({ textWrap: wrap })
    setShowToolbar(false)
  }, [updateAttributes])

  const setImageAlignment = useCallback((align: string) => {
    updateAttributes({ alignment: align })
  }, [updateAttributes])

  // Determine wrapper styles based on textWrap
  const wrapperStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    lineHeight: 0,
  }

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center',
  }

  if (textWrap === 'wrap-left') {
    Object.assign(containerStyles, { float: 'left', marginRight: 12, marginBottom: 8 })
  } else if (textWrap === 'wrap-right') {
    Object.assign(containerStyles, { float: 'right', marginLeft: 12, marginBottom: 8 })
  }

  return (
    <NodeViewWrapper
      style={containerStyles}
      data-text-wrap={textWrap}
    >
      <div
        style={wrapperStyles}
        onMouseEnter={() => setShowToolbar(true)}
        onMouseLeave={() => { if (!isResizing) setShowToolbar(false) }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          src={src}
          alt={alt || ''}
          title={title || ''}
          width={currentWidth}
          height={currentHeight}
          style={{
            display: 'block',
            maxWidth: '100%',
            outline: selected ? '2px solid #3b82f6' : 'none',
            borderRadius: 2,
            cursor: 'default',
          }}
          draggable={false}
        />

        {/* Resize handles (visible when selected or hovered) */}
        {(selected || showToolbar) && (
          <>
            <ResizeHandle position="right" onMouseDown={(e) => handleMouseDown(e, 'right')} />
            <ResizeHandle position="bottom-right" onMouseDown={(e) => handleMouseDown(e, 'bottom-right')} />
            <ResizeHandle position="left" onMouseDown={(e) => handleMouseDown(e, 'left')} />
          </>
        )}

        {/* Floating toolbar */}
        {(selected || showToolbar) && !isResizing && (
          <div style={{
            position: 'absolute',
            top: -36,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 2,
            backgroundColor: 'white',
            border: '1px solid #d2d0ce',
            borderRadius: 4,
            padding: '3px 4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 10,
          }}>
            <MiniButton title="Inline" active={textWrap === 'inline'} onClick={() => setTextWrap('inline')}>&#x25A0;</MiniButton>
            <MiniButton title="Links umfliessen" active={textWrap === 'wrap-left'} onClick={() => setTextWrap('wrap-left')}>&#x25C0;</MiniButton>
            <MiniButton title="Rechts umfliessen" active={textWrap === 'wrap-right'} onClick={() => setTextWrap('wrap-right')}>&#x25B6;</MiniButton>
            <div style={{ width: 1, height: 16, backgroundColor: '#e1dfdd', margin: '0 2px' }} />
            <MiniButton title="Links" active={alignment === 'left'} onClick={() => setImageAlignment('left')}>&#x25C2;</MiniButton>
            <MiniButton title="Zentriert" active={alignment === 'center'} onClick={() => setImageAlignment('center')}>&#x25CF;</MiniButton>
            <MiniButton title="Rechts" active={alignment === 'right'} onClick={() => setImageAlignment('right')}>&#x25B8;</MiniButton>
          </div>
        )}

        {/* Size indicator while resizing */}
        {isResizing && (
          <div style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontSize: 10,
            padding: '2px 6px',
            borderRadius: 3,
          }}>
            {width} × {height}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

function ResizeHandle({ position, onMouseDown }: {
  position: 'left' | 'right' | 'bottom-right'
  onMouseDown: (e: React.MouseEvent) => void
}) {
  const styles: React.CSSProperties = {
    position: 'absolute',
    width: position === 'bottom-right' ? 12 : 6,
    height: position === 'bottom-right' ? 12 : '60%',
    backgroundColor: '#3b82f6',
    borderRadius: position === 'bottom-right' ? '50%' : 3,
    cursor: position === 'bottom-right' ? 'nwse-resize' : 'ew-resize',
    opacity: 0.7,
    zIndex: 5,
  }

  if (position === 'right') {
    Object.assign(styles, { right: -3, top: '20%' })
  } else if (position === 'left') {
    Object.assign(styles, { left: -3, top: '20%' })
  } else {
    Object.assign(styles, { right: -4, bottom: -4 })
  }

  return <div style={styles} onMouseDown={onMouseDown} />
}

function MiniButton({ title, active, onClick, children }: {
  title: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      title={title}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      style={{
        width: 22,
        height: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        border: 'none',
        borderRadius: 3,
        backgroundColor: active ? '#c7e0f4' : 'transparent',
        color: active ? '#0078d4' : '#605e5c',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}
