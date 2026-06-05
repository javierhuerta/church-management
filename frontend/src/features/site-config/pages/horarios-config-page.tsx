import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Clock,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import {
  SiteConfigScheduleService,
  type ScheduleItemResponseDto,
  type CreateScheduleItemDto,
} from '@/lib/api'

// ─── Brand constants ──────────────────────────────────────────────────────────
const GOLD = '#C9A84C'

// ─── Types ────────────────────────────────────────────────────────────────────
type ScheduleItem = ScheduleItemResponseDto

type ScheduleTexts = {
  kicker: string | null
  title: string | null
  paragraph: string | null
}

type ItemFormData = {
  dayLabel: string
  dayAccent: boolean
  time: string
  title: string
  description: string
  sortOrder: number
  isActive: boolean
}

const DEFAULT_FORM: ItemFormData = {
  dayLabel: '',
  dayAccent: false,
  time: '',
  title: '',
  description: '',
  sortOrder: 0,
  isActive: true,
}

const DAY_SUGGESTIONS = ['Sábado', 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

// ─── Main component ───────────────────────────────────────────────────────────
export function HorariosConfigPage() {
  const queryClient = useQueryClient()

  // Form state for page texts
  const [textsForm, setTextsForm] = useState<ScheduleTexts>({
    kicker: '',
    title: '',
    paragraph: '',
  })
  const [isSavingTexts, setIsSavingTexts] = useState(false)

  // Item CRUD state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null)
  const [formData, setFormData] = useState<ItemFormData>(DEFAULT_FORM)
  const [itemToDelete, setItemToDelete] = useState<ScheduleItem | null>(null)

  // ─── Queries ────────────────────────────────────────────────────────────────

  const { data: texts, isLoading: textsLoading } = useQuery({
    queryKey: ['site-config', 'schedule', 'texts'],
    queryFn: () => SiteConfigScheduleService.scheduleControllerGetTexts() as Promise<ScheduleTexts>,
    select: (data) => data as ScheduleTexts,
  })

  // Sync texts to local form when data loads for the first time
  useEffect(() => {
    if (texts) {
      setTextsForm({
        kicker: texts.kicker ?? '',
        title: texts.title ?? '',
        paragraph: texts.paragraph ?? '',
      })
    }
  }, [texts])

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['site-config', 'schedule', 'items'],
    queryFn: () => SiteConfigScheduleService.scheduleControllerFindAll(),
  })

  // ─── Mutations ──────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (dto: CreateScheduleItemDto) =>
      SiteConfigScheduleService.scheduleControllerCreate(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config', 'schedule', 'items'] })
      toast.success('Horario creado')
      closeForm()
    },
    onError: () => toast.error('Error al crear horario'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateScheduleItemDto> }) =>
      SiteConfigScheduleService.scheduleControllerUpdate(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config', 'schedule', 'items'] })
      toast.success('Horario actualizado')
      closeForm()
    },
    onError: () => toast.error('Error al actualizar horario'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => SiteConfigScheduleService.scheduleControllerRemove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config', 'schedule', 'items'] })
      toast.success('Horario eliminado')
      setItemToDelete(null)
    },
    onError: () => toast.error('Error al eliminar horario'),
  })

  const reorderMutation = useMutation({
    mutationFn: (payload: Array<{ id: string; sortOrder: number }>) =>
      SiteConfigScheduleService.scheduleControllerReorder({ items: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config', 'schedule', 'items'] })
    },
    onError: () => toast.error('Error al reordenar'),
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      SiteConfigScheduleService.scheduleControllerUpdate(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config', 'schedule', 'items'] })
    },
    onError: () => toast.error('Error al cambiar estado'),
  })

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function openCreateForm() {
    setEditingItem(null)
    setFormData({ ...DEFAULT_FORM, sortOrder: items.length })
    setIsFormOpen(true)
  }

  function openEditForm(item: ScheduleItem) {
    setEditingItem(item)
    setFormData({
      dayLabel: item.dayLabel,
      dayAccent: item.dayAccent,
      time: item.time,
      title: item.title,
      description: item.description ?? '',
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    })
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingItem(null)
    setFormData(DEFAULT_FORM)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.dayLabel.trim() || !formData.time.trim() || !formData.title.trim()) {
      toast.error('Día, hora y nombre del servicio son obligatorios')
      return
    }

    const dto: CreateScheduleItemDto = {
      dayLabel: formData.dayLabel.trim(),
      dayAccent: formData.dayAccent,
      time: formData.time.trim(),
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive,
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, dto })
    } else {
      createMutation.mutate(dto)
    }
  }

  function handleMoveUp(index: number) {
    if (index === 0) return
    const reordered = [...items]
    const payload = reordered.map((item, i) => {
      if (i === index - 1) return { id: item.id, sortOrder: reordered[index].sortOrder }
      if (i === index) return { id: item.id, sortOrder: reordered[index - 1].sortOrder }
      return { id: item.id, sortOrder: item.sortOrder }
    })
    reorderMutation.mutate(payload)
  }

  function handleMoveDown(index: number) {
    if (index === items.length - 1) return
    const reordered = [...items]
    const payload = reordered.map((item, i) => {
      if (i === index) return { id: item.id, sortOrder: reordered[index + 1].sortOrder }
      if (i === index + 1) return { id: item.id, sortOrder: reordered[index].sortOrder }
      return { id: item.id, sortOrder: item.sortOrder }
    })
    reorderMutation.mutate(payload)
  }

  function handleToggleActive(item: ScheduleItem) {
    toggleActiveMutation.mutate({ id: item.id, isActive: !item.isActive })
  }

  async function handleSaveTexts(e: React.FormEvent) {
    e.preventDefault()
    setIsSavingTexts(true)
    // The generated client doesn't pass body for saveTexts — call raw fetch
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/site-config/schedule/texts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          kicker: textsForm.kicker || undefined,
          title: textsForm.title || undefined,
          paragraph: textsForm.paragraph || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      queryClient.invalidateQueries({ queryKey: ['site-config', 'schedule', 'texts'] })
      toast.success('Textos guardados')
    } catch {
      toast.error('Error al guardar textos')
    } finally {
      setIsSavingTexts(false)
    }
  }

  // ─── Loading skeleton ────────────────────────────────────────────────────────

  if (textsLoading || itemsLoading) {
    return (
      <div className="space-y-8">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ── Sección 1: Textos de la página ─────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div>
          <p className="text-xl font-semibold text-foreground">Textos de la página</p>
          <p className="text-sm text-muted-foreground mt-1">
            Encabezado que aparece en la sección Horarios del sitio público
          </p>
        </div>

        <form onSubmit={handleSaveTexts} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Kicker</label>
            <Input
              value={textsForm.kicker ?? ''}
              onChange={(e) => setTextsForm({ ...textsForm, kicker: e.target.value })}
              placeholder="Ej: Horarios"
            />
            <p className="text-xs text-muted-foreground">Texto pequeño sobre el título</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Título</label>
            <Input
              value={textsForm.title ?? ''}
              onChange={(e) => setTextsForm({ ...textsForm, title: e.target.value })}
              placeholder="Ej: Cada semana, un lugar para ti."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Párrafo</label>
            <Textarea
              value={textsForm.paragraph ?? ''}
              onChange={(e) => setTextsForm({ ...textsForm, paragraph: e.target.value })}
              placeholder="Ej: Todas las visitas son bienvenidas. No es necesario registrarse."
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSavingTexts}>
              <Save className="h-4 w-4 mr-2" />
              Guardar textos
            </Button>
          </div>
        </form>
      </section>

      {/* ── Sección 2: Horarios ─────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-semibold text-foreground">Horarios</p>
            <p className="text-sm text-muted-foreground mt-1">
              Servicios y actividades que aparecen en el sitio público
            </p>
          </div>
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo horario
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No hay horarios registrados</p>
            <p className="text-sm text-muted-foreground mt-1">
              Agrega el primer horario para que aparezca en el sitio público
            </p>
            <Button variant="outline" className="mt-4" onClick={openCreateForm}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar primer horario
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Día</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead className="w-24 text-center">Activo</TableHead>
                    <TableHead className="w-40 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <ScheduleRow
                      key={item.id}
                      item={item}
                      index={index}
                      total={items.length}
                      onEdit={() => openEditForm(item)}
                      onDelete={() => setItemToDelete(item)}
                      onToggleActive={() => handleToggleActive(item)}
                      onMoveUp={() => handleMoveUp(index)}
                      onMoveDown={() => handleMoveDown(index)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {items.map((item, index) => (
                <ScheduleCard
                  key={item.id}
                  item={item}
                  index={index}
                  total={items.length}
                  onEdit={() => openEditForm(item)}
                  onDelete={() => setItemToDelete(item)}
                  onToggleActive={() => handleToggleActive(item)}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── Form Sheet ──────────────────────────────────────────────────────── */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="sm:max-w-md h-full flex flex-col">
          <SheetHeader className="px-6 flex-shrink-0">
            <SheetTitle>{editingItem ? 'Editar horario' : 'Nuevo horario'}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-5 mt-6 px-6 pb-6">
              {/* Día */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Día *</label>
                <Input
                  list="day-suggestions"
                  value={formData.dayLabel}
                  onChange={(e) => setFormData({ ...formData, dayLabel: e.target.value })}
                  placeholder="Ej: Sábado, Miércoles"
                />
                <datalist id="day-suggestions">
                  {DAY_SUGGESTIONS.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>

              {/* Acento dorado */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <label className="text-sm font-medium text-foreground">Día principal</label>
                  <p className="text-xs text-muted-foreground">
                    Aplica estilo dorado/itálico al nombre del día
                  </p>
                </div>
                <Switch
                  checked={formData.dayAccent}
                  onCheckedChange={(checked) => setFormData({ ...formData, dayAccent: checked })}
                />
              </div>

              {/* Hora */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Hora *</label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              {/* Nombre del servicio */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nombre del servicio *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Culto Divino, Escuela Sabática"
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Descripción</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción breve del servicio"
                  rows={3}
                />
              </div>

              {/* Orden */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Orden</label>
                <Input
                  type="number"
                  min={0}
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                  }
                />
                <p className="text-xs text-muted-foreground">Orden de aparición (menor = primero)</p>
              </div>

              {/* Activo */}
              <div className="flex items-center justify-between py-1">
                <label className="text-sm font-medium text-foreground">Activo</label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeForm} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingItem ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Delete confirmation ──────────────────────────────────────────────── */}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar horario?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar{' '}
              <strong>{itemToDelete?.title}</strong> ({itemToDelete?.dayLabel})?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && deleteMutation.mutate(itemToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Desktop row ──────────────────────────────────────────────────────────────
function ScheduleRow({
  item,
  index,
  total,
  onEdit,
  onDelete,
  onToggleActive,
  onMoveUp,
  onMoveDown,
}: {
  item: ScheduleItem
  index: number
  total: number
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  return (
    <TableRow className={!item.isActive ? 'opacity-50' : undefined}>
      <TableCell className="text-muted-foreground text-xs">{index + 1}</TableCell>
      <TableCell>
        <DayBadge label={item.dayLabel} accent={item.dayAccent} />
      </TableCell>
      <TableCell>
        <span className="font-mono text-sm font-medium">{item.time}</span>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium text-foreground">{item.title}</p>
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.description}</p>
          )}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <Switch
          checked={item.isActive}
          onCheckedChange={onToggleActive}
          aria-label={item.isActive ? 'Desactivar' : 'Activar'}
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={index === 0}
            title="Subir"
            className="h-8 w-8"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={index === total - 1}
            title="Bajar"
            className="h-8 w-8"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit} title="Editar" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            title="Eliminar"
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

// ─── Mobile card ──────────────────────────────────────────────────────────────
function ScheduleCard({
  item,
  index,
  total,
  onEdit,
  onDelete,
  onToggleActive,
  onMoveUp,
  onMoveDown,
}: {
  item: ScheduleItem
  index: number
  total: number
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  return (
    <div
      className={`rounded-lg border border-border bg-card p-4 space-y-3 transition-opacity ${
        !item.isActive ? 'opacity-50' : ''
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <DayBadge label={item.dayLabel} accent={item.dayAccent} />
          <span className="font-mono text-sm font-medium text-foreground">{item.time}</span>
        </div>
        <Switch
          checked={item.isActive}
          onCheckedChange={onToggleActive}
          aria-label={item.isActive ? 'Desactivar' : 'Activar'}
        />
      </div>

      {/* Content */}
      <div>
        <p className="font-medium text-foreground">{item.title}</p>
        {item.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMoveUp}
          disabled={index === 0}
          className="h-8 w-8"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="h-8 w-8"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="h-3 w-3 mr-1" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Eliminar
        </Button>
      </div>
    </div>
  )
}

// ─── Day badge ────────────────────────────────────────────────────────────────
function DayBadge({ label, accent }: { label: string; accent: boolean }) {
  if (accent) {
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{ background: GOLD + '22', color: GOLD, border: `1px solid ${GOLD}44` }}
      >
        {label}
      </span>
    )
  }
  return (
    <Badge variant="secondary" className="text-xs">
      {label}
    </Badge>
  )
}
