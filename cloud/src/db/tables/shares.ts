import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { documents } from './documents'
import { users } from './users'

export const shares = sqliteTable('shares', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  sharedBy: text('shared_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sharedWith: text('shared_with').notNull().references(() => users.id, { onDelete: 'cascade' }),
  permission: text('permission', { enum: ['read', 'write'] }).notNull().default('read'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
