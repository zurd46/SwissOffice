import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ResizableImageView } from '../nodeviews/ResizableImageView'

export type TextWrap = 'inline' | 'break' | 'wrap-left' | 'wrap-right'

export interface ResizableImageOptions {
  inline: boolean
  allowBase64: boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      setResizableImage: (options: { src: string; alt?: string; title?: string; width?: number; textWrap?: TextWrap }) => ReturnType
    }
  }
}

export const ResizableImage = Node.create<ResizableImageOptions>({
  name: 'resizableImage',

  group: 'block',

  atom: true,

  draggable: true,

  addOptions() {
    return {
      inline: false,
      allowBase64: true,
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
        parseHTML: element => {
          const img = element.querySelector('img') || element
          return img.getAttribute('width') ? parseInt(img.getAttribute('width')!) : null
        },
      },
      height: {
        default: null,
        parseHTML: element => {
          const img = element.querySelector('img') || element
          return img.getAttribute('height') ? parseInt(img.getAttribute('height')!) : null
        },
      },
      textWrap: {
        default: 'inline' as TextWrap,
        parseHTML: element => element.getAttribute('data-text-wrap') || 'inline',
        renderHTML: attributes => ({
          'data-text-wrap': attributes.textWrap,
        }),
      },
      alignment: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-alignment') || 'center',
        renderHTML: attributes => ({
          'data-alignment': attributes.alignment,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-resizable-image]',
      },
      {
        tag: 'img[src]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-resizable-image': '',
    }), ['img', { src: HTMLAttributes.src, alt: HTMLAttributes.alt || '', title: HTMLAttributes.title || '' }]]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView)
  },

  addCommands() {
    return {
      setResizableImage: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },
})
