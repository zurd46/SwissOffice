import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const calls = sqliteTable('calls', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['audio', 'video'] }).notNull(),
  status: text('status', { enum: ['ringing', 'active', 'ended', 'missed', 'declined'] }).notNull(),
  conversationId: text('conversation_id'),
  channelId: text('channel_id'),
  initiatorId: text('initiator_id').notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
  duration: integer('duration'),
})
