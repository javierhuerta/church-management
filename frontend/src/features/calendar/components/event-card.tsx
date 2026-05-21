import { Link } from 'react-router-dom'
import { MapPin, Video, Archive, Clock } from 'lucide-react'
import type { EventResponseDto } from '@/lib/api'
import {
  EVENT_TYPE_STYLE,
  EVENT_TYPE_LABELS,
  getDepartmentStyle,
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

// Subtle default background per event type when no cover
const TYPE_BG: Record<string, string> = {
  local:     'linear-gradient(135deg, hsl(219 59% 25% / 0.07) 0%, hsl(40 55% 55% / 0.05) 100%)',
  asach:     'linear-gradient(135deg, hsl(270 50% 40% / 0.07) 0%, hsl(219 59% 25% / 0.05) 100%)',
  distrital: 'linear-gradient(135deg, hsl(175 60% 35% / 0.07) 0%, hsl(219 59% 25% / 0.05) 100%)',
}

// Status config
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon?: React.ReactNode }> = {
  published: { label: 'Publicado', bg: '#0F766E', color: '#fff', icon: <Clock style={{ width: 8, height: 8, display: 'inline', marginRight: 2 }} /> },
  archived:  { label: 'Archivado', bg: '#475569', color: '#fff', icon: <Archive style={{ width: 8, height: 8, display: 'inline', marginRight: 2 }} /> },
  draft:     { label: 'Borrador',  bg: '#C9A84C', color: '#102240' },
}

export function EventCard({ event, compact = false }: EventCardProps) {
  const typeStyle = EVENT_TYPE_STYLE[event.eventType] ?? EVENT_TYPE_STYLE.local
  const deptStyle = event.departmentName ? getDepartmentStyle(event.departmentName, event.departmentColor) : null
  const deptLabel = event.departmentName
    ? event.departmentName
    : null

  const coverUrl = (event as EventResponseDto & { coverImageUrl?: string }).coverImageUrl
  const status = event.status as string
  const statusCfg = STATUS_CONFIG[status]
  const isDraft = status === 'draft'
  const isArchived = status === 'archived'

  // Background: cover image with strong overlay OR type gradient
  const bgStyle = coverUrl
    ? {
        backgroundImage: `linear-gradient(to bottom, hsl(var(--card) / 0.82), hsl(var(--card) / 0.96)), url(${coverUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { backgroundImage: TYPE_BG[event.eventType] ?? TYPE_BG.local }

  return (
    <Link
      to={`/calendario/${event.shareSlug}`}
      className={`
        block rounded-xl border bg-card overflow-hidden
        transition-all duration-200
        hover:shadow-md hover:-translate-y-px
        ${isDraft ? 'border-dashed border-accent/60 opacity-80' : isArchived ? 'border-border/50 opacity-60' : 'border-border hover:border-primary/40'}
      `}
    >
      <div className="p-3" style={bgStyle}>
        {/* Title row */}
        <div className="flex items-start gap-2">
          {/* Color dot */}
          <span
            className="mt-1 h-2 w-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: typeStyle.dotColor }}
          />
          <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2 flex-1">
            {event.title}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            {event.meetingUrl && (
              <Video className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Time + location */}
        {!compact && (
          <div className="mt-1.5 pl-4 space-y-0.5 text-xs text-muted-foreground">
            <span>{formatTime(event.startDate)}</span>
            {event.location && (
              <div className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
        )}

        {/* Badges row */}
        <div className="mt-2 pl-4 flex flex-wrap items-center gap-1">
          {/* Event type badge */}
          <span
            className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: typeStyle.backgroundColor, color: typeStyle.color }}
          >
            {EVENT_TYPE_LABELS[event.eventType]}
          </span>

          {/* Department badge */}
          {deptLabel && deptStyle && (
            <span
              className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: deptStyle.backgroundColor, color: deptStyle.color }}
            >
              {deptLabel}
            </span>
          )}

          {/* Status badge — only show non-published states prominently */}
          {statusCfg && status !== 'published' && (
            <span
              className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
            >
              {statusCfg.icon}
              {statusCfg.label}
            </span>
          )}
        </div>
      </div>

      {/* Bottom accent line for published events */}
      {status === 'published' && (
        <div className="h-0.5 bg-primary/30" />
      )}
    </Link>
  )
}
