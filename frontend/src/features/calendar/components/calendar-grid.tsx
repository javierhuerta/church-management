import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Video, Users, Building2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { EventResponseDto } from '@/lib/api'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { EventCard } from './event-card'
import {
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
  DEPARTMENT_LABELS,
  getDepartmentColors,
} from '../utils/labels'

const BAND_BG_COLORS: Record<string, string> = {
  local: 'bg-blue-200 text-blue-900 hover:bg-blue-300',
  asach: 'bg-purple-200 text-purple-900 hover:bg-purple-300',
  distrital: 'bg-emerald-200 text-emerald-900 hover:bg-emerald-300',
}

function formatBandDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const sameDay =
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate()
  if (sameDay) {
    return `${format(s, "d 'de' MMM, HH:mm", { locale: es })} – ${format(e, 'HH:mm', { locale: es })}`
  }
  return `${format(s, "d MMM", { locale: es })} – ${format(e, "d MMM yyyy", { locale: es })}`
}

interface CalendarGridProps {
  currentMonth: Date
  events: EventResponseDto[]
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function buildWeeks(month: Date): Date[][] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const offset = first.getDay()
  const start = new Date(first)
  start.setDate(start.getDate() - offset)

  const weeks: Date[][] = []
  for (let w = 0; w < 6; w++) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      const day = new Date(start)
      day.setDate(start.getDate() + w * 7 + d)
      week.push(day)
    }
    weeks.push(week)
  }
  return weeks
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function isMultiDay(event: EventResponseDto): boolean {
  const s = startOfDay(new Date(event.startDate))
  const e = startOfDay(new Date(event.endDate))
  return e.getTime() > s.getTime()
}

interface MultiDayBand {
  event: EventResponseDto
  startCol: number
  endCol: number
  isStart: boolean
  isEnd: boolean
}

function buildBandsForWeek(multiDayEvents: EventResponseDto[], weekDays: Date[]): MultiDayBand[] {
  const wStart = startOfDay(weekDays[0])
  const wEnd = startOfDay(weekDays[6])
  const bands: MultiDayBand[] = []

  for (const event of multiDayEvents) {
    const evStart = startOfDay(new Date(event.startDate))
    const evEnd = startOfDay(new Date(event.endDate))

    if (evEnd < wStart || evStart > wEnd) continue

    let startCol = 0
    for (let i = 0; i < 7; i++) {
      if (startOfDay(weekDays[i]) >= evStart) { startCol = i; break }
    }

    let endCol = 6
    for (let i = 6; i >= 0; i--) {
      if (startOfDay(weekDays[i]) <= evEnd) { endCol = i; break }
    }

    bands.push({
      event,
      startCol,
      endCol,
      isStart: evStart >= wStart,
      isEnd: evEnd <= wEnd,
    })
  }

  return bands
}

