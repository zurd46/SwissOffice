'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import FontFamily from '@tiptap/extension-font-family'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Typography from '@tiptap/extension-typography'
import { FontSize } from './extensions/FontSize'
import { LineHeight } from './extensions/LineHeight'
import { PageBreak } from './extensions/PageBreak'
import { PasteHandler } from './extensions/PasteHandler'
import { ParagraphSpacing } from './extensions/ParagraphSpacing'
import { RibbonToolbar } from '../Toolbar/Ribbon/RibbonToolbar'
import { MenuBar } from '../Toolbar/MenuBar'
import { StatusBar } from '../StatusBar/StatusBar'
import { FindReplace } from '../Dialogs/FindReplace'
import { Sidebar } from '../Sidebar/Sidebar'
import { AIChatSidebar } from '../AI/AIChatSidebar'
import { AISettingsDialog } from '../AI/AISettingsDialog'
import { SettingsDialog } from '../Dialogs/SettingsDialog'
import { AIContextProvider } from '../../lib/ai/aiContext'
import { defaultContent } from '../../lib/defaultContent'
import { saveDocument, saveAsHTML, loadDocument, newDocument, printDocument } from '../../lib/fileOperations'
import { exportPDF } from '../Export/exportPDF'
import { exportDOCX } from '../Export/exportDOCX'
import { useState, useCallback, useEffect } from 'react'

// Electron API type
declare global {
  interface Window {
    electronAPI?: {
      onMenuAction: (callback: (action: string) => void) => () => void
      setTitle: (title: string) => void
      setDocumentEdited: (edited: boolean) => void
      isElectron: boolean
    }
  }
}

export function WriterEditor() {
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [documentName, setDocumentName] = useState('Unbenannt')
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.isElectron

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        bulletList: { keepMarks: true, keepAttributes: true },
        orderedList: { keepMarks: true, keepAttributes: true },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      FontFamily,
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Beginnen Sie mit der Eingabe...',
      }),
      CharacterCount,
      Typography.configure({
        openDoubleQuote: '\u201E',
        closeDoubleQuote: '\u201C',
        openSingleQuote: '\u201A',
        closeSingleQuote: '\u2018',
      }),
      FontSize,
      LineHeight,
      PageBreak,
      PasteHandler,
    ],
    content: defaultContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[297mm] p-[25mm] font-serif',
      },
    },
  })

  const toggleFindReplace = useCallback(() => {
    setShowFindReplace(prev => !prev)
  }, [])

  const toggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev)
  }, [])

  const toggleAIChat = useCallback(() => {
    setShowAIChat(prev => !prev)
  }, [])

  // Electron native menu handler
  useEffect(() => {
    if (!editor || !window.electronAPI) return

    const cleanup = window.electronAPI.onMenuAction((action: string) => {
      switch (action) {
        case 'new':
          newDocument(editor)
          setDocumentName('Unbenannt')
          break
        case 'open':
          loadDocument(editor)
          break
        case 'save':
          saveDocument(editor, documentName)
          break
        case 'export-pdf':
          exportPDF(editor, documentName)
          break
        case 'export-docx':
          exportDOCX(editor, documentName)
          break
        case 'export-html':
          saveAsHTML(editor, documentName)
          break
        case 'print':
          printDocument()
          break
        case 'undo':
          editor.chain().focus().undo().run()
          break
        case 'redo':
          editor.chain().focus().redo().run()
          break
        case 'find-replace':
          setShowFindReplace(prev => !prev)
          break
        case 'bold':
          editor.chain().focus().toggleBold().run()
          break
        case 'italic':
          editor.chain().focus().toggleItalic().run()
          break
        case 'underline':
          editor.chain().focus().toggleUnderline().run()
          break
        case 'clear-format':
          editor.chain().focus().clearNodes().unsetAllMarks().unsetFontSize().unsetColor().unsetHighlight().unsetFontFamily().unsetLineHeight().setTextAlign('left').run()
          break
        case 'insert-image': {
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'image/*'
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => {
              editor.chain().focus().setImage({ src: reader.result as string }).run()
            }
            reader.readAsDataURL(file)
          }
          input.click()
          break
        }
        case 'insert-table':
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          break
        case 'insert-link': {
          const url = prompt('URL eingeben:')
          if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
          break
        }
        case 'insert-hr':
          editor.chain().focus().setHorizontalRule().run()
          break
        case 'insert-page-break':
          editor.chain().focus().setPageBreak().run()
          break
        case 'toggle-sidebar':
          setShowSidebar(prev => !prev)
          break
        case 'toggle-ai-chat':
          setShowAIChat(prev => !prev)
          break
        case 'zoom-in':
          setZoom(prev => Math.min(200, prev + 10))
          break
        case 'zoom-out':
          setZoom(prev => Math.max(25, prev - 10))
          break
        case 'zoom-reset':
          setZoom(100)
          break
      }
    })

    return cleanup
  }, [editor, documentName])

  // Sync document title with Electron window
  useEffect(() => {
    if (isElectron) {
      window.electronAPI!.setTitle(documentName)
    }
  }, [documentName, isElectron])

  if (!editor) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
        <div style={{ color: '#888' }}>Editor wird geladen...</div>
      </div>
    )
  }

  return (
    <AIContextProvider>
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
      {/* Menu Bar - hidden in Electron (native menu takes over) */}
      {!isElectron && (
        <MenuBar
          editor={editor}
          documentName={documentName}
          setDocumentName={setDocumentName}
          onToggleFindReplace={toggleFindReplace}
          onToggleSidebar={toggleSidebar}
        />
      )}

      {/* Toolbar / Ribbon */}
      <RibbonToolbar
        editor={editor}
        onToggleFindReplace={toggleFindReplace}
        onToggleSidebar={toggleSidebar}
        showSidebar={showSidebar}
        onToggleAIChat={toggleAIChat}
        showAIChat={showAIChat}
        zoom={zoom}
        setZoom={setZoom}
        isElectron={isElectron}
      />

      {/* Find & Replace */}
      {showFindReplace && (
        <FindReplace editor={editor} onClose={() => setShowFindReplace(false)} />
      )}

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        {showSidebar && <Sidebar editor={editor} />}

        {/* Editor Area with A4 Page */}
        <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#e5e5e5', padding: '32px 0', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              border: '1px solid #d0d0d0',
              position: 'relative',
              width: `${210 * (zoom / 100)}mm`,
              minHeight: `${297 * (zoom / 100)}mm`,
              transformOrigin: 'top center',
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* AI Chat Sidebar */}
        {showAIChat && <AIChatSidebar editor={editor} onClose={() => setShowAIChat(false)} />}
      </div>

      {/* Status Bar */}
      <StatusBar editor={editor} zoom={zoom} setZoom={setZoom} />

      {/* AI Settings Dialog */}
      <AISettingsDialog />
    </div>
    </AIContextProvider>
  )
}
