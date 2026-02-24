import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tabStop: {
      addTabStop: (position: number, alignment?: 'left' | 'center' | 'right' | 'decimal') => ReturnType
      removeTabStop: (position: number) => ReturnType
      clearTabStops: () => ReturnType
    }
  }
}

export interface TabStopDefinition {
  position: number // in mm from left margin
  alignment: 'left' | 'center' | 'right' | 'decimal'
}

export const TabStop = Extension.create({
  name: 'tabStop',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          tabStops: {
            default: null,
            parseHTML: element => {
              const data = element.getAttribute('data-tab-stops')
              if (data) {
                try { return JSON.parse(data) } catch { return null }
              }
              return null
            },
            renderHTML: attributes => {
              if (!attributes.tabStops) return {}
              return {
                'data-tab-stops': JSON.stringify(attributes.tabStops),
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      addTabStop: (position: number, alignment: 'left' | 'center' | 'right' | 'decimal' = 'left') => ({ editor }) => {
        const { from, to } = editor.state.selection
        let applied = false
        editor.state.doc.nodesBetween(from, to, (node, pos) => {
          if (['paragraph', 'heading'].includes(node.type.name)) {
            const existing: TabStopDefinition[] = node.attrs.tabStops || []
            const updated = [...existing.filter(t => t.position !== position), { position, alignment }]
              .sort((a, b) => a.position - b.position)
            const tr = editor.state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              tabStops: updated,
            })
            editor.view.dispatch(tr)
            applied = true
            return false
          }
        })
        return applied
      },
      removeTabStop: (position: number) => ({ editor }) => {
        const { from, to } = editor.state.selection
        let applied = false
        editor.state.doc.nodesBetween(from, to, (node, pos) => {
          if (['paragraph', 'heading'].includes(node.type.name) && node.attrs.tabStops) {
            const updated = (node.attrs.tabStops as TabStopDefinition[]).filter(t => t.position !== position)
            const tr = editor.state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              tabStops: updated.length > 0 ? updated : null,
            })
            editor.view.dispatch(tr)
            applied = true
            return false
          }
        })
        return applied
      },
      clearTabStops: () => ({ editor }) => {
        const { from, to } = editor.state.selection
        let applied = false
        editor.state.doc.nodesBetween(from, to, (node, pos) => {
          if (['paragraph', 'heading'].includes(node.type.name) && node.attrs.tabStops) {
            const tr = editor.state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              tabStops: null,
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
