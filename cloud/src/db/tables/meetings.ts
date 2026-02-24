import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const meetings = sqliteTable('meetings', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  organizerId: text('organizer_id').notNull(),
  channelId: text('channel_id'),
  teamId: text('team_id'),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }).notNull(),
  isAllDay: integer('is_all_day', { mode: 'boolean' }).notNull().default(false),
  recurrence: text('recurrence', { enum: ['none', 'daily', 'weekly', 'biweekly', 'monthly'] }).notNull().default('none'),
  meetingLink: text('meeting_link').notNull(),
  hasLobby: integer('has_lobby', { mode: 'boolean' }).notNull().default(false),
  isRecordingEnabled: integer('is_recording_enabled', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
