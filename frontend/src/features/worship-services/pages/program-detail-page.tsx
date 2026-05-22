import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Clock, User, Music, FileText, Send, CheckCircle, Trash2, Calendar, Plus, Archive, Download, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuthUser } from '@/features/calendar/hooks/use-auth-user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { parseDateString } from '@/lib/date'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useTheme } from '@/components/theme-provider'
import {
  useProgram,
  useProgramLogs,
  useHymnSearch,
  useUserSearch,
  useDeleteProgram,
  useArchiveProgram,
  useDeleteGroup,
  useDeleteSection,
  useReorderGroups,
  useReorderSections,
  usePublishWithEvent,
} from '../hooks/use-worship-services'
import { downloadProgramPdf } from '../hooks/use-program-pdf'
import { ProgramChangeHistory } from '../components/program-change-history'
import { PublishWithEventDialog } from '../components/publish-with-event-dialog'
import { WorshipServicesProgramsService } from '@/lib/api'
import { toast } from 'sonner'

const STATUS_COLORS = {
  published: { light: '#0F766E', dark: '#0D9488' },
  draft:     { light: '#C9A84C', dark: '#D4B566' },
  archived:  { light: '#475569', dark: '#64748B' },
}

const NAVY = '#1B3A6B'

export function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthUser()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [editingDate, setEditingDate] = useState(false)
  const [isPublishing] = useState(false)
  const [addingGroup, setAddingGroup] = useState(false)
  const [addingSectionToGroup, setAddingSectionToGroup] = useState<string | null>(null)

  const [isDownloading, setIsDownloading] = useState(false)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null)
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'program' | 'history'>('program')

  const { data: program, isLoading } = useProgram(id || '')
  const { data: logs } = useProgramLogs(id || '')

  const groupToDelete = useMemo(
    () => program?.groups?.find((g) => g.id === deleteGroupId) ?? null,
    [program, deleteGroupId],
  )

  const sectionToDelete = useMemo(() => {
    if (!deleteSectionId || !program) return null
    for (const group of program.groups ?? []) {
      const found = group.sections?.find((s) => s.id === deleteSectionId)
      if (found) return found
    }
    return program.sections?.find((s) => s.id === deleteSectionId) ?? null
  }, [program, deleteSectionId])

  const deleteProgram = useDeleteProgram()
  const archiveProgram = useArchiveProgram(id || '')
  const deleteGroup = useDeleteGroup(id || '')
  const deleteSection = useDeleteSection(id || '')
  const reorderGroups = useReorderGroups(id || '')
  const reorderSections = useReorderSections(id || '')
  const publishWithEventMutation = usePublishWithEvent(id || '')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const invalidateProgram = () =>
    queryClient.invalidateQueries({ queryKey: ['worship-services', 'programs', id] })

  if (isLoading) {
    return <div className="text-muted-foreground">Cargando programa...</div>
  }

  if (!program) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <h2 className="text-xl font-semibold text-foreground">Programa no encontrado</h2>
      </div>
    )
  }

  const isPublished = program.status === 'PUBLISHED'
  const isArchived = program.status === 'ARCHIVED'
  const canEdit = !isArchived && (!isPublished || user?.role === 'Admin' || (user?.role === 'Pastor' && program.createdById === user?.userId))
  const canPublish = (user?.role === 'Admin' || user?.role === 'Pastor') && !isPublished && !isArchived
  const isAdmin = user?.role === 'Admin'

  async function handlePublish(createCalendarEvent: boolean) {
    const result = await publishWithEventMutation.mutateAsync(createCalendarEvent)
    await queryClient.invalidateQueries({ queryKey: ['worship-services', 'programs', id] })
    toast.success('Programa publicado')
    return { eventSlug: result.eventSlug ?? null }
  }

  const formattedDate = format(parseDateString(program.date) ?? new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })

  return (
    <div className="space-y-6">
      <PublishWithEventDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        program={program}
        onPublish={handlePublish}
        isPublishing={isPublishing}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="¿Eliminar este programa?"
        description="Esta acción es permanente y no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={async () => {
          await deleteProgram.mutateAsync(id || '')
          navigate('/cultos/programas')
        }}
      />
      <ConfirmDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        title="¿Archivar este programa?"
        description="El programa quedará como solo lectura y solo el Admin podrá editarlo."
        confirmLabel="Archivar"
        onConfirm={async () => {
          await archiveProgram.mutateAsync()
          setArchiveDialogOpen(false)
        }}
      />
      <ConfirmDialog
        open={!!deleteGroupId}
        onOpenChange={(open) => !open && setDeleteGroupId(null)}
        title={groupToDelete ? `¿Eliminar grupo "${groupToDelete.name}"?` : '¿Eliminar este grupo?'}
        description="Se eliminarán el grupo y todas sus secciones. Esta acción no se puede deshacer."
        confirmLabel="Eliminar grupo"
        variant="destructive"
        onConfirm={async () => {
          if (deleteGroupId) {
            await deleteGroup.mutateAsync(deleteGroupId)
            setDeleteGroupId(null)
          }
        }}
      />
      <ConfirmDialog
        open={!!deleteSectionId}
        onOpenChange={(open) => !open && setDeleteSectionId(null)}
        title={
          sectionToDelete
            ? `¿Eliminar sección "${sectionToDelete.name ?? sectionToDelete.templateSection?.name ?? 'sin nombre'}"?`
            : '¿Eliminar esta sección?'
        }
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar sección"
        variant="destructive"
        onConfirm={async () => {
          if (deleteSectionId) {
            await deleteSection.mutateAsync(deleteSectionId)
            setDeleteSectionId(null)
          }
        }}
      />

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/cultos/programas')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver
          </Button>
          {editingDate ? (
            <div className="flex items-center gap-2 mt-2">
              <DatePicker
                value={program.date}
                onChange={(newDate) => {
                  if (!newDate) return
                  WorshipServicesProgramsService.programControllerUpdateProgram(id || '', { date: newDate })
                    .then(() => { invalidateProgram(); toast.success('Fecha actualizada') })
                    .catch(() => toast.error('No se pudo actualizar la fecha'))
                }}
                className="w-56"
              />
              <Button variant="ghost" size="sm" onClick={() => setEditingDate(false)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-2">
              <p
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 28,
                  fontWeight: 600,
                  color: isDark ? '#A8C4F0' : NAVY,
                  lineHeight: 1.2,
                }}
              >
                {formattedDate}
              </p>
              {canEdit && (
                <Button variant="ghost" size="sm" onClick={() => setEditingDate(true)}>
                  <Calendar className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          <p className="text-muted-foreground mt-1">{program.template?.name}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isArchived ? (
            <span
              style={{
                background: isDark ? STATUS_COLORS.archived.dark : STATUS_COLORS.archived.light,
                color: '#fff',
                borderRadius: 9999,
                padding: '4px 12px',
                fontSize: 13,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Archive className="h-4 w-4 mr-1" /> Archivado
            </span>
          ) : isPublished ? (
            <span
              style={{
                background: isDark ? STATUS_COLORS.published.dark : STATUS_COLORS.published.light,
                color: '#fff',
                borderRadius: 9999,
                padding: '4px 12px',
                fontSize: 13,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Publicado
            </span>
          ) : (
            <span
              style={{
                background: isDark ? STATUS_COLORS.draft.dark : STATUS_COLORS.draft.light,
                color: '#102240',
                borderRadius: 9999,
                padding: '4px 12px',
                fontSize: 13,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Borrador
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={isDownloading}
            onClick={async () => {
              setIsDownloading(true)
              try {
                await downloadProgramPdf(program)
              } catch {
                toast.error('No se pudo generar el PDF')
              } finally {
                setIsDownloading(false)
              }
            }}
          >
            <Download className="h-4 w-4 mr-1" />
            {isDownloading ? 'Generando...' : 'Descargar PDF'}
          </Button>
          {canPublish && (
            <Button
              onClick={() => setPublishDialogOpen(true)}
              style={{
                background: isDark ? 'hsl(219,70%,60%)' : NAVY,
                color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA',
              }}
            >
              <Send className="h-4 w-4 mr-1" /> Publicar
            </Button>
          )}
          {isAdmin && isPublished && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setArchiveDialogOpen(true)}
            >
              <Archive className="h-4 w-4 mr-1" /> Archivar
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Eliminar
            </Button>
          )}
        </div>
      </div>

      <div className="lg:hidden mb-4">
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('program')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'program'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Programa
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Historial
          </button>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event: DragEndEvent) => {
                const { active, over } = event
                if (!over || active.id === over.id) return
                const sorted = [...(program.groups || [])].sort((a, b) => a.order - b.order)
                const oldIndex = sorted.findIndex(g => g.id === active.id)
                const newIndex = sorted.findIndex(g => g.id === over.id)
                reorderGroups.mutate(arrayMove(sorted, oldIndex, newIndex).map(g => g.id))
              }}
            >
              <SortableContext
                items={[...(program.groups || [])].sort((a, b) => a.order - b.order).map(g => g.id)}
                strategy={verticalListSortingStrategy}
              >
                {program.groups?.map((group) => (
                  <SortableGroupCard
                    key={group.id}
                    group={group}
                    canEdit={canEdit}
                    isEditingGroup={editingGroup === group.id}
                    onEditGroup={() => setEditingGroup(group.id)}
                    onCancelEditGroup={() => setEditingGroup(null)}
                    isAddingSection={addingSectionToGroup === group.id}
                    onToggleAddSection={() => setAddingSectionToGroup(addingSectionToGroup === group.id ? null : group.id)}
                    onCancelAddSection={() => setAddingSectionToGroup(null)}
                    editingSection={editingSection}
                    onEditSection={setEditingSection}
                    onCancelEditSection={() => setEditingSection(null)}
                    onDeleteSection={setDeleteSectionId}
                    onDeleteGroup={() => setDeleteGroupId(group.id)}
                    programId={id || ''}
                    invalidateProgram={invalidateProgram}
                    reorderSections={reorderSections}
                    sensors={sensors}
                  />
                ))}
              </SortableContext>
            </DndContext>
            {canEdit && (
              addingGroup ? (
                <AddGroupForm
                  onSave={async (data) => {
                    try {
                      await WorshipServicesProgramsService.programControllerAddGroup(id || '', data)
                      await invalidateProgram()
                      setAddingGroup(false)
                      toast.success('Grupo agregado')
                    } catch {
                      toast.error('No se pudo agregar el grupo')
                    }
                  }}
                  onCancel={() => setAddingGroup(false)}
                />
              ) : (
                <button
                  onClick={() => setAddingGroup(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Plus className="h-4 w-4" /> Agregar grupo
                </button>
              )
            )}
          </div>
          <div className="lg:col-span-1">
            <ProgramChangeHistory logs={logs} />
          </div>
        </div>
      </div>

      <div className="lg:hidden space-y-4">
        {activeTab === 'program' ? (
          <>
            {program.groups?.map((group) => (
              <SortableGroupCard
                key={group.id}
                group={group}
                canEdit={canEdit}
                isEditingGroup={editingGroup === group.id}
                onEditGroup={() => setEditingGroup(group.id)}
                onCancelEditGroup={() => setEditingGroup(null)}
                isAddingSection={addingSectionToGroup === group.id}
                onToggleAddSection={() => setAddingSectionToGroup(addingSectionToGroup === group.id ? null : group.id)}
                onCancelAddSection={() => setAddingSectionToGroup(null)}
                editingSection={editingSection}
                onEditSection={setEditingSection}
                onCancelEditSection={() => setEditingSection(null)}
                onDeleteSection={setDeleteSectionId}
                onDeleteGroup={() => setDeleteGroupId(group.id)}
                programId={id || ''}
                invalidateProgram={invalidateProgram}
                reorderSections={reorderSections}
                sensors={sensors}
              />
            ))}
            {canEdit && (
              addingGroup ? (
                <AddGroupForm
                  onSave={async (data) => {
                    try {
                      await WorshipServicesProgramsService.programControllerAddGroup(id || '', data)
                      await invalidateProgram()
                      setAddingGroup(false)
                      toast.success('Grupo agregado')
                    } catch {
                      toast.error('No se pudo agregar el grupo')
                    }
                  }}
                  onCancel={() => setAddingGroup(false)}
                />
              ) : (
                <button
                  onClick={() => setAddingGroup(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Plus className="h-4 w-4" /> Agregar grupo
                </button>
              )
            )}
          </>
        ) : (
          <ProgramChangeHistory logs={logs} />
        )}
      </div>
    </div>
  )
}

interface Group {
  id: string
  name: string
  startTime?: string | null
  endTime?: string | null
  order: number
}

interface GroupEditFormProps {
  group: Group
  onSave: (data: { name?: string; startTime?: string; endTime?: string }) => void
  onCancel: () => void
}

function GroupEditForm({ group, onSave, onCancel }: GroupEditFormProps) {
  const [formData, setFormData] = useState({
    name: group.name,
    startTime: group.startTime || '',
    endTime: group.endTime || '',
  })
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      await onSave(formData)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
      <Input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="flex-1"
        placeholder="Nombre del grupo"
      />
      <div className="flex items-center gap-1 flex-1">
        <Input
          type="time"
          value={formData.startTime}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          className="flex-1"
        />
        <Input
          type="time"
          value={formData.endTime}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          className="flex-1"
        />
      </div>
      <div className="flex items-center gap-1">
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? '...' : 'Guardar'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

interface Section {
  id: string
  name?: string | null
  startTime?: string | null
  duration?: number | null
  responsible?: string | null
  hymnText?: string | null
  notes?: string | null
  order: number
  groupId?: string | null
  templateSection?: { id: string; name: string } | null
}

interface SectionRowProps {
  section: Section
  canEdit: boolean
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onDelete: () => void
  onSaved: () => void
  sectionName?: string
}

function SectionRow({ section, canEdit, isEditing, onEdit, onCancel, onDelete, onSaved, sectionName }: SectionRowProps) {
  const displayName = section.name ?? sectionName ?? ''
  const [formData, setFormData] = useState({
    name: displayName,
    startTime: section.startTime || '',
    duration: section.duration || '',
    responsible: section.responsible || '',
    hymnText: section.hymnText || '',
    notes: section.notes || '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const { data: hymnSuggestions } = useHymnSearch(formData.hymnText)
  const { data: userSuggestions } = useUserSearch(formData.responsible)

  async function handleSave() {
    setIsSaving(true)
    try {
      await WorshipServicesProgramsService.programControllerUpdateSection(section.id, {
        name: formData.name || undefined,
        startTime: formData.startTime || null,
        duration: formData.duration ? Number(formData.duration) : null,
        responsible: formData.responsible || null,
        hymnText: formData.hymnText || null,
        notes: formData.notes || null,
      })
      await onSaved()
      onCancel()
      toast.success('Sección guardada')
    } catch {
      toast.error('No se pudo guardar la sección')
    } finally {
      setIsSaving(false)
    }
  }

  if (isEditing) {
    return (
      <div className="p-3 bg-muted/50 border-t border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          <div className="sm:col-span-2">
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nombre de la sección"
              className="h-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="h-8 text-sm flex-1"
            />
            <Input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="Min"
              className="h-8 text-sm w-16"
            />
          </div>
          <div className="relative">
            <Input
              value={formData.responsible}
              onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
              placeholder="Responsable"
              className="h-8 text-sm"
            />
            {userSuggestions && userSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 border rounded bg-card shadow-sm max-h-24 overflow-y-auto mt-1">
                {userSuggestions.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
                    onClick={() => setFormData({ ...formData, responsible: u.name })}
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative sm:col-span-2">
            <Input
              value={formData.hymnText}
              onChange={(e) => setFormData({ ...formData, hymnText: e.target.value })}
              placeholder="Himno (número o nombre)"
              className="h-8 text-sm"
            />
            {hymnSuggestions && hymnSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 border rounded bg-card shadow-sm max-h-24 overflow-y-auto mt-1">
                {hymnSuggestions.map((h) => (
                  <button
                    key={h.number}
                    type="button"
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
                    onClick={() => setFormData({ ...formData, hymnText: `Himno ${h.number} - ${h.name}` })}
                  >
                    {h.number} - {h.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="sm:col-span-2">
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas"
              className="h-8 text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? '...' : 'Guardar'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 flex items-start justify-between gap-4">
      <div className="flex-1 space-y-2">
        {displayName && (
          <p className="text-xs font-semibold text-foreground uppercase tracking-wide">{displayName}</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {section.startTime && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {section.startTime}
            </div>
          )}
          {section.responsible && (
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              {section.responsible}
            </div>
          )}
          {section.hymnText && (
            <div className="flex items-center gap-1">
              <Music className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate">{section.hymnText}</span>
            </div>
          )}
          {section.notes && (
            <div className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate">{section.notes}</span>
            </div>
          )}
        </div>
      </div>
      {canEdit && (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}

function AddGroupForm({
  onSave,
  onCancel,
}: {
  onSave: (data: { name: string; startTime?: string; endTime?: string }) => Promise<void>
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({ name: '', startTime: '', endTime: '' })
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) return
    setIsSaving(true)
    try {
      await onSave({
        name: formData.name.trim(),
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-4">
      <p className="text-sm font-medium text-foreground mb-3">Nuevo grupo</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          autoFocus
          placeholder="Nombre del grupo (ej: Escuela Sabática)"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <div className="flex gap-2">
          <Input
            type="time"
            placeholder="Hora inicio"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="flex-1"
          />
          <Input
            type="time"
            placeholder="Hora fin"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="flex-1"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" size="sm" disabled={isSaving || !formData.name.trim()}>
            {isSaving ? 'Guardando...' : 'Agregar grupo'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function AddSectionForm({
  onSave,
  onCancel,
}: {
  onSave: (name: string) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setIsSaving(true)
    try {
      await onSave(name.trim())
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 flex items-center gap-2 bg-muted border-t border-border">
      <Input
        autoFocus
        placeholder="Nombre de la sección (ej: Canto de apertura)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" size="sm" disabled={isSaving || !name.trim()}>
        {isSaving ? '...' : 'Agregar'}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
    </form>
  )
}

interface SortableGroupCardProps {
  group: {
    id: string
    name: string
    startTime?: string | null
    endTime?: string | null
    order: number
    sections?: Section[]
  }
  canEdit: boolean
  isEditingGroup: boolean
  onEditGroup: () => void
  onCancelEditGroup: () => void
  isAddingSection: boolean
  onToggleAddSection: () => void
  onCancelAddSection: () => void
  editingSection: string | null
  onEditSection: (id: string) => void
  onCancelEditSection: () => void
  onDeleteSection: (id: string) => void
  onDeleteGroup: () => void
  programId: string
  invalidateProgram: () => void
  reorderSections: { mutate: (orderedIds: string[]) => void }
  sensors: ReturnType<typeof useSensors>
}

function SortableGroupCard({
  group, canEdit, isEditingGroup, onEditGroup, onCancelEditGroup,
  isAddingSection, onToggleAddSection, onCancelAddSection,
  editingSection, onEditSection, onCancelEditSection, onDeleteSection,
  onDeleteGroup, invalidateProgram, reorderSections, sensors,
}: SortableGroupCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: group.id,
    disabled: !canEdit,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="bg-primary/5 px-4 py-3 border-b border-primary/10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            {isEditingGroup ? (
              <GroupEditForm
                group={group}
                onSave={async (data) => {
                  try {
                    await WorshipServicesProgramsService.programControllerUpdateGroup(group.id, data)
                    await invalidateProgram()
                    onCancelEditGroup()
                    toast.success('Grupo actualizado')
                  } catch {
                    toast.error('No se pudo actualizar el grupo')
                  }
                }}
                onCancel={onCancelEditGroup}
              />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  {canEdit && (
                    <button
                      className="cursor-grab touch-none text-primary/30 hover:text-primary/60"
                      {...attributes}
                      {...listeners}
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                  )}
                  <h3 className="font-semibold text-foreground">{group.name}</h3>
                </div>
                {(group.startTime || group.endTime) && (
                  <span className="text-xs text-primary/70 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {group.startTime}
                    {group.startTime && group.endTime && ' - '}
                    {group.endTime}
                  </span>
                )}
              </>
            )}
          </div>
          {canEdit && !isEditingGroup && (
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={onToggleAddSection}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Sección
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={onEditGroup}>Editar</Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={onDeleteGroup}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="divide-y divide-border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event: DragEndEvent) => {
            const { active, over } = event
            if (!over || active.id === over.id) return
            const sorted = [...(group.sections || [])].sort((a, b) => a.order - b.order)
            const oldIndex = sorted.findIndex(s => s.id === active.id)
            const newIndex = sorted.findIndex(s => s.id === over.id)
            reorderSections.mutate(arrayMove(sorted, oldIndex, newIndex).map(s => s.id))
          }}
        >
          <SortableContext
            items={[...(group.sections || [])].sort((a, b) => a.order - b.order).map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {[...(group.sections || [])].sort((a, b) => a.order - b.order).map((section) => (
              <SortableSectionRow
                key={section.id}
                section={section}
                canEdit={canEdit}
                isEditing={editingSection === section.id}
                onEdit={() => onEditSection(section.id)}
                onCancel={onCancelEditSection}
                onDelete={() => onDeleteSection(section.id)}
                sectionName={section.name ?? section.templateSection?.name}
                onSaved={invalidateProgram}
              />
            ))}
          </SortableContext>
        </DndContext>
        {isAddingSection && (
          <AddSectionForm
            onSave={async (name) => {
              try {
                await WorshipServicesProgramsService.programControllerAddSectionToGroup(group.id, { name })
                await invalidateProgram()
                onCancelAddSection()
                toast.success('Sección agregada')
              } catch {
                toast.error('No se pudo agregar la sección')
              }
            }}
            onCancel={onCancelAddSection}
          />
        )}
      </div>
    </div>
  )
}

function SortableSectionRow(props: Parameters<typeof SectionRow>[0]) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.section.id,
    disabled: !props.canEdit || props.isEditing,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {props.canEdit && !props.isEditing && (
        <button
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 cursor-grab touch-none text-muted-foreground/30 hover:text-muted-foreground p-1"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      <div className={props.canEdit && !props.isEditing ? 'pl-6' : ''}>
        <SectionRow {...props} />
      </div>
    </div>
  )
}
