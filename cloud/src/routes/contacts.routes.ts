import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import {
  createContactSchema, updateContactSchema, listContactsSchema,
  autocompleteContactSchema, createContactGroupSchema, updateContactGroupSchema,
  addGroupMemberSchema,
} from '../validators/contact.validators'
import { authMiddleware } from '../middleware/auth'
import * as contactService from '../services/contact.service'
import { importMicrosoftContacts } from '../services/microsoftImport.service'

export const contactRoutes = new Hono()

contactRoutes.use('*', authMiddleware)

// ── Contacts List + Create ──

contactRoutes.get('/', zValidator('query', listContactsSchema), async (c) => {
  const user = c.get('user')
  const query = c.req.valid('query')
  const result = contactService.listContacts(user.userId, query)
  return c.json({ ok: true, data: result })
})

contactRoutes.post('/', zValidator('json', createContactSchema), async (c) => {
  const user = c.get('user')
  const body = c.req.valid('json')
  const result = contactService.createContact(user.userId, body)
  return c.json({ ok: true, data: result }, 201)
})

// ── Static routes BEFORE /:id ──

contactRoutes.get('/autocomplete', zValidator('query', autocompleteContactSchema), async (c) => {
  const user = c.get('user')
  const { q, limit } = c.req.valid('query')
  const result = contactService.autocompleteContacts(user.userId, q, limit)
  return c.json({ ok: true, data: result })
})

// ── Contact Groups (before /:id to avoid conflict) ──

contactRoutes.get('/groups', async (c) => {
  const user = c.get('user')
  const result = contactService.listGroups(user.userId)
  return c.json({ ok: true, data: result })
})

contactRoutes.post('/groups', zValidator('json', createContactGroupSchema), async (c) => {
  const user = c.get('user')
  const body = c.req.valid('json')
  const result = contactService.createGroup(user.userId, body)
  return c.json({ ok: true, data: result }, 201)
})

contactRoutes.put('/groups/:id', zValidator('json', updateContactGroupSchema), async (c) => {
  const user = c.get('user')
  const body = c.req.valid('json')
  const result = contactService.updateGroup(c.req.param('id'), user.userId, body)
  return c.json({ ok: true, data: result })
})

contactRoutes.delete('/groups/:id', async (c) => {
  const user = c.get('user')
  contactService.deleteGroup(c.req.param('id'), user.userId)
  return c.json({ ok: true })
})

contactRoutes.post('/groups/:id/members', zValidator('json', addGroupMemberSchema), async (c) => {
  const user = c.get('user')
  const { contactId } = c.req.valid('json')
  const result = contactService.addGroupMember(c.req.param('id'), user.userId, contactId)
  return c.json({ ok: true, data: result }, 201)
})

contactRoutes.delete('/groups/:gId/members/:cId', async (c) => {
  const user = c.get('user')
  contactService.removeGroupMember(c.req.param('gId'), user.userId, c.req.param('cId'))
  return c.json({ ok: true })
})

// ── Microsoft Import ──

contactRoutes.post('/import/microsoft', async (c) => {
  const user = c.get('user')
  const { accountId } = await c.req.json()
  const result = await importMicrosoftContacts(accountId, user.userId)
  return c.json({ ok: true, data: result })
})

// ── Contacts by ID (AFTER static routes) ──

contactRoutes.get('/:id', async (c) => {
  const user = c.get('user')
  const result = contactService.getContact(c.req.param('id'), user.userId)
  return c.json({ ok: true, data: result })
})

contactRoutes.put('/:id', zValidator('json', updateContactSchema), async (c) => {
  const user = c.get('user')
  const body = c.req.valid('json')
  const result = contactService.updateContact(c.req.param('id'), user.userId, body)
  return c.json({ ok: true, data: result })
})

contactRoutes.delete('/:id', async (c) => {
  const user = c.get('user')
  contactService.deleteContact(c.req.param('id'), user.userId)
  return c.json({ ok: true })
})
