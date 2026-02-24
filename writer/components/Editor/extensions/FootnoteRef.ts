import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    footnoteRef: {
      insertFootnote: (footnoteId: string, number: number) => ReturnType
    }
  }
}

export const FootnoteRef = Node.create({
  name: 'footnoteRef',

  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      footnoteId: {
        default: null,
        parseHTML: element => element.getAttribute('data-footnote-id'),
        renderHTML: attributes => ({
          'data-footnote-id': attributes.footnoteId,
        }),
      },
      number: {
        default: 1,
        parseHTML: element => parseInt(element.getAttribute('data-footnote-number') || '1', 10),
        renderHTML: attributes => ({
          'data-footnote-number': String(attributes.number),
        }),
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'sup[data-footnote-id]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['sup', mergeAttributes(HTMLAttributes, {
      class: 'footnote-ref',
      style: 'color: #0078d4; cursor: pointer; font-size: 0.75em; vertical-align: super;',
    }), String(HTMLAttributes['data-footnote-number'] || '1')]
  },

  addCommands() {
    return {
      insertFootnote: (footnoteId: string, number: number) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { footnoteId, number },
        })
      },
    }
  },
})
