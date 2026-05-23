import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Trash2 } from 'lucide-react'

import { useVisit, useVisitStatuses } from '../hooks/use-visits-list'
import { usePeopleList } from '../hooks/use-people-list'
import { MissionVisitsService } from '@/lib/api'
import type { CreateVisitDto, UpdateVisitDto } from '@/lib/api'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PersonCombobox } from '../components/person-combobox'

// ─── Schema ─────────────────────────────────────────────────────────────────

const schema = z.object({
  personId:             z.string().min(1, 'La persona es requerida'),
  visitStatusId:        z.string().min(1, 'El estado es requerido'),
  scheduledDate:        z.string().optional(),
  completedDate:        z.string().optional(),
  responsiblePersonIds: z.array(z.string()).optional(),
  outcome:              z.string().optional(),
})

type FormValues = z.infer<typeof schema>

// ─── Component ───────────────────────────────────────────────────────────────

export function VisitFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = !!id && id !== 'nuevo'
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [formReady, setFormReady] = useState(!isEditing)

  const { data: existing } = useVisit(id ?? '')
  const { data: statuses = [] } = useVisitStatuses()
  const { data: people } = usePeopleList('')

  const peopleList = (people?.data ?? []).map((p) => ({
    id: p.id,
    label: [p.firstName, p.lastName].filter(Boolean).join(' '),
  }))

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
      personId:             '',
      visitStatusId:        '',
      scheduledDate:        '',
      completedDate:        '',
      responsiblePersonIds: [],
      outcome:              '',
      },
    })

  useEffect(() => {
    if (existing) {
      reset({
        personId:             existing.personId ?? '',
        visitStatusId:        existing.visitStatusId ?? '',
        scheduledDate:        existing.scheduledDate ?? '',
        completedDate:        existing.completedDate ?? '',
        responsiblePersonIds: existing.responsiblePersonIds ?? [],
        outcome:              existing.outcome ?? '',
      })
      setFormReady(true)
    }
  }, [existing, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      if (isEditing) {
        const payload: UpdateVisitDto = {
          visitStatusId:        values.visitStatusId,
          scheduledDate:        values.scheduledDate || null,
          completedDate:        values.completedDate || null,
          responsiblePersonIds: values.responsiblePersonIds ?? [],
          outcome:              values.outcome || null,
        }
        return MissionVisitsService.visitControllerUpdate(id!, payload)
      }
      const payload: CreateVisitDto = {
        personId:             values.personId,
        visitStatusId:        values.visitStatusId,
        scheduledDate:        values.scheduledDate || null,
        completedDate:        values.completedDate || null,
        responsiblePersonIds: values.responsiblePersonIds ?? [],
        outcome:              values.outcome || null,
      }
      return MissionVisitsService.visitControllerCreate(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-visits'] })
      toast.success(isEditing ? 'Visita actualizada' : 'Visita registrada')
      navigate('/misionero/visitas')
    },
    onError: (err: { body?: { message?: string } }) => {
      toast.error(err.body?.message ?? 'Error al guardar')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => MissionVisitsService.visitControllerRemove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-visits'] })
      toast.success('Visita eliminada')
      navigate('/misionero/visitas')
    },
    onError: (err: { body?: { message?: string } }) => {
      toast.error(err.body?.message ?? 'Error al eliminar')
    },
  })

  if (isEditing && !existing) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        Cargando...
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8"
          onClick={() => navigate('/misionero/visitas')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <p className="text-xl font-semibold text-foreground flex-1">
          {isEditing ? 'Editar visita' : 'Nueva visita'}
        </p>
        {isEditing && (
          <Button variant="ghost" size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        className="rounded-xl border border-border bg-card p-6 space-y-5"
      >
        {/* Persona */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Persona *</label>
          {isEditing ? (
            <div className="flex h-9 items-center px-3 rounded-md border border-border bg-muted text-sm text-foreground">
              {existing?.personFullName ?? '—'}
            </div>
          ) : (
            <Controller control={control} name="personId"
              render={({ field }) => (
                <PersonCombobox
                  value={field.value}
                  onChange={field.onChange}
                  people={peopleList}
                  error={!!errors.personId}
                  placeholder="Buscar persona..."
                />
              )}
            />
          )}
          {errors.personId && (
            <p className="text-xs text-destructive">{errors.personId.message}</p>
          )}
        </div>

        {/* Estado */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Estado *</label>
          {formReady && statuses.length > 0 ? (
            <Controller control={control} name="visitStatusId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s: { id: string; name: string }) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          ) : (
            <div className="h-9 rounded-md border border-border bg-muted animate-pulse" />
          )}
          {errors.visitStatusId && (
            <p className="text-xs text-destructive">{errors.visitStatusId.message}</p>
          )}
        </div>

        {/* Fecha programada */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Fecha programada</label>
          <Controller control={control} name="scheduledDate"
            render={({ field }) => (
              <DatePicker value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        {/* Fecha completada */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Fecha completada</label>
          <Controller control={control} name="completedDate"
            render={({ field }) => (
              <DatePicker value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        {/* Responsables */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Responsables</label>
          <Controller control={control} name="responsiblePersonIds"
            render={({ field }) => (
              <PersonCombobox
                multiple
                value={field.value ?? []}
                onChange={field.onChange}
                people={peopleList}
                placeholder="Agregar responsable..."
              />
            )}
          />
        </div>

        {/* Resultado */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Resultado</label>
          <Controller control={control} name="outcome"
            render={({ field }) => (
              <Textarea {...field} rows={3} placeholder="Resultado de la visita..." />
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-border pt-5">
          <Button type="button" variant="outline"
            onClick={() => navigate('/misionero/visitas')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || mutation.isPending}>
            {mutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar visita"
        description="¿Estás seguro? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  )
}
