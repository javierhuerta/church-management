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

const COLOR_PRESETS = [
  '#DC2626', '#B45309', '#7C3AED', '#0F766E',
  '#1B3A6B', '#475569', '#C9A84C', '#0369A1',
]

export function CatalogFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [search] = useSearchParams()
  const queryClient = useQueryClient()
  const isEditing = !!id && id !== 'nuevo'
  const type = (search.get('type') || 'rescue-stages') as CatalogType

  const [name, setName]               = useState('')
  const [code, setCode]               = useState('')
  const [description, setDescription] = useState('')
  const [displayOrder, setDisplayOrder] = useState(0)
  const [color, setColor]             = useState('')
  const [active, setActive]           = useState(true)

  const { data: existingItem, isLoading } = useQuery({
    queryKey: [type, id],
    queryFn: async () => {
      if (!isEditing || !id) return null
      return type === 'rescue-stages'
        ? RescueStagesService.rescueStagesControllerFindOne(id)
        : VisitStatusesService.visitStatusesControllerFindOne(id)
    },
    enabled: isEditing && !!id,
  })

  useEffect(() => {
    if (existingItem) {
      setName(existingItem.name ?? '')
      setCode(existingItem.code ?? '')
      setDescription(existingItem.description ?? '')
      setDisplayOrder(existingItem.displayOrder ?? 0)
      setColor((existingItem as any).color ?? '')
      setActive(existingItem.active ?? true)
    }
  }, [existingItem])

  const mutation = useMutation({
    mutationFn: async (data: CreateCatalogDto | UpdateCatalogDto) => {
      if (isEditing && id) {
        return type === 'rescue-stages'
          ? RescueStagesService.rescueStagesControllerUpdate(id, data as UpdateCatalogDto)
          : VisitStatusesService.visitStatusesControllerUpdate(id, data as UpdateCatalogDto)
      }
      return type === 'rescue-stages'
        ? RescueStagesService.rescueStagesControllerCreate(data as CreateCatalogDto)
        : VisitStatusesService.visitStatusesControllerCreate(data as CreateCatalogDto)
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
    if (isEditing) {
      // Al editar no enviamos code (es read-only)
      const payload: UpdateCatalogDto = {
        name,
        description: description || undefined,
        displayOrder,
        color: color || null,
        active,
      }
      mutation.mutate(payload)
    } else {
      const payload: CreateCatalogDto = {
        name,
        code,
        description: description || undefined,
        displayOrder,
        color: color || null,
        active,
      }
      mutation.mutate(payload)
    }
  }

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8"
          onClick={() => navigate('/mantenedores/catalogos')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <p className="text-xl font-semibold text-foreground">
          {isEditing ? 'Editar registro' : 'Nuevo registro'}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nombre *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Sin comenzar" required />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Código
                {isEditing && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    (no editable)
                  </span>
                )}
              </label>
              {isEditing ? (
                <div className="flex h-9 items-center px-3 rounded-md border border-border bg-muted text-sm font-mono text-muted-foreground">
                  {code}
                </div>
              ) : (
                <Input value={code} onChange={(e) => setCode(e.target.value)}
                  placeholder="Ej. SinComenzar" required
                  className="font-mono" />
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Descripción</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional" rows={2} />
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Color del badge</label>
            <div className="flex items-center gap-3">
              {/* Presets */}
              <div className="flex gap-1.5 flex-wrap">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="h-7 w-7 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: c,
                      borderColor: color === c ? '#fff' : 'transparent',
                      boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
                    }}
                  />
                ))}
              </div>
              {/* Custom hex */}
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full border border-border shrink-0"
                  style={{ backgroundColor: color || '#E5E7EB' }} />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#1B3A6B"
                  className="font-mono w-28 text-sm"
                  maxLength={7}
                />
              </div>
            </div>

            {/* Preview del badge */}
            {color && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">Preview:</span>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: color }}
                >
                  {name || 'Nombre'}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Orden</label>
              <Input type="number" value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                min={0} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="active" checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded border-border" />
              <label htmlFor="active" className="text-sm font-medium text-foreground">Activo</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <Button type="button" variant="outline"
              onClick={() => navigate('/mantenedores/catalogos')}>
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
