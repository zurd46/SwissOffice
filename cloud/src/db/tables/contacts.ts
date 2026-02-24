import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  firstName: text('first_name'),
  lastName: text('last_name'),
  displayName: text('display_name').notNull(),
  email: text('email'),
  email2: text('email2'),
  phone: text('phone'),
  phone2: text('phone2'),
  company: text('company'),
  jobTitle: text('job_title'),
  street: text('street'),
  city: text('city'),
  zip: text('zip'),
  country: text('country'),
  notes: text('notes'),
  avatarUrl: text('avatar_url'),
  website: text('website'),
  birthday: text('birthday'),
  microsoftContactId: text('microsoft_contact_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
