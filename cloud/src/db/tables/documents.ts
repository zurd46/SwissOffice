import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('Unbenannt'),
  content: text('content', { mode: 'json' }).notNull(),
  sizeBytes: integer('size_bytes').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
