import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import {
  addImapAccountSchema, updateAccountSchema, sendEmailSchema,
  setReadStatusSchema, setFlaggedStatusSchema, moveEmailSchema,
  searchEmailSchema, listEmailsSchema,
} from '../validators/email.validators'
import { authMiddleware } from '../middleware/auth'
import * as emailService from '../services/email.service'
import { syncAccount } from '../services/emailSync.service'

export const emailRoutes = new Hono()

emailRoutes.use('*', authMiddleware)

// ── Accounts ──

emailRoutes.get('/accounts', async (c) => {
  const user = c.get('user')
  const result = emailService.listAccounts(user.userId)
  return c.json({ ok: true, data: result })
})

emailRoutes.post('/accounts/imap', zValidator('json', addImapAccountSchema), async (c) => {
  const user = c.get('user')
  const body = c.req.valid('json')
  const result = await emailService.addImapAccount(user.userId, body)
  return c.json({ ok: true, data: result }, 201)
})

emailRoutes.put('/accounts/:id', zValidator('json', updateAccountSchema), async (c) => {
  const user = c.get('user')
  const body = c.req.valid('json')
  const result = emailService.updateAccount(c.req.param('id'), user.userId, body)
  return c.json({ ok: true, data: result })
})

emailRoutes.delete('/accounts/:id', async (c) => {
  const user = c.get('user')
  emailService.deleteAccount(c.req.param('id'), user.userId)
  return c.json({ ok: true })
})

emailRoutes.post('/accounts/:id/sync', async (c) => {
  const user = c.get('user')
  const result = await syncAccount(c.req.param('id'), user.userId)
  return c.json({ ok: true, data: result })
})

// ── Microsoft OAuth ──

emailRoutes.get('/oauth/microsoft/authorize', async (c) => {
  const user = c.get('user')
  const url = emailService.getMicrosoftAuthUrl(user.userId)
  return c.json({ ok: true, data: { url } })
})

emailRoutes.get('/oauth/microsoft/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state')
  if (!code || !state) return c.json({ ok: false, error: { code: 'MISSING_PARAMS', message: 'Code und State erforderlich' } }, 400)

  try {
    const result = await emailService.handleMicrosoftCallback(code, state)
    return c.html(`<html><body><h2>Microsoft-Konto verbunden!</h2><p>${result.emailAddress}</p><script>window.close()</script></body></html>`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler'
    return c.html(`<html><body><h2>Fehler</h2><p>${message}</p></body></html>`)
  }
})

// ── Folders ──

emailRoutes.get('/accounts/:id/folders', async (c) => {
  const user = c.get('user')
  const result = emailService.listFolders(c.req.param('id'), user.userId)
  return c.json({ ok: true, data: result })
})

// ── Emails ──

emailRoutes.get('/accounts/:id/folders/:fId/emails', zValidator('query', listEmailsSchema), async (c) => {
  const user = c.get('user')
  const { page, pageSize } = c.req.valid('query')
  const result = emailService.listEmails(c.req.param('id'), c.req.param('fId'), user.userId, page, pageSize)
  return c.json({ ok: true, data: result })
})

emailRoutes.get('/accounts/:id/emails/:eId', async (c) => {
  const user = c.get('user')
  const result = await emailService.getEmail(c.req.param('id'), c.req.param('eId'), user.userId)
  return c.json({ ok: true, data: result })
})

emailRoutes.post('/accounts/:id/emails/send', zValidator('json', sendEmailSchema), async (c) => {
  const user = c.get('user')
  const body = c.req.valid('json')
  const result = await emailService.sendEmail(c.req.param('id'), user.userId, body)
  return c.json({ ok: true, data: result })
})

emailRoutes.put('/accounts/:id/emails/:eId/read', zValidator('json', setReadStatusSchema), async (c) => {
  const user = c.get('user')
  const { isRead } = c.req.valid('json')
  const result = await emailService.setReadStatus(c.req.param('id'), c.req.param('eId'), user.userId, isRead)
  return c.json({ ok: true, data: result })
})

emailRoutes.put('/accounts/:id/emails/:eId/flag', zValidator('json', setFlaggedStatusSchema), async (c) => {
  const user = c.get('user')
  const { isFlagged } = c.req.valid('json')
  const result = await emailService.setFlaggedStatus(c.req.param('id'), c.req.param('eId'), user.userId, isFlagged)
  return c.json({ ok: true, data: result })
})

emailRoutes.post('/accounts/:id/emails/:eId/move', zValidator('json', moveEmailSchema), async (c) => {
  const user = c.get('user')
  const { targetFolderId } = c.req.valid('json')
  const result = await emailService.moveEmail(c.req.param('id'), c.req.param('eId'), user.userId, targetFolderId)
  return c.json({ ok: true, data: result })
})

emailRoutes.delete('/accounts/:id/emails/:eId', async (c) => {
  const user = c.get('user')
  await emailService.deleteEmail(c.req.param('id'), c.req.param('eId'), user.userId)
  return c.json({ ok: true })
})

// ── Attachments ──

emailRoutes.get('/accounts/:id/emails/:eId/attachments/:aId', async (c) => {
  const user = c.get('user')
  const result = await emailService.getAttachment(c.req.param('id'), c.req.param('eId'), c.req.param('aId'), user.userId)
  const binaryData = Buffer.from(result.content, 'base64')
  return new Response(binaryData, {
    headers: {
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Content-Length': String(binaryData.length),
    },
  })
})

// ── Search ──

emailRoutes.get('/accounts/:id/search', zValidator('query', searchEmailSchema), async (c) => {
  const user = c.get('user')
  const { q, folderId } = c.req.valid('query')
  const result = await emailService.searchEmails(c.req.param('id'), user.userId, q, folderId)
  return c.json({ ok: true, data: result })
})
