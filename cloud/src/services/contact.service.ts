import { eq, and, or, like, desc, sql } from 'drizzle-orm'
import { db } from '../db/client'
import { contacts, contactGroups, contactGroupMembers } from '../db/schema'
import { NotFoundError } from '../types/api'

function generateId(): string {
  return crypto.randomUUID()
}

// ── Contacts CRUD ──

export function listContacts(
  userId: string,
  options: { page: number; pageSize: number; search?: string; groupId?: string },
) {
  const offset = (options.page - 1) * options.pageSize

  let baseQuery = db
    .select()
    .from(contacts)
    .where(
      options.search
        ? and(
            eq(contacts.userId, userId),
            or(
              like(contacts.displayName, `%${options.search}%`),
              like(contacts.email, `%${options.search}%`),
              like(contacts.company, `%${options.search}%`),
            ),
          )
        : eq(contacts.userId, userId),
    )
    .orderBy(contacts.displayName)

  if (options.groupId) {
    const memberContactIds = db
      .select({ contactId: contactGroupMembers.contactId })
      .from(contactGroupMembers)
      .where(eq(contactGroupMembers.groupId, options.groupId))
      .all()
      .map((m) => m.contactId)

    if (memberContactIds.length === 0) {
      return { contacts: [], total: 0, page: options.page, pageSize: options.pageSize }
    }

    const allContacts = baseQuery.all().filter((c) => memberContactIds.includes(c.id))
    return {
      contacts: allContacts.slice(offset, offset + options.pageSize),
      total: allContacts.length,
      page: options.page,
      pageSize: options.pageSize,
    }
  }

  const allContacts = baseQuery.all()
  return {
    contacts: allContacts.slice(offset, offset + options.pageSize),
    total: allContacts.length,
    page: options.page,
    pageSize: options.pageSize,
  }
}

export function getContact(contactId: string, userId: string) {
  const contact = db
    .select()
    .from(contacts)
    .where(and(eq(contacts.id, contactId), eq(contacts.userId, userId)))
    .get()
  if (!contact) throw new NotFoundError('Kontakt nicht gefunden')
  return contact
}

export function createContact(userId: string, input: Record<string, unknown>) {
  const id = generateId()
  const now = new Date()
  db.insert(contacts)
    .values({ id, userId, ...input, createdAt: now, updatedAt: now } as typeof contacts.$inferInsert)
    .run()
  return db.select().from(contacts).where(eq(contacts.id, id)).get()!
}

export function updateContact(contactId: string, userId: string, input: Record<string, unknown>) {
  const existing = getContact(contactId, userId)
  db.update(contacts)
    .set({ ...input, updatedAt: new Date() } as Partial<typeof contacts.$inferInsert>)
    .where(eq(contacts.id, contactId))
    .run()
  return db.select().from(contacts).where(eq(contacts.id, contactId)).get()!
}

export function deleteContact(contactId: string, userId: string) {
  getContact(contactId, userId)
  db.delete(contacts).where(eq(contacts.id, contactId)).run()
}

export function autocompleteContacts(userId: string, query: string, limit: number) {
  return db
    .select({
      id: contacts.id,
      displayName: contacts.displayName,
      email: contacts.email,
      company: contacts.company,
    })
    .from(contacts)
    .where(
      and(
        eq(contacts.userId, userId),
        or(
          like(contacts.displayName, `%${query}%`),
          like(contacts.email, `%${query}%`),
        ),
      ),
    )
    .limit(limit)
    .all()
}

// ── Contact Groups ──

export function listGroups(userId: string) {
  const groups = db.select().from(contactGroups).where(eq(contactGroups.userId, userId)).orderBy(contactGroups.name).all()
  return groups.map((g) => {
    const count = db
      .select({ count: sql<number>`count(*)` })
      .from(contactGroupMembers)
      .where(eq(contactGroupMembers.groupId, g.id))
      .get()
    return { ...g, memberCount: count?.count ?? 0 }
  })
}

export function createGroup(userId: string, input: { name: string; color?: string }) {
  const id = generateId()
  const now = new Date()
  db.insert(contactGroups).values({ id, userId, name: input.name, color: input.color, createdAt: now, updatedAt: now }).run()
  return db.select().from(contactGroups).where(eq(contactGroups.id, id)).get()!
}

export function updateGroup(groupId: string, userId: string, input: { name?: string; color?: string }) {
  const group = db
    .select()
    .from(contactGroups)
    .where(and(eq(contactGroups.id, groupId), eq(contactGroups.userId, userId)))
    .get()
  if (!group) throw new NotFoundError('Gruppe nicht gefunden')
  db.update(contactGroups).set({ ...input, updatedAt: new Date() }).where(eq(contactGroups.id, groupId)).run()
  return db.select().from(contactGroups).where(eq(contactGroups.id, groupId)).get()!
}

export function deleteGroup(groupId: string, userId: string) {
  const group = db
    .select()
    .from(contactGroups)
    .where(and(eq(contactGroups.id, groupId), eq(contactGroups.userId, userId)))
    .get()
  if (!group) throw new NotFoundError('Gruppe nicht gefunden')
  db.delete(contactGroups).where(eq(contactGroups.id, groupId)).run()
}

export function addGroupMember(groupId: string, userId: string, contactId: string) {
  // Verify group belongs to user
  const group = db
    .select()
    .from(contactGroups)
    .where(and(eq(contactGroups.id, groupId), eq(contactGroups.userId, userId)))
    .get()
  if (!group) throw new NotFoundError('Gruppe nicht gefunden')

  // Verify contact belongs to user
  getContact(contactId, userId)

  const existing = db
    .select()
    .from(contactGroupMembers)
    .where(and(eq(contactGroupMembers.groupId, groupId), eq(contactGroupMembers.contactId, contactId)))
    .get()
  if (existing) return existing

  const id = generateId()
  db.insert(contactGroupMembers).values({ id, groupId, contactId, createdAt: new Date() }).run()
  return db.select().from(contactGroupMembers).where(eq(contactGroupMembers.id, id)).get()!
}

export function removeGroupMember(groupId: string, userId: string, contactId: string) {
  const group = db
    .select()
    .from(contactGroups)
    .where(and(eq(contactGroups.id, groupId), eq(contactGroups.userId, userId)))
    .get()
  if (!group) throw new NotFoundError('Gruppe nicht gefunden')

  db.delete(contactGroupMembers)
    .where(and(eq(contactGroupMembers.groupId, groupId), eq(contactGroupMembers.contactId, contactId)))
    .run()
}
