import { Mark, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    trackInsert: {
      setTrackInsert: (author?: string) => ReturnType
      unsetTrackInsert: () => ReturnType
    }
  }
}

export const TrackInsert = Mark.create({
  name: 'trackInsert',

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
      { tag: 'ins[data-track]' },
      { tag: 'span[data-track-insert]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['ins', mergeAttributes(HTMLAttributes, {
      'data-track': '',
      class: 'track-insert',
    }), 0]
  },

  addCommands() {
    return {
      setTrackInsert: (author?: string) => ({ commands }) => {
        return commands.setMark(this.name, {
          author: author || 'Benutzer',
          timestamp: String(Date.now()),
        })
      },
      unsetTrackInsert: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },
})
