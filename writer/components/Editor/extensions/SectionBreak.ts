import { Node, mergeAttributes } from '@tiptap/core'

export type SectionBreakType = 'nextPage' | 'continuous' | 'evenPage' | 'oddPage'

export const SectionBreak = Node.create({
  name: 'sectionBreak',

  group: 'block',

  defining: true,

  addAttributes() {
    return {
      breakType: {
        default: 'nextPage' as SectionBreakType,
        parseHTML: element => element.getAttribute('data-break-type') || 'nextPage',
        renderHTML: attributes => ({
          'data-break-type': attributes.breakType,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-section-break]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-section-break': '',
      style: 'page-break-after: always; break-after: page; border-top: 2px dashed #9ca3af; margin: 24px 0; height: 0; position: relative;',
    })]
  },

  addCommands() {
    return {
      setSectionBreak: (breakType: SectionBreakType = 'nextPage') => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { breakType },
        })
      },
    }
  },
})

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    sectionBreak: {
      setSectionBreak: (breakType?: SectionBreakType) => ReturnType
    }
  }
}
