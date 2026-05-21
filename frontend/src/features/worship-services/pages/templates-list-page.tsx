import { Link } from 'react-router-dom'
import { Plus, Pencil, FileText, Search } from 'lucide-react'
import { useState } from 'react'
import { useTemplates } from '../hooks/use-worship-services'
import type { ServiceTemplateResponseDto } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthUser } from '@/features/calendar/hooks/use-auth-user'

const TEMPLATE_TYPE_LABELS: Record<string, string> = {
  CULTO_SABATICO: 'Culto Sabático',
  CULTO_JA: 'Culto JA',
  CULTO_ORACION: 'Culto de Oración',
  OTRO: 'Otro',
}

const TEMPLATE_TYPE_STYLES: Record<string, { bg: string; color: string }> = {
  CULTO_SABATICO: { bg: '#1B3A6B22', color: '#1B3A6B' },
  CULTO_JA:       { bg: '#7C3AED22', color: '#5B21B6' },
  CULTO_ORACION:  { bg: '#16A34A22', color: '#15803D' },
  OTRO:           { bg: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' },
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  ACTIVE:   { bg: '#0F766E22', color: '#0F766E' },
  INACTIVE: { bg: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' },
}

export function TemplatesListPage() {
  const user = useAuthUser()
  const canManage = user?.role === 'Admin' || user?.role === 'Pastor'
  const { data: templates, isLoading, isError } = useTemplates()
  const [search, setSearch] = useState('')

  const filteredTemplates = search.trim()
    ? templates?.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
      )
    : templates

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 px-1">
        <h2 className="text-xl font-semibold text-muted-foreground">Plantillas de Cultos</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar plantilla..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-sm w-48"
            />
          </div>
          {canManage && (
            <Link to="/cultos/plantillas/nuevo">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> Nueva plantilla
              </Button>
            </Link>
          )}
        </div>
      </div>

      {isLoading && <TemplatesSkeleton />}
      {isError && (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-destructive">
          No se pudieron cargar las plantillas. Intenta nuevamente.
        </div>
      )}

      {!isLoading && !isError && (!templates || templates.length === 0) && (
        <EmptyState canCreate={canManage} />
      )}

      {!isLoading && !isError && templates && templates.length > 0 && filteredTemplates && filteredTemplates.length === 0 && search && (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">No se encontraron plantillas para "{search}"</p>
        </div>
      )}

      {!isLoading && !isError && filteredTemplates && filteredTemplates.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} canEdit={canManage} />
          ))}
        </div>
      )}
    </div>
  )
}

function TemplateCard({ template, canEdit }: { template: ServiceTemplateResponseDto; canEdit: boolean }) {
  const typeStyle = TEMPLATE_TYPE_STYLES[template.type] ?? TEMPLATE_TYPE_STYLES.OTRO
  const sectionCount = template.groups.reduce((acc: number, g) => acc + g.sections.length, 0) + template.sections.length

  return (
    <div className="rounded-xl border border-border bg-card p-5 hover:bg-[#C9A84C]/5 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{template.name}</h3>
          <span
            className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: typeStyle.bg, color: typeStyle.color }}
          >
            {TEMPLATE_TYPE_LABELS[template.type]}
          </span>
        </div>
        {template.isActive ? (
          <span
            className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: STATUS_STYLES.ACTIVE.bg, color: STATUS_STYLES.ACTIVE.color }}
          >
            Activa
          </span>
        ) : (
          <span
            className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: STATUS_STYLES.INACTIVE.bg, color: STATUS_STYLES.INACTIVE.color }}
          >
            Inactiva
          </span>
        )}
      </div>

      {template.description && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{template.description}</p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{sectionCount} secciones</span>
        {canEdit && (
          <div className="flex gap-1">
            <Link to={`/cultos/plantillas/${template.id}/editar`}>
              <Button variant="ghost" size="sm">
                <Pencil className="h-4 w-4 text-muted-foreground" />
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
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          <div className="mt-2 h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="mt-4 h-4 w-full bg-muted rounded animate-pulse" />
          <div className="mt-2 h-4 w-3/4 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ canCreate }: { canCreate: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-muted-foreground">Sin plantillas</h3>
      <p className="text-sm text-muted-foreground mt-1">
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