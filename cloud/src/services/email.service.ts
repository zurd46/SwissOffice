import { eq, and, like, desc } from 'drizzle-orm'
import { db } from '../db/client'
import { emailAccounts, emailFolders, emails, emailAttachments } from '../db/schema'
import { NotFoundError } from '../types/api'
import { encryptCredentials, decryptCredentials } from './crypto.service'
import { getProviderForAccount, syncAccount } from './emailSync.service'
import { exchangeCodeForTokens, getUserProfile, getAuthorizationUrl } from './microsoftOAuth.service'
import type { ImapCredentials, SendEmailParams } from '../types/email'

function generateId(): string {
  return crypto.randomUUID()
}

// ── Accounts ──

export function listAccounts(userId: string) {
  return db
    .select({
      id: emailAccounts.id,
      provider: emailAccounts.provider,
      label: emailAccounts.label,
      emailAddress: emailAccounts.emailAddress,
      isActive: emailAccounts.isActive,
      lastSyncAt: emailAccounts.lastSyncAt,
      syncError: emailAccounts.syncError,
      createdAt: emailAccounts.createdAt,
    })
    .from(emailAccounts)
    .where(eq(emailAccounts.userId, userId))
    .all()
}

export async function addImapAccount(userId: string, input: {
  label: string; emailAddress: string
  imapHost: string; imapPort: number; imapSecure: boolean
  smtpHost: string; smtpPort: number; smtpSecure: boolean
  username: string; password: string
}) {
  const id = generateId()
  const credentials: ImapCredentials = {
    imapHost: input.imapHost,
    imapPort: input.imapPort,
    imapSecure: input.imapSecure,
    smtpHost: input.smtpHost,
    smtpPort: input.smtpPort,
    smtpSecure: input.smtpSecure,
    username: input.username,
    password: input.password,
  }

  const encrypted = await encryptCredentials(JSON.stringify(credentials))
  const now = new Date()

  db.insert(emailAccounts)
    .values({
      id,
      userId,
      provider: 'imap',
      label: input.label,
      emailAddress: input.emailAddress,
      encryptedCredentials: encrypted,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  return { id, provider: 'imap', label: input.label, emailAddress: input.emailAddress }
}

export function updateAccount(accountId: string, userId: string, input: { label?: string; isActive?: boolean }) {
  const account = db
    .select()
    .from(emailAccounts)
    .where(and(eq(emailAccounts.id, accountId), eq(emailAccounts.userId, userId)))
    .get()
  if (!account) throw new NotFoundError('E-Mail-Konto nicht gefunden')

  db.update(emailAccounts)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(emailAccounts.id, accountId))
    .run()

  return db.select().from(emailAccounts).where(eq(emailAccounts.id, accountId)).get()!
}

export function deleteAccount(accountId: string, userId: string) {
  const account = db
    .select()
    .from(emailAccounts)
    .where(and(eq(emailAccounts.id, accountId), eq(emailAccounts.userId, userId)))
    .get()
  if (!account) throw new NotFoundError('E-Mail-Konto nicht gefunden')

  db.delete(emailAccounts).where(eq(emailAccounts.id, accountId)).run()
}

// ── Microsoft OAuth ──

export function getMicrosoftAuthUrl(userId: string) {
  const state = Buffer.from(JSON.stringify({ userId })).toString('base64url')
  return getAuthorizationUrl(state)
}

export async function handleMicrosoftCallback(code: string, state: string) {
  const { userId } = JSON.parse(Buffer.from(state, 'base64url').toString())
  const tokens = await exchangeCodeForTokens(code)
  const profile = await getUserProfile(tokens.accessToken)

  const id = generateId()
  const encrypted = await encryptCredentials(JSON.stringify(tokens))
  const now = new Date()

  db.insert(emailAccounts)
    .values({
      id,
      userId,
      provider: 'microsoft',
      label: profile.displayName ?? 'Microsoft',
      emailAddress: profile.mail ?? profile.userPrincipalName,
      encryptedOauthTokens: encrypted,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  return { id, provider: 'microsoft', label: profile.displayName, emailAddress: profile.mail ?? profile.userPrincipalName }
}

// ── Folders ──

export function listFolders(accountId: string, userId: string) {
  const account = db
    .select()
    .from(emailAccounts)
    .where(and(eq(emailAccounts.id, accountId), eq(emailAccounts.userId, userId)))
    .get()
  if (!account) throw new NotFoundError('E-Mail-Konto nicht gefunden')

  return db.select().from(emailFolders).where(eq(emailFolders.accountId, accountId)).all()
}

// ── Emails ──

export function listEmails(accountId: string, folderId: string, userId: string, page: number, pageSize: number) {
  const account = db
    .select()
    .from(emailAccounts)
    .where(and(eq(emailAccounts.id, accountId), eq(emailAccounts.userId, userId)))
    .get()
  if (!account) throw new NotFoundError('E-Mail-Konto nicht gefunden')

  const folder = db
    .select()
    .from(emailFolders)
    .where(and(eq(emailFolders.id, folderId), eq(emailFolders.accountId, accountId)))
    .get()
  if (!folder) throw new NotFoundError('Ordner nicht gefunden')

  const offset = (page - 1) * pageSize
  const allEmails = db
    .select()
    .from(emails)
    .where(eq(emails.folderId, folderId))
    .orderBy(desc(emails.receivedAt))
    .all()

  return {
    emails: allEmails.slice(offset, offset + pageSize),
    total: allEmails.length,
    page,
    pageSize,
  }
}

export async function getEmail(accountId: string, emailId: string, userId: string) {
  const account = db
    .select()
    .from(emailAccounts)
    .where(and(eq(emailAccounts.id, accountId), eq(emailAccounts.userId, userId)))
    .get()
  if (!account) throw new NotFoundError('E-Mail-Konto nicht gefunden')

  const email = db.select().from(emails).where(eq(emails.id, emailId)).get()
  if (!email) throw new NotFoundError('E-Mail nicht gefunden')

  // If body not cached, fetch from provider
  if (!email.bodyText && !email.bodyHtml && email.remoteMessageId) {
    const folder = db.select().from(emailFolders).where(eq(emailFolders.id, email.folderId)).get()
    if (folder) {
      try {
        const provider = await getProviderForAccount(accountId, userId)
        const remoteFolderId = folder.remoteFolderId ?? folder.name
        const fullEmail = await provider.fetchEmail(remoteFolderId, email.remoteMessageId)

        db.update(emails)
          .set({
            bodyText: fullEmail.bodyText,
            bodyHtml: fullEmail.bodyHtml,
            snippet: fullEmail.snippet,
          })
          .where(eq(emails.id, emailId))
          .run()

        // Cache attachments
        for (const att of fullEmail.attachments) {
          const existing = db
            .select()
            .from(emailAttachments)
            .where(and(eq(emailAttachments.emailId, emailId), eq(emailAttachments.remoteAttachmentId, att.id)))
            .get()
          if (!existing) {
            db.insert(emailAttachments)
              .values({
                id: generateId(),
                emailId,
                remoteAttachmentId: att.id,
                filename: att.filename,
                mimeType: att.mimeType,
                sizeBytes: att.sizeBytes,
                contentId: att.contentId,
                isInline: att.isInline,
                createdAt: new Date(),
              })
              .run()
          }
        }

        await provider.disconnect()
        return { ...email, bodyText: fullEmail.bodyText, bodyHtml: fullEmail.bodyHtml, snippet: fullEmail.snippet, attachments: fullEmail.attachments }
      } catch {
        // Fall through to return cached data
      }
    }
  }

  const attachmentList = db.select().from(emailAttachments).where(eq(emailAttachments.emailId, emailId)).all()
  return { ...email, attachments: attachmentList }
}

export async function sendEmail(accountId: string, userId: string, input: SendEmailParams) {
  const provider = await getProviderForAccount(accountId, userId)
  try {
    const result = await provider.sendEmail(input)
    return result
  } finally {
    await provider.disconnect()
  }
}

export async function setReadStatus(accountId: string, emailId: string, userId: string, isRead: boolean) {
  const email = db.select().from(emails).where(eq(emails.id, emailId)).get()
  if (!email) throw new NotFoundError('E-Mail nicht gefunden')

  if (email.remoteMessageId) {
    const provider = await getProviderForAccount(accountId, userId)
    try {
      await provider.setReadStatus(email.remoteMessageId, isRead)
    } finally {
      await provider.disconnect()
    }
  }

  db.update(emails).set({ isRead }).where(eq(emails.id, emailId)).run()
  return { id: emailId, isRead }
}

export async function setFlaggedStatus(accountId: string, emailId: string, userId: string, isFlagged: boolean) {
  const email = db.select().from(emails).where(eq(emails.id, emailId)).get()
  if (!email) throw new NotFoundError('E-Mail nicht gefunden')

  if (email.remoteMessageId) {
    const provider = await getProviderForAccount(accountId, userId)
    try {
      await provider.setFlaggedStatus(email.remoteMessageId, isFlagged)
    } finally {
      await provider.disconnect()
    }
  }

  db.update(emails).set({ isFlagged }).where(eq(emails.id, emailId)).run()
  return { id: emailId, isFlagged }
}

export async function moveEmail(accountId: string, emailId: string, userId: string, targetFolderId: string) {
  const email = db.select().from(emails).where(eq(emails.id, emailId)).get()
  if (!email) throw new NotFoundError('E-Mail nicht gefunden')

  if (email.remoteMessageId) {
    const targetFolder = db.select().from(emailFolders).where(eq(emailFolders.id, targetFolderId)).get()
    if (!targetFolder) throw new NotFoundError('Ziel-Ordner nicht gefunden')

    const provider = await getProviderForAccount(accountId, userId)
    try {
      await provider.moveEmail(email.remoteMessageId, targetFolder.remoteFolderId ?? targetFolder.name)
    } finally {
      await provider.disconnect()
    }
  }

  db.update(emails).set({ folderId: targetFolderId }).where(eq(emails.id, emailId)).run()
  return { id: emailId, folderId: targetFolderId }
}

export async function deleteEmail(accountId: string, emailId: string, userId: string) {
  const email = db.select().from(emails).where(eq(emails.id, emailId)).get()
  if (!email) throw new NotFoundError('E-Mail nicht gefunden')

  if (email.remoteMessageId) {
    const provider = await getProviderForAccount(accountId, userId)
    try {
      await provider.deleteEmail(email.remoteMessageId)
    } finally {
      await provider.disconnect()
    }
  }

  db.delete(emails).where(eq(emails.id, emailId)).run()
}

export async function getAttachment(accountId: string, emailId: string, attachmentId: string, userId: string) {
  const email = db.select().from(emails).where(eq(emails.id, emailId)).get()
  if (!email) throw new NotFoundError('E-Mail nicht gefunden')

  const attachment = db.select().from(emailAttachments).where(eq(emailAttachments.id, attachmentId)).get()
  if (!attachment) throw new NotFoundError('Anhang nicht gefunden')

  if (attachment.contentBase64) {
    return { filename: attachment.filename, mimeType: attachment.mimeType, content: attachment.contentBase64 }
  }

  // Download from provider
  if (email.remoteMessageId && attachment.remoteAttachmentId) {
    const provider = await getProviderForAccount(accountId, userId)
    try {
      const data = await provider.downloadAttachment(email.remoteMessageId, attachment.remoteAttachmentId)
      db.update(emailAttachments).set({ contentBase64: data.content }).where(eq(emailAttachments.id, attachmentId)).run()
      return { filename: attachment.filename, mimeType: attachment.mimeType, content: data.content }
    } finally {
      await provider.disconnect()
    }
  }

  throw new NotFoundError('Anhang-Inhalt nicht verfuegbar')
}

export async function searchEmails(accountId: string, userId: string, query: string, folderId?: string) {
  const provider = await getProviderForAccount(accountId, userId)
  try {
    const results = await provider.searchEmails(query, folderId)
    return results
  } finally {
    await provider.disconnect()
  }
}
