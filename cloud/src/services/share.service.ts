import { eq, and } from 'drizzle-orm'
import { db } from '../db/client'
import { shares, users, documents } from '../db/schema'
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from '../types/api'
import { checkDocumentAccess } from './document.service'

function generateId(): string {
  return crypto.randomUUID()
}

export async function listShares(documentId: string, userId: string) {
  await checkDocumentAccess(documentId, userId, 'owner')

  const result = db
    .select({
      id: shares.id,
      sharedWithId: users.id,
      sharedWithEmail: users.email,
      sharedWithName: users.displayName,
      permission: shares.permission,
      createdAt: shares.createdAt,
    })
    .from(shares)
    .innerJoin(users, eq(shares.sharedWith, users.id))
    .where(eq(shares.documentId, documentId))
    .all()

  return {
    shares: result.map((s) => ({
      id: s.id,
      sharedWith: { id: s.sharedWithId, email: s.sharedWithEmail, displayName: s.sharedWithName },
      permission: s.permission,
      createdAt: s.createdAt.toISOString(),
    })),
  }
}

export async function createShare(
  documentId: string,
  userId: string,
  input: { email: string; permission: 'read' | 'write' },
) {
  await checkDocumentAccess(documentId, userId, 'owner')

  const targetUser = db.select().from(users).where(eq(users.email, input.email)).get()
  if (!targetUser) throw new NotFoundError('Benutzer mit dieser E-Mail nicht gefunden')

  if (targetUser.id === userId) {
    throw new ValidationError('Dokument kann nicht mit sich selbst geteilt werden')
  }

  const existing = db
    .select()
    .from(shares)
    .where(and(eq(shares.documentId, documentId), eq(shares.sharedWith, targetUser.id)))
    .get()

  if (existing) throw new ConflictError('Dokument ist bereits mit diesem Benutzer geteilt')

  const id = generateId()
  const now = new Date()

  db.insert(shares).values({
    id,
    documentId,
    sharedBy: userId,
    sharedWith: targetUser.id,
    permission: input.permission,
    createdAt: now,
    updatedAt: now,
  }).run()

  return {
    id,
    sharedWith: { id: targetUser.id, email: targetUser.email, displayName: targetUser.displayName },
    permission: input.permission,
    createdAt: now.toISOString(),
  }
}

export async function updateShare(
  documentId: string,
  shareId: string,
  userId: string,
  input: { permission: 'read' | 'write' },
) {
  await checkDocumentAccess(documentId, userId, 'owner')

  const share = db.select().from(shares).where(eq(shares.id, shareId)).get()
  if (!share) throw new NotFoundError('Freigabe nicht gefunden')

  const now = new Date()
  db.update(shares)
    .set({ permission: input.permission, updatedAt: now })
    .where(eq(shares.id, shareId))
    .run()

  return { id: shareId, permission: input.permission, updatedAt: now.toISOString() }
}

export async function deleteShare(documentId: string, shareId: string, userId: string) {
  await checkDocumentAccess(documentId, userId, 'owner')

  const share = db.select().from(shares).where(eq(shares.id, shareId)).get()
  if (!share) throw new NotFoundError('Freigabe nicht gefunden')

  db.delete(shares).where(eq(shares.id, shareId)).run()
}
