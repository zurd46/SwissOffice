import { Extension } from '@tiptap/core'

export const TableCellBackground = Extension.create({
  name: 'tableCellBackground',

  addGlobalAttributes() {
    return [
      {
        types: ['tableCell', 'tableHeader'],
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: element => element.style.backgroundColor || null,
            renderHTML: attributes => {
              if (!attributes.backgroundColor) return {}
              return { style: `background-color: ${attributes.backgroundColor}` }
            },
          },
          borderColor: {
            default: null,
            parseHTML: element => element.style.borderColor || null,
            renderHTML: attributes => {
              if (!attributes.borderColor) return {}
              return { style: `border-color: ${attributes.borderColor}` }
            },
          },
          verticalAlign: {
            default: 'top',
            parseHTML: element => element.style.verticalAlign || 'top',
            renderHTML: attributes => {
              if (attributes.verticalAlign === 'top') return {}
              return { style: `vertical-align: ${attributes.verticalAlign}` }
            },
          },
        },
      },
    ]
  },
})

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableCellBackground: {
      setCellBackground: (color: string) => ReturnType
      unsetCellBackground: () => ReturnType
    }
  }
}
