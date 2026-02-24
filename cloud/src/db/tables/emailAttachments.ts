import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { emails } from './emails'

export const emailAttachments = sqliteTable('email_attachments', {
  id: text('id').primaryKey(),
  emailId: text('email_id').notNull().references(() => emails.id, { onDelete: 'cascade' }),
  remoteAttachmentId: text('remote_attachment_id'),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull().default(0),
  contentBase64: text('content_base64'),
  contentId: text('content_id'),
  isInline: integer('is_inline', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
