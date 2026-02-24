'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus, Video, Clock } from 'lucide-react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, addMonths, subMonths, addWeeks, subWeeks, setHours } from 'date-fns'
import { de } from 'date-fns/locale'
import { Tabs } from '@/components/Shared/Tabs'
import { Tooltip } from '@/components/Shared/Tooltip'
import { Dialog, DialogButton } from '@/components/Shared/Dialog'
import { cn } from '@/lib/utils/cn'
import type { Meeting } from '@/lib/types'

// Demo-Meetings
const demoMeetings: Meeting[] = [
  {
    id: 'meet-1',
    title: 'Sprint Planning',
    description: 'Wöchentliches Sprint Planning',
    organizerId: 'user-1',
    organizerName: 'Daniel Zurmühle',
    startTime: setHours(new Date(), 10).toISOString(),
    endTime: setHours(new Date(), 11).toISOString(),
    isAllDay: false,
    recurrence: 'weekly',
    meetingLink: 'https://meet.impulsmeet.local/abc123',
    hasLobby: false,
    isRecordingEnabled: false,
    participants: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'meet-2',
    title: 'Design Review',
    description: 'Monatliches Design Review',
    organizerId: 'user-5',
    organizerName: 'Julia Koch',
    startTime: setHours(new Date(), 14).toISOString(),
    endTime: setHours(new Date(), 15).toISOString(),
    isAllDay: false,
    recurrence: 'none',
    meetingLink: 'https://meet.impulsmeet.local/def456',
    hasLobby: true,
    isRecordingEnabled: true,
    participants: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'meet-3',
    title: 'Teambuilding',
    organizerId: 'user-3',
    organizerName: 'Max Weber',
    startTime: setHours(new Date(Date.now() + 86400000), 16).toISOString(),
    endTime: setHours(new Date(Date.now() + 86400000), 18).toISOString(),
    isAllDay: false,
    recurrence: 'none',
    meetingLink: 'https://meet.impulsmeet.local/ghi789',
    hasLobby: false,
    isRecordingEnabled: false,
    participants: [],
    createdAt: new Date().toISOString(),
  },
]

