import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mergeField: {
      insertMergeField: (fieldName: string) => ReturnType
    }
  }
}

export const MergeField = Node.create({
  name: 'mergeField',

  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      fieldName: {
        default: 'Feld',
        parseHTML: element => element.getAttribute('data-merge-field') || 'Feld',
        renderHTML: attributes => ({
          'data-merge-field': attributes.fieldName,
        }),
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'span[data-merge-field]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const fieldName = HTMLAttributes['data-merge-field'] || 'Feld'
    return ['span', mergeAttributes(HTMLAttributes, {
      class: 'merge-field',
      style: 'background-color: #e0f2fe; color: #0369a1; padding: 1px 6px; border-radius: 3px; font-size: 0.9em; border: 1px solid #7dd3fc; font-family: system-ui;',
      contenteditable: 'false',
    }), `\u00AB${fieldName}\u00BB`]
  },

  addCommands() {
    return {
      insertMergeField: (fieldName: string) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { fieldName },
        })
      },
    }
  },
})
