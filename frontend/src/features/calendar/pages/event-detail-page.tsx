import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CalendarService } from '@/lib/api'
import { useEventBySlug } from '../hooks/use-calendar'
import { useAuthUser } from '../hooks/use-auth-user'
import {
  EVENT_TYPE_STYLE,
  EVENT_TYPE_LABELS,
  isEditorRole,
} from '../utils/labels'
import { AttachmentGallery } from '../components/attachment-gallery'
import { ShareButtons } from '../components/share-buttons'
import { MeetingButton } from '../components/meeting-button'
import { OrganizerChip, type OrganizerEntry } from '../components/organizer-chip'
import { formatEventDateRange } from '../utils/event-date'
import { SYSTEM_NAME } from '@/lib/seo'

const resolveAbsoluteUrl = (path: string) =>
  path.startsWith('http') ? path : `${window.location.origin}${path}`

function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return (div.textContent || div.innerText || '').slice(0, 200)
}


export function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const user = useAuthUser()
  const canEdit = isEditorRole(user?.role)
  const { data: event, isLoading, isError } = useEventBySlug(slug ?? '')
  const [coverErrored, setCoverErrored] = useState(false)

  if (isLoading) {
    return <DetailSkeleton />
  }

  if (isError || !event) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <h2 className="text-xl font-semibold text-muted-foreground">
          Evento no encontrado
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
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

  const typeStyle = EVENT_TYPE_STYLE[event.eventType]
  const cover =
    !coverErrored && event.coverImageUrl
      ? event.coverImageUrl
      : null
  const coverAttachment = event.attachments.find((a) => a.isCover) ?? null
  const dateRange = formatEventDateRange(event.startDate, event.endDate)
  const organizerEntries: OrganizerEntry[] = event.organizers.map((o) =>
    o.kind === 'user' && o.userId
      ? {
          kind: 'user',
          id: o.id,
          userId: o.userId,
          name: o.name,
          email: o.email ?? null,
        }
      : { kind: 'text', id: o.id, displayName: o.name },
  )

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

  const eventDescription = stripHtml(event.description ?? '')
  const eventStart = event.startDate ? new Date(event.startDate).toISOString() : undefined

  return (
    <>
      <Helmet>
        <title>{event.title} — Calendario — {SYSTEM_NAME}</title>
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={eventDescription} />
        {event.coverImageUrl && <meta property="og:image" content={resolveAbsoluteUrl(event.coverImageUrl)} />}
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="event" />
        {eventStart && <meta property="event:start_time" content={eventStart} />}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: event.title,
            description: eventDescription,
            startDate: eventStart,
            endDate: event.endDate ? new Date(event.endDate).toISOString() : undefined,
            location: { '@type': 'Place', name: event.location ?? undefined },
            organizer: { '@type': 'Organization', name: 'Iglesia Adventista Central Osorno' },
            url: window.location.href,
          })}
        </script>
      </Helmet>
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
        <div className="space-y-1">
          <div className="relative w-full overflow-hidden rounded-2xl bg-muted h-48 md:h-64 lg:h-72">
            <img
              src={cover}
              alt={event.title}
              className="h-full w-full object-cover"
              onError={() => setCoverErrored(true)}
            />
          </div>
          {coverAttachment?.sourceAuthor && (
            <p className="text-[11px] text-muted-foreground text-right">
              Foto:{' '}
              {coverAttachment.sourceUrl ? (
                <a
                  href={coverAttachment.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-muted-foreground"
                >
                  {coverAttachment.sourceAuthor}
                </a>
              ) : (
                coverAttachment.sourceAuthor
              )}{' '}
              en Unsplash
            </p>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ backgroundColor: typeStyle.backgroundColor, color: typeStyle.color }}
          >
            {EVENT_TYPE_LABELS[event.eventType]}
          </span>
          {event.department?.name && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
              {event.department.name}
            </span>
          )}
          {event.status === 'draft' && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">
              Borrador
            </span>
          )}
          {event.status === 'archived' && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
              Archivado
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-muted-foreground">
          {event.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span className="capitalize">{dateRange.dateLabel}</span>
          </div>
          {dateRange.timeLabel && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{dateRange.timeLabel}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {event.meetingUrl && (
          <div className="pt-1">
            <MeetingButton url={event.meetingUrl} type={event.meetingType ?? null} />
          </div>
        )}
      </div>

      {event.description && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div
            className="prose prose-sm prose-neutral max-w-none"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        </section>
      )}

      {organizerEntries.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            Organizadores
          </h3>
          <div className="flex flex-wrap gap-3">
            {organizerEntries.map((o) => (
              <OrganizerChip key={o.id} organizer={o} />
            ))}
          </div>
        </section>
      )}

      {event.attachments.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <AttachmentGallery
            attachments={event.attachments}
          />
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          Compartir este evento
        </h3>
        <ShareButtons url={window.location.href} title={event.title} />
      </section>
      </div>
    </>
  )
}

function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="aspect-[16/9] w-full rounded-2xl bg-muted animate-pulse" />
      <div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
      <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
      <div className="h-32 bg-muted rounded animate-pulse" />
    </div>
  )
}

