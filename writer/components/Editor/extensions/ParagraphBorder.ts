import { Extension } from '@tiptap/core'

export type ParagraphBorderOptions = {
  types: string[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paragraphBorder: {
      setParagraphBorder: (options: {
        borderTop?: string
        borderBottom?: string
        borderLeft?: string
        borderRight?: string
        backgroundColor?: string
      }) => ReturnType
      unsetParagraphBorder: () => ReturnType
    }
  }
}

export const ParagraphBorder = Extension.create<ParagraphBorderOptions>({
  name: 'paragraphBorder',

  addOptions() {
    return {
      types: ['heading', 'paragraph'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          borderTop: {
            default: null,
            parseHTML: element => element.style.borderTop || null,
            renderHTML: attributes => {
              if (!attributes.borderTop) return {}
              return { style: `border-top: ${attributes.borderTop}` }
            },
          },
          borderBottom: {
            default: null,
            parseHTML: element => element.style.borderBottom || null,
            renderHTML: attributes => {
              if (!attributes.borderBottom) return {}
              return { style: `border-bottom: ${attributes.borderBottom}` }
            },
          },
          borderLeft: {
            default: null,
            parseHTML: element => element.style.borderLeft || null,
            renderHTML: attributes => {
              if (!attributes.borderLeft) return {}
              return { style: `border-left: ${attributes.borderLeft}` }
            },
          },
          borderRight: {
            default: null,
            parseHTML: element => element.style.borderRight || null,
            renderHTML: attributes => {
              if (!attributes.borderRight) return {}
              return { style: `border-right: ${attributes.borderRight}` }
            },
          },
          paragraphBackgroundColor: {
            default: null,
            parseHTML: element => element.getAttribute('data-bg-color') || null,
            renderHTML: attributes => {
              if (!attributes.paragraphBackgroundColor) return {}
              return {
                'data-bg-color': attributes.paragraphBackgroundColor,
                style: `background-color: ${attributes.paragraphBackgroundColor}; padding: 4px 8px;`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setParagraphBorder: (options) => ({ commands }) => {
        return this.options.types.every(type =>
          commands.updateAttributes(type, options)
        )
      },
      unsetParagraphBorder: () => ({ commands }) => {
        return this.options.types.every(type =>
          commands.resetAttributes(type, ['borderTop', 'borderBottom', 'borderLeft', 'borderRight', 'paragraphBackgroundColor'])
        )
      },
    }
  },
})
