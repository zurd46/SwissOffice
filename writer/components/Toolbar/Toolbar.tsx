'use client'

import { Editor } from '@tiptap/react'
import {
  Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, ListChecks,
  Indent, Outdent,
  Quote, Minus, FileImage, Table, Link, FileDown,
  Undo2, Redo2, Highlighter, Paintbrush, Type,
} from 'lucide-react'
import { ToolbarButton, ToolbarSelect, ToolbarDivider, ToolbarColorInput } from './ToolbarButton'
import { useState, useCallback } from 'react'

const FONT_FAMILIES = [
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS' },
  { label: 'Tahoma', value: 'Tahoma' },
  { label: 'Palatino', value: 'Palatino Linotype' },
  { label: 'Garamond', value: 'Garamond' },
  { label: 'Calibri', value: 'Calibri' },
  { label: 'Cambria', value: 'Cambria' },
  { label: 'Comic Sans MS', value: 'Comic Sans MS' },
  { label: 'Impact', value: 'Impact' },
  { label: 'Lucida Console', value: 'Lucida Console' },
]

const FONT_SIZES = [
  { label: '8', value: '8pt' },
  { label: '9', value: '9pt' },
  { label: '10', value: '10pt' },
  { label: '11', value: '11pt' },
  { label: '12', value: '12pt' },
  { label: '14', value: '14pt' },
  { label: '16', value: '16pt' },
  { label: '18', value: '18pt' },
  { label: '20', value: '20pt' },
  { label: '24', value: '24pt' },
  { label: '28', value: '28pt' },
  { label: '32', value: '32pt' },
  { label: '36', value: '36pt' },
  { label: '48', value: '48pt' },
  { label: '72', value: '72pt' },
]

const HEADING_OPTIONS = [
  { label: 'Normal', value: '0' },
  { label: 'Überschrift 1', value: '1' },
  { label: 'Überschrift 2', value: '2' },
  { label: 'Überschrift 3', value: '3' },
  { label: 'Überschrift 4', value: '4' },
  { label: 'Überschrift 5', value: '5' },
  { label: 'Überschrift 6', value: '6' },
]

const LINE_HEIGHTS = [
  { label: '1.0', value: '1' },
  { label: '1.15', value: '1.15' },
  { label: '1.5', value: '1.5' },
  { label: '2.0', value: '2' },
  { label: '2.5', value: '2.5' },
  { label: '3.0', value: '3' },
]

interface ToolbarProps {
  editor: Editor
}

export function Toolbar({ editor }: ToolbarProps) {
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

  const insertImage = useCallback(() => {
    const url = prompt('Bild-URL eingeben:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const insertImageFromFile = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const src = reader.result as string
        editor.chain().focus().setImage({ src }).run()
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }, [editor])

  const insertTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  const insertLink = useCallback(() => {
    const url = prompt('URL eingeben:')
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }, [editor])

  return (
    <div className="bg-white border-b border-gray-200 px-3 py-1.5 flex flex-wrap items-center gap-1">
      {/* Undo/Redo */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Rückgängig (Ctrl+Z)" disabled={!editor.can().undo()}>
        <Undo2 size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Wiederholen (Ctrl+Y)" disabled={!editor.can().redo()}>
        <Redo2 size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Heading Style */}
      <ToolbarSelect
        value={getCurrentHeading()}
        onChange={handleHeadingChange}
        options={HEADING_OPTIONS}
        title="Absatzformat"
        className="w-36"
      />

      {/* Font Family */}
      <ToolbarSelect
        value={getCurrentFontFamily()}
        onChange={(v) => editor.chain().focus().setFontFamily(v).run()}
        options={FONT_FAMILIES}
        title="Schriftart"
        className="w-40"
      />

      {/* Font Size */}
      <ToolbarSelect
        value={getCurrentFontSize()}
        onChange={(v) => editor.chain().focus().setFontSize(v).run()}
        options={FONT_SIZES}
        title="Schriftgrösse"
        className="w-16"
      />

      <ToolbarDivider />

      {/* Text formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Fett (Ctrl+B)">
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Kursiv (Ctrl+I)">
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Unterstrichen (Ctrl+U)">
        <Underline size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Durchgestrichen">
        <Strikethrough size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} isActive={editor.isActive('subscript')} title="Tiefgestellt">
        <Subscript size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} isActive={editor.isActive('superscript')} title="Hochgestellt">
        <Superscript size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Colors */}
      <ToolbarColorInput
        value={textColor}
        onChange={(color) => {
          setTextColor(color)
          editor.chain().focus().setColor(color).run()
        }}
        title="Textfarbe"
      />
      <ToolbarColorInput
        value={highlightColor}
        onChange={(color) => {
          setHighlightColor(color)
          editor.chain().focus().toggleHighlight({ color }).run()
        }}
        title="Hervorhebungsfarbe"
      />

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Linksbündig">
        <AlignLeft size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Zentriert">
        <AlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Rechtsbündig">
        <AlignRight size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Blocksatz">
        <AlignJustify size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Aufzählung">
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Nummerierung">
        <ListOrdered size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} title="Aufgabenliste">
        <ListChecks size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Indent */}
      <ToolbarButton onClick={() => editor.chain().focus().sinkListItem('listItem').run()} title="Einzug vergrössern" disabled={!editor.can().sinkListItem('listItem')}>
        <Indent size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().liftListItem('listItem').run()} title="Einzug verkleinern" disabled={!editor.can().liftListItem('listItem')}>
        <Outdent size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Line Height */}
      <ToolbarSelect
        value="1.5"
        onChange={(v) => editor.chain().focus().setLineHeight(v).run()}
        options={LINE_HEIGHTS}
        title="Zeilenabstand"
        className="w-16"
      />

      <ToolbarDivider />

      {/* Insert */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockzitat">
        <Quote size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontale Linie">
        <Minus size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={insertImageFromFile} title="Bild einfügen">
        <FileImage size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={insertTable} title="Tabelle einfügen">
        <Table size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={insertLink} isActive={editor.isActive('link')} title="Link einfügen">
        <Link size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setPageBreak().run()} title="Seitenumbruch">
        <FileDown size={16} />
      </ToolbarButton>
    </div>
  )
}
