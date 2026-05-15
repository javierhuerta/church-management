import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CalendarService,
  CreateEventDto,
  UpdateEventDto,
  DepartmentsService,
  type AttachmentResponseDto,
  type EventResponseDto,
  type OrganizerResponseDto,
} from '@/lib/api'
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
import { WysiwygEditor } from './wysiwyg-editor'
import { OrganizersSelect } from './organizers-select'
import { AttachmentUploader } from './attachment-uploader'
import {
  DEPARTMENT_LABELS,
  EVENT_TYPE_LABELS,
  MEETING_TYPE_LABELS,
} from '../utils/labels'

const formSchema = z
  .object({
    title: z.string().min(1, 'El título es requerido').max(200),
    description: z.string().optional(),
    startDate: z.string().min(1, 'La fecha de inicio es requerida'),
    endDate: z.string().min(1, 'La fecha de fin es requerida'),
    eventType: z.enum(['local', 'asach', 'distrital']),
    departmentId: z.string().optional(),
    meetingUrl: z
      .string()
      .url('Debe ser una URL válida (https://...)')
      .optional()
      .or(z.literal('')),
    meetingType: z.string().optional(),
    location: z.string().optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'La fecha de fin debe ser posterior a la de inicio',
    path: ['endDate'],
  })

type FormValues = z.infer<typeof formSchema>

interface EventFormProps {
  event?: EventResponseDto
  onSaved: (event: EventResponseDto) => void
}

function toDateTimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function EventForm({ event, onSaved }: EventFormProps) {
  const isEdit = !!event
  const [organizers, setOrganizers] = useState<OrganizerResponseDto[]>(
    event?.organizers ?? [],
  )
  const [attachments, setAttachments] = useState<AttachmentResponseDto[]>(
    event?.attachments ?? [],
  )
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => DepartmentsService.departmentsControllerFindAll(),
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: event?.title ?? '',
      description: event?.description ?? '',
      startDate: event ? toDateTimeLocal(event.startDate) : '',
      endDate: event ? toDateTimeLocal(event.endDate) : '',
      eventType: (event?.eventType as 'local' | 'asach' | 'distrital') ?? 'local',
      departmentId: event?.departmentId ?? '',
      meetingUrl: event?.meetingUrl ?? '',
      meetingType: event?.meetingType ?? '',
      location: event?.location ?? '',
    },
  })

  function getDepartmentLabel(name: string): string {
    return DEPARTMENT_LABELS[name as keyof typeof DEPARTMENT_LABELS] ?? name
  }

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const startIso = new Date(values.startDate).toISOString()
    const endIso = new Date(values.endDate).toISOString()
    const organizerIds = organizers.map((o) => o.id)

    try {
      if (isEdit && event) {
        const payload: UpdateEventDto = {
          title: values.title,
          description: values.description ?? '',
          startDate: startIso,
          endDate: endIso,
          eventType: values.eventType as UpdateEventDto.eventType,
          departmentId: values.departmentId || null,
          meetingUrl: values.meetingUrl || undefined,
          meetingType: (values.meetingType || null) as UpdateEventDto.meetingType | null,
          location: values.location || undefined,
          organizerIds,
        }
        const updated = await CalendarService.calendarControllerUpdate(
          event.id,
          payload,
        )
        onSaved(updated)
      } else {
        const payload: CreateEventDto = {
          title: values.title,
          description: values.description ?? '',
          startDate: startIso,
          endDate: endIso,
          eventType: values.eventType as CreateEventDto.eventType,
          departmentId: values.departmentId || undefined,
          meetingUrl: values.meetingUrl || undefined,
          meetingType: values.meetingType
            ? (values.meetingType as CreateEventDto.meetingType)
            : undefined,
          location: values.location || undefined,
          organizerIds,
        }
        const created = await CalendarService.calendarControllerCreate(payload)
        onSaved(created)
      }
    } catch (err) {
      const message =
        (err as { body?: { message?: string } })?.body?.message ??
        'Error al guardar el evento'
      setServerError(Array.isArray(message) ? message.join(', ') : message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input id="title" {...register('title')} />
        {errors.title && (
          <p className="text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Descripción</Label>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <WysiwygEditor
              value={field.value ?? ''}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Inicio *</Label>
          <Input
            id="startDate"
            type="datetime-local"
            {...register('startDate')}
          />
          {errors.startDate && (
            <p className="text-xs text-red-500">{errors.startDate.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Fin *</Label>
          <Input
            id="endDate"
            type="datetime-local"
            {...register('endDate')}
          />
          {errors.endDate && (
            <p className="text-xs text-red-500">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo de evento *</Label>
          <Controller
            control={control}
            name="eventType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>Departamento</Label>
          <Controller
            control={control}
            name="departmentId"
            render={({ field }) => (
              <Select
                value={field.value || 'none'}
                onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin departamento</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {getDepartmentLabel(d.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Ubicación</Label>
        <Input id="location" {...register('location')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="meetingUrl">URL de reunión</Label>
          <Input
            id="meetingUrl"
            placeholder="https://zoom.us/j/..."
            {...register('meetingUrl')}
          />
          {errors.meetingUrl && (
            <p className="text-xs text-red-500">{errors.meetingUrl.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Tipo de reunión</Label>
          <Controller
            control={control}
            name="meetingType"
            render={({ field }) => (
              <Select
                value={field.value || 'none'}
                onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Detectar automáticamente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Detectar automáticamente</SelectItem>
                  {Object.entries(MEETING_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Organizadores</Label>
        <OrganizersSelect value={organizers} onChange={setOrganizers} />
      </div>

      {isEdit && event && (
        <div className="space-y-2">
          <Label>Adjuntos</Label>
          <AttachmentUploader
            eventId={event.id}
            attachments={attachments}
            onChange={setAttachments}
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Guardando...'
            : isEdit
              ? 'Guardar cambios'
              : 'Crear evento'}
        </Button>
      </div>
    </form>
  )
}
