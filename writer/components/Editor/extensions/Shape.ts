import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ShapeNodeView } from '../nodeviews/ShapeNodeView'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    shape: {
      insertShape: (shapeType: string, attrs?: Record<string, unknown>) => ReturnType
    }
  }
}

export const Shape = Node.create({
  name: 'shape',

  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      shapeType: {
        default: 'rectangle',
        parseHTML: element => element.getAttribute('data-shape-type') || 'rectangle',
        renderHTML: attributes => ({
          'data-shape-type': attributes.shapeType,
        }),
      },
      width: {
        default: 150,
        parseHTML: element => parseInt(element.getAttribute('data-width') || '150', 10),
        renderHTML: attributes => ({
          'data-width': String(attributes.width),
        }),
      },
      height: {
        default: 80,
        parseHTML: element => parseInt(element.getAttribute('data-height') || '80', 10),
        renderHTML: attributes => ({
          'data-height': String(attributes.height),
        }),
      },
      fillColor: {
        default: '#4a90d9',
        parseHTML: element => element.getAttribute('data-fill') || '#4a90d9',
        renderHTML: attributes => ({
          'data-fill': attributes.fillColor,
        }),
      },
      strokeColor: {
        default: '#2c5f8a',
        parseHTML: element => element.getAttribute('data-stroke') || '#2c5f8a',
        renderHTML: attributes => ({
          'data-stroke': attributes.strokeColor,
        }),
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'div[data-shape]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-shape': '',
      class: 'shape-node',
      style: `display: inline-block; margin: 8px 0;`,
    })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ShapeNodeView)
  },

  addCommands() {
    return {
      insertShape: (shapeType: string, attrs: Record<string, unknown> = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { shapeType, ...attrs },
        })
      },
    }
  },
})
