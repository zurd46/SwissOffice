import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createDocumentSchema, updateDocumentSchema, listDocumentsSchema } from '../validators/document.validators'
import { authMiddleware } from '../middleware/auth'
import * as documentService from '../services/document.service'

export const documentRoutes = new Hono()

documentRoutes.use('*', authMiddleware)

documentRoutes.get('/', zValidator('query', listDocumentsSchema), async (c) => {
  const user = c.get('user')
  const query = c.req.valid('query')
  const result = documentService.listDocuments(user.userId, query)
  return c.json({ ok: true, data: result })
})

documentRoutes.post('/', zValidator('json', createDocumentSchema), async (c) => {
  const user = c.get('user')
  const body = c.req.valid('json')
  const result = documentService.createDocument(user.userId, body)
  return c.json({ ok: true, data: result }, 201)
})

documentRoutes.get('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const result = await documentService.getDocument(id, user.userId)
  return c.json({ ok: true, data: result })
})

documentRoutes.put('/:id', zValidator('json', updateDocumentSchema), async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const body = c.req.valid('json')
  const result = await documentService.updateDocument(id, user.userId, body)
  return c.json({ ok: true, data: result })
})

documentRoutes.delete('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  await documentService.deleteDocument(id, user.userId)
  return c.json({ ok: true })
})
