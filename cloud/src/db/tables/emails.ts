import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { emailFolders } from './emailFolders'

export const emails = sqliteTable('emails', {
  id: text('id').primaryKey(),
  folderId: text('folder_id').notNull().references(() => emailFolders.id, { onDelete: 'cascade' }),
  remoteMessageId: text('remote_message_id'),
  messageId: text('message_id'),
  inReplyTo: text('in_reply_to'),
  references: text('references'),
  subject: text('subject').notNull().default(''),
  fromAddress: text('from_address').notNull(),
  fromName: text('from_name'),
  toAddresses: text('to_addresses').notNull(),
  ccAddresses: text('cc_addresses'),
  bccAddresses: text('bcc_addresses'),
  bodyText: text('body_text'),
  bodyHtml: text('body_html'),
  snippet: text('snippet'),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  isFlagged: integer('is_flagged', { mode: 'boolean' }).notNull().default(false),
  isDraft: integer('is_draft', { mode: 'boolean' }).notNull().default(false),
  hasAttachments: integer('has_attachments', { mode: 'boolean' }).notNull().default(false),
  sizeBytes: integer('size_bytes'),
  sentAt: integer('sent_at', { mode: 'timestamp' }),
  receivedAt: integer('received_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
