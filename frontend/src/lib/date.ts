import { format, isValid, parse } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Boundary helpers between date strings (the contract used by the API and
 * forms) and `Date` objects (used internally by react-day-picker).
 *
 * All parsing uses `date-fns/parse` with an explicit pattern, never
 * `new Date(string)` — the latter interprets `YYYY-MM-DD` as UTC midnight,
 * which shifts the day by one in negative-offset timezones (Chile UTC-3/-4).
 * `parse` builds a local "wall clock" date, so the round trip is timezone-safe.
 */

export const DATE_FORMAT = 'yyyy-MM-dd'
export const DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm"

/** Parse a `YYYY-MM-DD` string into a local Date. Returns undefined if empty/invalid. */
export function parseDateString(value?: string | null): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value, DATE_FORMAT, new Date())
  return isValid(parsed) ? parsed : undefined
}

/** Parse a `YYYY-MM-DDTHH:mm` string into a local Date. Returns undefined if empty/invalid. */
export function parseDateTimeString(value?: string | null): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value, DATETIME_FORMAT, new Date())
  return isValid(parsed) ? parsed : undefined
}

/** Serialize a Date to a `YYYY-MM-DD` string (local wall-clock day, no UTC shift). */
export function formatDateString(date?: Date): string {
  if (!date || !isValid(date)) return ''
  return format(date, DATE_FORMAT)
}

/** Serialize a Date to a `YYYY-MM-DDTHH:mm` string (local wall-clock time). */
export function formatDateTimeString(date?: Date): string {
  if (!date || !isValid(date)) return ''
  return format(date, DATETIME_FORMAT)
}

/** Extract the `HH:mm` portion of a `YYYY-MM-DDTHH:mm` string, defaulting to "00:00". */
export function timeFromDateTimeString(value?: string | null): string {
  const date = parseDateTimeString(value)
  return date ? format(date, 'HH:mm') : '00:00'
}

/** Localized (es) human-readable label for a single date. */
export function displayDate(date?: Date): string {
  if (!date || !isValid(date)) return ''
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
}

/** Localized (es) human-readable label for a date and time. */
export function displayDateTime(date?: Date): string {
  if (!date || !isValid(date)) return ''
  return format(date, "d MMM yyyy, HH:mm", { locale: es })
}
