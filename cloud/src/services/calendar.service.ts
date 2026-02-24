import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { db } from '../db/client'
import { calendars, events, eventAttendees, eventReminders } from '../db/schema'
import { NotFoundError } from '../types/api'
import ical, { ICalCalendarMethod, ICalAttendeeRole, ICalAttendeeStatus } from 'ical-generator'

function generateId(): string {
  return crypto.randomUUID()
}

// ── Calendars CRUD ──

export function listCalendars(userId: string) {
  return db.select().from(calendars).where(eq(calendars.userId, userId)).orderBy(calendars.name).all()
}

export function getCalendar(calendarId: string, userId: string) {
  const calendar = db
    .select()
    .from(calendars)
    .where(and(eq(calendars.id, calendarId), eq(calendars.userId, userId)))
    .get()
  if (!calendar) throw new NotFoundError('Kalender nicht gefunden')
  return calendar
}

export function createCalendar(userId: string, input: { name: string; description?: string; color?: string; isDefault?: boolean; isVisible?: boolean }) {
  const id = generateId()
  const now = new Date()

  if (input.isDefault) {
    db.update(calendars).set({ isDefault: false }).where(eq(calendars.userId, userId)).run()
  }

  db.insert(calendars)
    .values({
      id,
      userId,
      name: input.name,
      description: input.description,
      color: input.color ?? '#3B82F6',
      isDefault: input.isDefault ?? false,
      isVisible: input.isVisible ?? true,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  return db.select().from(calendars).where(eq(calendars.id, id)).get()!
}

export function updateCalendar(calendarId: string, userId: string, input: Record<string, unknown>) {
  getCalendar(calendarId, userId)

  if (input.isDefault === true) {
    db.update(calendars).set({ isDefault: false }).where(eq(calendars.userId, userId)).run()
  }

  db.update(calendars)
    .set({ ...input, updatedAt: new Date() } as Partial<typeof calendars.$inferInsert>)
    .where(eq(calendars.id, calendarId))
    .run()

  return db.select().from(calendars).where(eq(calendars.id, calendarId)).get()!
}

export function deleteCalendar(calendarId: string, userId: string) {
  getCalendar(calendarId, userId)
  db.delete(calendars).where(eq(calendars.id, calendarId)).run()
}

// ── Events CRUD ──

export function listEvents(
  userId: string,
  options: { calendarId?: string; from?: string; to?: string; page: number; pageSize: number },
) {
  const offset = (options.page - 1) * options.pageSize

  // Get user's calendar IDs
  const userCalendarIds = db
    .select({ id: calendars.id })
    .from(calendars)
    .where(eq(calendars.userId, userId))
    .all()
    .map((c) => c.id)

  if (userCalendarIds.length === 0) {
    return { events: [], total: 0, page: options.page, pageSize: options.pageSize }
  }

  let allEvents = db
    .select()
    .from(events)
    .orderBy(events.startAt)
    .all()
    .filter((e) => {
      if (!userCalendarIds.includes(e.calendarId)) return false
      if (options.calendarId && e.calendarId !== options.calendarId) return false
      if (options.from && e.startAt < new Date(options.from)) return false
      if (options.to && e.endAt > new Date(options.to)) return false
      return true
    })

  const total = allEvents.length
  const paginated = allEvents.slice(offset, offset + options.pageSize)

  // Attach attendees + reminders
  const enriched = paginated.map((event) => {
    const attendeeList = db.select().from(eventAttendees).where(eq(eventAttendees.eventId, event.id)).all()
    const reminderList = db.select().from(eventReminders).where(eq(eventReminders.eventId, event.id)).all()
    return { ...event, attendees: attendeeList, reminders: reminderList }
  })

  return { events: enriched, total, page: options.page, pageSize: options.pageSize }
}

export function getEvent(eventId: string, userId: string) {
  const event = db.select().from(events).where(eq(events.id, eventId)).get()
  if (!event) throw new NotFoundError('Termin nicht gefunden')

  // Verify ownership via calendar
  getCalendar(event.calendarId, userId)

  const attendeeList = db.select().from(eventAttendees).where(eq(eventAttendees.eventId, eventId)).all()
  const reminderList = db.select().from(eventReminders).where(eq(eventReminders.eventId, eventId)).all()

  return { ...event, attendees: attendeeList, reminders: reminderList }
}

export function createEvent(
  userId: string,
  input: {
    calendarId: string
    title: string
    description?: string
    location?: string
    startAt: string
    endAt: string
    isAllDay?: boolean
    timezone?: string
    recurrenceRule?: string
    status?: 'confirmed' | 'tentative' | 'cancelled'
    attendees?: Array<{ email: string; name?: string; isOrganizer?: boolean }>
    reminders?: Array<{ minutesBefore: number; type?: 'notification' | 'email' }>
  },
) {
  getCalendar(input.calendarId, userId)

  const id = generateId()
  const now = new Date()
  const icalUid = `${id}@impulscloud`

  db.insert(events)
    .values({
      id,
      calendarId: input.calendarId,
      title: input.title,
      description: input.description,
      location: input.location,
      startAt: new Date(input.startAt),
      endAt: new Date(input.endAt),
      isAllDay: input.isAllDay ?? false,
      timezone: input.timezone ?? 'Europe/Zurich',
      recurrenceRule: input.recurrenceRule,
      status: input.status ?? 'confirmed',
      icalUid,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  if (input.attendees?.length) {
    for (const a of input.attendees) {
      db.insert(eventAttendees)
        .values({
          id: generateId(),
          eventId: id,
          email: a.email,
          name: a.name,
          isOrganizer: a.isOrganizer ?? false,
          rsvpStatus: 'pending',
          createdAt: now,
        })
        .run()
    }
  }

  if (input.reminders?.length) {
    for (const r of input.reminders) {
      db.insert(eventReminders)
        .values({
          id: generateId(),
          eventId: id,
          minutesBefore: r.minutesBefore,
          type: r.type ?? 'notification',
          createdAt: now,
        })
        .run()
    }
  }

  return getEvent(id, userId)
}

export function updateEvent(eventId: string, userId: string, input: Record<string, unknown>) {
  const event = getEvent(eventId, userId)
  const updates: Record<string, unknown> = { updatedAt: new Date() }

  if (input.title !== undefined) updates.title = input.title
  if (input.description !== undefined) updates.description = input.description
  if (input.location !== undefined) updates.location = input.location
  if (input.startAt !== undefined) updates.startAt = new Date(input.startAt as string)
  if (input.endAt !== undefined) updates.endAt = new Date(input.endAt as string)
  if (input.isAllDay !== undefined) updates.isAllDay = input.isAllDay
  if (input.timezone !== undefined) updates.timezone = input.timezone
  if (input.recurrenceRule !== undefined) updates.recurrenceRule = input.recurrenceRule
  if (input.status !== undefined) updates.status = input.status

  db.update(events).set(updates as Partial<typeof events.$inferInsert>).where(eq(events.id, eventId)).run()
  return getEvent(eventId, userId)
}

export function deleteEvent(eventId: string, userId: string) {
  getEvent(eventId, userId)
  db.delete(events).where(eq(events.id, eventId)).run()
}

// ── Attendees ──

export function addAttendee(eventId: string, userId: string, input: { email: string; name?: string; isOrganizer?: boolean }) {
  getEvent(eventId, userId)
  const id = generateId()
  db.insert(eventAttendees)
    .values({
      id,
      eventId,
      email: input.email,
      name: input.name,
      isOrganizer: input.isOrganizer ?? false,
      rsvpStatus: 'pending',
      createdAt: new Date(),
    })
    .run()
  return db.select().from(eventAttendees).where(eq(eventAttendees.id, id)).get()!
}

export function updateAttendee(eventId: string, attendeeId: string, userId: string, input: { rsvpStatus: string }) {
  getEvent(eventId, userId)
  const attendee = db.select().from(eventAttendees).where(eq(eventAttendees.id, attendeeId)).get()
  if (!attendee) throw new NotFoundError('Teilnehmer nicht gefunden')
  db.update(eventAttendees)
    .set({ rsvpStatus: input.rsvpStatus as 'accepted' | 'declined' | 'tentative' | 'pending' })
    .where(eq(eventAttendees.id, attendeeId))
    .run()
  return db.select().from(eventAttendees).where(eq(eventAttendees.id, attendeeId)).get()!
}

export function removeAttendee(eventId: string, attendeeId: string, userId: string) {
  getEvent(eventId, userId)
  db.delete(eventAttendees).where(eq(eventAttendees.id, attendeeId)).run()
}

// ── iCal Export ──

export function exportEventAsIcal(eventId: string, userId: string) {
  const event = getEvent(eventId, userId)

  const cal = ical({ name: 'ImpulsCloud', method: ICalCalendarMethod.PUBLISH })
  const icalEvent = cal.createEvent({
    id: event.icalUid ?? event.id,
    start: event.startAt,
    end: event.endAt,
    allDay: event.isAllDay,
    timezone: event.timezone,
    summary: event.title,
    description: event.description ?? undefined,
    location: event.location ?? undefined,
    status: event.status === 'confirmed' ? 'CONFIRMED' : event.status === 'tentative' ? 'TENTATIVE' : 'CANCELLED',
  })

  for (const attendee of event.attendees ?? []) {
    icalEvent.createAttendee({
      email: attendee.email,
      name: attendee.name ?? undefined,
      role: attendee.isOrganizer ? ICalAttendeeRole.CHAIR : ICalAttendeeRole.REQ,
      status: attendee.rsvpStatus === 'accepted'
        ? ICalAttendeeStatus.ACCEPTED
        : attendee.rsvpStatus === 'declined'
          ? ICalAttendeeStatus.DECLINED
          : attendee.rsvpStatus === 'tentative'
            ? ICalAttendeeStatus.TENTATIVE
            : ICalAttendeeStatus.NEEDSACTION,
    })
  }

  for (const reminder of event.reminders ?? []) {
    icalEvent.createAlarm({
      type: 'display' as const,
      trigger: reminder.minutesBefore * 60,
    })
  }

  return cal.toString()
}

// ── iCal Import ──

export function importIcalEvent(userId: string, calendarId: string, icalString: string) {
  getCalendar(calendarId, userId)

  // Basic VEVENT parser
  const veventMatch = icalString.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/)
  if (!veventMatch) throw new Error('Kein VEVENT in der iCal-Datei gefunden')

  const vevent = veventMatch[0]
  const getProp = (name: string): string | undefined => {
    const match = vevent.match(new RegExp(`${name}[^:]*:(.+)`))
    return match?.[1]?.trim()
  }

  const dtstart = getProp('DTSTART')
  const dtend = getProp('DTEND')
  const summary = getProp('SUMMARY') ?? 'Importierter Termin'
  const description = getProp('DESCRIPTION')
  const location = getProp('LOCATION')
  const uid = getProp('UID')
  const rrule = getProp('RRULE')

  if (!dtstart || !dtend) throw new Error('DTSTART und DTEND sind erforderlich')

  const isAllDay = dtstart.length === 8
  const parseDate = (dt: string) => {
    if (dt.length === 8) {
      return new Date(`${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}`)
    }
    return new Date(dt.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?/, '$1-$2-$3T$4:$5:$6Z'))
  }

  return createEvent(userId, {
    calendarId,
    title: summary,
    description,
    location,
    startAt: parseDate(dtstart).toISOString(),
    endAt: parseDate(dtend).toISOString(),
    isAllDay,
    recurrenceRule: rrule,
  })
}
