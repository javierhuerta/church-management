import { Link } from 'react-router-dom'
import { Calendar, MapPin, Video } from 'lucide-react'
import type { EventResponseDto } from '@/lib/api'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '../utils/labels'

interface EventCardProps {
  event: EventResponseDto
  compact?: boolean
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

export function EventCard({ event, compact = false }: EventCardProps) {
  const colors = EVENT_TYPE_COLORS[event.eventType]

  return (
    <Link
      to={`/calendario/${event.shareSlug}`}
      className={`
        block rounded-xl border border-neutral-200 bg-white p-3
        transition-all duration-200
        hover:shadow-sm hover:border-blue-200
        ${event.status === 'draft' ? 'opacity-70 border-dashed' : ''}
      `}
    >
      <div className="flex items-start gap-2">
        <span className={`mt-1.5 h-2 w-2 rounded-full ${colors.dot} flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-sm font-medium text-neutral-900 truncate">
              {event.title}
            </h4>
            {event.status === 'draft' && (
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                Borrador
              </span>
            )}
            {event.meetingUrl && (
              <Video className="h-3 w-3 text-neutral-400 flex-shrink-0" />
            )}
          </div>
          {!compact && (
            <div className="mt-1 space-y-0.5 text-xs text-neutral-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatTime(event.startDate)}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
            </div>
          )}
          <span
            className={`inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}
          >
            {EVENT_TYPE_LABELS[event.eventType]}
          </span>
        </div>
      </div>
    </Link>
  )
}
