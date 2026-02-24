import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const emailAccounts = sqliteTable('email_accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider', { enum: ['imap', 'microsoft'] }).notNull(),
  label: text('label').notNull(),
  emailAddress: text('email_address').notNull(),
  encryptedCredentials: text('encrypted_credentials'),
  encryptedOauthTokens: text('encrypted_oauth_tokens'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  lastSyncAt: integer('last_sync_at', { mode: 'timestamp' }),
  syncError: text('sync_error'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
