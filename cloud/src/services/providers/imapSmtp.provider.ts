import { ImapFlow } from 'imapflow'
import nodemailer from 'nodemailer'
import type { EmailProvider, EmailFolder, EmailMessage, EmailAttachment, SendEmailParams, ImapCredentials } from '../../types/email'

export function createImapSmtpProvider(credentials: ImapCredentials): EmailProvider {
  let imapClient: ImapFlow | null = null

  async function getImapClient(): Promise<ImapFlow> {
    if (imapClient) return imapClient
    imapClient = new ImapFlow({
      host: credentials.imapHost,
      port: credentials.imapPort,
      secure: credentials.imapSecure,
      auth: { user: credentials.username, pass: credentials.password },
      logger: false,
    })
    await imapClient.connect()
    return imapClient
  }

  function getSmtpTransport() {
    return nodemailer.createTransport({
      host: credentials.smtpHost,
      port: credentials.smtpPort,
      secure: credentials.smtpSecure,
      auth: { user: credentials.username, pass: credentials.password },
    })
  }

  function mapFolderType(path: string, specialUse?: string): EmailFolder['type'] {
    if (specialUse) {
      const mapping: Record<string, EmailFolder['type']> = {
        '\\Inbox': 'inbox',
        '\\Sent': 'sent',
        '\\Drafts': 'drafts',
        '\\Trash': 'trash',
        '\\Junk': 'junk',
        '\\Archive': 'archive',
      }
      return mapping[specialUse] ?? 'custom'
    }
    const lower = path.toLowerCase()
    if (lower === 'inbox') return 'inbox'
    if (lower.includes('sent')) return 'sent'
    if (lower.includes('draft')) return 'drafts'
    if (lower.includes('trash') || lower.includes('deleted')) return 'trash'
    if (lower.includes('junk') || lower.includes('spam')) return 'junk'
    if (lower.includes('archive')) return 'archive'
    return 'custom'
  }

  return {
    async fetchFolders(): Promise<EmailFolder[]> {
      const client = await getImapClient()
      const mailboxes = await client.list()
      return mailboxes.map((mb) => ({
        id: mb.path,
        remoteFolderId: mb.path,
        name: mb.name,
        type: mapFolderType(mb.path, mb.specialUse),
        parentFolderId: mb.parentPath || undefined,
        totalCount: 0,
        unreadCount: 0,
      }))
    },

    async fetchEmails(folderId: string, page: number, pageSize: number): Promise<{ emails: EmailMessage[]; total: number }> {
      const client = await getImapClient()
      const lock = await client.getMailboxLock(folderId)
      try {
        const total = client.mailbox?.exists ?? 0
        const start = Math.max(1, total - (page * pageSize) + 1)
        const end = Math.max(1, total - ((page - 1) * pageSize))

        if (total === 0) return { emails: [], total: 0 }

        const messages: EmailMessage[] = []
        for await (const msg of client.fetch(`${start}:${end}`, {
          envelope: true,
          flags: true,
          bodyStructure: true,
          uid: true,
        })) {
          const env = msg.envelope
          messages.push({
            id: String(msg.uid),
            messageId: env.messageId ?? undefined,
            subject: env.subject ?? '',
            from: { address: env.from?.[0]?.address ?? '', name: env.from?.[0]?.name ?? undefined },
            to: (env.to ?? []).map((a: { address?: string; name?: string }) => ({ address: a.address ?? '', name: a.name ?? undefined })),
            cc: (env.cc ?? []).map((a: { address?: string; name?: string }) => ({ address: a.address ?? '', name: a.name ?? undefined })),
            bodyText: undefined,
            bodyHtml: undefined,
            snippet: undefined,
            isRead: msg.flags?.has('\\Seen') ?? false,
            isFlagged: msg.flags?.has('\\Flagged') ?? false,
            isDraft: msg.flags?.has('\\Draft') ?? false,
            hasAttachments: !!msg.bodyStructure?.childNodes?.some((n: { disposition?: string }) => n.disposition === 'attachment'),
            sentAt: env.date ? new Date(env.date) : undefined,
            receivedAt: env.date ? new Date(env.date) : undefined,
          })
        }

        return { emails: messages.reverse(), total }
      } finally {
        lock.release()
      }
    },

    async fetchEmail(folderId: string, emailId: string): Promise<EmailMessage & { attachments: EmailAttachment[] }> {
      const client = await getImapClient()
      const lock = await client.getMailboxLock(folderId)
      try {
        const msg = await client.fetchOne(emailId, {
          envelope: true,
          flags: true,
          bodyStructure: true,
          source: true,
        }, { uid: true })

        const env = msg.envelope
        const attachments: EmailAttachment[] = []

        if (msg.bodyStructure?.childNodes) {
          for (const node of msg.bodyStructure.childNodes) {
            if (node.disposition === 'attachment') {
              attachments.push({
                id: node.part ?? '',
                filename: node.dispositionParameters?.filename ?? 'unknown',
                mimeType: `${node.type}/${node.subtype}`,
                sizeBytes: node.size ?? 0,
                isInline: false,
              })
            }
          }
        }

        // Parse body from source
        const source = msg.source?.toString() ?? ''
        let bodyText: string | undefined
        let bodyHtml: string | undefined

        // Simple text extraction
        const textMatch = source.match(/Content-Type: text\/plain[\s\S]*?\r\n\r\n([\s\S]*?)(?:\r\n--|\r\n\.\r\n|$)/i)
        if (textMatch) bodyText = textMatch[1].trim()

        const htmlMatch = source.match(/Content-Type: text\/html[\s\S]*?\r\n\r\n([\s\S]*?)(?:\r\n--|\r\n\.\r\n|$)/i)
        if (htmlMatch) bodyHtml = htmlMatch[1].trim()

        return {
          id: emailId,
          messageId: env.messageId ?? undefined,
          subject: env.subject ?? '',
          from: { address: env.from?.[0]?.address ?? '', name: env.from?.[0]?.name ?? undefined },
          to: (env.to ?? []).map((a: { address?: string; name?: string }) => ({ address: a.address ?? '', name: a.name ?? undefined })),
          cc: (env.cc ?? []).map((a: { address?: string; name?: string }) => ({ address: a.address ?? '', name: a.name ?? undefined })),
          bodyText,
          bodyHtml,
          snippet: bodyText?.substring(0, 200),
          isRead: msg.flags?.has('\\Seen') ?? false,
          isFlagged: msg.flags?.has('\\Flagged') ?? false,
          isDraft: msg.flags?.has('\\Draft') ?? false,
          hasAttachments: attachments.length > 0,
          sentAt: env.date ? new Date(env.date) : undefined,
          receivedAt: env.date ? new Date(env.date) : undefined,
          attachments,
        }
      } finally {
        lock.release()
      }
    },

    async downloadAttachment(emailId: string, attachmentId: string) {
      const client = await getImapClient()
      const { content } = await client.download(emailId, attachmentId, { uid: true })

      const chunks: Buffer[] = []
      for await (const chunk of content) {
        chunks.push(Buffer.from(chunk))
      }
      const buffer = Buffer.concat(chunks)

      return {
        filename: 'attachment',
        mimeType: 'application/octet-stream',
        content: buffer.toString('base64'),
      }
    },

    async sendEmail(params: SendEmailParams) {
      const transport = getSmtpTransport()
      const info = await transport.sendMail({
        from: credentials.username,
        to: params.to.map((a) => (a.name ? `"${a.name}" <${a.address}>` : a.address)).join(', '),
        cc: params.cc?.map((a) => (a.name ? `"${a.name}" <${a.address}>` : a.address)).join(', '),
        bcc: params.bcc?.map((a) => (a.name ? `"${a.name}" <${a.address}>` : a.address)).join(', '),
        subject: params.subject,
        text: params.bodyText,
        html: params.bodyHtml,
        inReplyTo: params.inReplyTo,
        references: params.references?.join(' '),
        attachments: params.attachments?.map((a) => ({
          filename: a.filename,
          content: Buffer.from(a.content, 'base64'),
          contentType: a.mimeType,
        })),
      })
      return { messageId: info.messageId }
    },

    async moveEmail(emailId: string, targetFolderId: string) {
      const client = await getImapClient()
      await client.messageMove(emailId, targetFolderId, { uid: true })
    },

    async deleteEmail(emailId: string) {
      const client = await getImapClient()
      await client.messageDelete(emailId, { uid: true })
    },

    async setReadStatus(emailId: string, isRead: boolean) {
      const client = await getImapClient()
      if (isRead) {
        await client.messageFlagsAdd(emailId, ['\\Seen'], { uid: true })
      } else {
        await client.messageFlagsRemove(emailId, ['\\Seen'], { uid: true })
      }
    },

    async setFlaggedStatus(emailId: string, isFlagged: boolean) {
      const client = await getImapClient()
      if (isFlagged) {
        await client.messageFlagsAdd(emailId, ['\\Flagged'], { uid: true })
      } else {
        await client.messageFlagsRemove(emailId, ['\\Flagged'], { uid: true })
      }
    },

    async searchEmails(query: string, folderId?: string): Promise<EmailMessage[]> {
      const client = await getImapClient()
      const folder = folderId ?? 'INBOX'
      const lock = await client.getMailboxLock(folder)
      try {
        const results: EmailMessage[] = []
        for await (const msg of client.fetch(
          { or: [{ subject: query }, { from: query }, { to: query }, { body: query }] },
          { envelope: true, flags: true, uid: true },
        )) {
          const env = msg.envelope
          results.push({
            id: String(msg.uid),
            messageId: env.messageId ?? undefined,
            subject: env.subject ?? '',
            from: { address: env.from?.[0]?.address ?? '', name: env.from?.[0]?.name ?? undefined },
            to: (env.to ?? []).map((a: { address?: string; name?: string }) => ({ address: a.address ?? '', name: a.name ?? undefined })),
            isRead: msg.flags?.has('\\Seen') ?? false,
            isFlagged: msg.flags?.has('\\Flagged') ?? false,
            isDraft: msg.flags?.has('\\Draft') ?? false,
            hasAttachments: false,
            sentAt: env.date ? new Date(env.date) : undefined,
            receivedAt: env.date ? new Date(env.date) : undefined,
          })
        }
        return results
      } finally {
        lock.release()
      }
    },

    async disconnect() {
      if (imapClient) {
        await imapClient.logout()
        imapClient = null
      }
    },
  }
}
