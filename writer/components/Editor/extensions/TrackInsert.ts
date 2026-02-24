import { Mark, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    trackInsert: {
      setTrackInsert: (author?: string) => ReturnType
      unsetTrackInsert: () => ReturnType
      enableTracking: () => ReturnType
      disableTracking: () => ReturnType
    }
  }
}

const trackingKey = new PluginKey('trackChangesTracking')

// Shared state for tracking enabled
let trackingEnabled = false

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
      enableTracking: () => () => {
        trackingEnabled = true
        return true
      },
      disableTracking: () => () => {
        trackingEnabled = false
        return true
      },
    }
  },

  addProseMirrorPlugins() {
    const markType = this.type

    return [
      new Plugin({
        key: trackingKey,
        appendTransaction(transactions, _oldState, newState) {
          if (!trackingEnabled) return null

          // Only process transactions that have actual document changes from user input
          const hasDocChanges = transactions.some(tr => tr.docChanged && !tr.getMeta('trackChange'))
          if (!hasDocChanges) return null

          const tr = newState.tr
          tr.setMeta('trackChange', true)
          let modified = false

          // Look at each step to find inserted ranges
          for (const transaction of transactions) {
            if (!transaction.docChanged || transaction.getMeta('trackChange')) continue
            transaction.steps.forEach(step => {
              const map = step.getMap()
              map.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
                if (newEnd > newStart) {
                  // This is an insertion range - mark it
                  const mark = markType.create({
                    author: 'Benutzer',
                    timestamp: String(Date.now()),
                  })
                  // Clamp to valid doc range
                  const clampedEnd = Math.min(newEnd, newState.doc.content.size)
                  const clampedStart = Math.max(newStart, 0)
                  if (clampedStart < clampedEnd) {
                    tr.addMark(clampedStart, clampedEnd, mark)
                    modified = true
                  }
                }
              })
            })
          }

          return modified ? tr : null
        },
      }),
    ]
  },
})
