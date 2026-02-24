# Cloud — Backend-API

Zentrales Backend für die ImpulsOffice-Suite. REST-API + WebSocket mit Hono und Bun Runtime.

## Stack

- Hono 4 (HTTP Framework)
- Bun Runtime (ES Modules)
- Drizzle ORM + SQLite (Datenbank)
- Zod 3.23 (Request-Validierung)
- jose 5 (JWT Auth)
- IMAPflow + Nodemailer (E-Mail)
- ical-generator + rrule (Kalender)

## Entwicklung

```bash
bun run dev           # Hot-Reload Dev-Server (Port 4000)
bun run start         # Production Server
bun run lint          # TypeScript Type-Check
bun run db:generate   # Drizzle Migrations generieren
bun run db:migrate    # Migrations ausführen
bun run db:push       # Schema direkt pushen
bun run db:studio     # Drizzle Studio (DB-Browser)
```

## Struktur

```
src/
  index.ts              Entry Point — Bun HTTP/WS Server, Migration
  app.ts                Hono App Setup — CORS, Error Handler, Route-Mounting

  routes/
    index.ts            Route-Registry (/api/v1)
    auth.routes.ts      POST /auth/register, /auth/login, /auth/refresh, /auth/logout, GET /auth/me
    documents.routes.ts CRUD /documents, GET /documents/:id/versions
    versions.routes.ts  Document-Versionierung
    shares.routes.ts    Freigaben pro Dokument
    calendars.routes.ts Kalender + Events + Attendees + Reminders
    contacts.routes.ts  Kontakte + Gruppen + Suche
    email.routes.ts     E-Mail-Konten, Ordner, Nachrichten
    meet/
      index.ts              Meet-Route-Registry
      conversations.routes.ts  Chat-Konversationen + Nachrichten
      teams.routes.ts          Teams + Kanäle + Mitglieder

  services/
    auth.service.ts         Login, Register, Token-Refresh
    crypto.service.ts       Argon2id Hashing, JWT Sign/Verify
    document.service.ts     Dokument-CRUD mit Zugriffskontrolle
    version.service.ts      Snapshots, Wiederherstellung
    share.service.ts        Freigaben (Read/Write)
    calendar.service.ts     Kalender, Events, iCal Export/Import, Wiederholungsregeln
    contact.service.ts      Kontakte, Gruppen, Volltextsuche
    email.service.ts        E-Mail CRUD
    emailSync.service.ts    IMAP-Synchronisation
    microsoftOAuth.service.ts   Microsoft Graph OAuth2 Flow
    microsoftImport.service.ts  Kontakt-/Kalender-Import via Graph API
    providers/
      imapSmtp.provider.ts      IMAP/SMTP E-Mail-Provider
      microsoftGraph.provider.ts Microsoft Graph API-Client

  middleware/
    auth.ts              JWT-Validierung, User-Injection in Context
    cors.ts              CORS-Konfiguration
    errorHandler.ts      Globaler Error Handler

  db/
    client.ts            Drizzle-Client Initialisierung
    schema.ts            Gesamtschema (Re-Export aller Tabellen)
    migrate.ts           Migration-Runner
    tables/              32 Drizzle-Tabellen:
      users.ts               Benutzer (email, name, passwordHash)
      refreshTokens.ts       Refresh-Tokens
      userStatus.ts          Online-/Offline-Status
      documents.ts           Dokumente (title, content JSON, ownerId)
      documentVersions.ts    Versionen (versionNumber, snapshot)
      shares.ts              Freigaben (documentId, userId, permission)
      attachments.ts         Datei-Anhänge
      calendars.ts           Kalender
      events.ts              Termine (start, end, rrule, location)
      eventAttendees.ts      Teilnehmer
      eventReminders.ts      Erinnerungen
      contacts.ts            Kontakte
      contactGroups.ts       Kontaktgruppen
      contactGroupMembers.ts Gruppen-Mitglieder
      teams.ts               Teams
      teamMembers.ts         Team-Mitglieder
      channels.ts            Team-Kanäle (public, private, announcement)
      channelMembers.ts      Kanal-Mitglieder
      conversations.ts       Chat-Konversationen (direct, group)
      conversationMembers.ts Konversations-Teilnehmer
      messages.ts            Nachrichten (text, attachments, replyTo)
      reactions.ts           Emoji-Reaktionen
      calls.ts               Anruf-Log
      meetings.ts            Meetings
      emailAccounts.ts       E-Mail-Konten
      emails.ts              E-Mails
      emailFolders.ts        E-Mail-Ordner
      emailAttachments.ts    E-Mail-Anhänge

  ws/
    WebSocketManager.ts     WebSocket-Verbindungsverwaltung
    handlers/
      chatHandler.ts        Echtzeit-Chat-Nachrichten
      presenceHandler.ts    Online-/Offline-Status
      callSignalingHandler.ts  WebRTC Signaling

  validators/
    auth.validators.ts      Register, Login Schemas
    document.validators.ts  Dokument-CRUD Schemas
    calendar.validators.ts  Kalender/Event Schemas
    contact.validators.ts   Kontakt Schemas
    email.validators.ts     E-Mail Schemas
    share.validators.ts     Freigabe Schemas
    version.validators.ts   Versions Schemas

  types/
    api.ts                  API-Response Typen
    auth.ts                 Auth Typen (AuthUser, TokenPayload)
    document.ts             Dokument Typen
    calendar.ts             Kalender Typen
    contact.ts              Kontakt Typen
    email.ts                E-Mail Typen

  config/
    env.ts                  Umgebungsvariablen (PORT, JWT_SECRET, DB_PATH, etc.)
```

