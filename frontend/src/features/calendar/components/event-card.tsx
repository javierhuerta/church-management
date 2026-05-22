import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Video, Archive, Clock, Users } from 'lucide-react'
import type { EventResponseDto } from '@/lib/api'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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

// Status config
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon?: React.ReactNode }> = {
  published: { label: 'Publicado', bg: '#0F766E', color: '#fff', icon: <Clock style={{ width: 8, height: 8, display: 'inline', marginRight: 2 }} /> },
  archived:  { label: 'Archivado', bg: '#475569', color: '#fff', icon: <Archive style={{ width: 8, height: 8, display: 'inline', marginRight: 2 }} /> },
  draft:     { label: 'Borrador',  bg: '#C9A84C', color: '#102240' },
}

// ─── Shared badge components ────────────────────────────────────────────────

interface EventBadgesProps {
  event: EventResponseDto
  deptStyle: ReturnType<typeof getDepartmentStyle> | null
}

// Badges con sigla — solo para tarjetas del grid desktop
function EventBadges({ event, deptStyle }: EventBadgesProps) {
  const typeStyle = EVENT_TYPE_STYLE[event.eventType] ?? EVENT_TYPE_STYLE.local
  const status = event.status as string
  const statusCfg = STATUS_CONFIG[status]
  const sigla = event.department?.sigla

  return (
    <div className="flex flex-wrap items-center gap-1">
      <span
        className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: typeStyle.backgroundColor, color: typeStyle.color }}
      >
        {EVENT_TYPE_LABELS[event.eventType]}
      </span>

      {sigla && deptStyle && (
        <span
          className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
          title={event.department?.name ?? undefined}
          style={{ backgroundColor: deptStyle.backgroundColor, color: deptStyle.color }}
        >
          {sigla}
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
  )
}

// Badges sin sigla — para mobile y popover (el departamento se muestra aparte como nombre completo)
function EventTypeBadges({ event }: { event: EventResponseDto }) {
  const typeStyle = EVENT_TYPE_STYLE[event.eventType] ?? EVENT_TYPE_STYLE.local
  const status = event.status as string
  const statusCfg = STATUS_CONFIG[status]

  return (
    <div className="flex flex-wrap items-center gap-1">
      <span
        className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: typeStyle.backgroundColor, color: typeStyle.color }}
      >
        {EVENT_TYPE_LABELS[event.eventType]}
      </span>

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
  )
}

// ─── Mobile card (cover as header) ──────────────────────────────────────────

