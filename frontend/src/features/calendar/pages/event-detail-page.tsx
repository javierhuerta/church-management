import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { CalendarService } from '@/lib/api'
import { useEventBySlug } from '../hooks/use-calendar'
import { useAuthUser } from '../hooks/use-auth-user'
import {
  DEPARTMENT_LABELS,
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
  isEditorRole,
} from '../utils/labels'
import { AttachmentGallery } from '../components/attachment-gallery'
import { ShareButtons } from '../components/share-buttons'
import { MeetingButton } from '../components/meeting-button'

const API_BASE =
  (import.meta as ImportMeta).env.VITE_API_URL || 'http://localhost:3000'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatRange(startIso: string, endIso: string): string {
  const start = new Date(startIso)
  const end = new Date(endIso)
  const fmt = (d: Date) =>
    d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
  return `${fmt(start)} – ${fmt(end)}`
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const user = useAuthUser()
  const canEdit = isEditorRole(user?.role)
  const { data: event, isLoading, isError } = useEventBySlug(slug ?? '')
  const [coverErrored, setCoverErrored] = useState(false)

  useEffect(() => {
    if (!event) return
    document.title = `${event.title} — Calendario`
    setMetaTag('og:title', event.title)
    setMetaTag('og:description', stripHtml(event.description ?? ''))
    setMetaTag(
      'og:image',
      event.coverImageUrl
        ? event.coverImageUrl.startsWith('http')
          ? event.coverImageUrl
          : `${API_BASE}${event.coverImageUrl}`
        : '',
    )
    setMetaTag('og:url', window.location.href)
    setMetaTag('og:type', 'event')
  }, [event])

  if (isLoading) {
    return <DetailSkeleton />
  }

  if (isError || !event) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
        <h2 className="text-xl font-semibold text-neutral-900">
          Evento no encontrado
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          El evento que buscas no existe o no está disponible.
        </p>
        <Link to="/calendario" className="inline-block mt-4">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver al calendario
          </Button>
        </Link>
      </div>
    )
  }

  const colors = EVENT_TYPE_COLORS[event.eventType]
  const cover =
    !coverErrored && event.coverImageUrl
      ? event.coverImageUrl.startsWith('http')
        ? event.coverImageUrl
        : `${API_BASE}${event.coverImageUrl}`
      : null

  async function handleDelete() {
    if (!confirm('¿Eliminar este evento permanentemente?')) return
    try {
      await CalendarService.calendarControllerRemove(event!.id)
      navigate('/calendario')
    } catch {
      alert('No se pudo eliminar el evento.')
    }
  }

  async function handlePublish() {
    try {
      await CalendarService.calendarControllerPublish(event!.id)
      window.location.reload()
    } catch {
      alert('No se pudo publicar el evento.')
    }
  }

  async function handleArchive() {
    try {
      await CalendarService.calendarControllerArchive(event!.id)
      window.location.reload()
    } catch {
      alert('No se pudo archivar el evento.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to="/calendario">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Calendario
          </Button>
        </Link>
        {canEdit && (
          <div className="flex items-center gap-2">
            {event.status === 'draft' && (
              <Button size="sm" onClick={handlePublish}>
                Publicar
              </Button>
            )}
            {event.status === 'published' && (
              <Button size="sm" variant="outline" onClick={handleArchive}>
                Archivar
              </Button>
            )}
            <Link to={`/calendario/${event.shareSlug}/editar`}>
              <Button size="sm" variant="outline">
                <Pencil className="h-4 w-4 mr-1" /> Editar
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Eliminar
            </Button>
          </div>
        )}
      </div>

      {cover && (
        <div className="relative w-full overflow-hidden rounded-2xl bg-neutral-100 h-48 md:h-64 lg:h-72">
          <img
            src={cover}
            alt={event.title}
            className="h-full w-full object-cover"
            onError={() => setCoverErrored(true)}
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}
          >
            {EVENT_TYPE_LABELS[event.eventType]}
          </span>
          {event.department && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-neutral-100 text-neutral-700">
              {DEPARTMENT_LABELS[event.department]}
            </span>
          )}
          {event.status === 'draft' && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">
              Borrador
            </span>
          )}
          {event.status === 'archived' && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-neutral-200 text-neutral-700">
              Archivado
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          {event.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-neutral-600 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span className="capitalize">{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{formatRange(event.startDate, event.endDate)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {event.meetingUrl && (
          <div className="pt-1">
            <MeetingButton url={event.meetingUrl} type={event.meetingType} />
          </div>
        )}
      </div>

      {event.description && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div
            className="prose prose-sm prose-neutral max-w-none"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        </section>
      )}

      {event.organizers.length > 0 && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">
            Organizadores
          </h3>
          <div className="flex flex-wrap gap-3">
            {event.organizers.map((o) => (
              <div
                key={o.id}
                className="flex items-center gap-2 rounded-full bg-neutral-50 border border-neutral-200 px-3 py-1.5"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-neutral-700 text-white text-[10px]">
                    {getInitials(o.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-neutral-700">{o.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {event.attachments.length > 0 && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <AttachmentGallery
            attachments={event.attachments}
            baseUrl={API_BASE}
          />
        </section>
      )}

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">
          Compartir este evento
        </h3>
        <ShareButtons url={window.location.href} title={event.title} />
      </section>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="aspect-[16/9] w-full rounded-2xl bg-neutral-100 animate-pulse" />
      <div className="h-8 w-2/3 bg-neutral-100 rounded animate-pulse" />
      <div className="h-4 w-1/2 bg-neutral-100 rounded animate-pulse" />
      <div className="h-32 bg-neutral-100 rounded animate-pulse" />
    </div>
  )
}

function setMetaTag(property: string, content: string): void {
  if (!content) return
  let tag = document.querySelector(`meta[property="${property}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('property', property)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return (div.textContent || div.innerText || '').slice(0, 200)
}
