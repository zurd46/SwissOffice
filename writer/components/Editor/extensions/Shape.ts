import { Node, mergeAttributes } from '@tiptap/core'

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
    const w = HTMLAttributes['data-width'] || 150
    const h = HTMLAttributes['data-height'] || 80
    const fill = HTMLAttributes['data-fill'] || '#4a90d9'
    const stroke = HTMLAttributes['data-stroke'] || '#2c5f8a'
    const shapeType = HTMLAttributes['data-shape-type'] || 'rectangle'

    let svgContent = ''
    switch (shapeType) {
      case 'ellipse':
        svgContent = `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2 - 2}" ry="${h / 2 - 2}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`
        break
      case 'arrow-right':
        svgContent = `<polygon points="0,${h * 0.25} ${w * 0.65},${h * 0.25} ${w * 0.65},0 ${w},${h / 2} ${w * 0.65},${h} ${w * 0.65},${h * 0.75} 0,${h * 0.75}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`
        break
      case 'line':
        svgContent = `<line x1="0" y1="${h / 2}" x2="${w}" y2="${h / 2}" stroke="${stroke}" stroke-width="3"/>`
        break
      default: // rectangle
        svgContent = `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="3" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`
    }

    return ['div', mergeAttributes(HTMLAttributes, {
      'data-shape': '',
      class: 'shape-node',
      style: `display: inline-block; margin: 8px 0;`,
    }), ['svg', {
      width: String(w),
      height: String(h),
      viewBox: `0 0 ${w} ${h}`,
      xmlns: 'http://www.w3.org/2000/svg',
      innerHTML: svgContent,
    }]]
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
