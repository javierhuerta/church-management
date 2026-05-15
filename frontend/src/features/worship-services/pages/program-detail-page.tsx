import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Clock, User, Music, FileText, Send, CheckCircle, Trash2, Calendar, Plus, Archive, Download } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuthUser } from '@/features/calendar/hooks/use-auth-user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  useProgram,
  useProgramLogs,
  useHymnSearch,
  useUserSearch,
  useDeleteProgram,
  useArchiveProgram,
  useDeleteGroup,
  useDeleteSection,
} from '../hooks/use-worship-services'
import { downloadProgramPdf } from '../hooks/use-program-pdf'
import { WorshipServicesProgramsService } from '@/lib/api'
import { toast } from 'sonner'

export function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthUser()

  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [editingDate, setEditingDate] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [addingGroup, setAddingGroup] = useState(false)
  const [addingSectionToGroup, setAddingSectionToGroup] = useState<string | null>(null)

  const [isDownloading, setIsDownloading] = useState(false)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null)
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null)

  const { data: program, isLoading } = useProgram(id || '')
  const { data: logs } = useProgramLogs(id || '')

  const deleteProgram = useDeleteProgram()
  const archiveProgram = useArchiveProgram(id || '')
  const deleteGroup = useDeleteGroup(id || '')
  const deleteSection = useDeleteSection(id || '')

  const invalidateProgram = () =>
    queryClient.invalidateQueries({ queryKey: ['worship-services', 'programs', id] })

  if (isLoading) {
    return <div className="text-neutral-500">Cargando programa...</div>
  }

  if (!program) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
        <h2 className="text-xl font-semibold text-neutral-900">Programa no encontrado</h2>
      </div>
    )
  }

  const isPublished = program.status === 'PUBLISHED'
  const isArchived = program.status === 'ARCHIVED'
  const canEdit = !isArchived && (!isPublished || user?.role === 'Admin' || (user?.role === 'Pastor' && program.createdById === user?.userId))
  const canPublish = (user?.role === 'Admin' || user?.role === 'Pastor') && !isPublished && !isArchived
  const isAdmin = user?.role === 'Admin'

  async function handlePublish() {
    setIsPublishing(true)
    try {
      await WorshipServicesProgramsService.programControllerPublish(id || '')
      await invalidateProgram()
      toast.success('Programa publicado')
    } catch {
      toast.error('No se pudo publicar el programa')
    } finally {
      setIsPublishing(false)
      setPublishDialogOpen(false)
    }
  }

  const formattedDate = format(new Date(program.date + 'T12:00:00'), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        title="¿Publicar este programa?"
        description="Una vez publicado, solo el Admin y el creador original podrán editarlo."
        confirmLabel="Publicar"
        onConfirm={handlePublish}
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
        title="¿Eliminar este grupo?"
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
        title="¿Eliminar esta sección?"
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
              <Input
                type="date"
                defaultValue={program.date}
                onChange={(e) => {
                  const newDate = e.target.value
                  WorshipServicesProgramsService.programControllerUpdateProgram(id || '', { date: newDate })
                    .then(() => { invalidateProgram(); toast.success('Fecha actualizada') })
                    .catch(() => toast.error('No se pudo actualizar la fecha'))
                }}
                className="w-40"
              />
              <Button variant="ghost" size="sm" onClick={() => setEditingDate(false)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-2">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
                {formattedDate}
              </h2>
              {canEdit && (
                <Button variant="ghost" size="sm" onClick={() => setEditingDate(true)}>
                  <Calendar className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          <p className="text-neutral-500 mt-1">{program.template?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {isArchived ? (
            <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-600">
              <Archive className="h-4 w-4 mr-1" /> Archivado
            </span>
          ) : isPublished ? (
            <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
              <CheckCircle className="h-4 w-4 mr-1" /> Publicado
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700">
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
            <Button onClick={() => setPublishDialogOpen(true)} disabled={isPublishing}>
              <Send className="h-4 w-4 mr-1" /> {isPublishing ? 'Publicando...' : 'Publicar'}
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
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Eliminar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {program.groups?.map((group) => (
            <div key={group.id} className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  {editingGroup === group.id ? (
                    <GroupEditForm
                      group={group}
                      onSave={async (data) => {
                        try {
                          await WorshipServicesProgramsService.programControllerUpdateGroup(group.id, data)
                          await invalidateProgram()
                          setEditingGroup(null)
                          toast.success('Grupo actualizado')
                        } catch {
                          toast.error('No se pudo actualizar el grupo')
                        }
                      }}
                      onCancel={() => setEditingGroup(null)}
                    />
                  ) : (
                    <>
                      <h3 className="font-semibold text-blue-900">{group.name}</h3>
                      <div className="flex items-center gap-2">
                        {(group.startTime || group.endTime) && (
                          <span className="text-xs text-blue-600 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {group.startTime && `${group.startTime}`}
                            {group.startTime && group.endTime && ' - '}
                            {group.endTime && `${group.endTime}`}
                          </span>
                        )}
                        {canEdit && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => setEditingGroup(group.id)}>
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAddingSectionToGroup(addingSectionToGroup === group.id ? null : group.id)}
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" /> Sección
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setDeleteGroupId(group.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="divide-y divide-neutral-100">
                {group.sections?.map((section) => (
                  <SectionRow
                    key={section.id}
                    section={section}
                    canEdit={canEdit}
                    isEditing={editingSection === section.id}
                    onEdit={() => setEditingSection(section.id)}
                    onCancel={() => setEditingSection(null)}
                    onDelete={() => setDeleteSectionId(section.id)}
                    sectionName={section.name ?? section.templateSection?.name}
                    onSaved={invalidateProgram}
                  />
                ))}
                {addingSectionToGroup === group.id && (
                  <AddSectionForm
                    onSave={async (name) => {
                      try {
                        await WorshipServicesProgramsService.programControllerAddSectionToGroup(group.id, { name })
                        await invalidateProgram()
                        setAddingSectionToGroup(null)
                        toast.success('Sección agregada')
                      } catch {
                        toast.error('No se pudo agregar la sección')
                      }
                    }}
                    onCancel={() => setAddingSectionToGroup(null)}
                  />
                )}
              </div>
            </div>
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
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-neutral-200 text-sm text-neutral-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4" /> Agregar grupo
              </button>
            )
          )}

          {program.sections?.filter(s => !s.groupId).map((section) => (
            <div key={section.id} className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <SectionRow
                section={section}
                canEdit={canEdit}
                isEditing={editingSection === section.id}
                onEdit={() => setEditingSection(section.id)}
                onCancel={() => setEditingSection(null)}
                onDelete={() => setDeleteSectionId(section.id)}
                sectionName={section.templateSection?.name ?? undefined}
                onSaved={invalidateProgram}
              />
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm sticky top-6">
            <div className="px-4 py-3 border-b border-neutral-100">
              <h3 className="font-semibold text-neutral-900">Historial de cambios</h3>
            </div>
            <div className="divide-y divide-neutral-100 max-h-96 overflow-y-auto">
              {logs?.map((log) => (
                <div key={log.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-900">{log.user?.name}</span>
                    <span className="text-xs text-neutral-500">
                      {format(new Date(log.createdAt), 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mt-0.5">{log.action}</p>
                  {log.previousValue && log.newValue && (
                    <div className="mt-1 text-xs text-neutral-400">
                      {log.previousValue} → {log.newValue}
                    </div>
                  )}
                </div>
              ))}
              {!logs?.length && (
                <div className="px-4 py-6 text-center text-sm text-neutral-500">
                  Sin cambios registrados
                </div>
              )}
            </div>
          </div>
        </div>
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
    <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
      <Input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="flex-1"
        placeholder="Nombre del grupo"
      />
      <Input
        type="time"
        value={formData.startTime}
        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
        className="w-24"
      />
      <Input
        type="time"
        value={formData.endTime}
        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
        className="w-24"
      />
      <Button type="submit" size="sm" disabled={isSaving}>
        {isSaving ? '...' : 'Guardar'}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        Cancelar
      </Button>
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
        startTime: formData.startTime || undefined,
        duration: formData.duration ? Number(formData.duration) : undefined,
        responsible: formData.responsible || undefined,
        hymnText: formData.hymnText || undefined,
        notes: formData.notes || undefined,
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
      <div className="p-4 space-y-4">
        <div className="space-y-1">
          <Label className="text-xs">Nombre de la sección</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nombre de la sección"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Hora inicio</Label>
            <Input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Duración (min)</Label>
            <Input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Responsable</Label>
          <Input
            value={formData.responsible}
            onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
            placeholder="Nombre del responsable"
          />
          {userSuggestions && userSuggestions.length > 0 && (
            <div className="border rounded bg-white shadow-sm mt-1 max-h-24 overflow-y-auto">
              {userSuggestions.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-50"
                  onClick={() => setFormData({ ...formData, responsible: u.name })}
                >
                  {u.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Himno</Label>
          <Input
            value={formData.hymnText}
            onChange={(e) => setFormData({ ...formData, hymnText: e.target.value })}
            placeholder="Número o nombre del himno"
          />
          {hymnSuggestions && hymnSuggestions.length > 0 && (
            <div className="border rounded bg-white shadow-sm mt-1 max-h-24 overflow-y-auto">
              {hymnSuggestions.map((h) => (
                <button
                  key={h.number}
                  type="button"
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-50"
                  onClick={() => setFormData({ ...formData, hymnText: `Himno ${h.number} - ${h.name}` })}
                >
                  {h.number} - {h.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Notas</Label>
          <Input
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notas adicionales"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 flex items-start justify-between gap-4">
      <div className="flex-1 space-y-2">
        {displayName && (
          <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">{displayName}</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {section.startTime && (
            <div className="flex items-center gap-1 text-neutral-500">
              <Clock className="h-3.5 w-3.5" />
              {section.startTime}
            </div>
          )}
          {section.responsible && (
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-neutral-400" />
              {section.responsible}
            </div>
          )}
          {section.hymnText && (
            <div className="flex items-center gap-1">
              <Music className="h-3.5 w-3.5 text-neutral-400" />
              <span className="truncate">{section.hymnText}</span>
            </div>
          )}
          {section.notes && (
            <div className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-neutral-400" />
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
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
    <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
      <p className="text-sm font-medium text-blue-900 mb-3">Nuevo grupo</p>
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
    <form onSubmit={handleSubmit} className="p-3 flex items-center gap-2 bg-neutral-50 border-t border-neutral-100">
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
