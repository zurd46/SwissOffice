'use client'

import { Editor } from '@tiptap/react'
import { useState, useCallback } from 'react'
import { X, Search, Replace, ChevronDown, ChevronUp } from 'lucide-react'

interface FindReplaceProps {
  editor: Editor
  onClose: () => void
}

export function FindReplace({ editor, onClose }: FindReplaceProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [matchCount, setMatchCount] = useState(0)
  const [currentMatch, setCurrentMatch] = useState(0)

  const findMatches = useCallback(() => {
    if (!searchTerm) {
      setMatchCount(0)
      setCurrentMatch(0)
      return []
    }

    const doc = editor.state.doc
    const matches: { from: number; to: number }[] = []
    const searchLower = searchTerm.toLowerCase()

    doc.descendants((node, pos) => {
      if (node.isText && node.text) {
        const text = node.text.toLowerCase()
        let index = text.indexOf(searchLower)
        while (index !== -1) {
          matches.push({
            from: pos + index,
            to: pos + index + searchTerm.length,
          })
          index = text.indexOf(searchLower, index + 1)
        }
      }
    })

    setMatchCount(matches.length)
    return matches
  }, [editor, searchTerm])

  const findNext = useCallback(() => {
    const matches = findMatches()
    if (matches.length === 0) return

    const next = (currentMatch + 1) % matches.length
    setCurrentMatch(next)

    const match = matches[next]
    editor.chain().focus().setTextSelection({ from: match.from, to: match.to }).run()
  }, [editor, findMatches, currentMatch])

  const findPrev = useCallback(() => {
    const matches = findMatches()
    if (matches.length === 0) return

    const prev = (currentMatch - 1 + matches.length) % matches.length
    setCurrentMatch(prev)

    const match = matches[prev]
    editor.chain().focus().setTextSelection({ from: match.from, to: match.to }).run()
  }, [editor, findMatches, currentMatch])

  const replaceOne = useCallback(() => {
    const matches = findMatches()
    if (matches.length === 0) return

    const match = matches[currentMatch]
    editor.chain()
      .focus()
      .setTextSelection({ from: match.from, to: match.to })
      .insertContent(replaceTerm)
      .run()
  }, [editor, findMatches, currentMatch, replaceTerm])

  const replaceAll = useCallback(() => {
    const matches = findMatches()
    if (matches.length === 0) return

    // Replace from end to start to preserve positions
    const sortedMatches = [...matches].sort((a, b) => b.from - a.from)
    const chain = editor.chain().focus()

    sortedMatches.forEach(match => {
      chain.setTextSelection({ from: match.from, to: match.to }).insertContent(replaceTerm)
    })

    chain.run()
    setMatchCount(0)
    setCurrentMatch(0)
  }, [editor, findMatches, replaceTerm])

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 shadow-sm">
      {/* Search */}
      <div className="flex items-center gap-2">
        <Search size={14} className="text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentMatch(0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') findNext()
          }}
          placeholder="Suchen..."
          className="border border-gray-300 rounded px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
          autoFocus
        />
        {matchCount > 0 && (
          <span className="text-xs text-gray-500">{currentMatch + 1}/{matchCount}</span>
        )}
        <button onClick={findPrev} className="p-1 hover:bg-gray-100 rounded" title="Vorherige">
          <ChevronUp size={14} />
        </button>
        <button onClick={findNext} className="p-1 hover:bg-gray-100 rounded" title="Nächste">
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Replace */}
      <div className="flex items-center gap-2">
        <Replace size={14} className="text-gray-400" />
        <input
          type="text"
          value={replaceTerm}
          onChange={(e) => setReplaceTerm(e.target.value)}
          placeholder="Ersetzen..."
          className="border border-gray-300 rounded px-2 py-1 text-sm w-48 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={replaceOne}
          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
        >
          Ersetzen
        </button>
        <button
          onClick={replaceAll}
          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
        >
          Alle ersetzen
        </button>
      </div>

      {/* Close */}
      <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded ml-auto" title="Schliessen">
        <X size={14} />
      </button>
    </div>
  )
}
