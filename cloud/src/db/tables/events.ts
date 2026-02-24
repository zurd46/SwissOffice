import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { calendars } from './calendars'

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  calendarId: text('calendar_id').notNull().references(() => calendars.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  startAt: integer('start_at', { mode: 'timestamp' }).notNull(),
  endAt: integer('end_at', { mode: 'timestamp' }).notNull(),
  isAllDay: integer('is_all_day', { mode: 'boolean' }).notNull().default(false),
  timezone: text('timezone').notNull().default('Europe/Zurich'),
  recurrenceRule: text('recurrence_rule'),
  status: text('status', { enum: ['confirmed', 'tentative', 'cancelled'] }).notNull().default('confirmed'),
  microsoftEventId: text('microsoft_event_id'),
  icalUid: text('ical_uid'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
