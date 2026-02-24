import { Mark, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    trackDelete: {
      setTrackDelete: (author?: string) => ReturnType
      unsetTrackDelete: () => ReturnType
    }
  }
}

export const TrackDelete = Mark.create({
  name: 'trackDelete',

  addAttributes() {
    return {
      author: {
        default: 'Benutzer',
        parseHTML: element => element.getAttribute('data-author') || 'Benutzer',
        renderHTML: attributes => ({
          'data-author': attributes.author,
        }),
      },
      timestamp: {
        default: null,
        parseHTML: element => element.getAttribute('data-timestamp'),
        renderHTML: attributes => ({
          'data-timestamp': attributes.timestamp || String(Date.now()),
        }),
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'del[data-track]' },
      { tag: 'span[data-track-delete]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['del', mergeAttributes(HTMLAttributes, {
      'data-track': '',
      class: 'track-delete',
    }), 0]
  },

  addCommands() {
    return {
      setTrackDelete: (author?: string) => ({ commands }) => {
        return commands.setMark(this.name, {
          author: author || 'Benutzer',
          timestamp: String(Date.now()),
        })
      },
      unsetTrackDelete: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },
})
