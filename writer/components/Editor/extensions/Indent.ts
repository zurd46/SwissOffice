import { Extension } from '@tiptap/core'

export type IndentOptions = {
  types: string[]
  minLevel: number
  maxLevel: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      increaseIndent: () => ReturnType
      decreaseIndent: () => ReturnType
    }
  }
}

export const Indent = Extension.create<IndentOptions>({
  name: 'indent',

  addOptions() {
    return {
      types: ['heading', 'paragraph'],
      minLevel: 0,
      maxLevel: 8,
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: element => {
              const marginLeft = element.style.marginLeft
              if (!marginLeft) return 0
              return Math.round(parseInt(marginLeft) / 40) || 0
            },
            renderHTML: attributes => {
              if (!attributes.indent || attributes.indent === 0) {
                return {}
              }
              return {
                style: `margin-left: ${(attributes.indent as number) * 40}px`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      increaseIndent: () => ({ tr, state, dispatch }) => {
        const { selection } = state
        const { from, to } = selection

        let changed = false
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const currentIndent = (node.attrs.indent as number) || 0
            if (currentIndent < this.options.maxLevel) {
              if (dispatch) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  indent: currentIndent + 1,
                })
              }
              changed = true
            }
          }
        })

        return changed
      },
      decreaseIndent: () => ({ tr, state, dispatch }) => {
        const { selection } = state
        const { from, to } = selection

        let changed = false
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const currentIndent = (node.attrs.indent as number) || 0
            if (currentIndent > this.options.minLevel) {
              if (dispatch) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  indent: currentIndent - 1,
                })
              }
              changed = true
            }
          }
        })

        return changed
      },
    }
  },
})
