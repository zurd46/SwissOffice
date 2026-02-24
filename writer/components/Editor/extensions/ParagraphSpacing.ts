import { Extension } from '@tiptap/core'

export type ParagraphSpacingOptions = {
  types: string[]
  defaultSpaceBefore: string
  defaultSpaceAfter: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paragraphSpacing: {
      setSpaceBefore: (value: string) => ReturnType
      setSpaceAfter: (value: string) => ReturnType
      unsetSpaceBefore: () => ReturnType
      unsetSpaceAfter: () => ReturnType
    }
  }
}

export const ParagraphSpacing = Extension.create<ParagraphSpacingOptions>({
  name: 'paragraphSpacing',

  addOptions() {
    return {
      types: ['heading', 'paragraph'],
      defaultSpaceBefore: '0pt',
      defaultSpaceAfter: '8pt',
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          spaceBefore: {
            default: this.options.defaultSpaceBefore,
            parseHTML: element => element.style.marginTop || this.options.defaultSpaceBefore,
            renderHTML: attributes => {
              if (attributes.spaceBefore === this.options.defaultSpaceBefore) {
                return {}
              }
              return { style: `margin-top: ${attributes.spaceBefore}` }
            },
          },
          spaceAfter: {
            default: this.options.defaultSpaceAfter,
            parseHTML: element => element.style.marginBottom || this.options.defaultSpaceAfter,
            renderHTML: attributes => {
              if (attributes.spaceAfter === this.options.defaultSpaceAfter) {
                return {}
              }
              return { style: `margin-bottom: ${attributes.spaceAfter}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setSpaceBefore: (value: string) => ({ commands }) => {
        return this.options.types.every(type =>
          commands.updateAttributes(type, { spaceBefore: value })
        )
      },
      setSpaceAfter: (value: string) => ({ commands }) => {
        return this.options.types.every(type =>
          commands.updateAttributes(type, { spaceAfter: value })
        )
      },
      unsetSpaceBefore: () => ({ commands }) => {
        return this.options.types.every(type =>
          commands.resetAttributes(type, 'spaceBefore')
        )
      },
      unsetSpaceAfter: () => ({ commands }) => {
        return this.options.types.every(type =>
          commands.resetAttributes(type, 'spaceAfter')
        )
      },
    }
  },
})