function MultiDayBand({ band }: { band: MultiDayBand }) {
  const event = band.event
  const typeColors = EVENT_TYPE_COLORS[event.eventType]
  const bandColors = BAND_BG_COLORS[event.eventType] ?? BAND_BG_COLORS.local
  const deptColors = event.departmentName ? getDepartmentColors(event.departmentName) : null
  const deptLabel = event.departmentName
    ? (DEPARTMENT_LABELS[event.departmentName as keyof typeof DEPARTMENT_LABELS] ?? event.departmentName)
    : null

  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleMouseEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }
  function handleMouseLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }

  return (
    <div
      style={{
        gridColumnStart: band.startCol + 1,
        gridColumnEnd: band.endCol + 2,
      }}
      className={`
        ${band.isStart ? 'ml-1' : ''}
        ${band.isEnd ? 'mr-1' : ''}
      `}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Link
            to={`/calendario/${event.shareSlug}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`
              block text-[11px] font-semibold px-2 py-0.5 truncate leading-5 transition-colors
              ${bandColors}
              ${band.isStart ? 'rounded-l-full' : ''}
              ${band.isEnd ? 'rounded-r-full' : ''}
            `}
          >
            {band.isStart ? event.title : <span className="opacity-0">·</span>}
          </Link>
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="start"
          className="w-72 p-0 shadow-lg bg-white border border-neutral-200"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              <span className={`mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0 ${typeColors.dot}`} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900 leading-tight">
                  {event.title}
                </p>
                {event.status === 'draft' && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded mt-1 inline-block">
                    Borrador
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                <span>{formatBandDateRange(event.startDate, event.endDate)}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
              {event.meetingUrl && (
                <div className="flex items-center gap-2">
                  <Video className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                  <a
                    href={event.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Unirse a la reunión
                  </a>
                </div>
              )}
              {event.organizers && event.organizers.length > 0 && (
                <div className="flex items-start gap-2">
                  <Users className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                  <span className="truncate">
                    {event.organizers.map((o) => o.name).join(', ')}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-neutral-100">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors.bg} ${typeColors.text}`}>
                {EVENT_TYPE_LABELS[event.eventType]}
              </span>
              {deptLabel && deptColors && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${deptColors.bg} ${deptColors.text} flex items-center gap-1`}>
                  <Building2 className="h-2.5 w-2.5" />
                  {deptLabel}
                </span>
              )}
            </div>

            <Link
              to={`/calendario/${event.shareSlug}`}
              className="block text-center text-[11px] text-blue-600 hover:text-blue-700 font-medium pt-1"
            >
              Ver detalles →
            </Link>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function CalendarGrid({ currentMonth, events }: CalendarGridProps) {
  const weeks = buildWeeks(currentMonth)
  const today = new Date()
  const monthIdx = currentMonth.getMonth()

  const multiDayEvents = events.filter(isMultiDay)
  const singleDayEvents = events.filter((e) => !isMultiDay(e))

  const singleByDay = new Map<string, EventResponseDto[]>()
  for (const event of singleDayEvents) {
    const key = dayKey(new Date(event.startDate))
    const list = singleByDay.get(key) ?? []
    list.push(event)
    singleByDay.set(key, list)
  }

  // Also show multi-day event on its start day in single-day cells if there's no band shown (edge case)
  // Multi-day events on their start day are handled by the bands — no need to duplicate

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-3 py-2 text-xs font-semibold text-neutral-500 text-center">
            {d}
          </div>
        ))}
      </div>

      {/* 6 week rows */}
      {weeks.map((weekDays, weekIdx) => {
        const bands = buildBandsForWeek(multiDayEvents, weekDays)
        const isLastWeek = weekIdx === 5

        return (
          <div key={weekIdx}>
            {/* Multi-day event bands */}
            {bands.length > 0 && (
              <div
                className="grid grid-cols-7 gap-y-0.5 py-0.5 border-b border-neutral-50"
                style={{ gridAutoFlow: 'dense' }}
              >
                {bands.map((band, i) => (
                  <MultiDayBand key={`${band.event.id}-${i}`} band={band} />
                ))}
              </div>
            )}

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {weekDays.map((cell, dayIdx) => {
                const inMonth = cell.getMonth() === monthIdx
                const isToday = isSameDay(cell, today)
                const key = dayKey(cell)
                const dayEvents = singleByDay.get(key) ?? []
                const isLastCol = dayIdx === 6

                return (
                  <div
                    key={dayIdx}
                    className={`
                      min-h-[96px] p-2
                      ${!isLastCol ? 'border-r border-neutral-100' : ''}
                      ${!isLastWeek ? 'border-b border-neutral-100' : ''}
                      ${inMonth ? 'bg-white' : 'bg-neutral-50/60'}
                    `}
                  >
                    <div
                      className={`
                        inline-flex h-6 w-6 items-center justify-center rounded-full
                        text-xs font-medium mb-1
                        ${isToday
                          ? 'bg-blue-600 text-white'
                          : inMonth
                            ? 'text-neutral-700'
                            : 'text-neutral-400'
                        }
                      `}
                    >
                      {cell.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((e) => (
                        <EventCard key={e.id} event={e} compact />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[10px] text-neutral-400 px-1">
                          +{dayEvents.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
