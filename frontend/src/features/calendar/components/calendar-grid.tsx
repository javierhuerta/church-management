import type { EventResponseDto } from '@/lib/api'
import { EventCard } from './event-card'

interface CalendarGridProps {
  currentMonth: Date
  events: EventResponseDto[]
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function buildMonthCells(month: Date): Date[] {
  const first = startOfMonth(month)
  const offset = first.getDay()
  const start = new Date(first)
  start.setDate(start.getDate() - offset)
  const cells: Date[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    cells.push(d)
  }
  return cells
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function groupEventsByDay(
  events: EventResponseDto[],
): Map<string, EventResponseDto[]> {
  const map = new Map<string, EventResponseDto[]>()
  for (const event of events) {
    const d = new Date(event.startDate)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    const list = map.get(key) ?? []
    list.push(event)
    map.set(key, list)
  }
  return map
}

export function CalendarGrid({ currentMonth, events }: CalendarGridProps) {
  const cells = buildMonthCells(currentMonth)
  const eventsByDay = groupEventsByDay(events)
  const today = new Date()
  const monthIdx = currentMonth.getMonth()

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="px-3 py-2 text-xs font-semibold text-neutral-500 text-center"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-6">
        {cells.map((cell, idx) => {
          const inMonth = cell.getMonth() === monthIdx
          const isToday = isSameDay(cell, today)
          const key = `${cell.getFullYear()}-${cell.getMonth()}-${cell.getDate()}`
          const dayEvents = eventsByDay.get(key) ?? []

          return (
            <div
              key={idx}
              className={`
                min-h-[100px] border-r border-b border-neutral-100 p-2
                ${(idx + 1) % 7 === 0 ? 'border-r-0' : ''}
                ${idx >= 35 ? 'border-b-0' : ''}
                ${inMonth ? 'bg-white' : 'bg-neutral-50'}
              `}
            >
              <div
                className={`
                  inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium
                  ${isToday ? 'bg-blue-600 text-white' : inMonth ? 'text-neutral-700' : 'text-neutral-400'}
                `}
              >
                {cell.getDate()}
              </div>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map((e) => (
                  <EventCard key={e.id} event={e} compact />
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-neutral-500">
                    + {dayEvents.length - 3} más
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
