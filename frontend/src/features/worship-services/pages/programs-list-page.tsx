import { Link } from 'react-router-dom'
import { Plus, Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { usePrograms } from '../hooks/use-worship-services'
import { Button } from '@/components/ui/button'
import { useAuthUser } from '@/features/calendar/hooks/use-auth-user'

export function ProgramsListPage() {
  const user = useAuthUser()
  const canCreate = ['Admin', 'Pastor', 'Anciano', 'DirectorDepartamento'].includes(user?.role || '')
  const { data: programs, isLoading, isError } = usePrograms()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
            Programas de Culto
          </h2>
          <p className="text-neutral-500 mt-1">
            Programas de culto creados a partir de plantillas
          </p>
        </div>
        {canCreate && (
          <Link to="/cultos/programas/nuevo">
            <Button>
              <Plus className="h-4 w-4 mr-1" /> Nuevo programa
            </Button>
          </Link>
        )}
      </div>

      {isLoading && <ProgramsSkeleton />}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No se pudieron cargar los programas. Intenta nuevamente.
        </div>
      )}

      {!isLoading && !isError && (!programs || programs.length === 0) && (
        <EmptyState canCreate={canCreate} />
      )}

      {!isLoading && !isError && programs && programs.length > 0 && (
        <div className="grid gap-4">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProgramCard({ program }: { program: any }) {
  const formattedDate = format(new Date(program.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
  const isPublished = program.status === 'PUBLISHED'

  return (
    <Link to={`/cultos/programas/${program.id}`}>
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-lg bg-blue-100 p-2">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">{formattedDate}</h3>
              <p className="text-sm text-neutral-500 mt-0.5">{program.template?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPublished ? (
              <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                <Clock className="h-3 w-3 mr-1" /> Publicado
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                Borrador
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
          {program.groups?.length > 0 && (
            <span>{program.groups.length} grupos</span>
          )}
          {program.sections?.length > 0 && (
            <span>{program.sections.length} secciones</span>
          )}
        </div>
      </div>
    </Link>
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

function EmptyState({ canCreate }: { canCreate: boolean }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <span className="text-2xl">📅</span>
      </div>
      <h3 className="text-base font-semibold text-neutral-900">Sin programas</h3>
      <p className="text-sm text-neutral-500 mt-1">
        {canCreate
          ? 'Crea tu primer programa de culto selecciona una plantilla.'
          : 'No hay programas disponibles.'}
      </p>
      {canCreate && (
        <Link to="/cultos/programas/nuevo" className="mt-4 inline-block">
          <Button>
            <Plus className="h-4 w-4 mr-1" /> Crear programa
          </Button>
        </Link>
      )}
    </div>
  )
}