import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    citation: {
      insertCitation: (bibId: string, displayText: string) => ReturnType
    }
  }
}

export const Citation = Node.create({
  name: 'citation',

  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      bibId: {
        default: null,
        parseHTML: element => element.getAttribute('data-bib-id'),
        renderHTML: attributes => ({
          'data-bib-id': attributes.bibId,
        }),
      },
      displayText: {
        default: '',
        parseHTML: element => element.getAttribute('data-display-text') || element.textContent,
        renderHTML: attributes => ({
          'data-display-text': attributes.displayText,
        }),
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'span[data-bib-id]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, {
      class: 'citation-ref',
      style: 'color: #0078d4; cursor: pointer;',
    }), HTMLAttributes['data-display-text'] || '']
  },

  addCommands() {
    return {
      insertCitation: (bibId: string, displayText: string) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { bibId, displayText },
        })
      },
    }
  },
})
