import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, ChevronRight, Timer } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthUser } from '@/features/calendar/hooks/use-auth-user'
import { useTemplates, type ServiceTemplateType } from '../hooks/use-worship-services'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WorshipServicesProgramsService } from '@/lib/api'
import type { ServiceTemplateResponseDto } from '@/lib/api/models/ServiceTemplateResponseDto'
import type { TemplateSectionResponseDto } from '@/lib/api/models/TemplateSectionResponseDto'

const formSchema = z.object({
  templateId: z.string().min(1, 'Selecciona una plantilla'),
  date: z.string().min(1, 'La fecha es requerida'),
})

type FormValues = z.infer<typeof formSchema>

const templateTypeLabels: Record<ServiceTemplateType, string> = {
  CULTO_SABATICO: 'Culto Sabático',
  CULTO_JA: 'Culto JA',
  CULTO_ORACION: 'Culto de Oración',
  OTRO: 'Otro',
}

function SectionPreviewRow({
  section,
  variant = 'group',
}: {
  section: TemplateSectionResponseDto
  variant?: 'group' | 'standalone'
}) {
  const isStandalone = variant === 'standalone'
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-1.5 min-w-0">
        <ChevronRight
          className={`h-3 w-3 shrink-0 ${isStandalone ? 'text-blue-400' : 'text-neutral-300'}`}
        />
        <span className={`truncate ${isStandalone ? 'text-blue-800' : 'text-neutral-700'}`}>
          {section.name}
        </span>
      </div>
      {(section.startTime || section.duration) && (
        <div className="flex items-center gap-2 text-neutral-400 shrink-0">
          {section.startTime && (
            <span className="flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {section.startTime}
            </span>
          )}
          {section.duration && (
            <span className="flex items-center gap-0.5">
              <Timer className="h-2.5 w-2.5" />
              {section.duration} min
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function TemplatePreview({ template }: { template: ServiceTemplateResponseDto }) {
  const sortedGroups = [...template.groups].sort((a, b) => a.order - b.order)
  // Exclude sections that belong to a group — those appear inside the group card
  const standaloneSections = [...template.sections]
    .filter((s) => !s.groupId)
    .sort((a, b) => a.order - b.order)

  const hasContent = sortedGroups.length > 0 || standaloneSections.length > 0

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-blue-900">{template.name}</p>
          {template.description && (
            <p className="text-xs text-blue-700 mt-0.5">{template.description}</p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          {templateTypeLabels[template.type]}
        </span>
      </div>

      {!hasContent && (
        <p className="text-xs text-blue-600 italic">Esta plantilla no tiene secciones definidas.</p>
      )}

      {sortedGroups.map((group) => (
        <div
          key={group.id}
          className="rounded-lg border border-blue-100 bg-white/70 p-3 space-y-2"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
              {group.name}
            </p>
            {(group.startTime || group.endTime) && (
              <span className="flex items-center gap-1 text-xs text-neutral-500">
                <Clock className="h-3 w-3" />
                {group.startTime}
                {group.endTime ? ` – ${group.endTime}` : ''}
              </span>
            )}
          </div>
          {group.sections.length === 0 ? (
            <p className="text-xs text-neutral-400 italic">Sin secciones</p>
          ) : (
            <div className="space-y-1">
              {[...group.sections]
                .sort((a, b) => a.order - b.order)
                .map((s) => (
                  <SectionPreviewRow key={s.id} section={s} variant="group" />
                ))}
            </div>
          )}
        </div>
      ))}

      {standaloneSections.length > 0 && (
        <div className="space-y-1">
          {sortedGroups.length > 0 && (
            <p className="text-xs font-semibold text-blue-700 mb-1.5">Secciones adicionales</p>
          )}
          {standaloneSections.map((s) => (
            <SectionPreviewRow key={s.id} section={s} variant="standalone" />
          ))}
        </div>
      )}
    </div>
  )
}

export function ProgramCreatePage() {
  const navigate = useNavigate()
  const user = useAuthUser()
  const canCreate = ['Admin', 'Pastor', 'Anciano', 'DirectorDepartamento'].includes(user?.role || '')
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplateResponseDto | null>(null)

  const { data: templates, isLoading } = useTemplates()

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateId: '',
      date: '',
    },
  })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    setIsSubmitting(true)

    try {
      const program = await WorshipServicesProgramsService.programControllerCreate(values)
      navigate(`/cultos/programas/${program.id}`)
    } catch (err) {
      setServerError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
        <h2 className="text-xl font-semibold text-neutral-900">Acceso restringido</h2>
        <p className="text-sm text-neutral-500 mt-1">
          No tienes permisos para crear programas.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </Button>

      <div>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
          Nuevo programa de culto
        </h2>
        <p className="text-neutral-500 mt-1">
          Selecciona una plantilla y la fecha para crear el programa
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha del culto *</Label>
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <DatePicker
                  id="date"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.date && (
              <p className="text-xs text-red-500">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Plantilla *</Label>
            <Controller
              control={control}
              name="templateId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val)
                    const t = templates?.find((x) => x.id === val) ?? null
                    setSelectedTemplate(t)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="loading" disabled>
                        Cargando...
                      </SelectItem>
                    ) : (
                      templates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} ({templateTypeLabels[template.type]})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.templateId && (
              <p className="text-xs text-red-500">{errors.templateId.message}</p>
            )}
          </div>

          {selectedTemplate && <TemplatePreview template={selectedTemplate} />}

          {templates && templates.length === 0 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
              No hay plantillas activas. Crea una plantilla primero.
              <Button
                type="button"
                variant="link"
                size="sm"
                className="ml-2"
                onClick={() => navigate('/cultos/plantillas/nuevo')}
              >
                Crear plantilla
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting ? 'Creando...' : 'Crear programa'}
          </Button>
        </div>
      </form>
    </div>
  )
}
