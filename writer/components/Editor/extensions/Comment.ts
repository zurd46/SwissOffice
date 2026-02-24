import { Mark, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      setComment: (commentId: string) => ReturnType
      unsetComment: () => ReturnType
    }
  }
}

export const Comment = Mark.create({
  name: 'comment',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: element => element.getAttribute('data-comment-id'),
        renderHTML: attributes => ({
          'data-comment-id': attributes.commentId,
        }),
      },
      resolved: {
        default: false,
        parseHTML: element => element.getAttribute('data-resolved') === 'true',
        renderHTML: attributes => ({
          'data-resolved': String(attributes.resolved),
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-comment-id]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      class: `comment-highlight ${HTMLAttributes['data-resolved'] === 'true' ? 'comment-resolved' : ''}`,
    }), 0]
  },

  addCommands() {
    return {
      setComment: (commentId: string) => ({ commands }) => {
        return commands.setMark(this.name, { commentId })
      },
      unsetComment: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },
})
