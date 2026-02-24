import { eq, and } from 'drizzle-orm'
import { db } from '../db/client'
import { emailAccounts, contacts, calendars, events, eventAttendees } from '../db/schema'
import { decryptCredentials, encryptCredentials } from './crypto.service'
import { env } from '../config/env'
import type { MicrosoftOAuthTokens } from '../types/email'

function generateId(): string {
  return crypto.randomUUID()
}

async function getGraphToken(accountId: string, userId: string): Promise<string> {
  const account = db
    .select()
    .from(emailAccounts)
    .where(and(eq(emailAccounts.id, accountId), eq(emailAccounts.userId, userId), eq(emailAccounts.provider, 'microsoft')))
    .get()

  if (!account?.encryptedOauthTokens) throw new Error('Kein Microsoft-Konto gefunden')

  const tokens: MicrosoftOAuthTokens = JSON.parse(await decryptCredentials(account.encryptedOauthTokens))

  if (Date.now() >= tokens.expiresAt - 60_000) {
    const response = await fetch(`https://login.microsoftonline.com/${env.MS_GRAPH_TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.MS_GRAPH_CLIENT_ID,
        client_secret: env.MS_GRAPH_CLIENT_SECRET,
        refresh_token: tokens.refreshToken,
        grant_type: 'refresh_token',
        scope: 'https://graph.microsoft.com/.default offline_access',
      }),
    })
    if (!response.ok) throw new Error('Token refresh fehlgeschlagen')
    const data = await response.json() as { access_token: string; refresh_token: string; expires_in: number }

    const newTokens: MicrosoftOAuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? tokens.refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
    }

    const encrypted = await encryptCredentials(JSON.stringify(newTokens))
    db.update(emailAccounts)
      .set({ encryptedOauthTokens: encrypted, updatedAt: new Date() })
      .where(eq(emailAccounts.id, accountId))
      .run()

    return newTokens.accessToken
  }

  return tokens.accessToken
}

// ── Import Contacts from Microsoft ──

interface MsContact {
  id: string
  displayName?: string
  givenName?: string
  surname?: string
  emailAddresses?: Array<{ address: string }>
  mobilePhone?: string
  businessPhones?: string[]
  companyName?: string
  jobTitle?: string
  homeAddress?: { street?: string; city?: string; postalCode?: string; countryOrRegion?: string }
  personalNotes?: string
  birthday?: string
}

export async function importMicrosoftContacts(accountId: string, userId: string) {
  const token = await getGraphToken(accountId, userId)
  const now = new Date()
  let imported = 0
  let updated = 0
  let nextLink: string | null = 'https://graph.microsoft.com/v1.0/me/contacts?$top=100'

  while (nextLink) {
    const resp = await fetch(nextLink, { headers: { Authorization: `Bearer ${token}` } })
    if (!resp.ok) throw new Error(`Microsoft Kontakte laden fehlgeschlagen: ${resp.status}`)
    const data = await resp.json() as { value: MsContact[]; '@odata.nextLink'?: string }

    for (const mc of data.value) {
      const existing = db
        .select()
        .from(contacts)
        .where(and(eq(contacts.userId, userId), eq(contacts.microsoftContactId, mc.id)))
        .get()

      const contactData = {
        firstName: mc.givenName ?? null,
        lastName: mc.surname ?? null,
        displayName: mc.displayName ?? mc.givenName ?? mc.surname ?? 'Unbekannt',
        email: mc.emailAddresses?.[0]?.address ?? null,
        email2: mc.emailAddresses?.[1]?.address ?? null,
        phone: mc.mobilePhone ?? mc.businessPhones?.[0] ?? null,
        phone2: mc.businessPhones?.[1] ?? null,
        company: mc.companyName ?? null,
        jobTitle: mc.jobTitle ?? null,
        street: mc.homeAddress?.street ?? null,
        city: mc.homeAddress?.city ?? null,
        zip: mc.homeAddress?.postalCode ?? null,
        country: mc.homeAddress?.countryOrRegion ?? null,
        notes: mc.personalNotes ?? null,
        birthday: mc.birthday ?? null,
        microsoftContactId: mc.id,
      }

      if (existing) {
        db.update(contacts)
          .set({ ...contactData, updatedAt: now })
          .where(eq(contacts.id, existing.id))
          .run()
        updated++
      } else {
        db.insert(contacts)
          .values({ id: generateId(), userId, ...contactData, createdAt: now, updatedAt: now } as typeof contacts.$inferInsert)
          .run()
        imported++
      }
    }

    nextLink = data['@odata.nextLink'] ?? null
  }

  return { imported, updated }
}

// ── Import Calendar from Microsoft ──

interface MsCalendar {
  id: string
  name: string
  color?: string
  isDefaultCalendar?: boolean
}

interface MsEvent {
  id: string
  subject?: string
  body?: { content: string; contentType: string }
  start: { dateTime: string; timeZone: string }
  end: { dateTime: string; timeZone: string }
  isAllDay?: boolean
  location?: { displayName?: string }
  recurrence?: { pattern?: { type: string }; range?: Record<string, string> }
  showAs?: string
  attendees?: Array<{ emailAddress: { address: string; name?: string }; status?: { response: string }; type?: string }>
  iCalUId?: string
}

export async function importMicrosoftCalendars(accountId: string, userId: string) {
  const token = await getGraphToken(accountId, userId)
  const now = new Date()
  let calendarsImported = 0
  let eventsImported = 0

  // Fetch calendars
  const calResp = await fetch('https://graph.microsoft.com/v1.0/me/calendars', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!calResp.ok) throw new Error('Microsoft Kalender laden fehlgeschlagen')
  const calData = await calResp.json() as { value: MsCalendar[] }

  for (const msCal of calData.value) {
    let calendar = db
      .select()
      .from(calendars)
      .where(and(eq(calendars.userId, userId), eq(calendars.microsoftCalendarId, msCal.id)))
      .get()

    if (!calendar) {
      const calId = generateId()
      db.insert(calendars)
        .values({
          id: calId,
          userId,
          name: msCal.name,
          color: msCal.color ?? '#3B82F6',
          microsoftCalendarId: msCal.id,
          isDefault: msCal.isDefaultCalendar ?? false,
          isVisible: true,
          createdAt: now,
          updatedAt: now,
        })
        .run()
      calendar = db.select().from(calendars).where(eq(calendars.id, calId)).get()!
      calendarsImported++
    }

    // Fetch events for this calendar (next 6 months)
    const startDate = new Date().toISOString()
    const endDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
    const eventsResp = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendars/${msCal.id}/calendarView?startDateTime=${startDate}&endDateTime=${endDate}&$top=200`,
      { headers: { Authorization: `Bearer ${token}`, Prefer: 'outlook.timezone="Europe/Zurich"' } },
    )
    if (!eventsResp.ok) continue
    const eventsData = await eventsResp.json() as { value: MsEvent[] }

    for (const msEvent of eventsData.value) {
      const existing = db
        .select()
        .from(events)
        .where(and(eq(events.calendarId, calendar.id), eq(events.microsoftEventId, msEvent.id)))
        .get()

      if (existing) continue

      const eventId = generateId()
      db.insert(events)
        .values({
          id: eventId,
          calendarId: calendar.id,
          title: msEvent.subject ?? 'Kein Titel',
          description: msEvent.body?.content,
          location: msEvent.location?.displayName,
          startAt: new Date(msEvent.start.dateTime + 'Z'),
          endAt: new Date(msEvent.end.dateTime + 'Z'),
          isAllDay: msEvent.isAllDay ?? false,
          timezone: msEvent.start.timeZone ?? 'Europe/Zurich',
          status: msEvent.showAs === 'tentative' ? 'tentative' : 'confirmed',
          microsoftEventId: msEvent.id,
          icalUid: msEvent.iCalUId,
          createdAt: now,
          updatedAt: now,
        })
        .run()

      // Import attendees
      if (msEvent.attendees) {
        for (const att of msEvent.attendees) {
          const rsvpMap: Record<string, 'accepted' | 'declined' | 'tentative' | 'pending'> = {
            accepted: 'accepted',
            declined: 'declined',
            tentativelyAccepted: 'tentative',
          }
          db.insert(eventAttendees)
            .values({
              id: generateId(),
              eventId,
              email: att.emailAddress.address,
              name: att.emailAddress.name,
              rsvpStatus: rsvpMap[att.status?.response ?? ''] ?? 'pending',
              isOrganizer: att.type === 'required',
              createdAt: now,
            })
            .run()
        }
      }

      eventsImported++
    }
  }

  return { calendarsImported, eventsImported }
}
