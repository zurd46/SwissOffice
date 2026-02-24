import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import {
  createCalendarSchema, updateCalendarSchema, createEventSchema, updateEventSchema,
  listEventsSchema, addAttendeeSchema, updateAttendeeSchema,
} from '../validators/calendar.validators'
import { authMiddleware } from '../middleware/auth'
import * as calendarService from '../services/calendar.service'
import { importMicrosoftCalendars } from '../services/microsoftImport.service'

export const calendarRoutes = new Hono()

calendarRoutes.use('*', authMiddleware)

// ── Calendars ──

calendarRoutes.get('/', async (c) => {
  const user = c.get('user')
  const result = calendarService.listCalendars(user.userId)
  return c.json({ ok: true, data: result })
})

calendarRoutes.post('/', zValidator('json', createCalendarSchema), async (c) => {
  const user = c.get('user')
  const body = c.req.valid('json')
  const result = calendarService.createCalendar(user.userId, body)
  return c.json({ ok: true, data: result }, 201)
})

calendarRoutes.put('/:id', zValidator('json', updateCalendarSchema), async (c) => {
  const user = c.get('user')
  const body = c.req.valid('json')
  const result = calendarService.updateCalendar(c.req.param('id'), user.userId, body)
  return c.json({ ok: true, data: result })
})

calendarRoutes.delete('/:id', async (c) => {
  const user = c.get('user')
  calendarService.deleteCalendar(c.req.param('id'), user.userId)
  return c.json({ ok: true })
})

calendarRoutes.post('/import/microsoft', async (c) => {
  const user = c.get('user')
  const { accountId } = await c.req.json()
  const result = await importMicrosoftCalendars(accountId, user.userId)
  return c.json({ ok: true, data: result })
})

// ── Events ──

export const eventRoutes = new Hono()

eventRoutes.use('*', authMiddleware)

eventRoutes.get('/', zValidator('query', listEventsSchema), async (c) => {
  const user = c.get('user')
  const query = c.req.valid('query')
  const result = calendarService.listEvents(user.userId, query)
  return c.json({ ok: true, data: result })
})

eventRoutes.post('/', zValidator('json', createEventSchema), async (c) => {
  const user = c.get('user')
  const body = c.req.valid('json')
  const result = calendarService.createEvent(user.userId, body)
  return c.json({ ok: true, data: result }, 201)
})

eventRoutes.get('/:id', async (c) => {
  const user = c.get('user')
  const result = calendarService.getEvent(c.req.param('id'), user.userId)
  return c.json({ ok: true, data: result })
})

eventRoutes.put('/:id', zValidator('json', updateEventSchema), async (c) => {
  const user = c.get('user')
  const body = c.req.valid('json')
  const result = calendarService.updateEvent(c.req.param('id'), user.userId, body)
  return c.json({ ok: true, data: result })
})

eventRoutes.delete('/:id', async (c) => {
  const user = c.get('user')
  calendarService.deleteEvent(c.req.param('id'), user.userId)
  return c.json({ ok: true })
})

// Attendees
eventRoutes.post('/:id/attendees', zValidator('json', addAttendeeSchema), async (c) => {
  const user = c.get('user')
  const body = c.req.valid('json')
  const result = calendarService.addAttendee(c.req.param('id'), user.userId, body)
  return c.json({ ok: true, data: result }, 201)
})

eventRoutes.put('/:id/attendees/:aId', zValidator('json', updateAttendeeSchema), async (c) => {
  const user = c.get('user')
  const body = c.req.valid('json')
  const result = calendarService.updateAttendee(c.req.param('id'), c.req.param('aId'), user.userId, body)
  return c.json({ ok: true, data: result })
})

eventRoutes.delete('/:id/attendees/:aId', async (c) => {
  const user = c.get('user')
  calendarService.removeAttendee(c.req.param('id'), c.req.param('aId'), user.userId)
  return c.json({ ok: true })
})

// iCal Export/Import
eventRoutes.get('/:id/ical', async (c) => {
  const user = c.get('user')
  const icalString = calendarService.exportEventAsIcal(c.req.param('id'), user.userId)
  return new Response(icalString, {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'attachment; filename="event.ics"' },
  })
})

eventRoutes.post('/import/ical', async (c) => {
  const user = c.get('user')
  const body = await c.req.json()
  const result = calendarService.importIcalEvent(user.userId, body.calendarId, body.icalString)
  return c.json({ ok: true, data: result }, 201)
})
