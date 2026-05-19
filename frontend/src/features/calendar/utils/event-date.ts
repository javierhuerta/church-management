const DATE_FORMATTER = new Intl.DateTimeFormat('es-CL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('es-CL', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const TIME_FORMATTER = new Intl.DateTimeFormat('es-CL', {
  hour: '2-digit',
  minute: '2-digit',
})

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export interface FormattedEventDateRange {
  dateLabel: string
  timeLabel: string | null
  isMultiDay: boolean
  isSameInstant: boolean
}

/**
 * Format an event's start/end into a date label and an optional time label.
 *
 * - Single day, start === end: only the time at start is shown as `timeLabel`.
 * - Single day, range: time label is "HH:MM – HH:MM".
 * - Multi day: date label spans both days "vie 12 jun – sáb 13 jun 2026" and
 *   time label combines both ends "09:00 – 18:00".
 */
export function formatEventDateRange(
  startIso: string | Date,
  endIso: string | Date,
): FormattedEventDateRange {
  const start = startIso instanceof Date ? startIso : new Date(startIso)
  const end = endIso instanceof Date ? endIso : new Date(endIso)
  const isSameInstant = start.getTime() === end.getTime()
  const isMultiDay = !sameCalendarDay(start, end)

  if (isMultiDay) {
    const startShort = SHORT_DATE_FORMATTER.format(start)
    const endShort = SHORT_DATE_FORMATTER.format(end)
    const year = end.getFullYear()
    return {
      dateLabel: `${startShort} – ${endShort} · ${year}`,
      timeLabel: `${TIME_FORMATTER.format(start)} – ${TIME_FORMATTER.format(end)}`,
      isMultiDay: true,
      isSameInstant: false,
    }
  }

  const dateLabel = DATE_FORMATTER.format(start)
  if (isSameInstant) {
    return {
      dateLabel,
      timeLabel: TIME_FORMATTER.format(start),
      isMultiDay: false,
      isSameInstant: true,
    }
  }
  return {
    dateLabel,
    timeLabel: `${TIME_FORMATTER.format(start)} – ${TIME_FORMATTER.format(end)}`,
    isMultiDay: false,
    isSameInstant: false,
  }
}
