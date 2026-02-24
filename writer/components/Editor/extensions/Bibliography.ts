import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bibliography: {
      insertBibliography: () => ReturnType
    }
  }
}

export const Bibliography = Node.create({
  name: 'bibliography',

  group: 'block',
  atom: true,

  addAttributes() {
    return {
      style: {
        default: 'apa',
        parseHTML: element => element.getAttribute('data-citation-style') || 'apa',
        renderHTML: attributes => ({
          'data-citation-style': attributes.style,
        }),
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'div[data-bibliography]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-bibliography': '',
      class: 'bibliography-block',
      style: 'border-top: 2px solid #d1d5db; margin-top: 2em; padding-top: 1em;',
    }), ['h3', { style: 'font-size: 14pt; font-weight: 700; margin-bottom: 0.5em;' }, 'Literaturverzeichnis'], ['div', { class: 'bibliography-entries', style: 'font-size: 11pt; line-height: 1.6;' }, '(Wird automatisch generiert)']]
  },

  addCommands() {
    return {
      insertBibliography: () => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
        })
      },
    }
  },
})
