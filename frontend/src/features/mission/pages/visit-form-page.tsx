import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Trash2, Plus, Clock } from 'lucide-react'

import { useVisit, useVisitStatuses } from '../hooks/use-visits-list'
import { usePeopleList } from '../hooks/use-people-list'
import { MissionVisitsService } from '@/lib/api'
import type { CreateVisitDto, UpdateVisitDto, CreateVisitAttemptDto } from '@/lib/api'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { PersonCombobox } from '../components/person-combobox'
import { formatShortDate } from '@/lib/date'

// ── Constantes de intento ────────────────────────────────────────────────────

const ATTEMPT_RESULTS = [
  { value: 'no_encontrado', label: 'No encontrado' },
  { value: 'reagendado',    label: 'Reagendado' },
  { value: 'en_dialogo',    label: 'En diálogo' },
  { value: 'positivo',      label: 'Respuesta positiva' },
  { value: 'negativo',      label: 'No interesado' },
] as const

const RESULT_COLORS: Record<string, string> = {
  no_encontrado: '#64748B',
  reagendado:    '#B45309',
  en_dialogo:    '#1B3A6B',
  positivo:      '#0F766E',
  negativo:      '#DC2626',
}

// ── Schemas ──────────────────────────────────────────────────────────────────

const caseSchema = z.object({
  personId:             z.string().min(1, 'La persona es requerida'),
  visitStatusId:        z.string().min(1, 'El estado es requerido'),
  responsiblePersonIds: z.array(z.string()).optional(),
  notes:                z.string().optional(),
})

const attemptSchema = z.object({
  attemptDate:          z.string().min(1, 'La fecha es requerida'),
  result:               z.string().min(1, 'El resultado es requerido'),
  responsiblePersonIds: z.array(z.string()).optional(),
  notes:                z.string().optional(),
})

type CaseValues   = z.infer<typeof caseSchema>
type AttemptValues = z.infer<typeof attemptSchema>

// ── Component ─────────────────────────────────────────────────────────────────

