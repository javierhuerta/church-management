import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Archive, Calendar, Clock, MapPin, Video, Users, Building2 } from 'lucide-react'
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
  EVENT_TYPE_STYLE,
  EVENT_TYPE_LABELS,
  getDepartmentStyle,
} from '../utils/labels'

// Status config — mirrors event-card.tsx
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon?: React.ReactNode }> = {
  published: { label: 'Publicado', bg: '#0F766E', color: '#fff', icon: <Clock style={{ width: 8, height: 8, display: 'inline', marginRight: 2 }} /> },
  archived:  { label: 'Archivado', bg: '#475569', color: '#fff', icon: <Archive style={{ width: 8, height: 8, display: 'inline', marginRight: 2 }} /> },
  draft:     { label: 'Borrador',  bg: '#C9A84C', color: '#102240' },
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
  const typeStyle = EVENT_TYPE_STYLE[event.eventType] ?? EVENT_TYPE_STYLE.local
  const deptStyle = event.department ? getDepartmentStyle(event.department.name, event.department.color) : null
  const sigla = event.department?.sigla ?? null
  const status = event.status as string
  const statusCfg = STATUS_CONFIG[status]
  const isDraft = status === 'draft'
  const isArchived = status === 'archived'
  const coverUrl = event.coverImageUrl

  // Band pill color based on status
  const bandBg = isDraft
    ? 'rgba(201,168,76,0.18)'
    : isArchived
    ? 'rgba(71,85,105,0.15)'
    : `${typeStyle.dotColor}28`
  const bandText = isDraft ? '#92600A' : isArchived ? '#475569' : typeStyle.color
  const bandBorder = isDraft
    ? '1px dashed rgba(201,168,76,0.6)'
    : isArchived
    ? '1px solid rgba(71,85,105,0.3)'
    : 'none'

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
      className={`${band.isStart ? 'ml-1' : ''} ${band.isEnd ? 'mr-1' : ''}`}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Link
            to={`/calendario/${event.shareSlug}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`
              block text-[11px] font-semibold px-2 py-0.5 truncate leading-5 transition-opacity
              ${isArchived ? 'opacity-60' : ''}
              ${band.isStart ? 'rounded-l-full' : ''}
              ${band.isEnd ? 'rounded-r-full' : ''}
            `}
            style={{ backgroundColor: bandBg, color: bandText, border: bandBorder }}
          >
            {band.isStart ? event.title : <span className="opacity-0">·</span>}
          </Link>
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="start"
          className="w-72 p-0 shadow-lg border border-border overflow-hidden rounded-xl bg-card"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Cover image header */}
          {coverUrl && (
            <div className="relative w-full aspect-video bg-muted overflow-hidden">
              <img
                src={coverUrl}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-3 space-y-2.5">
            {/* Title + status badge */}
            <div className="flex items-start gap-2">
              <span
              className="mt-1 h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: deptStyle ? deptStyle.dotColor : typeStyle.dotColor }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {event.title}
                </p>
              </div>
              {statusCfg && status !== 'published' && (
                <span
                  className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                >
                  {statusCfg.icon}
                  {statusCfg.label}
                </span>
              )}
            </div>

            {/* Date range */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pl-4">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{formatBandDateRange(event.startDate, event.endDate)}</span>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pl-4">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}

            {/* Meeting link */}
            {event.meetingUrl && (
              <div className="flex items-center gap-2 text-xs pl-4">
                <Video className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <a
                  href={event.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  Unirse a la reunión
                </a>
              </div>
            )}

            {/* Organizers */}
            {event.organizers && event.organizers.length > 0 && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground pl-4">
                <Users className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <span className="truncate">{event.organizers.map((o) => o.name).join(', ')}</span>
              </div>
            )}

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-border">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: typeStyle.backgroundColor, color: typeStyle.color }}
              >
                {EVENT_TYPE_LABELS[event.eventType]}
              </span>
              {sigla && deptStyle && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                  title={event.department?.name ?? undefined}
                  style={{ backgroundColor: deptStyle.backgroundColor, color: deptStyle.color }}
                >
                  <Building2 className="h-2.5 w-2.5" />
                  {sigla}
                </span>
              )}
              <Link
                to={`/calendario/${event.shareSlug}`}
                className="ml-auto text-[11px] text-primary hover:underline font-medium"
              >
                Ver detalles →
              </Link>
            </div>
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
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-3 py-2 text-xs font-semibold text-muted-foreground text-center">
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
                className="grid grid-cols-7 gap-y-0.5 py-0.5 border-b border-border"
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
                      ${!isLastCol ? 'border-r border-border' : ''}
                      ${!isLastWeek ? 'border-b border-border' : ''}
                      ${inMonth ? 'bg-card' : 'bg-muted/40'}
                    `}
                  >
                    <div
                      className={`
                        inline-flex h-6 w-6 items-center justify-center rounded-full
                        text-xs font-medium mb-1
                        ${isToday
                          ? 'bg-primary text-primary-foreground'
                          : inMonth
                            ? 'text-muted-foreground'
                            : 'text-muted-foreground'
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
                        <span className="text-[10px] text-muted-foreground px-1">
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
