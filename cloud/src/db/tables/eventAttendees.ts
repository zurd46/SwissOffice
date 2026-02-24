import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { events } from './events'

export const eventAttendees = sqliteTable('event_attendees', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  name: text('name'),
  rsvpStatus: text('rsvp_status', { enum: ['accepted', 'declined', 'tentative', 'pending'] }).notNull().default('pending'),
  isOrganizer: integer('is_organizer', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
