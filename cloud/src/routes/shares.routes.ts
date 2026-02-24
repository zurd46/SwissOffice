import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createShareSchema, updateShareSchema } from '../validators/share.validators'
import { authMiddleware } from '../middleware/auth'
import * as shareService from '../services/share.service'

export const shareRoutes = new Hono()

shareRoutes.use('*', authMiddleware)

shareRoutes.get('/:documentId/shares', async (c) => {
  const user = c.get('user')
  const documentId = c.req.param('documentId')
  const result = await shareService.listShares(documentId, user.userId)
  return c.json({ ok: true, data: result })
})

shareRoutes.post('/:documentId/shares', zValidator('json', createShareSchema), async (c) => {
  const user = c.get('user')
  const documentId = c.req.param('documentId')
  const body = c.req.valid('json')
  const result = await shareService.createShare(documentId, user.userId, body)
  return c.json({ ok: true, data: result }, 201)
})

shareRoutes.put('/:documentId/shares/:shareId', zValidator('json', updateShareSchema), async (c) => {
  const user = c.get('user')
  const documentId = c.req.param('documentId')
  const shareId = c.req.param('shareId')
  const body = c.req.valid('json')
  const result = await shareService.updateShare(documentId, shareId, user.userId, body)
  return c.json({ ok: true, data: result })
})

shareRoutes.delete('/:documentId/shares/:shareId', async (c) => {
  const user = c.get('user')
  const documentId = c.req.param('documentId')
  const shareId = c.req.param('shareId')
  await shareService.deleteShare(documentId, shareId, user.userId)
  return c.json({ ok: true })
})
