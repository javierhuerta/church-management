import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, User, Music, FileText, Send, CheckCircle, Trash2, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuthUser } from '@/features/calendar/hooks/use-auth-user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProgram, useProgramLogs, useHymnSearch, useUserSearch } from '../hooks/use-worship-services'
import { WorshipServicesProgramsService } from '@/lib/api'

export function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthUser()
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [editingDate, setEditingDate] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const { data: program, isLoading } = useProgram(id || '')
  const { data: logs } = useProgramLogs(id || '')

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
  const canEdit = !isPublished || user?.role === 'Admin' || (user?.role === 'Pastor' && program.createdById === user?.userId)
  const canPublish = user?.role === 'Admin' || user?.role === 'Pastor'

  async function handlePublish() {
    if (!confirm('¿Publicar este programa? Una vez publicado solo Admin y el creador original podrán editarlo.')) {
      return
    }

    setIsPublishing(true)
    try {
      await WorshipServicesProgramsService.programControllerPublish(id || '')
      window.location.reload()
    } finally {
      setIsPublishing(false)
    }
  }

  const formattedDate = format(new Date(program.date + 'T12:00:00'), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/cultos/programas')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver
          </Button>
          {editingDate ? (
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="date"
                value={program.date}
                onChange={(e) => {
                  const newDate = e.target.value
                  WorshipServicesProgramsService.programControllerUpdateProgram(id || '', { date: newDate })
                    .then(() => window.location.reload())
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
          {isPublished ? (
            <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
              <CheckCircle className="h-4 w-4 mr-1" /> Publicado
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700">
              Borrador
            </span>
          )}
          {canPublish && !isPublished && (
            <Button onClick={handlePublish} disabled={isPublishing}>
              <Send className="h-4 w-4 mr-1" /> {isPublishing ? 'Publicando...' : 'Publicar'}
            </Button>
          )}
          {user?.role === 'Admin' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={async () => {
                if (!confirm('¿Eliminar este programa? Esta acción no se puede deshacer.')) return
                await WorshipServicesProgramsService.programControllerDelete(id || '')
                navigate('/cultos/programas')
              }}
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
                        await WorshipServicesProgramsService.programControllerUpdateGroup(group.id, data)
                        window.location.reload()
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
                          <Button variant="ghost" size="sm" onClick={() => setEditingGroup(group.id)}>
                            Editar
                          </Button>
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
                  />
                ))}
              </div>
            </div>
          ))}

          {program.sections?.filter(s => !s.groupId).map((section) => (
            <div key={section.id} className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="px-4 py-3 border-b border-neutral-100">
                <h3 className="font-semibold text-neutral-900">{section.templateSectionId}</h3>
              </div>
              <div className="p-4">
                <SectionRow
                  section={section}
                  canEdit={canEdit}
                  isEditing={editingSection === section.id}
                  onEdit={() => setEditingSection(section.id)}
                  onCancel={() => setEditingSection(null)}
                />
              </div>
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
  startTime?: string | null
  duration?: number | null
  responsible?: string | null
  hymnText?: string | null
  notes?: string | null
  order: number
}

interface SectionRowProps {
  section: Section
  canEdit: boolean
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
}

function SectionRow({ section, canEdit, isEditing, onEdit, onCancel }: SectionRowProps) {
  const [formData, setFormData] = useState({
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
        ...formData,
        duration: formData.duration ? Number(formData.duration) : undefined,
      })
      window.location.reload()
    } finally {
      setIsSaving(false)
    }
  }

  if (isEditing) {
    return (
      <div className="p-4 space-y-4">
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
      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
      {canEdit && (
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Editar
        </Button>
      )}
    </div>
  )
}