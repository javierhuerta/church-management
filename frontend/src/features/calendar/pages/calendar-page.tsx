import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Plus, Download, Loader2 } from 'lucide-react'
import { useCalendar, useCalendarInfinite, type EventType, type CalendarInfiniteFilters } from '../hooks/use-calendar'
import { useAuthUser } from '../hooks/use-auth-user'
import { isEditorRole } from '../utils/labels'
import { CalendarGrid } from '../components/calendar-grid'
import { CalendarList } from '../components/calendar-list'
import { EventFilters } from '../components/event-filters'
import { Button } from '@/components/ui/button'
import { DepartmentsService } from '@/lib/api'
import { downloadCalendarPdf } from '../hooks/use-calendar-pdf'
import { SYSTEM_NAME } from '@/lib/seo'

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function CalendarPage() {
  const user = useAuthUser()
  const canEdit = isEditorRole(user?.role)

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  const [eventType, setEventType] = useState<EventType | undefined>(undefined)
  const [departmentId, setDepartmentId] = useState<string | undefined>(undefined)

  const filters = useMemo(() => {
    const start = startOfMonth(currentMonth)
    start.setDate(start.getDate() - 7)
    const end = endOfMonth(currentMonth)
    end.setDate(end.getDate() + 7)
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      eventType,
      departmentId,
    }
  }, [currentMonth, eventType, departmentId])

  const { data, isLoading, isError } = useCalendar(filters)
  const events = data?.data ?? []

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => DepartmentsService.departmentsControllerFindAll(),
  })

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  async function handleDownloadPdf() {
    setIsGeneratingPdf(true)
    try {
      const dept = departmentId ? departments.find((d) => d.id === departmentId) : undefined
      await downloadCalendarPdf(currentMonth, events, {
        departmentName: dept?.name ?? null, // kept for PDF filter label only
        eventType,
      })
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Calendario — {SYSTEM_NAME}</title>
        <meta name="description" content="Calendario de eventos de la Iglesia Adventista Central Osorno — actividades eclesiásticas, eventos ASACH y distritales." />
      </Helmet>
      <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-muted-foreground">
            Calendario
          </h2>
          <p className="text-muted-foreground mt-1">
            Eventos de la iglesia, ASACH y distritales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf || events.length === 0}
          >
            {isGeneratingPdf ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            Descargar PDF
          </Button>
          {canEdit && (
            <Link to="/calendario/nuevo">
              <Button>
                <Plus className="h-4 w-4 mr-1" /> Crear evento
              </Button>
            </Link>
          )}
        </div>
      </div>

      <EventFilters
        eventType={eventType}
        departmentId={departmentId}
        currentMonth={currentMonth}
        onEventTypeChange={setEventType}
        onDepartmentChange={setDepartmentId}
        onPrevMonth={() =>
          setCurrentMonth(
            (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1),
          )
        }
        onNextMonth={() =>
          setCurrentMonth(
            (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1),
          )
        }
        onToday={() => setCurrentMonth(startOfMonth(new Date()))}
      />

      {isLoading && <CalendarSkeleton />}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No se pudieron cargar los eventos. Intenta nuevamente.
        </div>
      )}

      {/* Desktop: month grid — guarded by its own empty/loading state */}
      {!isLoading && !isError && (
        <div className="hidden md:block">
          {events.length > 0 ? (
            <CalendarGrid currentMonth={currentMonth} events={events} />
          ) : (
            <EmptyState />
          )}
        </div>
      )}

      {/* Mobile: infinite scroll list — renders independently of desktop query */}
      <div className="block md:hidden">
        <MobileCalendarList filters={{ eventType, departmentId, startMonth: currentMonth }} />
      </div>
      </div>
    </>
  )
}

function MobileCalendarList({ filters }: { filters: CalendarInfiniteFilters }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useCalendarInfinite(filters)

  const events = data?.pages.flatMap((p) => p.data ?? []) ?? []

  if (isLoading) return <CalendarSkeleton />

  if (events.length === 0 && !hasNextPage) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
        <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">📅</span>
        </div>
        <h3 className="text-base font-semibold text-muted-foreground">
          Sin eventos
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          No hay eventos para los filtros seleccionados.
        </p>
      </div>
    )
  }

  return (
    <CalendarList
      events={events}
      onLoadMore={fetchNextPage}
      hasMore={hasNextPage ?? true}
      isLoadingMore={isFetchingNextPage}
    />
  )
}

function CalendarSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 42 }).map((_, i) => (
          <div
            key={i}
            className="h-20 bg-muted rounded animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
      <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <span className="text-2xl">📅</span>
      </div>
      <h3 className="text-base font-semibold text-muted-foreground">
        Sin eventos
      </h3>
      <p className="text-sm text-muted-foreground mt-1">
        No hay eventos para los filtros seleccionados.
      </p>
    </div>
  )
}
