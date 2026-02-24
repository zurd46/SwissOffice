import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { emailAccounts } from './emailAccounts'

export const emailFolders = sqliteTable('email_folders', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => emailAccounts.id, { onDelete: 'cascade' }),
  remoteFolderId: text('remote_folder_id'),
  name: text('name').notNull(),
  type: text('type', { enum: ['inbox', 'sent', 'drafts', 'trash', 'junk', 'archive', 'custom'] }).notNull().default('custom'),
  parentFolderId: text('parent_folder_id'),
  totalCount: integer('total_count').notNull().default(0),
  unreadCount: integer('unread_count').notNull().default(0),
  uidValidity: integer('uid_validity'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
