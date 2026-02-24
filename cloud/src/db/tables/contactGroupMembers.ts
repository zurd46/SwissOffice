import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'
import { contacts } from './contacts'
import { contactGroups } from './contactGroups'

export const contactGroupMembers = sqliteTable('contact_group_members', {
  id: text('id').primaryKey(),
  contactId: text('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  groupId: text('group_id').notNull().references(() => contactGroups.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
