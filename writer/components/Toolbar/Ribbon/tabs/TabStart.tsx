'use client'

import { Editor } from '@tiptap/react'
import {
  Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, ListChecks,
  Indent, Outdent,
  Quote, Search, RemoveFormatting,
  Scissors, Copy, ClipboardPaste,
  AArrowUp, AArrowDown,
  Undo2, Redo2,
} from 'lucide-react'
import { ToolbarButton, ToolbarSelect, ToolbarColorButton } from '../../ToolbarButton'
import { RibbonGroup, RibbonGroupLast } from '../RibbonGroup'
import { FONT_FAMILIES, FONT_SIZES, HEADING_OPTIONS, LINE_HEIGHTS } from '../constants'
import { useState, useCallback } from 'react'

interface TabStartProps {
  editor: Editor
  onToggleFindReplace: () => void
}

export function TabStart({ editor, onToggleFindReplace }: TabStartProps) {
  const [textColor, setTextColor] = useState('#000000')
  const [highlightColor, setHighlightColor] = useState('#ffff00')

  const getCurrentFontSize = () => {
    const attrs = editor.getAttributes('textStyle')
    return attrs.fontSize || '12pt'
  }

  const getCurrentFontFamily = () => {
    const attrs = editor.getAttributes('textStyle')
    return attrs.fontFamily || 'Times New Roman'
  }

  const getCurrentHeading = () => {
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive('heading', { level: i })) return String(i)
    }
    return '0'
  }

  const handleHeadingChange = (value: string) => {
    const level = parseInt(value)
    if (level === 0) {
      editor.chain().focus().setParagraph().run()
    } else {
      editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run()
    }
  }

  const increaseFontSize = useCallback(() => {
    const current = getCurrentFontSize()
    const num = parseInt(current)
    const sizes = FONT_SIZES.map(s => parseInt(s.value))
    const next = sizes.find(s => s > num) || sizes[sizes.length - 1]
    editor.chain().focus().setFontSize(`${next}pt`).run()
  }, [editor])

  const decreaseFontSize = useCallback(() => {
    const current = getCurrentFontSize()
    const num = parseInt(current)
    const sizes = FONT_SIZES.map(s => parseInt(s.value)).reverse()
    const next = sizes.find(s => s < num) || sizes[sizes.length - 1]
    editor.chain().focus().setFontSize(`${next}pt`).run()
  }, [editor])

  const handleCut = useCallback(() => {
    document.execCommand('cut')
  }, [])

  const handleCopy = useCallback(() => {
    document.execCommand('copy')
  }, [])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      editor.chain().focus().insertContent(text).run()
    } catch {
      document.execCommand('paste')
    }
  }, [editor])

  const dividerStyle = { width: 1, height: 16, backgroundColor: '#e1dfdd', margin: '0 4px', flexShrink: 0 } as const

  return (
    <>
      {/* Zwischenablage */}
      <RibbonGroup label="Zwischenablage">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Rückgängig (Ctrl+Z)" disabled={!editor.can().undo()}>
              <Undo2 size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Wiederholen (Ctrl+Y)" disabled={!editor.can().redo()}>
              <Redo2 size={14} />
            </ToolbarButton>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ToolbarButton onClick={handleCut} title="Ausschneiden (Ctrl+X)">
              <Scissors size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={handleCopy} title="Kopieren (Ctrl+C)">
              <Copy size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={handlePaste} title="Einfügen (Ctrl+V)">
              <ClipboardPaste size={14} />
            </ToolbarButton>
          </div>
        </div>
      </RibbonGroup>

      {/* Schriftart */}
      <RibbonGroup label="Schriftart">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <ToolbarSelect
              value={getCurrentFontFamily()}
              onChange={(v) => editor.chain().focus().setFontFamily(v).run()}
              options={FONT_FAMILIES}
              title="Schriftart"
              className="w-[120px]"
            />
            <ToolbarSelect
              value={getCurrentFontSize()}
              onChange={(v) => editor.chain().focus().setFontSize(v).run()}
              options={FONT_SIZES}
              title="Schriftgrösse"
              className="w-[46px]"
            />
            <ToolbarButton onClick={increaseFontSize} title="Schrift vergrössern">
              <AArrowUp size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={decreaseFontSize} title="Schrift verkleinern">
              <AArrowDown size={14} />
            </ToolbarButton>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Fett (Ctrl+B)">
              <Bold size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Kursiv (Ctrl+I)">
              <Italic size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Unterstrichen (Ctrl+U)">
              <Underline size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Durchgestrichen">
              <Strikethrough size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} isActive={editor.isActive('subscript')} title="Tiefgestellt">
              <Subscript size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} isActive={editor.isActive('superscript')} title="Hochgestellt">
              <Superscript size={14} />
            </ToolbarButton>
            <div style={dividerStyle} />
            <ToolbarColorButton
              value={textColor}
              onChange={(color) => { setTextColor(color); editor.chain().focus().setColor(color).run() }}
              title="Textfarbe"
              icon="text"
            />
            <ToolbarColorButton
              value={highlightColor}
              onChange={(color) => { setHighlightColor(color); editor.chain().focus().toggleHighlight({ color }).run() }}
              title="Hervorhebungsfarbe"
              icon="highlight"
            />
            <div style={dividerStyle} />
            <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().run()} title="Formatierung entfernen">
              <RemoveFormatting size={14} />
            </ToolbarButton>
          </div>
        </div>
      </RibbonGroup>

      {/* Absatz */}
      <RibbonGroup label="Absatz">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Aufzählung">
              <List size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Nummerierung">
              <ListOrdered size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} title="Aufgabenliste">
              <ListChecks size={14} />
            </ToolbarButton>
            <div style={dividerStyle} />
            <ToolbarButton onClick={() => editor.chain().focus().liftListItem('listItem').run()} title="Einzug verkleinern" disabled={!editor.can().liftListItem('listItem')}>
              <Outdent size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().sinkListItem('listItem').run()} title="Einzug vergrössern" disabled={!editor.can().sinkListItem('listItem')}>
              <Indent size={14} />
            </ToolbarButton>
            <div style={dividerStyle} />
            <ToolbarSelect
              value="1.5"
              onChange={(v) => editor.chain().focus().setLineHeight(v).run()}
              options={LINE_HEIGHTS}
              title="Zeilenabstand"
              className="w-[44px]"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Linksbündig">
              <AlignLeft size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Zentriert">
              <AlignCenter size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Rechtsbündig">
              <AlignRight size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Blocksatz">
              <AlignJustify size={14} />
            </ToolbarButton>
            <div style={dividerStyle} />
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockzitat">
              <Quote size={14} />
            </ToolbarButton>
          </div>
        </div>
      </RibbonGroup>

      {/* Formatvorlagen */}
      <RibbonGroupLast label="Formatvorlagen">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <ToolbarSelect
            value={getCurrentHeading()}
            onChange={handleHeadingChange}
            options={HEADING_OPTIONS}
            title="Absatzformat"
            className="w-[130px]"
          />
          <button
            onClick={onToggleFindReplace}
            title="Suchen & Ersetzen (Ctrl+H)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              height: 26,
              padding: '0 6px',
              borderRadius: 2,
              fontSize: 11,
              color: '#323130',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.1s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e1dfdd' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <Search size={13} style={{ color: '#605e5c' }} />
            <span>Suchen & Ersetzen</span>
          </button>
        </div>
      </RibbonGroupLast>
    </>
  )
}