## API-Endpunkte

Basis: `http://localhost:4000/api/v1`

| Bereich | Prefix | Auth |
|---|---|---|
| Auth | `/auth` | Nein (Register/Login), Ja (Refresh/Logout/Me) |
| Dokumente | `/documents` | Ja |
| Versionen | `/versions` | Ja |
| Freigaben | `/shares` | Ja |
| Kalender | `/calendars` | Ja |
| Kontakte | `/contacts` | Ja |
| E-Mail | `/email` | Ja |
| Chat | `/meet/conversations` | Ja |
| Teams | `/meet/teams` | Ja |

## Auth-Flow

1. `POST /auth/register` — Benutzer erstellen (Argon2id Hash)
2. `POST /auth/login` — Access Token (15min) + Refresh Token (7d)
3. `POST /auth/refresh` — Neues Access Token
4. Header: `Authorization: Bearer <access-token>`
5. WebSocket: Token als Query-Parameter `?token=<access-token>`

## Patterns

### Neue Route hinzufügen

```ts
// src/routes/meine.routes.ts
import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { zValidator } from '@hono/zod-validator'
import { meineSchema } from '../validators/meine.validators'

const app = new Hono()
app.use('*', authMiddleware)

app.get('/', async (c) => {
  const user = c.get('user')  // AuthUser aus Middleware
  // ...
  return c.json({ data: result })
})

app.post('/', zValidator('json', meineSchema), async (c) => {
  const body = c.req.valid('json')
  // ...
  return c.json({ data: result }, 201)
})

export { app as meineRoutes }
```

In `src/routes/index.ts` einbinden: `app.route('/meine', meineRoutes)`

### Neue Tabelle hinzufügen

```ts
// src/db/tables/meineTabelle.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const meineTabelle = sqliteTable('meine_tabelle', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})
```

In `src/db/schema.ts` re-exportieren, dann `bun run db:generate && bun run db:migrate`.

## Konventionen

- ES Modules (`import`/`export`)
- Alle Routen-Dateien: `*.routes.ts`
- Alle Validierungs-Dateien: `*.validators.ts`
- Alle Service-Dateien: `*.service.ts`
- Zod-Validierung auf **jedem** Endpoint
- Fehler immer über `HTTPException` werfen
- DB-Tabellen in separaten Dateien unter `src/db/tables/`
- Labels: Deutsch (API-Fehlermeldungen dürfen Englisch sein)
