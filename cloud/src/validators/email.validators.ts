import { z } from 'zod'

export const addImapAccountSchema = z.object({
  label: z.string().min(1),
  emailAddress: z.string().email(),
  imapHost: z.string().min(1),
  imapPort: z.coerce.number().default(993),
  imapSecure: z.boolean().default(true),
  smtpHost: z.string().min(1),
  smtpPort: z.coerce.number().default(587),
  smtpSecure: z.boolean().default(true),
  username: z.string().min(1),
  password: z.string().min(1),
})

export const updateAccountSchema = z.object({
  label: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
})

export const sendEmailSchema = z.object({
  to: z.array(z.object({ address: z.string().email(), name: z.string().optional() })).min(1),
  cc: z.array(z.object({ address: z.string().email(), name: z.string().optional() })).optional(),
  bcc: z.array(z.object({ address: z.string().email(), name: z.string().optional() })).optional(),
  subject: z.string().default(''),
  bodyText: z.string().optional(),
  bodyHtml: z.string().optional(),
  inReplyTo: z.string().optional(),
  references: z.array(z.string()).optional(),
  attachments: z.array(z.object({
    filename: z.string().min(1),
    content: z.string().min(1),
    mimeType: z.string().min(1),
  })).optional(),
})

export const setReadStatusSchema = z.object({
  isRead: z.boolean(),
})

export const setFlaggedStatusSchema = z.object({
  isFlagged: z.boolean(),
})

export const moveEmailSchema = z.object({
  targetFolderId: z.string().min(1),
})

export const searchEmailSchema = z.object({
  q: z.string().min(1),
  folderId: z.string().optional(),
})

export const listEmailsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(50),
})
