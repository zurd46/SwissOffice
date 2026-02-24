import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns'
import { de } from 'date-fns/locale'

export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString)
  return format(date, 'HH:mm')
}

export function formatChatListTime(dateString: string): string {
  const date = new Date(dateString)

  if (isToday(date)) {
    return format(date, 'HH:mm')
  }
  if (isYesterday(date)) {
    return 'Gestern'
  }
  if (isThisWeek(date)) {
    return format(date, 'EEEE', { locale: de })
  }
  return format(date, 'dd.MM.yyyy')
}

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: de })
}

export function formatCallDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`
}

export function formatMeetingTime(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return `${format(startDate, 'HH:mm')} – ${format(endDate, 'HH:mm')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