export function VisitFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = !!id && id !== 'nuevo'
  const [deleteOpen, setDeleteOpen]         = useState(false)
  const [formReady, setFormReady]           = useState(!isEditing)
  const [showAttemptForm, setShowAttemptForm] = useState(false)

  const { data: existing }    = useVisit(id ?? '')
  const { data: statuses = [] } = useVisitStatuses()
  const { data: people }      = usePeopleList('')

  const peopleList = (people?.data ?? []).map((p) => ({
    id: p.id,
    label: [p.firstName, p.lastName].filter(Boolean).join(' '),
  }))

  // ── Formulario del caso ──────────────────────────────────────────────────
  const caseForm = useForm<CaseValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: { personId: '', visitStatusId: '', responsiblePersonIds: [], notes: '' },
  })

  useEffect(() => {
    if (existing) {
      caseForm.reset({
        personId:             existing.personId ?? '',
        visitStatusId:        existing.visitStatusId ?? '',
        responsiblePersonIds: existing.responsiblePersonIds ?? [],
        notes:                existing.notes ?? '',
      })
      setFormReady(true)
    }
  }, [existing, caseForm.reset])

  const caseMutation = useMutation({
    mutationFn: (values: CaseValues) => {
      if (isEditing) {
        const payload: UpdateVisitDto = {
          visitStatusId:        values.visitStatusId,
          responsiblePersonIds: values.responsiblePersonIds ?? [],
          notes:                values.notes || null,
        }
        return MissionVisitsService.visitControllerUpdate(id!, payload)
      }
      const payload: CreateVisitDto = {
        personId:             values.personId,
        visitStatusId:        values.visitStatusId,
        responsiblePersonIds: values.responsiblePersonIds ?? [],
        notes:                values.notes || null,
      }
      return MissionVisitsService.visitControllerCreate(payload)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mission-visits'] })
      queryClient.invalidateQueries({ queryKey: ['mission-visit', id] })
      toast.success(isEditing ? 'Caso actualizado' : 'Caso registrado')
      if (!isEditing) navigate(`/misionero/visitas/${data.id}`)
    },
    onError: (err: { body?: { message?: string } }) => {
      toast.error(err.body?.message ?? 'Error al guardar')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => MissionVisitsService.visitControllerRemove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-visits'] })
      toast.success('Caso eliminado')
      navigate('/misionero/visitas')
    },
    onError: (err: { body?: { message?: string } }) => {
      toast.error(err.body?.message ?? 'Error al eliminar')
    },
  })

  // ── Formulario de intento ────────────────────────────────────────────────
  const attemptForm = useForm<AttemptValues>({
    resolver: zodResolver(attemptSchema),
    defaultValues: { attemptDate: '', result: '', responsiblePersonIds: [], notes: '' },
  })

  const attemptMutation = useMutation({
    mutationFn: (values: AttemptValues) => {
      const payload: CreateVisitAttemptDto = {
        attemptDate:          values.attemptDate,
        result:               values.result as CreateVisitAttemptDto['result'],
        responsiblePersonIds: values.responsiblePersonIds ?? [],
        notes:                values.notes || null,
      }
      return MissionVisitsService.visitControllerAddAttempt(id!, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-visit', id] })
      queryClient.invalidateQueries({ queryKey: ['mission-visits'] })
      toast.success('Intento registrado')
      attemptForm.reset({ attemptDate: '', result: '', responsiblePersonIds: [], notes: '' })
      setShowAttemptForm(false)
    },
    onError: (err: { body?: { message?: string } }) => {
      toast.error(err.body?.message ?? 'Error al registrar intento')
    },
  })

  const deleteAttemptMutation = useMutation({
    mutationFn: (attemptId: string) =>
      MissionVisitsService.visitControllerRemoveAttempt(id!, attemptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-visit', id] })
      queryClient.invalidateQueries({ queryKey: ['mission-visits'] })
      toast.success('Intento eliminado')
    },
    onError: (err: { body?: { message?: string } }) => {
      toast.error(err.body?.message ?? 'Error al eliminar intento')
    },
  })

  if (isEditing && !existing) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        Cargando...
      </div>
    )
  }

  const attempts = existing?.attempts ?? []

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8"
          onClick={() => navigate('/misionero/visitas')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <p className="text-xl font-semibold text-foreground flex-1">
          {isEditing ? 'Caso de visitación' : 'Nueva visitación'}
        </p>
        {isEditing && (
          <Button variant="ghost" size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Grid: formulario + historial lado a lado en desktop */}
      <div className={isEditing ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 items-start' : ''}>

      {/* Formulario del caso */}
      <form
        onSubmit={caseForm.handleSubmit((v) => caseMutation.mutate(v))}
        className="rounded-xl border border-border bg-card p-6 space-y-5"
      >
        <p className="text-sm font-semibold text-foreground">Información del caso</p>

        {/* Persona */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Persona *</label>
          {isEditing ? (
            <div className="flex h-9 items-center px-3 rounded-md border border-border bg-muted text-sm text-foreground">
              {existing?.personFullName ?? '—'}
            </div>
          ) : (
            <Controller control={caseForm.control} name="personId"
              render={({ field }) => (
                <PersonCombobox value={field.value} onChange={field.onChange}
                  people={peopleList} error={!!caseForm.formState.errors.personId}
                  placeholder="Buscar persona..." />
              )}
            />
          )}
          {caseForm.formState.errors.personId && (
            <p className="text-xs text-destructive">{caseForm.formState.errors.personId.message}</p>
          )}
        </div>

        {/* Estado */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Estado *</label>
          {formReady && statuses.length > 0 ? (
            <Controller control={caseForm.control} name="visitStatusId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s: { id: string; name: string; color?: string | null }) => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="flex items-center gap-2">
                          {s.color && (
                            <span className="inline-block h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: s.color }} />
                          )}
                          {s.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          ) : (
            <div className="h-9 rounded-md border border-border bg-muted animate-pulse" />
          )}
          {caseForm.formState.errors.visitStatusId && (
            <p className="text-xs text-destructive">{caseForm.formState.errors.visitStatusId.message}</p>
          )}
        </div>

        {/* Coordinadores */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Coordinadores</label>
          <Controller control={caseForm.control} name="responsiblePersonIds"
            render={({ field }) => (
              <PersonCombobox multiple value={field.value ?? []} onChange={field.onChange}
                people={peopleList} placeholder="Agregar coordinador..." />
            )}
          />
        </div>

        {/* Notas */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Notas del caso</label>
          <Controller control={caseForm.control} name="notes"
            render={({ field }) => (
              <Textarea {...field} rows={2} placeholder="Observaciones generales del caso..." />
            )}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-5">
          <Button type="button" variant="outline" onClick={() => navigate('/misionero/visitas')}>
            Cancelar
          </Button>
          <Button type="submit"
            disabled={caseForm.formState.isSubmitting || caseMutation.isPending}>
            {caseMutation.isPending ? 'Guardando...' : 'Guardar caso'}
          </Button>
        </div>
      </form>

      {/* ── Historial de intentos (solo cuando editando) ── */}
      {isEditing && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Historial de visitas
              {attempts.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({attempts.length} intento{attempts.length !== 1 ? 's' : ''})
                </span>
              )}
            </p>
            <Button size="sm" variant="outline" onClick={() => setShowAttemptForm((v) => !v)}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Registrar intento
            </Button>
          </div>

          {/* Formulario para nuevo intento */}
          {showAttemptForm && (
            <form
              onSubmit={attemptForm.handleSubmit((v) => attemptMutation.mutate(v))}
              className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-4"
            >
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">Nuevo intento</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Fecha *</label>
                  <Controller control={attemptForm.control} name="attemptDate"
                    render={({ field }) => (
                      <DatePicker value={field.value} onChange={field.onChange} />
                    )}
                  />
                  {attemptForm.formState.errors.attemptDate && (
                    <p className="text-xs text-destructive">{attemptForm.formState.errors.attemptDate.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">¿Qué pasó? *</label>
                  <Controller control={attemptForm.control} name="result"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar resultado" />
                        </SelectTrigger>
                        <SelectContent>
                          {ATTEMPT_RESULTS.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              <span className="flex items-center gap-2">
                                <span className="inline-block h-2 w-2 rounded-full shrink-0"
                                  style={{ backgroundColor: RESULT_COLORS[r.value] }} />
                                {r.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {attemptForm.formState.errors.result && (
                    <p className="text-xs text-destructive">{attemptForm.formState.errors.result.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">¿Quiénes fueron?</label>
                <Controller control={attemptForm.control} name="responsiblePersonIds"
                  render={({ field }) => (
                    <PersonCombobox multiple value={field.value ?? []} onChange={field.onChange}
                      people={peopleList} placeholder="Agregar persona..." />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Notas del intento</label>
                <Controller control={attemptForm.control} name="notes"
                  render={({ field }) => (
                    <Textarea {...field} rows={2} placeholder="¿Qué ocurrió? ¿Cómo respondió?" />
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm"
                  onClick={() => { setShowAttemptForm(false); attemptForm.reset() }}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm"
                  disabled={attemptMutation.isPending}>
                  {attemptMutation.isPending ? 'Guardando...' : 'Guardar intento'}
                </Button>
              </div>
            </form>
          )}

          {/* Lista de intentos */}
          {attempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
              <Clock className="h-6 w-6 opacity-40" />
              <p className="text-sm">Sin intentos registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.map((attempt) => {
                const resultColor = RESULT_COLORS[attempt.result] ?? '#64748B'
                const resultLabel = ATTEMPT_RESULTS.find((r) => r.value === attempt.result)?.label ?? attempt.result
                return (
                  <div key={attempt.id}
                    className="flex gap-3 p-3 rounded-lg border border-border bg-background">
                    {/* Color dot */}
                    <div className="flex flex-col items-center gap-1 pt-0.5">
                      <span className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: resultColor }} />
                      <div className="w-px flex-1 bg-border" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground tabular-nums">
                            {formatShortDate(attempt.attemptDate)}
                          </span>
                          <span
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white shrink-0"
                            style={{ backgroundColor: resultColor }}
                          >
                            {resultLabel}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => deleteAttemptMutation.mutate(attempt.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {attempt.responsiblePersonNames?.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {attempt.responsiblePersonNames.join(', ')}
                        </p>
                      )}
                      {attempt.notes && (
                        <p className="text-sm text-foreground/80">{attempt.notes}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      </div>{/* fin grid */}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar caso de visitación"
        description="Se eliminarán también todos los intentos registrados. ¿Estás seguro?"
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  )
}
