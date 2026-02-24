import { relations } from 'drizzle-orm'
import { users } from './tables/users'
import { documents } from './tables/documents'
import { documentVersions } from './tables/documentVersions'
import { shares } from './tables/shares'
import { refreshTokens } from './tables/refreshTokens'
import { emailAccounts } from './tables/emailAccounts'
import { emailFolders } from './tables/emailFolders'
import { emails } from './tables/emails'
import { emailAttachments } from './tables/emailAttachments'
import { contacts } from './tables/contacts'
import { contactGroups } from './tables/contactGroups'
import { contactGroupMembers } from './tables/contactGroupMembers'
import { calendars } from './tables/calendars'
import { events } from './tables/events'
import { eventAttendees } from './tables/eventAttendees'
import { eventReminders } from './tables/eventReminders'
// Meet-Tabellen
import { conversations } from './tables/conversations'
import { conversationMembers } from './tables/conversationMembers'
import { messages } from './tables/messages'
import { attachments } from './tables/attachments'
import { reactions } from './tables/reactions'
import { teams } from './tables/teams'
import { teamMembers } from './tables/teamMembers'
import { channels } from './tables/channels'
import { channelMembers } from './tables/channelMembers'
import { calls } from './tables/calls'
import { meetings } from './tables/meetings'
import { userStatus } from './tables/userStatus'

export {
  users, documents, documentVersions, shares, refreshTokens,
  emailAccounts, emailFolders, emails, emailAttachments,
  contacts, contactGroups, contactGroupMembers,
  calendars, events, eventAttendees, eventReminders,
  // Meet
  conversations, conversationMembers, messages, attachments, reactions,
  teams, teamMembers, channels, channelMembers,
  calls, meetings, userStatus,
}

// ── Users Relations ──
export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  shares: many(shares, { relationName: 'sharedWith' }),
  refreshTokens: many(refreshTokens),
  emailAccounts: many(emailAccounts),
  contacts: many(contacts),
  contactGroups: many(contactGroups),
  calendars: many(calendars),
}))

// ── Documents Relations ──
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

// ── Email Relations ──
export const emailAccountsRelations = relations(emailAccounts, ({ one, many }) => ({
  user: one(users, { fields: [emailAccounts.userId], references: [users.id] }),
  folders: many(emailFolders),
}))

export const emailFoldersRelations = relations(emailFolders, ({ one, many }) => ({
  account: one(emailAccounts, { fields: [emailFolders.accountId], references: [emailAccounts.id] }),
  emails: many(emails),
}))

export const emailsRelations = relations(emails, ({ one, many }) => ({
  folder: one(emailFolders, { fields: [emails.folderId], references: [emailFolders.id] }),
  attachments: many(emailAttachments),
}))

export const emailAttachmentsRelations = relations(emailAttachments, ({ one }) => ({
  email: one(emails, { fields: [emailAttachments.emailId], references: [emails.id] }),
}))

// ── Contacts Relations ──
export const contactsRelations = relations(contacts, ({ one, many }) => ({
  user: one(users, { fields: [contacts.userId], references: [users.id] }),
  groupMembers: many(contactGroupMembers),
}))

export const contactGroupsRelations = relations(contactGroups, ({ one, many }) => ({
  user: one(users, { fields: [contactGroups.userId], references: [users.id] }),
  members: many(contactGroupMembers),
}))

export const contactGroupMembersRelations = relations(contactGroupMembers, ({ one }) => ({
  contact: one(contacts, { fields: [contactGroupMembers.contactId], references: [contacts.id] }),
  group: one(contactGroups, { fields: [contactGroupMembers.groupId], references: [contactGroups.id] }),
}))

// ── Calendar Relations ──
export const calendarsRelations = relations(calendars, ({ one, many }) => ({
  user: one(users, { fields: [calendars.userId], references: [users.id] }),
  events: many(events),
}))

export const eventsRelations = relations(events, ({ one, many }) => ({
  calendar: one(calendars, { fields: [events.calendarId], references: [calendars.id] }),
  attendees: many(eventAttendees),
  reminders: many(eventReminders),
}))

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  event: one(events, { fields: [eventAttendees.eventId], references: [events.id] }),
}))

export const eventRemindersRelations = relations(eventReminders, ({ one }) => ({
  event: one(events, { fields: [eventReminders.eventId], references: [events.id] }),
}))
