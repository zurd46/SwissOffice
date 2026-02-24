'use client'

import { Editor } from '@tiptap/react'
import { useState, useCallback } from 'react'
import { X, Search, Replace, ChevronDown, ChevronUp, CaseSensitive, WholeWord } from 'lucide-react'

interface FindReplaceProps {
  editor: Editor
  onClose: () => void
}

export function FindReplace({ editor, onClose }: FindReplaceProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [matchCount, setMatchCount] = useState(0)
  const [currentMatch, setCurrentMatch] = useState(0)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)

  const findMatches = useCallback(() => {
    if (!searchTerm) {
      setMatchCount(0)
      setCurrentMatch(0)
      return []
    }

    const doc = editor.state.doc
    const matches: { from: number; to: number }[] = []

    doc.descendants((node, pos) => {
      if (node.isText && node.text) {
        const text = caseSensitive ? node.text : node.text.toLowerCase()
        const search = caseSensitive ? searchTerm : searchTerm.toLowerCase()

        let index = text.indexOf(search)
        while (index !== -1) {
          const from = pos + index
          const to = from + searchTerm.length

          if (wholeWord) {
            const beforeChar = index > 0 ? node.text![index - 1] : ' '
            const afterChar = index + searchTerm.length < node.text!.length ? node.text![index + searchTerm.length] : ' '
            const isWordBoundaryBefore = /\W/.test(beforeChar)
            const isWordBoundaryAfter = /\W/.test(afterChar)
            if (isWordBoundaryBefore && isWordBoundaryAfter) {
              matches.push({ from, to })
            }
          } else {
            matches.push({ from, to })
          }

          index = text.indexOf(search, index + 1)
        }
      }
    })

    setMatchCount(matches.length)
    return matches
  }, [editor, searchTerm, caseSensitive, wholeWord])

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

    const { tr } = editor.state
    const sortedMatches = [...matches].sort((a, b) => b.from - a.from)

    sortedMatches.forEach(match => {
      tr.replaceWith(match.from, match.to, editor.state.schema.text(replaceTerm))
    })

    editor.view.dispatch(tr)
    setMatchCount(0)
    setCurrentMatch(0)
  }, [editor, findMatches, replaceTerm])

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: 4,
    borderRadius: 3,
    border: active ? '1px solid #0078d4' : '1px solid transparent',
    backgroundColor: active ? '#e0f0ff' : 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: active ? '#0078d4' : '#999',
  })

  const inputStyle: React.CSSProperties = {
    border: '1px solid #c8c6c4',
    borderRadius: 4,
    padding: '4px 8px',
    fontSize: 13,
    width: 192,
    outline: 'none',
  }

  const btnStyle: React.CSSProperties = {
    padding: '4px 10px',
    fontSize: 11,
    backgroundColor: '#f3f2f1',
    border: '1px solid #c8c6c4',
    borderRadius: 3,
    cursor: 'pointer',
    color: '#323130',
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e1dfdd',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Search size={14} style={{ color: '#a19f9d' }} />
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
          style={inputStyle}
          autoFocus
        />
        {matchCount > 0 && (
          <span style={{ fontSize: 11, color: '#a19f9d', whiteSpace: 'nowrap' }}>
            {currentMatch + 1}/{matchCount}
          </span>
        )}
        <button onClick={findPrev} style={toggleBtnStyle(false)} title="Vorherige">
          <ChevronUp size={14} />
        </button>
        <button onClick={findNext} style={toggleBtnStyle(false)} title="Nächste">
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <button
          onClick={() => setCaseSensitive(!caseSensitive)}
          style={toggleBtnStyle(caseSensitive)}
          title="Gross-/Kleinschreibung beachten"
        >
          <CaseSensitive size={14} />
        </button>
        <button
          onClick={() => setWholeWord(!wholeWord)}
          style={toggleBtnStyle(wholeWord)}
          title="Ganzes Wort"
        >
          <WholeWord size={14} />
        </button>
      </div>

      {/* Replace */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Replace size={14} style={{ color: '#a19f9d' }} />
        <input
          type="text"
          value={replaceTerm}
          onChange={(e) => setReplaceTerm(e.target.value)}
          placeholder="Ersetzen..."
          style={inputStyle}
        />
        <button onClick={replaceOne} style={btnStyle}>
          Ersetzen
        </button>
        <button onClick={replaceAll} style={btnStyle}>
          Alle ersetzen
        </button>
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        style={{ ...toggleBtnStyle(false), marginLeft: 'auto' }}
        title="Schliessen"
      >
        <X size={14} />
      </button>
    </div>
  )
}
