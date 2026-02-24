import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { documents } from './documents'
import { users } from './users'

export const documentVersions = sqliteTable('document_versions', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  createdBy: text('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  label: text('label'),
  content: text('content', { mode: 'json' }).notNull(),
  sizeBytes: integer('size_bytes').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
