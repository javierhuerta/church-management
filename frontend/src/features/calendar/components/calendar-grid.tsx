import { Link } from 'react-router-dom'
import type { EventResponseDto } from '@/lib/api'
import { EventCard } from './event-card'
import { EVENT_TYPE_COLORS } from '../utils/labels'

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
  const colors = EVENT_TYPE_COLORS[band.event.eventType]
  return (
    <Link
      to={`/calendario/${band.event.shareSlug}`}
      style={{
        gridColumnStart: band.startCol + 1,
        gridColumnEnd: band.endCol + 2,
      }}
      title={band.event.title}
      className={`
        text-[10px] font-medium px-2 py-0.5 truncate leading-5 transition-opacity hover:opacity-80
        ${colors.bg} ${colors.text}
        ${band.isStart ? 'rounded-l-full ml-1' : ''}
        ${band.isEnd ? 'rounded-r-full mr-1' : ''}
      `}
    >
      {band.isStart ? band.event.title : <span className="opacity-0">·</span>}
    </Link>
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
