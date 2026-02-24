import type { DocumentSettings } from './types/document'
import { defaultDocumentSettings } from './documentContext'

export const defaultContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Willkommen bei ImpulsWriter' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Beginnen Sie hier mit der Bearbeitung Ihres Dokuments. ImpulsWriter bietet alle Funktionen, die Sie für professionelle Dokumente benötigen.',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [],
    },
  ],
}

export const defaultSettings: DocumentSettings = { ...defaultDocumentSettings }
