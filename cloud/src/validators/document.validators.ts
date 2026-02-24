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

export const createDocumentSchema = z.object({
  title: z.string().min(1).max(500),
  content: impulsDocumentSchema,
})

export const updateDocumentSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: impulsDocumentSchema.optional(),
}).refine((data) => data.title !== undefined || data.content !== undefined, {
  message: 'Mindestens title oder content muss angegeben werden',
})

export const listDocumentsSchema = z.object({
  filter: z.enum(['owned', 'shared', 'all']).default('all'),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})
