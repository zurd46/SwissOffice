import { z } from 'zod'

const headerFooterContentSchema = z.object({
  html: z.string(),
  enabled: z.boolean(),
})

const impulsDocumentSchema = z.object({
  version: z.number(),
  settings: z.object({
    pageSize: z.object({ name: z.string(), width: z.number(), height: z.number() }),
    orientation: z.enum(['portrait', 'landscape']),
    margins: z.object({ top: z.number(), right: z.number(), bottom: z.number(), left: z.number() }),
    headerContent: headerFooterContentSchema,
    footerContent: headerFooterContentSchema,
    showPageNumbers: z.boolean(),
    pageNumberPosition: z.enum(['left', 'center', 'right']),
    firstPageDifferent: z.boolean(),
    firstPageHeaderContent: headerFooterContentSchema,
    firstPageFooterContent: headerFooterContentSchema,
  }),
  content: z.record(z.unknown()),
  footnotes: z.array(z.object({ id: z.string(), number: z.number(), content: z.string() })).optional(),
  bibliography: z.array(z.record(z.unknown())).optional(),
  citationStyle: z.enum(['apa', 'mla', 'chicago']).optional(),
})

// Flexibles Content-Schema: akzeptiert Writer-Dokumente UND beliebige JSON-Objekte (z.B. Tabulator)
const flexibleContentSchema = z.union([
  impulsDocumentSchema,
  z.record(z.unknown()),
])

export const createDocumentSchema = z.object({
  title: z.string().min(1).max(500),
  content: flexibleContentSchema,
  docType: z.enum(['writer', 'tabulator']).optional().default('writer'),
})

export const updateDocumentSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: flexibleContentSchema.optional(),
}).refine((data) => data.title !== undefined || data.content !== undefined, {
  message: 'Mindestens title oder content muss angegeben werden',
})

export const listDocumentsSchema = z.object({
  filter: z.enum(['owned', 'shared', 'all']).default('all'),
  search: z.string().optional(),
  docType: z.enum(['writer', 'tabulator', 'all']).optional().default('all'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})
