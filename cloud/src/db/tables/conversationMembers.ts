import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const conversationMembers = sqliteTable('conversation_members', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull(),
  userId: text('user_id').notNull(),
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  isMuted: integer('is_muted', { mode: 'boolean' }).notNull().default(false),
  lastReadAt: integer('last_read_at', { mode: 'timestamp' }),
  joinedAt: integer('joined_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
