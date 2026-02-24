import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    columnLayout: {
      setColumns: (count: 1 | 2 | 3 | 4) => ReturnType
      setColumnGap: (gap: string) => ReturnType
    }
  }
}

export const ColumnLayout = Extension.create({
  name: 'columnLayout',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'bulletList', 'orderedList', 'blockquote'],
        attributes: {
          columnCount: {
            default: null,
            parseHTML: element => {
              const cc = element.style.columnCount
              return cc ? parseInt(cc, 10) : null
            },
            renderHTML: attributes => {
              if (!attributes.columnCount || attributes.columnCount <= 1) return {}
              return {
                style: `column-count: ${attributes.columnCount}; column-gap: ${attributes.columnGap || '2em'}; column-rule: 1px solid #e0e0e0;`,
              }
            },
          },
          columnGap: {
            default: '2em',
            renderHTML: () => ({}), // rendered together with columnCount
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setColumns: (count: 1 | 2 | 3 | 4) => ({ editor, chain }) => {
        if (count <= 1) {
          return chain().updateAttributes('paragraph', { columnCount: null, columnGap: null }).run()
        }
        // Apply to the wrapping section/parent if possible
        const { from, to } = editor.state.selection
        let applied = false
        editor.state.doc.nodesBetween(from, to, (node, pos) => {
          if (['paragraph', 'heading', 'bulletList', 'orderedList', 'blockquote'].includes(node.type.name)) {
            const tr = editor.state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              columnCount: count,
              columnGap: '2em',
            })
            editor.view.dispatch(tr)
            applied = true
            return false // stop
          }
        })
        return applied
      },
      setColumnGap: (gap: string) => ({ editor }) => {
        const { from, to } = editor.state.selection
        let applied = false
        editor.state.doc.nodesBetween(from, to, (node, pos) => {
          if (node.attrs.columnCount) {
            const tr = editor.state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              columnGap: gap,
            })
            editor.view.dispatch(tr)
            applied = true
            return false
          }
        })
        return applied
      },
    }
  },
})
