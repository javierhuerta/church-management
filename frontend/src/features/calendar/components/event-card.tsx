import { Link } from 'react-router-dom'
import { MapPin, Video } from 'lucide-react'
import type { EventResponseDto } from '@/lib/api'
import {
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
  DEPARTMENT_LABELS,
  getDepartmentColors,
} from '../utils/labels'

interface EventCardProps {
  event: EventResponseDto
  compact?: boolean
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/* Default cover gradient per event type */
const TYPE_GRADIENT: Record<string, string> = {
  local:      'linear-gradient(135deg, hsl(219 59% 25% / 0.18), hsl(40 55% 55% / 0.12))',
  asach:      'linear-gradient(135deg, hsl(270 50% 40% / 0.15), hsl(219 59% 25% / 0.12))',
  distrital:  'linear-gradient(135deg, hsl(175 60% 35% / 0.15), hsl(219 59% 25% / 0.12))',
}

export function EventCard({ event, compact = false }: EventCardProps) {
  const typeColors = EVENT_TYPE_COLORS[event.eventType]
  const deptColors = event.departmentName ? getDepartmentColors(event.departmentName) : null
  const deptLabel = event.departmentName
    ? (DEPARTMENT_LABELS[event.departmentName as keyof typeof DEPARTMENT_LABELS] ?? event.departmentName)
    : null

  const coverUrl = (event as EventResponseDto & { coverImageUrl?: string }).coverImageUrl
  const bgStyle = coverUrl
    ? {
        backgroundImage: `linear-gradient(to bottom, hsl(var(--card) / 0.65), hsl(var(--card) / 0.90)), url(${coverUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { backgroundImage: TYPE_GRADIENT[event.eventType] ?? TYPE_GRADIENT.local }

  return (
    <Link
      to={`/calendario/${event.shareSlug}`}
      className={`
        block rounded-xl border border-border bg-card overflow-hidden
        transition-all duration-200
        hover:shadow-md hover:border-primary/40 hover:-translate-y-px
        ${event.status === 'draft' ? 'opacity-70 border-dashed' : ''}
      `}
    >
      <div className="p-2.5" style={bgStyle}>
        {/* Title row */}
        <div className="flex items-start gap-1.5">
          <span className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${typeColors.dot}`} />
          <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2 flex-1">
            {event.title}
          </p>
          {event.meetingUrl && (
            <Video className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
          )}
        </div>

        {/* Time + location (non-compact) */}
        {!compact && (
          <div className="mt-1 pl-3.5 space-y-0.5 text-[10px] text-muted-foreground">
            <span>{formatTime(event.startDate)}</span>
            {event.location && (
              <div className="flex items-center gap-1 truncate">
                <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
        )}

        {/* Badges */}
        <div className="mt-1.5 pl-3.5 flex flex-wrap items-center gap-1">
          <span
            className={`inline-block text-[9px] font-medium px-1.5 py-0.5 rounded-full ${typeColors.bg} ${typeColors.text}`}
          >
            {EVENT_TYPE_LABELS[event.eventType]}
          </span>
          {deptLabel && deptColors && (
            <span
              className={`inline-block text-[9px] font-medium px-1.5 py-0.5 rounded-full ${deptColors.bg} ${deptColors.text}`}
            >
              {deptLabel}
            </span>
          )}
          {event.status === 'draft' && (
            <span className="inline-block text-[9px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: '#C9A84C', color: '#102240' }}>
              Borrador
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
