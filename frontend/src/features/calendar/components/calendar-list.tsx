import type { EventResponseDto } from '@/lib/api'
import { EventCard } from './event-card'

interface CalendarListProps {
  events: EventResponseDto[]
}

function dayKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function formatDayHeader(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function CalendarList({ events }: CalendarListProps) {
  const sorted = [...events].sort(
    (a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  )

  const groups = new Map<string, { label: string; events: EventResponseDto[] }>()
  for (const event of sorted) {
    const key = dayKey(event.startDate)
    if (!groups.has(key)) {
      groups.set(key, { label: formatDayHeader(event.startDate), events: [] })
    }
    groups.get(key)!.events.push(event)
  }

  return (
    <div className="space-y-4">
      {[...groups.values()].map((group) => (
        <div key={group.label} className="space-y-2">
          <h3 className="text-sm font-semibold text-neutral-700 capitalize sticky top-0 bg-neutral-50 py-1">
            {group.label}
          </h3>
          <div className="space-y-2">
            {group.events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
