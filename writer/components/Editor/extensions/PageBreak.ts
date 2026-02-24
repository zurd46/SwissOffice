import { Node, mergeAttributes } from '@tiptap/core'

export const PageBreak = Node.create({
  name: 'pageBreak',

  group: 'block',

  parseHTML() {
    return [
      {
        tag: 'div[data-page-break]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-page-break': '',
      style: 'page-break-after: always; break-after: page; border-top: 2px dashed #ccc; margin: 20px 0; height: 0;'
    })]
  },

  addCommands() {
    return {
      setPageBreak: () => ({ commands }) => {
        return commands.insertContent({ type: this.name })
      },
    }
  },
})

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      setPageBreak: () => ReturnType
    }
  }
}
