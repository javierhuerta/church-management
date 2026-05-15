import { useState, useRef } from 'react'
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
import {
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
  DEPARTMENT_COLORS,
  DEPARTMENT_LABELS,
} from '../utils/labels'

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

  if (sameDay) {
    return `${format(s, "d 'de' MMM, HH:mm", { locale: es })} – ${format(e, 'HH:mm', { locale: es })}`
  }
  return `${format(s, "d MMM", { locale: es })} – ${format(e, "d MMM yyyy", { locale: es })}`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function EventCard({ event, compact = false }: EventCardProps) {
  const typeColors = EVENT_TYPE_COLORS[event.eventType]
  const deptColors = event.department ? DEPARTMENT_COLORS[event.department] : null
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleMouseEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    if (compact) setOpen(true)
  }

  function handleMouseLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }

  const cardContent = (
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
        <div className="mt-1.5 flex flex-col items-center gap-1 flex-shrink-0">
          <span className={`h-2 w-2 rounded-full ${typeColors.dot}`} />
          {deptColors && (
            <span className={`h-2 w-2 rounded-full ${deptColors.dot}`} />
          )}
        </div>
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
          <div className="mt-1.5 flex items-center gap-1 flex-wrap">
            <span
              className={`inline-block text-[10px] px-1.5 py-0.5 rounded ${typeColors.bg} ${typeColors.text}`}
            >
              {EVENT_TYPE_LABELS[event.eventType]}
            </span>
            {event.department && deptColors && (
              <span
                className={`inline-block text-[10px] px-1.5 py-0.5 rounded ${deptColors.bg} ${deptColors.text}`}
              >
                {DEPARTMENT_LABELS[event.department]}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )

  if (!compact) return cardContent

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {cardContent}
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        className="w-72 p-0 shadow-lg"
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
              <span>{formatDateRange(event.startDate, event.endDate)}</span>
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
            {event.department && deptColors && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${deptColors.bg} ${deptColors.text} flex items-center gap-1`}>
                <Building2 className="h-2.5 w-2.5" />
                {DEPARTMENT_LABELS[event.department]}
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
  )
}
