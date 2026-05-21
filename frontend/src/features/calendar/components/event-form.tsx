import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CalendarService,
  CreateEventDto,
  UpdateEventDto,
  DepartmentsService,
  type AttachmentResponseDto,
  type EventResponseDto,
  type OrganizerInputDto,
} from '@/lib/api'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateTimePicker } from '@/components/ui/date-time-picker'
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
import { CoverImagePicker } from './cover-image-picker'
import { DepartmentCombobox } from './department-combobox'
import type { OrganizerEntry } from './organizer-chip'
import { useCoverUpload } from '../hooks/use-cover-upload'
import {
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

function toDateTimeLocal(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function existingOrganizersToEntries(
  event?: EventResponseDto,
): OrganizerEntry[] {
  if (!event) return []
  return event.organizers.map<OrganizerEntry>((o) =>
    o.kind === 'user' && o.userId
      ? {
          kind: 'user',
          id: o.id,
          userId: o.userId,
          name: o.name,
          email: o.email ?? null,
        }
      : { kind: 'text', id: o.id, displayName: o.name },
  )
}

function organizersToInput(entries: OrganizerEntry[]): OrganizerInputDto[] {
  return entries.map((e) =>
    e.kind === 'user'
      ? { userId: e.userId }
      : { displayName: e.displayName },
  )
}

function resolveCoverUrl(url: string | null | undefined): string | null {
  return url ?? null
}

export function EventForm({ event, onSaved }: EventFormProps) {
  const isEdit = !!event
  const [organizers, setOrganizers] = useState<OrganizerEntry[]>(
    existingOrganizersToEntries(event),
  )
  const [attachments, setAttachments] = useState<AttachmentResponseDto[]>(
    event?.attachments ?? [],
  )
  const [serverError, setServerError] = useState<string | null>(null)
  const [coverWarning, setCoverWarning] = useState<string | null>(null)
  const [endAutoAdjusted, setEndAutoAdjusted] = useState(false)
  const cover = useCoverUpload()
  const queryClient = useQueryClient()

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => DepartmentsService.departmentsControllerFindAll(),
  })

  const departmentOptions = useMemo(
    () =>
      departments.map((d) => ({
        id: d.id,
        name: d.name,
        label:
          d.name,
      })),
    [departments],
  )

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
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

  const watchedTitle = watch('title')
  const watchedDepartmentId = watch('departmentId')
  const watchedStart = watch('startDate')
  const watchedEnd = watch('endDate')

  useEffect(() => {
    if (!watchedStart || !watchedEnd) {
      setEndAutoAdjusted(false)
      return
    }
    if (new Date(watchedEnd) < new Date(watchedStart)) {
      setValue('endDate', watchedStart, { shouldValidate: true })
      setEndAutoAdjusted(true)
    } else {
      setEndAutoAdjusted(false)
    }
  }, [watchedStart, watchedEnd, setValue])

  const departmentName = useMemo(() => {
    const dep = departmentOptions.find((d) => d.id === watchedDepartmentId)
    return dep?.label ?? null
  }, [watchedDepartmentId, departmentOptions])

  const currentCover = useMemo(() => {
    if (cover.pending) return cover.pending.previewUrl
    return resolveCoverUrl(event?.coverImageUrl)
  }, [cover.pending, event?.coverImageUrl])

  async function onSubmit(values: FormValues) {
    setServerError(null)
    setCoverWarning(null)
    const startIso = new Date(values.startDate).toISOString()
    const endIso = new Date(values.endDate).toISOString()
    const organizerInput = organizersToInput(organizers)

    try {
      let saved: EventResponseDto
      if (isEdit && event) {
        const payload: UpdateEventDto = {
          title: values.title,
          description: values.description ?? '',
          startDate: startIso,
          endDate: endIso,
          eventType: values.eventType as UpdateEventDto.eventType,
          departmentId: values.departmentId || null,
          meetingUrl: values.meetingUrl || undefined,
          meetingType: (values.meetingType || null) as
            | UpdateEventDto.meetingType
            | null,
          location: values.location || undefined,
          organizers: organizerInput,
        }
        saved = await CalendarService.calendarControllerUpdate(event.id, payload)
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
          organizers: organizerInput,
        }
        saved = await CalendarService.calendarControllerCreate(payload)
      }

      if (cover.pending) {
        try {
          await cover.uploadFor(saved.id)
        } catch (err) {
          setCoverWarning(
            `Evento guardado, pero falló la subida de la portada: ${(err as Error).message}`,
          )
          await queryClient.invalidateQueries({ queryKey: ['calendar'] })
          onSaved(saved)
          return
        }
      }

      // Invalidate and wait for refetch so the detail page sees the updated coverImageUrl
      await queryClient.invalidateQueries({ queryKey: ['calendar'] })
      await queryClient.refetchQueries({ queryKey: ['calendar', 'slug', saved.shareSlug] })
      onSaved(saved)
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
      {coverWarning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {coverWarning}
        </div>
      )}

      <CoverImagePicker
        currentCoverUrl={currentCover}
        eventTitle={watchedTitle}
        departmentName={departmentName}
        onCoverPicked={(result) =>
          cover.setPending({
            blob: result.blob,
            previewUrl: result.previewUrl,
            metadata: result.metadata,
          })
        }
      />

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
          <Controller
            control={control}
            name="startDate"
            render={({ field }) => (
              <DateTimePicker
                id="startDate"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.startDate && (
            <p className="text-xs text-red-500">{errors.startDate.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Fin *</Label>
          <Controller
            control={control}
            name="endDate"
            render={({ field }) => (
              <DateTimePicker
                id="endDate"
                value={field.value}
                onChange={field.onChange}
                minDate={watchedStart || undefined}
              />
            )}
          />
          {errors.endDate && (
            <p className="text-xs text-red-500">{errors.endDate.message}</p>
          )}
          {endAutoAdjusted && (
            <p className="text-xs text-muted-foreground">
              Ajustamos la fecha de fin para que no sea anterior al inicio.
            </p>
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
              <DepartmentCombobox
                value={field.value || null}
                onChange={(v) => field.onChange(v ?? '')}
                departments={departmentOptions}
              />
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

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        <Button type="submit" disabled={isSubmitting || cover.uploading}>
          {isSubmitting || cover.uploading
            ? 'Guardando...'
            : isEdit
              ? 'Guardar cambios'
              : 'Crear evento'}
        </Button>
      </div>
    </form>
  )
}
