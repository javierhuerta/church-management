import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Settings } from 'lucide-react'
import { RescueStagesService, VisitStatusesService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

type CatalogType = 'rescue-stages' | 'visit-statuses'

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Settings className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-muted-foreground">No hay {label} registrados</h3>
      <p className="text-sm text-muted-foreground mt-1">Crea el primer registro para comenzar.</p>
    </div>
  )
}

interface CatalogItem {
  id: string
  code: string
  name: string
  description: string | null
  displayOrder: number
  active: boolean
}

function CatalogSection({
  title,
  type,
  items,
  isLoading,
  onDelete,
}: {
  title: string
  type: CatalogType
  items: CatalogItem[]
  isLoading: boolean
  onDelete: (id: string, type: CatalogType) => void
}) {
  const navigate = useNavigate()
  const [localDeleteId, setLocalDeleteId] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <Button size="sm" onClick={() => navigate(`/mantenedores/catalogos/nuevo?type=${type}&displayOrder=${items.length + 1}`)}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo
        </Button>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      )}

      {!isLoading && items.length === 0 && <EmptyState label={title.toLowerCase()} />}

      {!isLoading && items.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Código</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Descripción</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Orden</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Estado</th>
                <th className="w-24 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-muted-foreground font-mono">{item.code}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-muted-foreground">{item.description ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-muted-foreground">{item.displayOrder}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {item.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/mantenedores/catalogos/${item.id}?type=${type}`)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setLocalDeleteId(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!localDeleteId}
        onOpenChange={(open) => !open && setLocalDeleteId(null)}
        title="Eliminar registro"
        description="¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={() => {
          if (localDeleteId) onDelete(localDeleteId, type)
          setLocalDeleteId(null)
        }}
      />
    </div>
  )
}

export function CatalogsListPage() {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: CatalogType; id: string }) => {
      if (type === 'rescue-stages') {
        await RescueStagesService.rescueStagesControllerRemove(id)
      } else {
        await VisitStatusesService.visitStatusesControllerRemove(id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rescue-stages'] })
      queryClient.invalidateQueries({ queryKey: ['visit-statuses'] })
      toast.success('Registro eliminado')
    },
    onError: (err: { body?: { message?: string } }) => {
      toast.error(err.body?.message ?? 'Error al eliminar')
    },
  })

  const { data: rescueStages = [], isLoading: loadingRescueStages } = useQuery({
    queryKey: ['rescue-stages'],
    queryFn: () => RescueStagesService.rescueStagesControllerFindAll(),
  })

  const { data: visitStatuses = [], isLoading: loadingVisitStatuses } = useQuery({
    queryKey: ['visit-statuses'],
    queryFn: () => VisitStatusesService.visitStatusesControllerFindAll(),
  })

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Etapas de rescate</h2>
        <p className="text-sm text-muted-foreground mt-1">Etapas para el seguimiento de miembros a rescatar</p>
        <div className="mt-4">
          <CatalogSection
            title="Etapas"
            type="rescue-stages"
            items={rescueStages as unknown as CatalogItem[]}
            isLoading={loadingRescueStages}
            onDelete={(id) => deleteMutation.mutate({ type: 'rescue-stages', id })}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-foreground">Estados de visita</h2>
        <p className="text-sm text-muted-foreground mt-1">Estados para el seguimiento de visitación</p>
        <div className="mt-4">
          <CatalogSection
            title="Estados"
            type="visit-statuses"
            items={visitStatuses as unknown as CatalogItem[]}
            isLoading={loadingVisitStatuses}
            onDelete={(id) => deleteMutation.mutate({ type: 'visit-statuses', id })}
          />
        </div>
      </div>
    </div>
  )
}