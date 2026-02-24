import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const channelMembers = sqliteTable('channel_members', {
  id: text('id').primaryKey(),
  channelId: text('channel_id').notNull(),
  userId: text('user_id').notNull(),
  notificationSetting: text('notification_setting', { enum: ['all', 'mentions', 'none'] }).notNull().default('all'),
  joinedAt: integer('joined_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
