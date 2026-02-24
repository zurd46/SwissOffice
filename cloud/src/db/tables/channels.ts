import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const channels = sqliteTable('channels', {
  id: text('id').primaryKey(),
  teamId: text('team_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  topic: text('topic'),
  type: text('type', { enum: ['public', 'private', 'announcement'] }).notNull().default('public'),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
