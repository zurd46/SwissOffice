import { env } from '../config/env'

const AUTHORIZE_URL = `https://login.microsoftonline.com/${env.MS_GRAPH_TENANT_ID}/oauth2/v2.0/authorize`
const TOKEN_URL = `https://login.microsoftonline.com/${env.MS_GRAPH_TENANT_ID}/oauth2/v2.0/token`

const SCOPES = [
  'openid',
  'offline_access',
  'Mail.ReadWrite',
  'Mail.Send',
  'MailboxSettings.Read',
  'Contacts.ReadWrite',
  'Calendars.ReadWrite',
  'User.Read',
].join(' ')

export function getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.MS_GRAPH_CLIENT_ID,
    response_type: 'code',
    redirect_uri: env.MS_GRAPH_REDIRECT_URI,
    scope: SCOPES,
    state,
    response_mode: 'query',
    prompt: 'consent',
  })
  return `${AUTHORIZE_URL}?${params.toString()}`
}

export async function exchangeCodeForTokens(code: string) {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.MS_GRAPH_CLIENT_ID,
      client_secret: env.MS_GRAPH_CLIENT_SECRET,
      code,
      redirect_uri: env.MS_GRAPH_REDIRECT_URI,
      grant_type: 'authorization_code',
      scope: SCOPES,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Microsoft OAuth Fehler: ${err}`)
  }

  const data = await response.json() as {
    access_token: string
    refresh_token: string
    expires_in: number
    id_token?: string
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
}

export async function getUserProfile(accessToken: string) {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) throw new Error('Microsoft Profil konnte nicht geladen werden')
  return response.json() as Promise<{ displayName: string; mail: string; userPrincipalName: string }>
}
