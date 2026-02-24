import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    columnBreak: {
      setColumnBreak: () => ReturnType
    }
  }
}

export const ColumnBreak = Node.create({
  name: 'columnBreak',

  group: 'block',
  atom: true,
  selectable: true,

  parseHTML() {
    return [
      { tag: 'div[data-column-break]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-column-break': '',
      style: 'break-before: column; height: 0; margin: 0; padding: 0;',
    })]
  },

  addCommands() {
    return {
      setColumnBreak: () => ({ commands }) => {
        return commands.insertContent({ type: this.name })
      },
    }
  },
})
