import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createVersionSchema, listVersionsSchema } from '../validators/version.validators'
import { authMiddleware } from '../middleware/auth'
import * as versionService from '../services/version.service'

export const versionRoutes = new Hono()

versionRoutes.use('*', authMiddleware)

versionRoutes.get('/:documentId/versions', zValidator('query', listVersionsSchema), async (c) => {
  const user = c.get('user')
  const documentId = c.req.param('documentId')
  const query = c.req.valid('query')
  const result = await versionService.listVersions(documentId, user.userId, query)
  return c.json({ ok: true, data: result })
})

versionRoutes.get('/:documentId/versions/:versionId', async (c) => {
  const user = c.get('user')
  const documentId = c.req.param('documentId')
  const versionId = c.req.param('versionId')
  const result = await versionService.getVersion(documentId, versionId, user.userId)
  return c.json({ ok: true, data: result })
})

versionRoutes.post('/:documentId/versions', zValidator('json', createVersionSchema), async (c) => {
  const user = c.get('user')
  const documentId = c.req.param('documentId')
  const body = c.req.valid('json')
  const result = await versionService.createNamedVersion(documentId, user.userId, body.label)
  return c.json({ ok: true, data: result }, 201)
})

versionRoutes.post('/:documentId/versions/:versionId/restore', async (c) => {
  const user = c.get('user')
  const documentId = c.req.param('documentId')
  const versionId = c.req.param('versionId')
  const result = await versionService.restoreVersion(documentId, versionId, user.userId)
  return c.json({ ok: true, data: result })
})
