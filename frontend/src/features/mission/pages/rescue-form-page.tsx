import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Trash2 } from 'lucide-react'

import { useRescueMember, useRescueStages } from '../hooks/use-visits-list'
import { usePeopleList } from '../hooks/use-people-list'
import { MissionRescueMembersService } from '@/lib/api'
import type { CreateRescueMemberDto, UpdateRescueMemberDto } from '@/lib/api'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  rescueStageId:        z.string().min(1, 'La etapa es requerida'),
  yearsSinceBaptism:    z.string().optional(),
  responsiblePersonIds: z.array(z.string()).optional(),
  notes:                z.string().optional(),
})

type FormValues = z.infer<typeof schema>

// ─── Component ───────────────────────────────────────────────────────────────

export function RescueFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = !!id && id !== 'nuevo'
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [formReady, setFormReady] = useState(!isEditing)

  const { data: existing } = useRescueMember(id ?? '')
  const { data: stages = [] } = useRescueStages()
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
      rescueStageId:        '',
      yearsSinceBaptism:    '',
      responsiblePersonIds: [],
      notes:                '',
      },
    })

  useEffect(() => {
    if (existing) {
      reset({
        personId:             existing.personId ?? '',
        rescueStageId:        existing.rescueStageId ?? '',
        yearsSinceBaptism:    existing.yearsSinceBaptism?.toString() ?? '',
        responsiblePersonIds: existing.responsiblePersonIds ?? [],
        notes:                existing.notes ?? '',
      })
      setFormReady(true)
    }
  }, [existing, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      if (isEditing) {
        const payload: UpdateRescueMemberDto = {
          rescueStageId:        values.rescueStageId,
          yearsSinceBaptism:    values.yearsSinceBaptism ? parseInt(values.yearsSinceBaptism) : null,
          responsiblePersonIds: values.responsiblePersonIds ?? [],
          notes:                values.notes || null,
        }
        return MissionRescueMembersService.rescueMemberControllerUpdate(id!, payload)
      }
      const payload: CreateRescueMemberDto = {
        personId:             values.personId,
        rescueStageId:        values.rescueStageId,
        yearsSinceBaptism:    values.yearsSinceBaptism ? parseInt(values.yearsSinceBaptism) : null,
        responsiblePersonIds: values.responsiblePersonIds ?? [],
        notes:                values.notes || null,
      }
      return MissionRescueMembersService.rescueMemberControllerCreate(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-rescue-members'] })
      toast.success(isEditing ? 'Registro actualizado' : 'Registro creado')
      navigate('/misionero/rescate')
    },
    onError: (err: { body?: { message?: string } }) => {
      toast.error(err.body?.message ?? 'Error al guardar')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => MissionRescueMembersService.rescueMemberControllerRemove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-rescue-members'] })
      toast.success('Registro eliminado')
      navigate('/misionero/rescate')
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
          onClick={() => navigate('/misionero/rescate')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <p className="text-xl font-semibold text-foreground flex-1">
          {isEditing ? 'Editar miembro' : 'Nuevo miembro a rescatar'}
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

        {/* Etapa */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Etapa *</label>
          {formReady && stages.length > 0 ? (
            <Controller control={control} name="rescueStageId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((s: { id: string; name: string }) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          ) : (
            <div className="h-9 rounded-md border border-border bg-muted animate-pulse" />
          )}
          {errors.rescueStageId && (
            <p className="text-xs text-destructive">{errors.rescueStageId.message}</p>
          )}
        </div>

        {/* Años desde el bautismo */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Años desde el bautismo</label>
          <Controller control={control} name="yearsSinceBaptism"
            render={({ field }) => (
              <Input {...field} type="number" min="0" placeholder="Ej. 15" />
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

        {/* Notas */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Notas</label>
          <Controller control={control} name="notes"
            render={({ field }) => (
              <Textarea {...field} rows={3} placeholder="Notas sobre el seguimiento..." />
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-border pt-5">
          <Button type="button" variant="outline"
            onClick={() => navigate('/misionero/rescate')}>
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
        title="Eliminar registro"
        description="¿Estás seguro? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  )
}
