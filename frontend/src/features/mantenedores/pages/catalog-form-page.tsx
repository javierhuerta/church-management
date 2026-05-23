import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { CreateCatalogDto, UpdateCatalogDto } from '@/lib/api'
import { RescueStagesService, VisitStatusesService } from '@/lib/api'

type CatalogType = 'rescue-stages' | 'visit-statuses'

export function CatalogFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [search] = useSearchParams()
  const queryClient = useQueryClient()
  const isEditing = !!id && id !== 'nuevo'
  const type = (search.get('type') || 'rescue-stages') as CatalogType

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [displayOrder, setDisplayOrder] = useState(0)
  const [active, setActive] = useState(true)

  const { data: existingItem, isLoading } = useQuery({
    queryKey: [type, id],
    queryFn: async () => {
      if (!isEditing || !id) return null
      if (type === 'rescue-stages') {
        return RescueStagesService.rescueStagesControllerFindOne(id)
      } else {
        return VisitStatusesService.visitStatusesControllerFindOne(id)
      }
    },
    enabled: isEditing && !!id,
  })

  useEffect(() => {
    if (existingItem) {
      setName(existingItem.name ?? '')
      setCode(existingItem.code ?? '')
      setDescription(existingItem.description ?? '')
      setDisplayOrder(existingItem.displayOrder ?? 0)
      setActive(existingItem.active ?? true)
    }
  }, [existingItem])

  const mutation = useMutation({
    mutationFn: async (data: CreateCatalogDto | UpdateCatalogDto) => {
      if (isEditing && id) {
        if (type === 'rescue-stages') {
          return RescueStagesService.rescueStagesControllerUpdate(id, data as UpdateCatalogDto)
        } else {
          return VisitStatusesService.visitStatusesControllerUpdate(id, data as UpdateCatalogDto)
        }
      } else {
        if (type === 'rescue-stages') {
          return RescueStagesService.rescueStagesControllerCreate(data as CreateCatalogDto)
        } else {
          return VisitStatusesService.visitStatusesControllerCreate(data as CreateCatalogDto)
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] })
      toast.success(isEditing ? 'Registro actualizado' : 'Registro creado')
      navigate('/mantenedores/catalogos')
    },
    onError: (err: { body?: { message?: string } }) => {
      toast.error(err.body?.message ?? 'Error al guardar')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      name,
      code,
      description: description || undefined,
      displayOrder,
      active,
    })
  }

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2" onClick={() => navigate('/mantenedores/catalogos')}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <h1 className="text-xl font-semibold text-foreground">
          {isEditing ? 'Editar registro' : 'Nuevo registro'}
        </h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nombre *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del registro"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Código *</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Código único"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Descripción</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Orden de visualización</label>
              <Input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                min={0}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <label htmlFor="active" className="text-sm font-medium text-foreground">Activo</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/mantenedores/catalogos')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {mutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}