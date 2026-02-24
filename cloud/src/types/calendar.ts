export interface Calendar {
  id: string
  userId: string
  name: string
  description?: string
  color: string
  microsoftCalendarId?: string
  isDefault: boolean
  isVisible: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CalendarEvent {
  id: string
  calendarId: string
  title: string
  description?: string
  location?: string
  startAt: Date
  endAt: Date
  isAllDay: boolean
  timezone: string
  recurrenceRule?: string
  status: 'confirmed' | 'tentative' | 'cancelled'
  microsoftEventId?: string
  icalUid?: string
  attendees?: EventAttendee[]
  reminders?: EventReminder[]
  createdAt: Date
  updatedAt: Date
}

export interface EventAttendee {
  id: string
  eventId: string
  email: string
  name?: string
  rsvpStatus: 'accepted' | 'declined' | 'tentative' | 'pending'
  isOrganizer: boolean
}

export interface EventReminder {
  id: string
  eventId: string
  minutesBefore: number
  type: 'notification' | 'email'
}
