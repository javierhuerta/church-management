import { Link } from 'react-router-dom'
import { MapPin, Video, Archive, Clock } from 'lucide-react'
import type { EventResponseDto } from '@/lib/api'
import {
  EVENT_TYPE_STYLE,
  EVENT_TYPE_LABELS,
  getDepartmentStyle,
} from '../utils/labels'
import defaultCover from '@/assets/images/default-cover.jpg'

interface EventCardProps {
  event: EventResponseDto
  compact?: boolean
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const sameDay =
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate()

  const dateOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  const timeOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }

  if (sameDay) {
    const date = s.toLocaleDateString('es-CL', dateOpts)
    const t1 = s.toLocaleTimeString('es-CL', timeOpts)
    const t2 = e.toLocaleTimeString('es-CL', timeOpts)
    return `${date} · ${t1}–${t2}`
  }

  const d1 = s.toLocaleDateString('es-CL', dateOpts)
  const d2 = e.toLocaleDateString('es-CL', dateOpts)
  return `${d1} – ${d2}`
}

/** Returns uppercase initials from a name: "Jóvenes y Adolescentes" → "JA" */
function toInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 4)
}

// Status config
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon?: React.ReactNode }> = {
  published: { label: 'Publicado', bg: '#0F766E', color: '#fff', icon: <Clock style={{ width: 8, height: 8, display: 'inline', marginRight: 2 }} /> },
  archived:  { label: 'Archivado', bg: '#475569', color: '#fff', icon: <Archive style={{ width: 8, height: 8, display: 'inline', marginRight: 2 }} /> },
  draft:     { label: 'Borrador',  bg: '#C9A84C', color: '#102240' },
}

// Subtle gradient when there is no cover image
const TYPE_BG: Record<string, string> = {
  local:     'linear-gradient(135deg, hsl(219 59% 25% / 0.07) 0%, hsl(40 55% 55% / 0.05) 100%)',
  asach:     'linear-gradient(135deg, hsl(270 50% 40% / 0.07) 0%, hsl(219 59% 25% / 0.05) 100%)',
  distrital: 'linear-gradient(135deg, hsl(175 60% 35% / 0.07) 0%, hsl(219 59% 25% / 0.05) 100%)',
}

export function EventCard({ event, compact = false }: EventCardProps) {
  const typeStyle = EVENT_TYPE_STYLE[event.eventType] ?? EVENT_TYPE_STYLE.local
  const deptStyle = event.departmentName ? getDepartmentStyle(event.departmentName, event.departmentColor) : null
  const deptInitials = event.departmentName ? toInitials(event.departmentName) : null

  const coverUrl = (event as EventResponseDto & { coverImageUrl?: string }).coverImageUrl
  const status = event.status as string
  const statusCfg = STATUS_CONFIG[status]
  const isDraft = status === 'draft'
  const isArchived = status === 'archived'
  const hasCover = !!coverUrl

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
      {/* Cover area */}
      <div className="relative overflow-hidden" style={hasCover ? undefined : { backgroundImage: TYPE_BG[event.eventType] ?? TYPE_BG.local }}>
        {/* Default cover image when no custom cover */}
        {!hasCover && (
          <img
            src={defaultCover}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.12 }}
          />
        )}
        {/* Custom cover image */}
        {hasCover && (
          <img
            src={coverUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.22 }}
          />
        )}

        <div className="relative p-3 space-y-1.5 min-w-0">
          {/* Title row */}
          <div className="flex items-start gap-2 min-w-0">
            <span
              className="mt-1 h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: deptStyle ? deptStyle.dotColor : typeStyle.dotColor }}
            />
            <p className="text-sm font-semibold leading-snug line-clamp-2 flex-1 text-foreground min-w-0">
              {event.title}
            </p>
            {event.meetingUrl && (
              <Video className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
            )}
          </div>

          {/* Date + location — always shown */}
          <div className="pl-4 space-y-0.5 text-xs text-muted-foreground">
            <span className="font-medium">{formatDateRange(event.startDate, event.endDate)}</span>
            {!compact && event.location && (
              <div className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="pl-4 flex flex-wrap items-center gap-1">
            <span
              className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: typeStyle.backgroundColor, color: typeStyle.color }}
            >
              {EVENT_TYPE_LABELS[event.eventType]}
            </span>

            {deptInitials && deptStyle && (
              <span
                className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
                title={event.departmentName ?? undefined}
                style={{ backgroundColor: deptStyle.backgroundColor, color: deptStyle.color }}
              >
                {deptInitials}
              </span>
            )}

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
      </div>

      {/* Bottom accent line for published events */}
      {status === 'published' && (
        <div className="h-0.5 bg-primary/30" />
      )}
    </Link>
  )
}
