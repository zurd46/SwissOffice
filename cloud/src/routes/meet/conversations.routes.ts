import { Hono } from 'hono'
import { db } from '../../db'
import { conversations, conversationMembers, messages } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'

export const conversationRoutes = new Hono()

// Alle Conversations eines Users
conversationRoutes.get('/', async (c) => {
  const userId = c.req.header('x-user-id')
  if (!userId) return c.json({ error: 'Nicht authentifiziert' }, 401)

  const memberships = await db.select()
    .from(conversationMembers)
    .where(eq(conversationMembers.userId, userId))

  const convIds = memberships.map(m => m.conversationId)
  if (convIds.length === 0) return c.json([])

  const result = await db.select()
    .from(conversations)
    .orderBy(desc(conversations.updatedAt))

  return c.json(result.filter(conv => convIds.includes(conv.id)))
})

// Neue Conversation erstellen
conversationRoutes.post('/', async (c) => {
  const userId = c.req.header('x-user-id')
  if (!userId) return c.json({ error: 'Nicht authentifiziert' }, 401)

  const body = await c.req.json() as {
    type: 'direct' | 'group'
    name?: string
    memberIds: string[]
  }

  const convId = crypto.randomUUID()
  await db.insert(conversations).values({
    id: convId,
    type: body.type,
    name: body.name,
    createdBy: userId,
  })

  // Creator als Mitglied hinzufügen
  const allMembers = [userId, ...body.memberIds]
  for (const memberId of allMembers) {
    await db.insert(conversationMembers).values({
      id: crypto.randomUUID(),
      conversationId: convId,
      userId: memberId,
    })
  }

  return c.json({ id: convId }, 201)
})

// Nachrichten einer Conversation
conversationRoutes.get('/:id/messages', async (c) => {
  const convId = c.req.param('id')
  const limit = Number(c.req.query('limit') ?? '50')
  const offset = Number(c.req.query('offset') ?? '0')

  const result = await db.select()
    .from(messages)
    .where(eq(messages.conversationId, convId))
    .orderBy(desc(messages.createdAt))
    .limit(limit)
    .offset(offset)

  return c.json(result.reverse())
})

// Nachricht senden
conversationRoutes.post('/:id/messages', async (c) => {
  const userId = c.req.header('x-user-id')
  if (!userId) return c.json({ error: 'Nicht authentifiziert' }, 401)

  const convId = c.req.param('id')
  const body = await c.req.json() as {
    content: string
    type?: string
    replyToId?: string
  }

  const msgId = crypto.randomUUID()
  await db.insert(messages).values({
    id: msgId,
    conversationId: convId,
    senderId: userId,
    type: (body.type as 'text') ?? 'text',
    content: body.content,
    replyToId: body.replyToId,
  })

  // Conversation updatedAt aktualisieren
  await db.update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, convId))

  return c.json({ id: msgId }, 201)
})
