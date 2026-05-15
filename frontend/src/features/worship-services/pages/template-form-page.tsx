import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { useAuthUser } from '@/features/calendar/hooks/use-auth-user'
import { useTemplate } from '../hooks/use-worship-services'
import type { ServiceTemplateResponseDto } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WorshipServicesTemplatesService } from '@/lib/api'

type ServiceTemplateType = 'CULTO_SABATICO' | 'CULTO_JA' | 'CULTO_ORACION' | 'OTRO'

const TEMPLATE_TYPES: { value: ServiceTemplateType; label: string }[] = [
  { value: 'CULTO_SABATICO', label: 'Culto Sabático' },
  { value: 'CULTO_JA', label: 'Culto JA' },
  { value: 'CULTO_ORACION', label: 'Culto de Oración' },
  { value: 'OTRO', label: 'Otro' },
]

interface SectionInput {
  name: string
  order: number
  startTime?: string
  duration?: number
}

interface GroupInput {
  name: string
  startTime: string
  endTime: string
  order: number
  sections: SectionInput[]
}

interface FormValues {
  name: string
  description: string
  type: ServiceTemplateType
  isActive: boolean
  groups: GroupInput[]
  sections: SectionInput[]
}

function templateToFormValues(template: ServiceTemplateResponseDto): FormValues {
  const sortByOrder = <T extends { order: number }>(items: T[]) =>
    [...items].sort((a, b) => a.order - b.order)

  return {
    name: template.name,
    description: template.description ?? '',
    type: template.type as ServiceTemplateType,
    isActive: template.isActive,
    groups: sortByOrder(template.groups ?? []).map((group) => ({
      name: group.name,
      startTime: group.startTime ?? '',
      endTime: group.endTime ?? '',
      order: group.order,
      sections: sortByOrder(group.sections ?? []).map((section) => ({
        name: section.name,
        order: section.order,
        startTime: section.startTime ?? '',
        duration: section.duration ?? undefined,
      })),
    })),
    sections: sortByOrder(
      (template.sections ?? []).filter((section) => !section.groupId),
    ).map((section) => ({
      name: section.name,
      order: section.order,
      startTime: section.startTime ?? '',
      duration: section.duration ?? undefined,
    })),
  }
}

export function TemplateFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id
  const user = useAuthUser()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: existingTemplate, isLoading: isLoadingTemplate } = useTemplate(
    id ?? '',
  )

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      type: 'CULTO_SABATICO' as ServiceTemplateType,
      isActive: true,
      groups: [],
      sections: [],
    },
  })

  const {
    fields: groupFields,
    append: appendGroup,
    remove: removeGroup,
  } = useFieldArray({ control, name: 'groups' })

  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({ control, name: 'sections' })

  useEffect(() => {
    if (isEditMode && existingTemplate) {
      reset(templateToFormValues(existingTemplate))
    }
  }, [isEditMode, existingTemplate, reset])

  async function onSubmit(values: FormValues) {
    setServerError(null)
    setIsSubmitting(true)

    try {
      if (isEditMode && id) {
        await WorshipServicesTemplatesService.templateControllerUpdate(id, values as any)
      } else {
        await WorshipServicesTemplatesService.templateControllerCreate(values as any)
      }
      navigate('/cultos/plantillas')
    } catch (err) {
      setServerError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canManage = user?.role === 'Admin' || user?.role === 'Pastor'

  if (!canManage) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
        <h2 className="text-xl font-semibold text-neutral-900">Acceso restringido</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Solo Admin y Pastor pueden gestionar plantillas.
        </p>
      </div>
    )
  }

  if (isEditMode && isLoadingTemplate) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
        <p className="text-sm text-neutral-500">Cargando plantilla...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </Button>

      <div>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
          {isEditMode ? 'Editar plantilla' : 'Nueva plantilla'}
        </h2>
        <p className="text-neutral-500 mt-1">
          {isEditMode
            ? 'Modifica los datos de la plantilla de culto'
            : 'Crea una nueva plantilla para programas de culto'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la plantilla *</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input id="description" {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de culto *</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange as any}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <Select
                    value={field.value ? 'active' : 'inactive'}
                    onValueChange={(v) => field.onChange(v === 'active')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="inactive">Inactiva</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900">Grupos</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendGroup({ name: '', startTime: '', endTime: '', order: groupFields.length, sections: [] })
              }
            >
              <Plus className="h-4 w-4 mr-1" /> Agregar grupo
            </Button>
          </div>

          {groupFields.map((group, groupIndex) => (
            <div key={group.id} className="border border-neutral-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-neutral-400 cursor-grab" />
                <Input
                  placeholder="Nombre del grupo (ej: Escuela Sabática)"
                  {...register(`groups.${groupIndex}.name` as any)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGroup(groupIndex)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 ml-6">
                <Input
                  placeholder="Hora inicio (ej: 09:00)"
                  {...register(`groups.${groupIndex}.startTime` as any)}
                />
                <Input
                  placeholder="Hora fin (ej: 10:30)"
                  {...register(`groups.${groupIndex}.endTime` as any)}
                />
              </div>

              <div className="ml-6 space-y-2">
                <Label className="text-sm text-neutral-500">Secciones del grupo</Label>
                <Controller
                  control={control}
                  name={`groups.${groupIndex}.sections`}
                  render={({ field }) => (
                    <div className="space-y-2">
                      {field.value?.map((_: any, sectionIndex: number) => (
                        <div key={sectionIndex} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Nombre de la sección"
                              {...register(`groups.${groupIndex}.sections.${sectionIndex}.name` as any)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const current = [...(field.value || [])]
                                current.splice(sectionIndex, 1)
                                field.onChange(current)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pl-0">
                            <Input
                              type="time"
                              placeholder="Hora inicio"
                              {...register(`groups.${groupIndex}.sections.${sectionIndex}.startTime` as any)}
                              className="text-sm"
                            />
                            <Input
                              type="number"
                              placeholder="Duración (min)"
                              min={1}
                              {...register(`groups.${groupIndex}.sections.${sectionIndex}.duration` as any, { valueAsNumber: true })}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSections = [...(field.value || []), { name: '', order: field.value?.length || 0, startTime: '', duration: undefined }]
                          field.onChange(newSections)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Agregar sección
                      </Button>
                    </div>
                  )}
                />
              </div>
            </div>
          ))}

          {groupFields.length === 0 && (
            <p className="text-sm text-neutral-500 text-center py-4">
              Sin grupos. Agrega grupos para organizar secciones.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900">Secciones sin grupo</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendSection({ name: '', order: sectionFields.length, startTime: '', duration: undefined })
              }
            >
              <Plus className="h-4 w-4 mr-1" /> Agregar sección
            </Button>
          </div>

          <div className="space-y-3">
            {sectionFields.map((section, index) => (
              <div key={section.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-neutral-400 cursor-grab" />
                  <Input
                    placeholder="Nombre de la sección"
                    {...register(`sections.${index}.name` as any)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSection(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 ml-6">
                  <Input
                    type="time"
                    placeholder="Hora inicio"
                    {...register(`sections.${index}.startTime` as any)}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Duración (min)"
                    min={1}
                    {...register(`sections.${index}.duration` as any, { valueAsNumber: true })}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {sectionFields.length === 0 && (
              <p className="text-sm text-neutral-500 text-center py-4">
                Sin secciones adicionales.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Guardando...'
              : isEditMode
                ? 'Guardar cambios'
                : 'Crear plantilla'}
          </Button>
        </div>
      </form>
    </div>
  )
}