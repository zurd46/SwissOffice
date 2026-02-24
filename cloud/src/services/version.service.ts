import { eq, desc } from 'drizzle-orm'
import { db } from '../db/client'
import { documents, documentVersions, users } from '../db/schema'
import { NotFoundError } from '../types/api'
import { checkDocumentAccess } from './document.service'

function generateId(): string {
  return crypto.randomUUID()
}

export async function listVersions(
  documentId: string,
  userId: string,
  options: { page: number; limit: number },
) {
  await checkDocumentAccess(documentId, userId, 'read')

  const offset = (options.page - 1) * options.limit

  const versions = db
    .select({
      id: documentVersions.id,
      versionNumber: documentVersions.versionNumber,
      label: documentVersions.label,
      createdBy: documentVersions.createdBy,
      createdByName: users.displayName,
      sizeBytes: documentVersions.sizeBytes,
      createdAt: documentVersions.createdAt,
    })
    .from(documentVersions)
    .innerJoin(users, eq(documentVersions.createdBy, users.id))
    .where(eq(documentVersions.documentId, documentId))
    .orderBy(desc(documentVersions.versionNumber))
    .limit(options.limit)
    .offset(offset)
    .all()

  const totalResult = db
    .select({ count: documentVersions.id })
    .from(documentVersions)
    .where(eq(documentVersions.documentId, documentId))
    .all()

  return {
    versions: versions.map((v) => ({
      ...v,
      createdAt: v.createdAt.toISOString(),
    })),
    total: totalResult.length,
  }
}

export async function getVersion(documentId: string, versionId: string, userId: string) {
  await checkDocumentAccess(documentId, userId, 'read')

  const version = db
    .select({
      id: documentVersions.id,
      versionNumber: documentVersions.versionNumber,
      label: documentVersions.label,
      content: documentVersions.content,
      createdBy: documentVersions.createdBy,
      createdByName: users.displayName,
      createdAt: documentVersions.createdAt,
    })
    .from(documentVersions)
    .innerJoin(users, eq(documentVersions.createdBy, users.id))
    .where(eq(documentVersions.id, versionId))
    .get()

  if (!version) throw new NotFoundError('Version nicht gefunden')

  return { ...version, createdAt: version.createdAt.toISOString() }
}

export async function createNamedVersion(documentId: string, userId: string, label?: string) {
  await checkDocumentAccess(documentId, userId, 'write')

  const doc = db.select().from(documents).where(eq(documents.id, documentId)).get()
  if (!doc) throw new NotFoundError('Dokument nicht gefunden')

  const latest = db
    .select({ versionNumber: documentVersions.versionNumber })
    .from(documentVersions)
    .where(eq(documentVersions.documentId, documentId))
    .orderBy(desc(documentVersions.versionNumber))
    .limit(1)
    .get()

  const versionNumber = (latest?.versionNumber ?? 0) + 1
  const id = generateId()
  const now = new Date()

  db.insert(documentVersions).values({
    id,
    documentId,
    createdBy: userId,
    versionNumber,
    label: label || `Momentaufnahme #${versionNumber}`,
    content: doc.content,
    sizeBytes: doc.sizeBytes,
    createdAt: now,
  }).run()

  return { id, versionNumber, label: label || `Momentaufnahme #${versionNumber}`, createdAt: now.toISOString() }
}

export async function restoreVersion(documentId: string, versionId: string, userId: string) {
  await checkDocumentAccess(documentId, userId, 'write')

  const version = db.select().from(documentVersions).where(eq(documentVersions.id, versionId)).get()
  if (!version) throw new NotFoundError('Version nicht gefunden')

  const latest = db
    .select({ versionNumber: documentVersions.versionNumber })
    .from(documentVersions)
    .where(eq(documentVersions.documentId, documentId))
    .orderBy(desc(documentVersions.versionNumber))
    .limit(1)
    .get()

  const newVersionNumber = (latest?.versionNumber ?? 0) + 1
  const now = new Date()
  const id = generateId()

  // Neue Version mit dem wiederhergestellten Inhalt
  db.insert(documentVersions).values({
    id,
    documentId,
    createdBy: userId,
    versionNumber: newVersionNumber,
    label: `Wiederhergestellt von Version ${version.versionNumber}`,
    content: version.content,
    sizeBytes: version.sizeBytes,
    createdAt: now,
  }).run()

  // Dokument aktualisieren
  db.update(documents)
    .set({ content: version.content, sizeBytes: version.sizeBytes, updatedAt: now })
    .where(eq(documents.id, documentId))
    .run()

  return { id, versionNumber: newVersionNumber, restoredFrom: version.versionNumber }
}
