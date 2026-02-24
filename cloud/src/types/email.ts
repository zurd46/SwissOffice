export interface EmailAddress {
  address: string
  name?: string
}

export interface EmailMessage {
  id: string
  messageId?: string
  subject: string
  from: EmailAddress
  to: EmailAddress[]
  cc?: EmailAddress[]
  bcc?: EmailAddress[]
  bodyText?: string
  bodyHtml?: string
  snippet?: string
  isRead: boolean
  isFlagged: boolean
  isDraft: boolean
  hasAttachments: boolean
  sizeBytes?: number
  sentAt?: Date
  receivedAt?: Date
}

export interface EmailFolder {
  id: string
  remoteFolderId?: string
  name: string
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'junk' | 'archive' | 'custom'
  parentFolderId?: string
  totalCount: number
  unreadCount: number
}

export interface EmailAttachment {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  contentBase64?: string
  contentId?: string
  isInline: boolean
}

export interface SendEmailParams {
  to: EmailAddress[]
  cc?: EmailAddress[]
  bcc?: EmailAddress[]
  subject: string
  bodyText?: string
  bodyHtml?: string
  inReplyTo?: string
  references?: string[]
  attachments?: Array<{
    filename: string
    content: string // base64
    mimeType: string
  }>
}

export interface ImapCredentials {
  imapHost: string
  imapPort: number
  imapSecure: boolean
  smtpHost: string
  smtpPort: number
  smtpSecure: boolean
  username: string
  password: string
}

export interface MicrosoftOAuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface EmailProvider {
  fetchFolders(): Promise<EmailFolder[]>
  fetchEmails(folderId: string, page: number, pageSize: number): Promise<{ emails: EmailMessage[]; total: number }>
  fetchEmail(folderId: string, emailId: string): Promise<EmailMessage & { attachments: EmailAttachment[] }>
  downloadAttachment(emailId: string, attachmentId: string): Promise<{ filename: string; mimeType: string; content: string }>
  sendEmail(params: SendEmailParams): Promise<{ messageId: string }>
  moveEmail(emailId: string, targetFolderId: string): Promise<void>
  deleteEmail(emailId: string): Promise<void>
  setReadStatus(emailId: string, isRead: boolean): Promise<void>
  setFlaggedStatus(emailId: string, isFlagged: boolean): Promise<void>
  searchEmails(query: string, folderId?: string): Promise<EmailMessage[]>
  disconnect(): Promise<void>
}