type ViewMode = 'day' | 'week' | 'month'

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [showCreateMeeting, setShowCreateMeeting] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)

  const tabs = [
    { id: 'day', label: 'Tag' },
    { id: 'week', label: 'Woche' },
    { id: 'month', label: 'Monat' },
  ]

  const navigateBack = () => {
    if (viewMode === 'month') setCurrentDate(prev => subMonths(prev, 1))
    else if (viewMode === 'week') setCurrentDate(prev => subWeeks(prev, 1))
    else setCurrentDate(prev => new Date(prev.getTime() - 86400000))
  }

  const navigateForward = () => {
    if (viewMode === 'month') setCurrentDate(prev => addMonths(prev, 1))
    else if (viewMode === 'week') setCurrentDate(prev => addWeeks(prev, 1))
    else setCurrentDate(prev => new Date(prev.getTime() + 86400000))
  }

  const headerText = useMemo(() => {
    if (viewMode === 'month') return format(currentDate, 'MMMM yyyy', { locale: de })
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = endOfWeek(currentDate, { weekStartsOn: 1 })
      return `${format(start, 'd. MMM', { locale: de })} – ${format(end, 'd. MMM yyyy', { locale: de })}`
    }
    return format(currentDate, 'EEEE, d. MMMM yyyy', { locale: de })
  }, [currentDate, viewMode])

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const end = endOfWeek(currentDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentDate])

  const hours = Array.from({ length: 14 }, (_, i) => i + 7) // 7:00 - 20:00

  const getMeetingsForDay = (day: Date) => {
    return demoMeetings.filter(m => isSameDay(new Date(m.startTime), day))
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#edebe9]">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-[#242424]">Kalender</h2>
          <div className="flex items-center gap-1">
            <button onClick={navigateBack} className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-[#605e5c]">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium text-[#242424] min-w-[200px] text-center">{headerText}</span>
            <button onClick={navigateForward} className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-[#605e5c]">
              <ChevronRight size={18} />
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm text-[#0078d4] hover:bg-[#f0f6ff] rounded transition-colors"
          >
            Heute
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Tabs tabs={tabs} activeTab={viewMode} onTabChange={(t) => setViewMode(t as ViewMode)} />
          <Tooltip content="Meeting planen">
            <button
              onClick={() => setShowCreateMeeting(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0078d4] text-white rounded text-sm hover:bg-[#106ebe] transition-colors"
            >
              <Plus size={16} />
              Neues Meeting
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'month' ? (
          /* Month View */
          <div className="h-full flex flex-col">
            <div className="grid grid-cols-7 border-b border-[#edebe9]">
              {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                <div key={day} className="px-2 py-2 text-xs font-semibold text-[#605e5c] text-center">{day}</div>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-7 auto-rows-fr">
              {monthDays.map(day => {
                const dayMeetings = getMeetingsForDay(day)
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'border-b border-r border-[#edebe9] p-1 min-h-[80px]',
                      !isSameMonth(day, currentDate) && 'bg-[#faf9f8]'
                    )}
                  >
                    <span className={cn(
                      'inline-flex items-center justify-center w-6 h-6 text-xs rounded-full',
                      isToday(day)
                        ? 'bg-[#0078d4] text-white font-bold'
                        : !isSameMonth(day, currentDate)
                          ? 'text-[#a19f9d]'
                          : 'text-[#242424]'
                    )}>
                      {format(day, 'd')}
                    </span>
                    {dayMeetings.map(meeting => (
                      <button
                        key={meeting.id}
                        onClick={() => setSelectedMeeting(meeting)}
                        className="w-full text-left mt-0.5 px-1 py-0.5 bg-[#e8f0fe] text-[#0078d4] text-xs rounded truncate hover:bg-[#cce0f7] transition-colors"
                      >
                        {format(new Date(meeting.startTime), 'HH:mm')} {meeting.title}
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        ) : viewMode === 'week' ? (
          /* Week View */
          <div className="flex h-full">
            <div className="w-16 shrink-0 border-r border-[#edebe9]">
              <div className="h-10" />
              {hours.map(hour => (
                <div key={hour} className="h-16 flex items-start justify-end pr-2">
                  <span className="text-xs text-[#a19f9d] -mt-2">{`${hour}:00`}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-7">
              {weekDays.map(day => {
                const dayMeetings = getMeetingsForDay(day)
                return (
                  <div key={day.toISOString()} className="border-r border-[#edebe9]">
                    <div className={cn(
                      'h-10 flex flex-col items-center justify-center border-b border-[#edebe9] sticky top-0 bg-white z-10',
                      isToday(day) && 'bg-[#f0f6ff]'
                    )}>
                      <span className="text-xs text-[#605e5c]">{format(day, 'EEE', { locale: de })}</span>
                      <span className={cn(
                        'text-sm font-semibold',
                        isToday(day) ? 'text-[#0078d4]' : 'text-[#242424]'
                      )}>
                        {format(day, 'd')}
                      </span>
                    </div>
                    <div className="relative">
                      {hours.map(hour => (
                        <div key={hour} className="h-16 border-b border-[#f3f2f1]" />
                      ))}
                      {dayMeetings.map(meeting => {
                        const startHour = new Date(meeting.startTime).getHours()
                        const startMinute = new Date(meeting.startTime).getMinutes()
                        const endHour = new Date(meeting.endTime).getHours()
                        const durationHours = endHour - startHour
                        const top = (startHour - 7) * 64 + (startMinute / 60) * 64
                        const height = Math.max(durationHours * 64, 32)
                        return (
                          <button
                            key={meeting.id}
                            onClick={() => setSelectedMeeting(meeting)}
                            className="absolute left-0.5 right-0.5 bg-[#0078d4] text-white rounded px-1.5 py-1 text-xs hover:bg-[#106ebe] transition-colors overflow-hidden"
                            style={{ top: `${top}px`, height: `${height}px` }}
                          >
                            <div className="font-medium truncate">{meeting.title}</div>
                            <div className="text-white/80 truncate">
                              {format(new Date(meeting.startTime), 'HH:mm')} – {format(new Date(meeting.endTime), 'HH:mm')}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Day View */
          <div className="flex h-full">
            <div className="w-16 shrink-0 border-r border-[#edebe9]">
              {hours.map(hour => (
                <div key={hour} className="h-16 flex items-start justify-end pr-2">
                  <span className="text-xs text-[#a19f9d] -mt-2">{`${hour}:00`}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 relative">
              {hours.map(hour => (
                <div key={hour} className="h-16 border-b border-[#f3f2f1]" />
              ))}
              {getMeetingsForDay(currentDate).map(meeting => {
                const startHour = new Date(meeting.startTime).getHours()
                const startMinute = new Date(meeting.startTime).getMinutes()
                const endHour = new Date(meeting.endTime).getHours()
                const durationHours = endHour - startHour
                const top = (startHour - 7) * 64 + (startMinute / 60) * 64
                const height = Math.max(durationHours * 64, 32)
                return (
                  <button
                    key={meeting.id}
                    onClick={() => setSelectedMeeting(meeting)}
                    className="absolute left-2 right-2 bg-[#0078d4] text-white rounded-lg px-3 py-2 text-sm hover:bg-[#106ebe] transition-colors"
                    style={{ top: `${top}px`, height: `${height}px` }}
                  >
                    <div className="font-semibold">{meeting.title}</div>
                    <div className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
                      <Clock size={12} />
                      {format(new Date(meeting.startTime), 'HH:mm')} – {format(new Date(meeting.endTime), 'HH:mm')}
                    </div>
                    {meeting.description && <div className="text-white/70 text-xs mt-1">{meeting.description}</div>}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Meeting Detail Dialog */}
      {selectedMeeting && (
        <Dialog open onClose={() => setSelectedMeeting(null)} title={selectedMeeting.title} size="sm"
          footer={
            <>
              <DialogButton onClick={() => setSelectedMeeting(null)}>Schliessen</DialogButton>
              <DialogButton onClick={() => setSelectedMeeting(null)} variant="primary">
                <span className="flex items-center gap-1.5"><Video size={14} /> Beitreten</span>
              </DialogButton>
            </>
          }
        >
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-2 text-[#605e5c]">
              <Clock size={16} />
              <span>
                {format(new Date(selectedMeeting.startTime), 'EEEE, d. MMMM yyyy', { locale: de })}
                {' · '}
                {format(new Date(selectedMeeting.startTime), 'HH:mm')} – {format(new Date(selectedMeeting.endTime), 'HH:mm')}
              </span>
            </div>
            {selectedMeeting.description && <p className="text-[#242424]">{selectedMeeting.description}</p>}
            <div className="text-xs text-[#605e5c]">
              Organisiert von {selectedMeeting.organizerName}
            </div>
          </div>
        </Dialog>
      )}

      {/* Create Meeting Dialog */}
      {showCreateMeeting && (
        <CreateMeetingDialog onClose={() => setShowCreateMeeting(false)} />
      )}
    </div>
  )
}

function CreateMeetingDialog({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')

  return (
    <Dialog
      open
      onClose={onClose}
      title="Neues Meeting"
      size="md"
      footer={
        <>
          <DialogButton onClick={onClose}>Abbrechen</DialogButton>
          <DialogButton onClick={onClose} variant="primary" disabled={!title.trim()}>
            Meeting erstellen
          </DialogButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-[#242424] mb-1">Titel</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Meeting-Titel eingeben"
            className="w-full h-9 px-3 rounded border border-[#8a8886] text-sm focus:border-[#0078d4] focus:outline-none"
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#242424] mb-1">Datum</label>
            <input type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} className="w-full h-9 px-3 rounded border border-[#8a8886] text-sm focus:border-[#0078d4] focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#242424] mb-1">Uhrzeit</label>
            <div className="flex items-center gap-2">
              <input type="time" defaultValue="10:00" className="flex-1 h-9 px-3 rounded border border-[#8a8886] text-sm focus:border-[#0078d4] focus:outline-none" />
              <span className="text-[#605e5c]">–</span>
              <input type="time" defaultValue="11:00" className="flex-1 h-9 px-3 rounded border border-[#8a8886] text-sm focus:border-[#0078d4] focus:outline-none" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#242424] mb-1">Beschreibung</label>
          <textarea
            placeholder="Optionale Beschreibung..."
            rows={3}
            className="w-full px-3 py-2 rounded border border-[#8a8886] text-sm focus:border-[#0078d4] focus:outline-none resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#242424] mb-1">Wiederholung</label>
          <select className="w-full h-9 px-3 rounded border border-[#8a8886] text-sm focus:border-[#0078d4] focus:outline-none bg-white">
            <option value="none">Keine Wiederholung</option>
            <option value="daily">Täglich</option>
            <option value="weekly">Wöchentlich</option>
            <option value="biweekly">Alle 2 Wochen</option>
            <option value="monthly">Monatlich</option>
          </select>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="accent-[#0078d4]" />
            <span className="text-sm">Warteraum aktivieren</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="accent-[#0078d4]" />
            <span className="text-sm">Aufzeichnung erlauben</span>
          </label>
        </div>
      </div>
    </Dialog>
  )
}
