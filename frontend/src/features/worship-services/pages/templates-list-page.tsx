import { Link } from 'react-router-dom'
import { Plus, Pencil } from 'lucide-react'
import { useTemplates } from '../hooks/use-worship-services'
import type { ServiceTemplateResponseDto } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useAuthUser } from '@/features/calendar/hooks/use-auth-user'

const TEMPLATE_TYPE_LABELS: Record<string, string> = {
  CULTO_SABATICO: 'Culto Sabático',
  CULTO_JA: 'Culto JA',
  CULTO_ORACION: 'Culto de Oración',
  OTRO: 'Otro',
}

const TEMPLATE_TYPE_STYLES: Record<string, string> = {
  CULTO_SABATICO: 'bg-blue-100 text-blue-800',
  CULTO_JA: 'bg-purple-100 text-purple-800',
  CULTO_ORACION: 'bg-green-100 text-green-800',
  OTRO: 'bg-gray-100 text-gray-800',
}

export function TemplatesListPage() {
  const user = useAuthUser()
  const canManage = user?.role === 'Admin' || user?.role === 'Pastor'
  const { data: templates, isLoading, isError } = useTemplates()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
            Plantillas de Cultos
          </h2>
          <p className="text-neutral-500 mt-1">
            Gestiona las plantillas para los programas de culto
          </p>
        </div>
        {canManage && (
          <Link to="/cultos/plantillas/nuevo">
            <Button>
              <Plus className="h-4 w-4 mr-1" /> Nueva plantilla
            </Button>
          </Link>
        )}
      </div>

      {isLoading && <TemplatesSkeleton />}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No se pudieron cargar las plantillas. Intenta nuevamente.
        </div>
      )}

      {!isLoading && !isError && (!templates || templates.length === 0) && (
        <EmptyState canCreate={canManage} />
      )}

      {!isLoading && !isError && templates && templates.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} canEdit={canManage} />
          ))}
        </div>
      )}
    </div>
  )
}

function TemplateCard({ template, canEdit }: { template: ServiceTemplateResponseDto; canEdit: boolean }) {
  const sectionCount = template.groups.reduce((acc: number, g) => acc + g.sections.length, 0) + template.sections.length

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 truncate">{template.name}</h3>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${TEMPLATE_TYPE_STYLES[template.type]}`}>
            {TEMPLATE_TYPE_LABELS[template.type]}
          </span>
        </div>
        {template.isActive ? (
          <span className="shrink-0 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            Activa
          </span>
        ) : (
          <span className="shrink-0 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            Inactiva
          </span>
        )}
      </div>

      {template.description && (
        <p className="mt-2 text-sm text-neutral-500 line-clamp-2">{template.description}</p>
      )}

      <div className="mt-3 flex items-center justify-between text-sm text-neutral-500">
        <span>{sectionCount} secciones</span>
        {canEdit && (
          <div className="flex gap-1">
            <Link to={`/cultos/plantillas/${template.id}/editar`}>
              <Button variant="ghost" size="sm">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function TemplatesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="h-5 w-32 bg-neutral-200 rounded animate-pulse" />
          <div className="mt-2 h-4 w-20 bg-neutral-100 rounded animate-pulse" />
          <div className="mt-4 h-4 w-full bg-neutral-100 rounded animate-pulse" />
          <div className="mt-2 h-4 w-3/4 bg-neutral-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ canCreate }: { canCreate: boolean }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <span className="text-2xl">📋</span>
      </div>
      <h3 className="text-base font-semibold text-neutral-900">Sin plantillas</h3>
      <p className="text-sm text-neutral-500 mt-1">
        {canCreate
          ? 'Crea tu primera plantilla para comenzar a organizar cultos.'
          : 'No hay plantillas disponibles.'}
      </p>
      {canCreate && (
        <Link to="/cultos/plantillas/nuevo" className="mt-4 inline-block">
          <Button>
            <Plus className="h-4 w-4 mr-1" /> Crear plantilla
          </Button>
        </Link>
      )}
    </div>
  )
}