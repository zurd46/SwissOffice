import { relations } from 'drizzle-orm'
import { users } from './tables/users'
import { documents } from './tables/documents'
import { documentVersions } from './tables/documentVersions'
import { shares } from './tables/shares'
import { refreshTokens } from './tables/refreshTokens'

export { users, documents, documentVersions, shares, refreshTokens }

export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  shares: many(shares, { relationName: 'sharedWith' }),
  refreshTokens: many(refreshTokens),
}))

export const documentsRelations = relations(documents, ({ one, many }) => ({
  owner: one(users, { fields: [documents.ownerId], references: [users.id] }),
  versions: many(documentVersions),
  shares: many(shares),
}))

export const documentVersionsRelations = relations(documentVersions, ({ one }) => ({
  document: one(documents, { fields: [documentVersions.documentId], references: [documents.id] }),
  createdByUser: one(users, { fields: [documentVersions.createdBy], references: [users.id] }),
}))

export const sharesRelations = relations(shares, ({ one }) => ({
  document: one(documents, { fields: [shares.documentId], references: [documents.id] }),
  sharedByUser: one(users, { fields: [shares.sharedBy], references: [users.id] }),
  sharedWithUser: one(users, { fields: [shares.sharedWith], references: [users.id], relationName: 'sharedWith' }),
}))

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, { fields: [refreshTokens.userId], references: [users.id] }),
}))
