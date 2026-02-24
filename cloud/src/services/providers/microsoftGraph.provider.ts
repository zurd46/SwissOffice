import type {
  EmailProvider, EmailFolder, EmailMessage, EmailAttachment, SendEmailParams, MicrosoftOAuthTokens,
} from '../../types/email'

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0/me'

export function createMicrosoftGraphProvider(
  tokens: MicrosoftOAuthTokens,
  onTokenRefresh: (newTokens: MicrosoftOAuthTokens) => Promise<void>,
  clientId: string,
  clientSecret: string,
  tenantId: string,
): EmailProvider {
  let accessToken = tokens.accessToken
  let refreshToken = tokens.refreshToken
  let expiresAt = tokens.expiresAt

  async function ensureValidToken(): Promise<string> {
    if (Date.now() < expiresAt - 60_000) return accessToken

    const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: 'https://graph.microsoft.com/.default offline_access',
      }),
    })

    if (!response.ok) throw new Error(`Token refresh fehlgeschlagen: ${response.status}`)

    const data = await response.json() as { access_token: string; refresh_token: string; expires_in: number }
    accessToken = data.access_token
    refreshToken = data.refresh_token ?? refreshToken
    expiresAt = Date.now() + data.expires_in * 1000

    await onTokenRefresh({ accessToken, refreshToken, expiresAt })
    return accessToken
  }

  async function graphFetch(path: string, options?: RequestInit): Promise<Response> {
    const token = await ensureValidToken()
    const resp = await fetch(`${GRAPH_BASE}${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options?.headers },
    })
    if (!resp.ok) {
      const err = await resp.text()
      throw new Error(`Graph API Fehler (${resp.status}): ${err}`)
    }
    return resp
  }

  function mapFolderType(displayName: string): EmailFolder['type'] {
    const lower = displayName.toLowerCase()
    if (lower === 'inbox' || lower === 'posteingang') return 'inbox'
    if (lower === 'sent items' || lower === 'gesendete elemente') return 'sent'
    if (lower === 'drafts' || lower === 'entwürfe') return 'drafts'
    if (lower === 'deleted items' || lower === 'gelöschte elemente') return 'trash'
    if (lower === 'junk email' || lower === 'junk-e-mail') return 'junk'
    if (lower === 'archive' || lower === 'archiv') return 'archive'
    return 'custom'
  }

  interface GraphAddress { emailAddress: { address: string; name?: string } }

  function mapAddress(addr: GraphAddress) {
    return { address: addr.emailAddress.address, name: addr.emailAddress.name }
  }

  interface GraphMessage {
    id: string
    internetMessageId?: string
    subject?: string
    from?: GraphAddress
    toRecipients?: GraphAddress[]
    ccRecipients?: GraphAddress[]
    bccRecipients?: GraphAddress[]
    body?: { content: string; contentType: string }
    bodyPreview?: string
    isRead?: boolean
    flag?: { flagStatus: string }
    isDraft?: boolean
    hasAttachments?: boolean
    sentDateTime?: string
    receivedDateTime?: string
  }

  function mapMessage(msg: GraphMessage): EmailMessage {
    return {
      id: msg.id,
      messageId: msg.internetMessageId,
      subject: msg.subject ?? '',
      from: msg.from ? mapAddress(msg.from) : { address: '' },
      to: (msg.toRecipients ?? []).map(mapAddress),
      cc: (msg.ccRecipients ?? []).map(mapAddress),
      bodyText: msg.body?.contentType === 'text' ? msg.body.content : undefined,
      bodyHtml: msg.body?.contentType === 'html' ? msg.body.content : undefined,
      snippet: msg.bodyPreview,
      isRead: msg.isRead ?? false,
      isFlagged: msg.flag?.flagStatus === 'flagged',
      isDraft: msg.isDraft ?? false,
      hasAttachments: msg.hasAttachments ?? false,
      sentAt: msg.sentDateTime ? new Date(msg.sentDateTime) : undefined,
      receivedAt: msg.receivedDateTime ? new Date(msg.receivedDateTime) : undefined,
    }
  }

  return {
    async fetchFolders(): Promise<EmailFolder[]> {
      const resp = await graphFetch('/mailFolders?$top=100')
      const data = await resp.json() as { value: Array<{ id: string; displayName: string; parentFolderId?: string; totalItemCount: number; unreadItemCount: number }> }
      return data.value.map((f) => ({
        id: f.id,
        remoteFolderId: f.id,
        name: f.displayName,
        type: mapFolderType(f.displayName),
        parentFolderId: f.parentFolderId,
        totalCount: f.totalItemCount,
        unreadCount: f.unreadItemCount,
      }))
    },

    async fetchEmails(folderId: string, page: number, pageSize: number) {
      const skip = (page - 1) * pageSize
      const resp = await graphFetch(
        `/mailFolders/${folderId}/messages?$top=${pageSize}&$skip=${skip}&$orderby=receivedDateTime desc&$count=true`,
        { headers: { ConsistencyLevel: 'eventual' } },
      )
      const data = await resp.json() as { value: GraphMessage[]; '@odata.count'?: number }
      return {
        emails: data.value.map(mapMessage),
        total: data['@odata.count'] ?? data.value.length,
      }
    },

    async fetchEmail(folderId: string, emailId: string) {
      const [msgResp, attachResp] = await Promise.all([
        graphFetch(`/messages/${emailId}?$select=id,internetMessageId,subject,from,toRecipients,ccRecipients,bccRecipients,body,bodyPreview,isRead,flag,isDraft,hasAttachments,sentDateTime,receivedDateTime`),
        graphFetch(`/messages/${emailId}/attachments`),
      ])
      const msg = await msgResp.json() as GraphMessage
      const attachData = await attachResp.json() as { value: Array<{ id: string; name: string; contentType: string; size: number; contentBytes?: string; contentId?: string; isInline: boolean }> }

      const attachments: EmailAttachment[] = attachData.value.map((a) => ({
        id: a.id,
        filename: a.name,
        mimeType: a.contentType,
        sizeBytes: a.size,
        contentBase64: a.contentBytes,
        contentId: a.contentId,
        isInline: a.isInline,
      }))

      return { ...mapMessage(msg), attachments }
    },

    async downloadAttachment(emailId: string, attachmentId: string) {
      const resp = await graphFetch(`/messages/${emailId}/attachments/${attachmentId}`)
      const data = await resp.json() as { name: string; contentType: string; contentBytes: string }
      return { filename: data.name, mimeType: data.contentType, content: data.contentBytes }
    },

    async sendEmail(params: SendEmailParams) {
      const message = {
        subject: params.subject,
        body: {
          contentType: params.bodyHtml ? 'html' : 'text',
          content: params.bodyHtml ?? params.bodyText ?? '',
        },
        toRecipients: params.to.map((a) => ({ emailAddress: { address: a.address, name: a.name } })),
        ccRecipients: params.cc?.map((a) => ({ emailAddress: { address: a.address, name: a.name } })),
        bccRecipients: params.bcc?.map((a) => ({ emailAddress: { address: a.address, name: a.name } })),
        attachments: params.attachments?.map((a) => ({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: a.filename,
          contentBytes: a.content,
          contentType: a.mimeType,
        })),
      }

      await graphFetch('/sendMail', {
        method: 'POST',
        body: JSON.stringify({ message, saveToSentItems: true }),
      })

      return { messageId: '' }
    },

    async moveEmail(emailId: string, targetFolderId: string) {
      await graphFetch(`/messages/${emailId}/move`, {
        method: 'POST',
        body: JSON.stringify({ destinationId: targetFolderId }),
      })
    },

    async deleteEmail(emailId: string) {
      const token = await ensureValidToken()
      await fetch(`${GRAPH_BASE}/messages/${emailId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
    },

    async setReadStatus(emailId: string, isRead: boolean) {
      await graphFetch(`/messages/${emailId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isRead }),
      })
    },

    async setFlaggedStatus(emailId: string, isFlagged: boolean) {
      await graphFetch(`/messages/${emailId}`, {
        method: 'PATCH',
        body: JSON.stringify({ flag: { flagStatus: isFlagged ? 'flagged' : 'notFlagged' } }),
      })
    },

    async searchEmails(query: string, folderId?: string) {
      const path = folderId
        ? `/mailFolders/${folderId}/messages?$search="${query}"&$top=50`
        : `/messages?$search="${query}"&$top=50`
      const resp = await graphFetch(path)
      const data = await resp.json() as { value: GraphMessage[] }
      return data.value.map(mapMessage)
    },

    async disconnect() {
      // No persistent connection for Graph API
    },
  }
}
