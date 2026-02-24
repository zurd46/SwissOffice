import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textBox: {
      insertTextBox: (attrs?: { width?: number; height?: number }) => ReturnType
    }
  }
}

export const TextBox = Node.create({
  name: 'textBox',

  group: 'block',
  content: 'block+',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      width: {
        default: 200,
        parseHTML: element => parseInt(element.getAttribute('data-width') || '200', 10),
        renderHTML: attributes => ({
          'data-width': String(attributes.width),
        }),
      },
      height: {
        default: 100,
        parseHTML: element => parseInt(element.getAttribute('data-height') || '100', 10),
        renderHTML: attributes => ({
          'data-height': String(attributes.height),
        }),
      },
      borderColor: {
        default: '#333333',
        parseHTML: element => element.getAttribute('data-border-color') || '#333333',
        renderHTML: attributes => ({
          'data-border-color': attributes.borderColor,
        }),
      },
      backgroundColor: {
        default: 'transparent',
        parseHTML: element => element.getAttribute('data-bg-color') || 'transparent',
        renderHTML: attributes => ({
          'data-bg-color': attributes.backgroundColor,
        }),
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'div[data-text-box]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const width = HTMLAttributes['data-width'] || 200
    const height = HTMLAttributes['data-height'] || 100
    const borderColor = HTMLAttributes['data-border-color'] || '#333333'
    const bgColor = HTMLAttributes['data-bg-color'] || 'transparent'

    return ['div', mergeAttributes(HTMLAttributes, {
      'data-text-box': '',
      class: 'text-box',
      style: `width: ${width}px; min-height: ${height}px; border: 1px solid ${borderColor}; background-color: ${bgColor}; padding: 8px; margin: 8px 0; position: relative; cursor: text;`,
    }), 0]
  },

  addCommands() {
    return {
      insertTextBox: (attrs = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { width: attrs.width || 200, height: attrs.height || 100 },
          content: [{ type: 'paragraph' }],
        })
      },
    }
  },
})
