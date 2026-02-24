import { eq, and } from 'drizzle-orm'
import { db } from '../db/client'
import { emailAccounts, emailFolders, emails, emailAttachments } from '../db/schema'
import { encryptCredentials, decryptCredentials } from './crypto.service'
import { createImapSmtpProvider } from './providers/imapSmtp.provider'
import { createMicrosoftGraphProvider } from './providers/microsoftGraph.provider'
import { env } from '../config/env'
import type { EmailProvider, ImapCredentials, MicrosoftOAuthTokens } from '../types/email'

function generateId(): string {
  return crypto.randomUUID()
}

export async function getProviderForAccount(accountId: string, userId: string): Promise<EmailProvider> {
  const account = db
    .select()
    .from(emailAccounts)
    .where(and(eq(emailAccounts.id, accountId), eq(emailAccounts.userId, userId)))
    .get()

  if (!account) throw new Error('E-Mail-Konto nicht gefunden')

  if (account.provider === 'imap') {
    if (!account.encryptedCredentials) throw new Error('Keine IMAP-Credentials vorhanden')
    const decrypted = await decryptCredentials(account.encryptedCredentials)
    const credentials: ImapCredentials = JSON.parse(decrypted)
    return createImapSmtpProvider(credentials)
  }

  if (account.provider === 'microsoft') {
    if (!account.encryptedOauthTokens) throw new Error('Keine Microsoft OAuth-Tokens vorhanden')
    const decrypted = await decryptCredentials(account.encryptedOauthTokens)
    const tokens: MicrosoftOAuthTokens = JSON.parse(decrypted)

    return createMicrosoftGraphProvider(
      tokens,
      async (newTokens) => {
        const encrypted = await encryptCredentials(JSON.stringify(newTokens))
        db.update(emailAccounts)
          .set({ encryptedOauthTokens: encrypted, updatedAt: new Date() })
          .where(eq(emailAccounts.id, accountId))
          .run()
      },
      env.MS_GRAPH_CLIENT_ID,
      env.MS_GRAPH_CLIENT_SECRET,
      env.MS_GRAPH_TENANT_ID,
    )
  }

  throw new Error(`Unbekannter Provider: ${account.provider}`)
}

export async function syncAccount(accountId: string, userId: string) {
  const provider = await getProviderForAccount(accountId, userId)

  try {
    // 1. Sync folders
    const remoteFolders = await provider.fetchFolders()
    for (const rf of remoteFolders) {
      const existing = db
        .select()
        .from(emailFolders)
        .where(and(eq(emailFolders.accountId, accountId), eq(emailFolders.remoteFolderId, rf.remoteFolderId ?? rf.id)))
        .get()

      if (existing) {
        db.update(emailFolders)
          .set({ name: rf.name, type: rf.type, totalCount: rf.totalCount, unreadCount: rf.unreadCount, updatedAt: new Date() })
          .where(eq(emailFolders.id, existing.id))
          .run()
      } else {
        db.insert(emailFolders)
          .values({
            id: generateId(),
            accountId,
            remoteFolderId: rf.remoteFolderId ?? rf.id,
            name: rf.name,
            type: rf.type,
            parentFolderId: rf.parentFolderId,
            totalCount: rf.totalCount,
            unreadCount: rf.unreadCount,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .run()
      }
    }

    // 2. Sync emails from main folders (first 100)
    const foldersToSync = db
      .select()
      .from(emailFolders)
      .where(eq(emailFolders.accountId, accountId))
      .all()
      .filter((f) => ['inbox', 'sent', 'drafts'].includes(f.type))

    for (const folder of foldersToSync) {
      const remoteFolderId = folder.remoteFolderId ?? folder.name
      const { emails: remoteEmails } = await provider.fetchEmails(remoteFolderId, 1, 100)

      for (const re of remoteEmails) {
        const existingEmail = db
          .select()
          .from(emails)
          .where(and(eq(emails.folderId, folder.id), eq(emails.remoteMessageId, re.id)))
          .get()

        if (!existingEmail) {
          db.insert(emails)
            .values({
              id: generateId(),
              folderId: folder.id,
              remoteMessageId: re.id,
              messageId: re.messageId,
              subject: re.subject,
              fromAddress: re.from.address,
              fromName: re.from.name,
              toAddresses: JSON.stringify(re.to),
              ccAddresses: re.cc ? JSON.stringify(re.cc) : null,
              snippet: re.snippet,
              isRead: re.isRead,
              isFlagged: re.isFlagged,
              isDraft: re.isDraft,
              hasAttachments: re.hasAttachments,
              sizeBytes: re.sizeBytes,
              sentAt: re.sentAt,
              receivedAt: re.receivedAt,
              createdAt: new Date(),
            })
            .run()
        }
      }
    }

    // Update sync timestamp
    db.update(emailAccounts)
      .set({ lastSyncAt: new Date(), syncError: null, updatedAt: new Date() })
      .where(eq(emailAccounts.id, accountId))
      .run()

    return { synced: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Sync-Fehler'
    db.update(emailAccounts)
      .set({ syncError: message, updatedAt: new Date() })
      .where(eq(emailAccounts.id, accountId))
      .run()
    throw error
  } finally {
    await provider.disconnect()
  }
}
