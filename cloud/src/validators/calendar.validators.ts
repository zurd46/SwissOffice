import { z } from 'zod'

export const createCalendarSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  color: z.string().default('#3B82F6'),
  isDefault: z.boolean().default(false),
  isVisible: z.boolean().default(true),
})

export const updateCalendarSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  isDefault: z.boolean().optional(),
  isVisible: z.boolean().optional(),
})

export const createEventSchema = z.object({
  calendarId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  isAllDay: z.boolean().default(false),
  timezone: z.string().default('Europe/Zurich'),
  recurrenceRule: z.string().optional(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']).default('confirmed'),
  attendees: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
    isOrganizer: z.boolean().default(false),
  })).optional(),
  reminders: z.array(z.object({
    minutesBefore: z.number().min(0),
    type: z.enum(['notification', 'email']).default('notification'),
  })).optional(),
})

export const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  isAllDay: z.boolean().optional(),
  timezone: z.string().optional(),
  recurrenceRule: z.string().optional(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']).optional(),
})

export const listEventsSchema = z.object({
  calendarId: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(200).default(50),
})

export const addAttendeeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  isOrganizer: z.boolean().default(false),
})

export const updateAttendeeSchema = z.object({
  rsvpStatus: z.enum(['accepted', 'declined', 'tentative', 'pending']),
})