function MobileEventCard({ event, compact }: EventCardProps) {
  const typeStyle = EVENT_TYPE_STYLE[event.eventType] ?? EVENT_TYPE_STYLE.local
  const deptStyle = event.department
    ? getDepartmentStyle(event.department.name, event.department.color)
    : null
  const coverUrl = event.coverImageUrl
  const status = event.status as string
  const isDraft = status === 'draft'
  const isArchived = status === 'archived'

  return (
    <Link
      to={`/calendario/${event.shareSlug}`}
      className={`
        block rounded-xl border bg-card overflow-hidden
        transition-all duration-200 hover:shadow-md hover:-translate-y-px
        ${isDraft ? 'border-dashed border-accent/60 opacity-80' : isArchived ? 'border-border/50 opacity-60' : 'border-border hover:border-primary/40'}
      `}
    >
      {/* Cover header — fixed height keeps it compact on mobile */}
      <div
        className="w-full h-32 overflow-hidden relative bg-muted"
        style={{ backgroundColor: deptStyle?.dotColor ?? typeStyle.dotColor + '33' }}
      >
        <img
          src={coverUrl ?? defaultCover}
          alt=""
          aria-hidden
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-3 space-y-1.5">
        {/* Title */}
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

        {/* Date + location */}
        <div className="pl-4 space-y-0.5 text-xs text-muted-foreground">
          <span className="font-medium">{formatDateRange(event.startDate, event.endDate)}</span>
          {!compact && event.location && (
            <div className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        {/* Department full name */}
        {event.department?.name && (
          <div className="pl-4 flex items-center gap-1 text-xs text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: deptStyle?.dotColor }}
            />
            <span className="truncate">{event.department.name}</span>
          </div>
        )}

        {/* Organizers (brief) */}
        {event.organizers && event.organizers.length > 0 && (
          <div className="pl-4 flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">
              {event.organizers.map(o => o.name).join(', ')}
            </span>
          </div>
        )}

        {/* Badges — type + status only (no sigla in mobile) */}
        <div className="pl-4">
          <EventTypeBadges event={event} />
        </div>
      </div>

      {/* Bottom accent for published */}
      {status === 'published' && <div className="h-0.5 bg-primary/30" />}
    </Link>
  )
}

// ─── Desktop popover content ─────────────────────────────────────────────────

function EventPopoverContent({ event }: { event: EventResponseDto }) {
  const typeStyle = EVENT_TYPE_STYLE[event.eventType] ?? EVENT_TYPE_STYLE.local
  const deptStyle = event.department
    ? getDepartmentStyle(event.department.name, event.department.color)
    : null
  const coverUrl = event.coverImageUrl

  return (
    <div className="w-72 overflow-hidden">
      {/* Cover image */}
      <div
        className="w-full aspect-video overflow-hidden relative bg-muted"
        style={{ backgroundColor: deptStyle?.dotColor ?? typeStyle.dotColor + '33' }}
      >
        <img
          src={coverUrl ?? defaultCover}
          alt=""
          aria-hidden
          className="w-full h-full object-cover"
        />
      </div>

      {/* Detail */}
      <div className="p-3 space-y-2">
        <p className="text-sm font-semibold leading-snug text-foreground">{event.title}</p>

        {event.description && (
          <p
            className="text-xs text-muted-foreground line-clamp-3"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        )}

        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">{formatDateRange(event.startDate, event.endDate)}</div>

          {event.location && (
            <div className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {event.meetingUrl && (
            <div className="flex items-center gap-1 truncate">
              <Video className="h-3 w-3 flex-shrink-0" />
              <a
                href={event.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {event.meetingUrl}
              </a>
            </div>
          )}

          {event.department?.name && (
            <div className="flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: deptStyle?.dotColor }}
              />
              <span className="truncate">{event.department.name}</span>
            </div>
          )}

          {event.organizers && event.organizers.length > 0 && (
            <div className="flex items-start gap-1">
              <Users className="h-3 w-3 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">
                {event.organizers.map(o => o.name).join(', ')}
              </span>
            </div>
          )}
        </div>

        <EventTypeBadges event={event} />
      </div>
    </div>
  )
}

// ─── Desktop card (minimal + popover on hover) ───────────────────────────────

function DesktopEventCard({ event, compact }: EventCardProps) {
  const typeStyle = EVENT_TYPE_STYLE[event.eventType] ?? EVENT_TYPE_STYLE.local
  const deptStyle = event.department
    ? getDepartmentStyle(event.department.name, event.department.color)
    : null
  const status = event.status as string
  const isDraft = status === 'draft'
  const isArchived = status === 'archived'

  // Hover-controlled popover (same pattern as MultiDayBand in calendar-grid)
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleMouseEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }
  function handleMouseLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }

  const cardContent = (
    <div
      className={`
        rounded-xl border bg-card overflow-hidden
        transition-all duration-200 hover:shadow-md hover:-translate-y-px cursor-pointer
        ${isDraft ? 'border-dashed border-accent/60 opacity-80' : isArchived ? 'border-border/50 opacity-60' : 'border-border hover:border-primary/40'}
      `}
    >
      <div className="p-3 space-y-1.5">
        {/* Title */}
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

        {/* Date + location */}
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
        <div className="pl-4">
          <EventBadges event={event} deptStyle={deptStyle} />
        </div>
      </div>

      {status === 'published' && <div className="h-0.5 bg-primary/30" />}
    </div>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Link
          to={`/calendario/${event.shareSlug}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="focus:outline-none"
        >
          {cardContent}
        </Link>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="p-0 overflow-hidden w-72"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <EventPopoverContent event={event} />
      </PopoverContent>
    </Popover>
  )
}

// ─── Public export: responsive switcher ──────────────────────────────────────

export function EventCard({ event, compact = false }: EventCardProps) {
  return (
    <>
      {/* Mobile: cover as header */}
      <div className="md:hidden">
        <MobileEventCard event={event} compact={compact} />
      </div>
      {/* Desktop: minimal card + popover */}
      <div className="hidden md:block">
        <DesktopEventCard event={event} compact={compact} />
      </div>
    </>
  )
}
