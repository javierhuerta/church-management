import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Save,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Video,
  AlertTriangle,
  Info,
  Tv,
} from 'lucide-react'
import { TransmisionesAdminService } from '@/lib/api'
import type { SermonVideoResponseDto } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useTheme } from '@/components/theme-provider'

// ─── Constantes de marca ─────────────────────────────────────────────────────
const STATUS_COLORS = {
  published: { light: '#0F766E', dark: '#0D9488' },
  draft: { light: '#C9A84C', dark: '#D4B566' },
}

// ─── Schemas Zod ─────────────────────────────────────────────────────────────
const configSchema = z.object({
  channelId: z.string(),
  channelHandle: z.string(),
  isLiveManual: z.boolean(),
})
type ConfigFormValues = z.infer<typeof configSchema>

const sermonSchema = z.object({
  youtubeUrl: z.string().min(1, 'La URL es requerida'),
  title: z.string().min(1, 'El título es requerido'),
  preacher: z.string().min(1, 'El predicador es requerido'),
  reference: z.string().optional(),
  date: z.string().min(1, 'La fecha es requerida'),
})
type SermonFormValues = z.infer<typeof sermonSchema>

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ isPublished }: { isPublished: boolean }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const variant = isPublished ? 'published' : 'draft'
  const bg = isDark ? STATUS_COLORS[variant].dark : STATUS_COLORS[variant].light

  return (
    <span
      style={{
        background: bg,
        color: variant === 'draft' ? '#102240' : '#fff',
        borderRadius: 9999,
        padding: '3px 10px',
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {isPublished ? 'Publicado' : 'Borrador'}
    </span>
  )
}

// ─── Sermon Card ──────────────────────────────────────────────────────────────
function SermonCard({
  sermon,
  isFirst,
  isLast,
  onEdit,
}: {
  sermon: SermonVideoResponseDto
  isFirst: boolean
  isLast: boolean
  onEdit: (sermon: SermonVideoResponseDto) => void
}) {
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const togglePublishMutation = useMutation({
    mutationFn: () => TransmisionesAdminService.transmisionesAdminControllerTogglePublish(sermon.id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['transmisiones-sermons'] })
      toast.success(updated.isPublished ? 'Predicación publicada' : 'Predicación despublicada')
    },
    onError: () => toast.error('Error al cambiar estado'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => TransmisionesAdminService.transmisionesAdminControllerDeleteSermon(sermon.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transmisiones-sermons'] })
      toast.success('Predicación eliminada')
    },
    onError: () => toast.error('Error al eliminar'),
  })

  const reorderMutation = useMutation({
    mutationFn: (direction: 'up' | 'down') => {
      // Reorder by swapping order values — we use the current order ± 1
      const newOrder = direction === 'up' ? sermon.order - 1 : sermon.order + 1
      return TransmisionesAdminService.transmisionesAdminControllerReorderSermons({
        sermons: [{ id: sermon.id, order: newOrder }],
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transmisiones-sermons'] })
    },
    onError: () => toast.error('Error al reordenar'),
  })

  const formattedDate = (() => {
    try {
      return new Date(sermon.date + 'T12:00:00').toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return sermon.date
    }
  })()

  return (
    <div
      data-testid="sermon-card"
      className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        <img
          src={sermon.thumbnailUrl}
          alt={sermon.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.currentTarget
            target.style.display = 'none'
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Badge estado */}
        <div className="absolute top-2 left-2 pointer-events-none">
          <StatusBadge isPublished={sermon.isPublished} />
        </div>

        {/* Acciones hover */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(sermon)}
            className="h-8 w-8 rounded-md bg-white/90 hover:bg-white text-foreground flex items-center justify-center shadow-sm"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            data-testid="sermon-publish-toggle"
            onClick={() => togglePublishMutation.mutate()}
            disabled={togglePublishMutation.isPending}
            className="h-8 w-8 rounded-md bg-white/90 hover:bg-white text-foreground flex items-center justify-center shadow-sm"
            title={sermon.isPublished ? 'Despublicar' : 'Publicar'}
          >
            {togglePublishMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : sermon.isPublished ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="h-8 w-8 rounded-md bg-white/90 hover:bg-white text-destructive flex items-center justify-center shadow-sm"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Botones reordenar */}
        <div className="absolute bottom-2 right-2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isFirst && (
            <button
              onClick={() => reorderMutation.mutate('up')}
              disabled={reorderMutation.isPending}
              className="h-6 w-6 rounded bg-white/90 hover:bg-white text-foreground flex items-center justify-center shadow-sm"
              title="Subir"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
          )}
          {!isLast && (
            <button
              onClick={() => reorderMutation.mutate('down')}
              disabled={reorderMutation.isPending}
              className="h-6 w-6 rounded bg-white/90 hover:bg-white text-foreground flex items-center justify-center shadow-sm"
              title="Bajar"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold text-foreground line-clamp-2">{sermon.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{sermon.preacher}</p>
        {sermon.reference && (
          <p className="text-xs text-muted-foreground truncate">{sermon.reference}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
      </div>

      {/* Dialog confirmar eliminación */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar predicación</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Seguro que quieres eliminar{' '}
            <span className="font-medium text-foreground">{sermon.title}</span>? Esta acción no se
            puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteMutation.mutate()
                setConfirmDelete(false)
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Sermon Form Dialog ───────────────────────────────────────────────────────
function SermonFormDialog({
  open,
  editingSermon,
  onClose,
}: {
  open: boolean
  editingSermon: SermonVideoResponseDto | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const isEditing = editingSermon !== null
  const oembedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const form = useForm<SermonFormValues>({
    resolver: zodResolver(sermonSchema),
    defaultValues: {
      youtubeUrl: '',
      title: '',
      preacher: '',
      reference: '',
      date: '',
    },
    values: isEditing
      ? {
          youtubeUrl: editingSermon.url ?? '',
          title: editingSermon.title,
          preacher: editingSermon.preacher,
          reference: editingSermon.reference ?? '',
          date: editingSermon.date,
        }
      : undefined,
  })

  const oembedMutation = useMutation({
    mutationFn: (url: string) =>
      TransmisionesAdminService.transmisionesAdminControllerResolveOembed({ url }),
    onSuccess: (data) => {
      if (data.title) {
        form.setValue('title', data.title, { shouldDirty: true })
      }
    },
  })

  const createMutation = useMutation({
    mutationFn: (values: SermonFormValues) =>
      TransmisionesAdminService.transmisionesAdminControllerCreateSermon({
        youtubeUrl: values.youtubeUrl,
        title: values.title,
        preacher: values.preacher,
        reference: values.reference || null,
        date: values.date,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transmisiones-sermons'] })
      toast.success('Predicación guardada')
      form.reset()
      onClose()
    },
    onError: () => toast.error('Error al guardar la predicación'),
  })

  const updateMutation = useMutation({
    mutationFn: (values: SermonFormValues) =>
      TransmisionesAdminService.transmisionesAdminControllerUpdateSermon(editingSermon!.id, {
        youtubeUrl: values.youtubeUrl,
        title: values.title,
        preacher: values.preacher,
        reference: values.reference || null,
        date: values.date,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transmisiones-sermons'] })
      toast.success('Predicación actualizada')
      form.reset()
      onClose()
    },
    onError: () => toast.error('Error al actualizar la predicación'),
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  function handleUrlBlur(url: string) {
    if (!url || isEditing) return
    if (oembedTimeoutRef.current) clearTimeout(oembedTimeoutRef.current)
    oembedTimeoutRef.current = setTimeout(() => {
      oembedMutation.mutate(url)
    }, 300)
  }

  function handleSubmit(values: SermonFormValues) {
    if (isEditing) {
      updateMutation.mutate(values)
    } else {
      createMutation.mutate(values)
    }
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar predicación' : 'Nueva predicación'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
          {/* URL de YouTube */}
          <div className="space-y-2">
            <Label htmlFor="sermon-url">URL de YouTube</Label>
            <Input
              id="sermon-url"
              data-testid="sermon-url-input"
              {...form.register('youtubeUrl')}
              onBlur={(e) => handleUrlBlur(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={isEditing}
            />
            {oembedMutation.isPending && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Obteniendo información del video...
              </p>
            )}
            {form.formState.errors.youtubeUrl && (
              <p className="text-sm text-destructive">{form.formState.errors.youtubeUrl.message}</p>
            )}
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="sermon-title">Título</Label>
            <Input
              id="sermon-title"
              data-testid="sermon-title-input"
              {...form.register('title')}
              placeholder="Título de la predicación"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Predicador */}
          <div className="space-y-2">
            <Label htmlFor="sermon-preacher">Predicador</Label>
            <Input
              id="sermon-preacher"
              data-testid="sermon-preacher-input"
              {...form.register('preacher')}
              placeholder="Pr. Nombre Apellido"
            />
            {form.formState.errors.preacher && (
              <p className="text-sm text-destructive">{form.formState.errors.preacher.message}</p>
            )}
          </div>

          {/* Cita bíblica */}
          <div className="space-y-2">
            <Label htmlFor="sermon-reference">
              Cita bíblica{' '}
              <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Input
              id="sermon-reference"
              data-testid="sermon-reference-input"
              {...form.register('reference')}
              placeholder="Ej: Mateo 6:25–34"
            />
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="sermon-date">Fecha</Label>
            <Input
              id="sermon-date"
              data-testid="sermon-date-input"
              type="date"
              {...form.register('date')}
            />
            {form.formState.errors.date && (
              <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              data-testid="sermon-save-button"
              disabled={isPending}
              className="gap-2"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Bloque A: Config del canal ───────────────────────────────────────────────
function ChannelConfigBlock() {
  const queryClient = useQueryClient()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const { data: config, isLoading } = useQuery({
    queryKey: ['transmisiones-config'],
    queryFn: () => TransmisionesAdminService.transmisionesAdminControllerGetConfig(),
  })

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    values: {
      channelId: config?.channelId ?? '',
      channelHandle: config?.channelHandle ?? '',
      isLiveManual: config?.isLiveManual ?? false,
    },
  })

  const isLiveManual = form.watch('isLiveManual')

  const saveMutation = useMutation({
    mutationFn: (values: ConfigFormValues) =>
      TransmisionesAdminService.transmisionesAdminControllerUpdateConfig({
        channelId: values.channelId || null,
        channelHandle: values.channelHandle || null,
        isLiveManual: values.isLiveManual,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transmisiones-config'] })
      toast.success('Configuración guardada')
    },
    onError: () => toast.error('Error al guardar la configuración'),
  })

  if (isLoading) {
    return <Skeleton className="h-56 w-full rounded-xl" />
  }

  return (
    <form
      onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))}
      className="rounded-xl border border-border bg-card p-6 space-y-5"
    >
      {/* Encabezado del bloque */}
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <Tv className="h-4 w-4 text-primary" />
        <p className="text-sm font-bold text-foreground uppercase tracking-wider">
          Canal de YouTube
        </p>
      </div>

      {/* ID del canal */}
      <div className="space-y-2">
        <Label htmlFor="channelId">ID del canal</Label>
        <Input
          id="channelId"
          data-testid="transmisiones-channelId-input"
          {...form.register('channelId')}
          placeholder="UCxxxxxxxxxxxxxxxxxxxxx"
        />
        <p className="text-xs text-muted-foreground">
          El ID del canal comienza con <code className="bg-muted px-1 rounded text-xs">UC</code> y
          tiene 24 caracteres. Lo encuentras en la URL de tu canal de YouTube. Si está vacío, el
          reproductor no funcionará en el sitio público.
        </p>
      </div>

      {/* Handle del canal */}
      <div className="space-y-2">
        <Label htmlFor="channelHandle">Handle del canal</Label>
        <Input
          id="channelHandle"
          data-testid="transmisiones-channelHandle-input"
          {...form.register('channelHandle')}
          placeholder="IASDCentralOsorno"
        />
        <p className="text-xs text-muted-foreground">
          El handle es el nombre corto del canal (sin @). Se usa para los enlaces del sitio público.
        </p>
      </div>

      {/* Switch isLiveManual */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="isLiveManual" className="text-sm font-medium text-foreground">
              ¿Estamos transmitiendo en vivo ahora?
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enciende este toggle antes del culto para mostrar el badge "EN VIVO AHORA" en el sitio
              público. Apágalo cuando termine.
            </p>
          </div>
          <Switch
            id="isLiveManual"
            data-testid="transmisiones-isLiveManual-switch"
            checked={form.watch('isLiveManual')}
            onCheckedChange={(checked) =>
              form.setValue('isLiveManual', checked, { shouldDirty: true })
            }
          />
        </div>

        {/* Badge de advertencia cuando está activo */}
        {isLiveManual && (
          <div
            data-testid="transmisiones-live-warning"
            className="flex items-center gap-2 rounded-lg px-4 py-3"
            style={{
              background: isDark ? 'rgba(212,181,102,0.15)' : 'rgba(201,168,76,0.12)',
              border: `1px solid ${isDark ? '#D4B566' : '#C9A84C'}`,
            }}
          >
            <AlertTriangle
              className="h-4 w-4 shrink-0"
              style={{ color: isDark ? '#D4B566' : '#C9A84C' }}
            />
            <p
              className="text-sm font-medium"
              style={{ color: isDark ? '#D4B566' : '#92700A' }}
            >
              El badge "EN VIVO AHORA" está encendido en el sitio público
            </p>
          </div>
        )}
      </div>

      {/* Guardar */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          data-testid="transmisiones-save-button"
          disabled={saveMutation.isPending || !form.formState.isDirty}
          className="gap-2"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar configuración
        </Button>
      </div>
    </form>
  )
}

// ─── Bloque B: CRUD de predicaciones ─────────────────────────────────────────
function SermonsBlock() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingSermon, setEditingSermon] = useState<SermonVideoResponseDto | null>(null)

  const { data: sermons, isLoading } = useQuery({
    queryKey: ['transmisiones-sermons'],
    queryFn: () => TransmisionesAdminService.transmisionesAdminControllerListSermons(),
  })

  function handleEdit(sermon: SermonVideoResponseDto) {
    setEditingSermon(sermon)
    setFormOpen(true)
  }

  function handleAddNew() {
    setEditingSermon(null)
    setFormOpen(true)
  }

  function handleClose() {
    setFormOpen(false)
    setEditingSermon(null)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      {/* Encabezado del bloque */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-primary" />
          <p className="text-sm font-bold text-foreground uppercase tracking-wider">
            Predicaciones
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          data-testid="sermon-add-button"
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </div>

      {/* Ayuda contextual */}
      <div className="rounded-lg border border-border bg-muted/40 p-3 flex items-start gap-3">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Pega la URL de un video de YouTube para agregar una predicación. El título se
          auto-completará desde YouTube. Solo las predicaciones{' '}
          <span className="font-medium text-foreground">publicadas</span> aparecen en el sitio
          público. La primera (más reciente) se muestra como predicación destacada.
        </p>
      </div>

      {/* Lista de cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-video rounded-xl" />
          ))}
        </div>
      ) : sermons && sermons.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sermons.map((sermon, idx) => (
            <SermonCard
              key={sermon.id}
              sermon={sermon}
              isFirst={idx === 0}
              isLast={idx === sermons.length - 1}
              onEdit={handleEdit}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center">
          <Video className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-base font-semibold text-foreground">No hay predicaciones</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Agrega la primera predicación pegando una URL de YouTube
          </p>
          <Button onClick={handleAddNew} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar predicación
          </Button>
        </div>
      )}

      {/* Dialog de formulario */}
      <SermonFormDialog open={formOpen} editingSermon={editingSermon} onClose={handleClose} />
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function TransmisionesConfigPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-1">
        <p className="text-2xl font-bold text-foreground">Transmisiones</p>
        <p className="text-sm text-muted-foreground mt-1">
          Configura el canal de YouTube y administra las predicaciones del sitio público.
        </p>
      </div>

      {/* Layout: centrado en desktop, full-width en mobile */}
      <div className="w-full max-w-2xl mx-auto space-y-6 lg:max-w-none">
        {/* En desktop: columna centrada para config, ancho completo para sermons */}
        <div className="lg:max-w-2xl lg:mx-auto">
          <ChannelConfigBlock />
        </div>

        <SermonsBlock />
      </div>
    </div>
  )
}
