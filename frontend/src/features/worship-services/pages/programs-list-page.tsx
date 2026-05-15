import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Calendar, Clock, Archive, Filter, Trash2, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { parseDateString } from '@/lib/date'
import { usePrograms, useDeleteProgram, type ProgramFilters } from '../hooks/use-worship-services'
import { useTemplates } from '../hooks/use-worship-services'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuthUser } from '@/features/calendar/hooks/use-auth-user'
import type { ServiceProgramResponseDto } from '@/lib/api'

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Archivado',
}

export function ProgramsListPage() {
  const user = useAuthUser()
  const isAdmin = user?.role === 'Admin'
  const canCreate = ['Admin', 'Pastor', 'Anciano', 'DirectorDepartamento'].includes(user?.role || '')

  const [filters, setFilters] = useState<ProgramFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const { data: programs, isLoading, isError } = usePrograms(filters)
  const { data: templates } = useTemplates()
  const deleteProgram = useDeleteProgram()

  const hasActiveFilters = Object.values(filters).some(Boolean)

  function clearFilters() {
    setFilters({})
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="¿Eliminar este programa?"
        description="Esta acción es permanente y no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={async () => {
          if (deleteTargetId) {
            await deleteProgram.mutateAsync(deleteTargetId)
            setDeleteTargetId(null)
          }
        }}
      />

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
            Programas de Culto
          </h2>
          <p className="text-neutral-500 mt-1">
            Programas de culto creados a partir de plantillas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? 'border-blue-300 text-blue-700 bg-blue-50' : ''}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1.5 rounded-full bg-blue-600 text-white text-xs px-1.5">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </Button>
          {canCreate && (
            <Link to="/cultos/programas/nuevo">
              <Button>
                <Plus className="h-4 w-4 mr-1" /> Nuevo programa
              </Button>
            </Link>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-600">Estado</label>
              <select
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: (e.target.value as ProgramFilters['status']) || undefined })}
              >
                <option value="">Todos</option>
                <option value="DRAFT">Borrador</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="ARCHIVED">Archivado</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-600">Plantilla</label>
              <select
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.templateId || ''}
                onChange={(e) => setFilters({ ...filters, templateId: e.target.value || undefined })}
              >
                <option value="">Todas</option>
                {templates?.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-neutral-600">Rango de fechas</label>
              <DateRangePicker
                value={{ from: filters.dateFrom, to: filters.dateTo }}
                onChange={(range) =>
                  setFilters({
                    ...filters,
                    dateFrom: range.from || undefined,
                    dateTo: range.to || undefined,
                  })
                }
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-3.5 w-3.5 mr-1" /> Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      )}

      {isLoading && <ProgramsSkeleton />}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No se pudieron cargar los programas. Intenta nuevamente.
        </div>
      )}

      {!isLoading && !isError && (!programs || programs.length === 0) && (
        <EmptyState canCreate={canCreate} hasFilters={hasActiveFilters} />
      )}

      {!isLoading && !isError && programs && programs.length > 0 && (
        <div className="grid gap-4">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              isAdmin={isAdmin}
              onDelete={() => setDeleteTargetId(program.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProgramCard({
  program,
  isAdmin,
  onDelete,
}: {
  program: ServiceProgramResponseDto
  isAdmin: boolean
  onDelete: () => void
}) {
  const formattedDate = format(parseDateString(program.date) ?? new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
  const status = program.status as string

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4 p-5">
        <Link to={`/cultos/programas/${program.id}`} className="flex-1 flex items-start gap-3 min-w-0">
          <div className="mt-1 rounded-lg bg-blue-100 p-2 shrink-0">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-neutral-900 truncate">{formattedDate}</h3>
            <p className="text-sm text-neutral-500 mt-0.5">{program.template?.name}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={status} />
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.preventDefault()
                onDelete()
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Link to={`/cultos/programas/${program.id}`}>
        <div className="px-5 pb-4 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
          {program.groups && program.groups.length > 0 && (
            <span>{program.groups.length} grupos</span>
          )}
          {program.sections && program.sections.length > 0 && (
            <span>{program.sections.length} secciones</span>
          )}
        </div>
      </Link>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'PUBLISHED') {
    return (
      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
        <Clock className="h-3 w-3 mr-1" /> Publicado
      </span>
    )
  }
  if (status === 'ARCHIVED') {
    return (
      <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
        <Archive className="h-3 w-3 mr-1" /> Archivado
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

function ProgramsSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 bg-neutral-200 rounded-lg animate-pulse" />
            <div className="flex-1">
              <div className="h-5 w-48 bg-neutral-200 rounded animate-pulse" />
              <div className="mt-1 h-4 w-32 bg-neutral-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ canCreate, hasFilters }: { canCreate: boolean; hasFilters: boolean }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <span className="text-2xl">📅</span>
      </div>
      <h3 className="text-base font-semibold text-neutral-900">
        {hasFilters ? 'Sin resultados' : 'Sin programas'}
      </h3>
      <p className="text-sm text-neutral-500 mt-1">
        {hasFilters
          ? 'No hay programas que coincidan con los filtros aplicados.'
          : canCreate
          ? 'Crea tu primer programa de culto seleccionando una plantilla.'
          : 'No hay programas disponibles.'}
      </p>
      {canCreate && !hasFilters && (
        <Link to="/cultos/programas/nuevo" className="mt-4 inline-block">
          <Button>
            <Plus className="h-4 w-4 mr-1" /> Crear programa
          </Button>
        </Link>
      )}
    </div>
  )
}
