import { Hono } from 'hono'
import { db } from '../../db'
import { teams, teamMembers, channels, channelMembers } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const teamRoutes = new Hono()

// Alle Teams eines Users
teamRoutes.get('/', async (c) => {
  const userId = c.req.header('x-user-id')
  if (!userId) return c.json({ error: 'Nicht authentifiziert' }, 401)

  const memberships = await db.select()
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId))

  const teamIds = memberships.map(m => m.teamId)
  if (teamIds.length === 0) return c.json([])

  const allTeams = await db.select().from(teams)
  const userTeams = allTeams.filter(t => teamIds.includes(t.id))

  // Channels pro Team laden
  const result = await Promise.all(userTeams.map(async (team) => {
    const teamChannels = await db.select()
      .from(channels)
      .where(eq(channels.teamId, team.id))
    return { ...team, channels: teamChannels }
  }))

  return c.json(result)
})

// Team erstellen
teamRoutes.post('/', async (c) => {
  const userId = c.req.header('x-user-id')
  if (!userId) return c.json({ error: 'Nicht authentifiziert' }, 401)

  const body = await c.req.json() as {
    name: string
    description?: string
    isPublic?: boolean
  }

  const teamId = crypto.randomUUID()
  await db.insert(teams).values({
    id: teamId,
    name: body.name,
    description: body.description,
    isPublic: body.isPublic ?? true,
    createdBy: userId,
  })

  // Creator als Owner hinzufügen
  await db.insert(teamMembers).values({
    id: crypto.randomUUID(),
    teamId,
    userId,
    role: 'owner',
  })

  // Default "Allgemein" Channel erstellen
  const channelId = crypto.randomUUID()
  await db.insert(channels).values({
    id: channelId,
    teamId,
    name: 'Allgemein',
    type: 'public',
    isDefault: true,
    createdBy: userId,
  })

  await db.insert(channelMembers).values({
    id: crypto.randomUUID(),
    channelId,
    userId,
  })

  return c.json({ id: teamId }, 201)
})

// Channel erstellen
teamRoutes.post('/:teamId/channels', async (c) => {
  const userId = c.req.header('x-user-id')
  if (!userId) return c.json({ error: 'Nicht authentifiziert' }, 401)

  const teamId = c.req.param('teamId')
  const body = await c.req.json() as {
    name: string
    description?: string
    type?: 'public' | 'private' | 'announcement'
  }

  const channelId = crypto.randomUUID()
  await db.insert(channels).values({
    id: channelId,
    teamId,
    name: body.name,
    description: body.description,
    type: body.type ?? 'public',
    createdBy: userId,
  })

  // Creator als Mitglied
  await db.insert(channelMembers).values({
    id: crypto.randomUUID(),
    channelId,
    userId,
  })

  return c.json({ id: channelId }, 201)
})

// Mitglied einladen
teamRoutes.post('/:teamId/members', async (c) => {
  const body = await c.req.json() as { userId: string; role?: string }
  const teamId = c.req.param('teamId')

  await db.insert(teamMembers).values({
    id: crypto.randomUUID(),
    teamId,
    userId: body.userId,
    role: (body.role as 'member') ?? 'member',
  })

  return c.json({ ok: true }, 201)
})
