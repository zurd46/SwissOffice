import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    advancedList: {
      setListType: (type: 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman') => ReturnType
      restartNumbering: (start: number) => ReturnType
    }
  }
}

export const AdvancedList = Extension.create({
  name: 'advancedList',

  addGlobalAttributes() {
    return [
      {
        types: ['orderedList'],
        attributes: {
          listStyleType: {
            default: 'decimal',
            parseHTML: element => element.style.listStyleType || 'decimal',
            renderHTML: attributes => {
              if (attributes.listStyleType && attributes.listStyleType !== 'decimal') {
                return { style: `list-style-type: ${attributes.listStyleType}` }
              }
              return {}
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setListType: (type: string) => ({ editor, commands }) => {
        if (!editor.isActive('orderedList')) {
          return false
        }
        return commands.updateAttributes('orderedList', { listStyleType: type })
      },
      restartNumbering: (start: number) => ({ editor, commands }) => {
        if (!editor.isActive('orderedList')) {
          return false
        }
        return commands.updateAttributes('orderedList', { start })
      },
    }
  },
})
