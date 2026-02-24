import { eq, and, or, like, sql, desc } from 'drizzle-orm'
import { db } from '../db/client'
import { documents, shares, users, documentVersions } from '../db/schema'
import { NotFoundError, ForbiddenError } from '../types/api'
import type { ImpulsDocument } from '../types/document'

function generateId(): string {
  return crypto.randomUUID()
}

export type Permission = 'owner' | 'read' | 'write'

export async function checkDocumentAccess(
  documentId: string,
  userId: string,
  requiredPermission: 'read' | 'write' | 'owner',
): Promise<{ document: typeof documents.$inferSelect; permission: Permission }> {
  const doc = db.select().from(documents).where(eq(documents.id, documentId)).get()
  if (!doc) throw new NotFoundError('Dokument nicht gefunden')

  if (doc.ownerId === userId) {
    return { document: doc, permission: 'owner' }
  }

  const share = db
    .select()
    .from(shares)
    .where(and(eq(shares.documentId, documentId), eq(shares.sharedWith, userId)))
    .get()

  if (!share) throw new ForbiddenError('Kein Zugriff auf dieses Dokument')

  if (requiredPermission === 'owner') {
    throw new ForbiddenError('Nur der Eigentuemer kann diese Aktion ausfuehren')
  }

  if (requiredPermission === 'write' && share.permission === 'read') {
    throw new ForbiddenError('Keine Schreibberechtigung fuer dieses Dokument')
  }

  return { document: doc, permission: share.permission as Permission }
}

export function listDocuments(
  userId: string,
  options: { filter: string; search?: string; page: number; limit: number },
) {
  const offset = (options.page - 1) * options.limit

  // Eigene Dokumente
  let ownedDocs: Array<Record<string, unknown>> = []
  if (options.filter === 'owned' || options.filter === 'all') {
    const query = db
      .select({
        id: documents.id,
        title: documents.title,
        ownerId: documents.ownerId,
        ownerName: users.displayName,
        sizeBytes: documents.sizeBytes,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .innerJoin(users, eq(documents.ownerId, users.id))
      .where(
        options.search
          ? and(eq(documents.ownerId, userId), like(documents.title, `%${options.search}%`))
          : eq(documents.ownerId, userId),
      )
      .orderBy(desc(documents.updatedAt))
      .all()

    ownedDocs = query.map((d) => ({
      ...d,
      permission: 'owner' as const,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }))
  }

  // Geteilte Dokumente
  let sharedDocs: Array<Record<string, unknown>> = []
  if (options.filter === 'shared' || options.filter === 'all') {
    const query = db
      .select({
        id: documents.id,
        title: documents.title,
        ownerId: documents.ownerId,
        ownerName: users.displayName,
        sizeBytes: documents.sizeBytes,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        permission: shares.permission,
      })
      .from(shares)
      .innerJoin(documents, eq(shares.documentId, documents.id))
      .innerJoin(users, eq(documents.ownerId, users.id))
      .where(
        options.search
          ? and(eq(shares.sharedWith, userId), like(documents.title, `%${options.search}%`))
          : eq(shares.sharedWith, userId),
      )
      .orderBy(desc(documents.updatedAt))
      .all()

    sharedDocs = query.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }))
  }

  const allDocs = [...ownedDocs, ...sharedDocs]
  const total = allDocs.length
  const paginated = allDocs.slice(offset, offset + options.limit)

  return { documents: paginated, total, page: options.page, limit: options.limit }
}

export function createDocument(userId: string, input: { title: string; content: ImpulsDocument }) {
  const id = generateId()
  const now = new Date()
  const contentJson = input.content
  const sizeBytes = new TextEncoder().encode(JSON.stringify(contentJson)).length

  db.insert(documents).values({
    id,
    ownerId: userId,
    title: input.title,
    content: contentJson,
    sizeBytes,
    createdAt: now,
    updatedAt: now,
  }).run()

  // Version #1 automatisch erstellen
  db.insert(documentVersions).values({
    id: generateId(),
    documentId: id,
    createdBy: userId,
    versionNumber: 1,
    label: 'Erste Version',
    content: contentJson,
    sizeBytes,
    createdAt: now,
  }).run()

  return {
    id,
    title: input.title,
    sizeBytes,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }
}

export async function getDocument(documentId: string, userId: string) {
  const { document: doc, permission } = await checkDocumentAccess(documentId, userId, 'read')

  const owner = db.select({ displayName: users.displayName }).from(users).where(eq(users.id, doc.ownerId)).get()

  const latestVersion = db
    .select({ versionNumber: documentVersions.versionNumber })
    .from(documentVersions)
    .where(eq(documentVersions.documentId, documentId))
    .orderBy(desc(documentVersions.versionNumber))
    .limit(1)
    .get()

  return {
    id: doc.id,
    title: doc.title,
    ownerId: doc.ownerId,
    ownerName: owner?.displayName ?? 'Unbekannt',
    permission,
    content: doc.content,
    sizeBytes: doc.sizeBytes,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    currentVersionNumber: latestVersion?.versionNumber ?? 1,
  }
}

export async function updateDocument(
  documentId: string,
  userId: string,
  input: { title?: string; content?: ImpulsDocument },
) {
  const { document: doc } = await checkDocumentAccess(documentId, userId, 'write')
  const now = new Date()
  let versionNumber: number | undefined

  if (input.content) {
    const contentJson = input.content
    const sizeBytes = new TextEncoder().encode(JSON.stringify(contentJson)).length

    // Naechste Versionsnummer ermitteln
    const latest = db
      .select({ versionNumber: documentVersions.versionNumber })
      .from(documentVersions)
      .where(eq(documentVersions.documentId, documentId))
      .orderBy(desc(documentVersions.versionNumber))
      .limit(1)
      .get()

    versionNumber = (latest?.versionNumber ?? 0) + 1

    db.insert(documentVersions).values({
      id: generateId(),
      documentId,
      createdBy: userId,
      versionNumber,
      content: contentJson,
      sizeBytes,
      createdAt: now,
    }).run()

    db.update(documents)
      .set({ content: contentJson, sizeBytes, updatedAt: now, ...(input.title ? { title: input.title } : {}) })
      .where(eq(documents.id, documentId))
      .run()
  } else if (input.title) {
    db.update(documents)
      .set({ title: input.title, updatedAt: now })
      .where(eq(documents.id, documentId))
      .run()
  }

  const updated = db.select().from(documents).where(eq(documents.id, documentId)).get()!

  return {
    id: updated.id,
    title: updated.title,
    sizeBytes: updated.sizeBytes,
    updatedAt: updated.updatedAt.toISOString(),
    ...(versionNumber !== undefined ? { versionNumber } : {}),
  }
}

export async function deleteDocument(documentId: string, userId: string) {
  await checkDocumentAccess(documentId, userId, 'owner')
  db.delete(documents).where(eq(documents.id, documentId)).run()
}
