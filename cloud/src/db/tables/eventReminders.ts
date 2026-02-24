import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { events } from './events'

export const eventReminders = sqliteTable('event_reminders', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  minutesBefore: integer('minutes_before').notNull().default(15),
  type: text('type', { enum: ['notification', 'email'] }).notNull().default('notification'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
