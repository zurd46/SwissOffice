import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull(),
  channelId: text('channel_id'),
  senderId: text('sender_id').notNull(),
  type: text('type', { enum: ['text', 'image', 'video', 'file', 'audio', 'gif', 'system'] }).notNull().default('text'),
  content: text('content').notNull(),
  replyToId: text('reply_to_id'),
  isEdited: integer('is_edited', { mode: 'boolean' }).notNull().default(false),
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
})
