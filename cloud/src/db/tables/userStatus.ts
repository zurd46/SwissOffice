import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const userStatus = sqliteTable('user_status', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  presence: text('presence', { enum: ['online', 'offline', 'away', 'busy', 'dnd'] }).notNull().default('offline'),
  customMessage: text('custom_message'),
  lastSeenAt: integer('last_seen_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
