import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from '@/components/theme-provider'
import {
  useMissionaryTeam,
  useCreateMissionaryTeam,
  useUpdateMissionaryTeam,
} from '../hooks/use-missionary-teams'
import { useSabbathClassesActive } from '../hooks/use-sabbath-classes'
import { PersonCombobox } from '../components/person-combobox'
import { MissionPeopleService } from '@/lib/api/services/MissionPeopleService'
import { PeriodsService } from '@/lib/api/services/PeriodsService'
import { MissionSmallGroupsService } from '@/lib/api/services/MissionSmallGroupsService'

const NAVY = '#1B3A6B'

type FormValues = {
  label: string
  periodId: string
  memberIds: string[]
  smallGroupId: string
  sabbathClassId: string
  isActive: boolean
  notes: string
}

export function MissionaryTeamFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const query = useMissionaryTeam(id ?? '')
  const createMutation = useCreateMissionaryTeam()
  const updateMutation = useUpdateMissionaryTeam(id ?? '')

  // Audience type: 'small-group' | 'sabbath-class' | 'none'
  const [audienceType, setAudienceType] = useState<'small-group' | 'sabbath-class' | 'none'>('none')

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      label: '',
      periodId: '',
      memberIds: [],
      smallGroupId: '',
      sabbathClassId: '',
      isActive: true,
      notes: '',
    },
  })

  // Data queries
  const peopleQuery = useQuery({
    queryKey: ['people-all'],
    queryFn: () => MissionPeopleService.missionControllerFindAll(1, 500),
  })

  const periodsQuery = useQuery({
    queryKey: ['periods'],
    queryFn: () => PeriodsService.periodControllerFindAll(),
  })

  const smallGroupsQuery = useQuery({
    queryKey: ['small-groups'],
    queryFn: () => MissionSmallGroupsService.smallGroupControllerFindAll(),
  })

  const sabbathClassesQuery = useSabbathClassesActive()

  useEffect(() => {
    if (query.data) {
      const team = query.data
      const activeMembers = team.members.filter((m) => m.isActive)
      reset({
        label: team.label ?? '',
        periodId: team.periodId,
        memberIds: activeMembers.map((m) => m.personId),
        smallGroupId: team.smallGroupId ?? '',
        sabbathClassId: team.sabbathClassId ?? '',
        isActive: team.isActive,
        notes: team.notes ?? '',
      })
      if (team.smallGroupId) setAudienceType('small-group')
      else if (team.sabbathClassId) setAudienceType('sabbath-class')
      else setAudienceType('none')
    }
  }, [query.data, reset])

  // When audience type changes, clear the other field
  function handleAudienceTypeChange(type: 'small-group' | 'sabbath-class' | 'none') {
    setAudienceType(type)
    if (type !== 'small-group') setValue('smallGroupId', '')
    if (type !== 'sabbath-class') setValue('sabbathClassId', '')
  }

  const people: Array<{ id: string; label: string }> = (() => {
    const data = peopleQuery.data
    if (!data) return []
    const arr = Array.isArray(data) ? data : (data as { data?: unknown[] }).data ?? []
    return (arr as Array<{ id: string; firstName: string; lastName?: string | null }>).map((p) => ({
      id: p.id,
      label: `${p.firstName} ${p.lastName ?? ''}`.trim(),
    }))
  })()

  const periods: Array<{ id: string; year: number }> = Array.isArray(periodsQuery.data)
    ? periodsQuery.data
    : []

  const smallGroups: Array<{ id: string; actionUnit: string; name: string | null }> =
    Array.isArray(smallGroupsQuery.data)
      ? smallGroupsQuery.data.map((g) => ({ id: g.id, actionUnit: g.actionUnit, name: g.name ?? null }))
      : []

  const sabbathClasses = sabbathClassesQuery.data ?? []

  async function onSubmit(values: FormValues) {
    if (values.memberIds.length < 2) {
      toast.error('Se requieren al menos 2 integrantes')
      return
    }

    if (!values.periodId) {
      toast.error('Selecciona un período')
      return
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          label: values.label.trim() || null,
          smallGroupId: audienceType === 'small-group' ? values.smallGroupId || null : null,
          sabbathClassId: audienceType === 'sabbath-class' ? values.sabbathClassId || null : null,
          isActive: values.isActive,
          notes: values.notes.trim() || null,
        })
        toast.success('Equipo actualizado correctamente')
      } else {
        await createMutation.mutateAsync({
          label: values.label.trim() || null,
          periodId: values.periodId,
          smallGroupId: audienceType === 'small-group' ? values.smallGroupId || null : null,
          sabbathClassId: audienceType === 'sabbath-class' ? values.sabbathClassId || null : null,
          isActive: values.isActive,
          notes: values.notes.trim() || null,
          members: values.memberIds.map((personId) => ({ personId })),
        })
        toast.success('Equipo creado correctamente')
      }
      navigate('/misionero/equipos')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el equipo'
      toast.error(msg)
    }
  }

  if (isEdit && query.isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        Cargando...
      </div>
    )
  }

  const memberIds = watch('memberIds')

  return (
    <div className="max-w-lg space-y-6">
      <p className="text-2xl font-bold text-foreground">
        {isEdit ? 'Editar equipo misionero' : 'Nuevo equipo misionero'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Label */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Etiqueta (opcional)</label>
          <input
            {...register('label')}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Ej. Equipo 4"
          />
        </div>

        {/* Period (only on create) */}
        {!isEdit && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Período <span className="text-destructive">*</span>
            </label>
            <select
              {...register('periodId', { required: 'El período es obligatorio' })}
              data-testid="team-period-select"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Seleccionar período...</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.year}
                </option>
              ))}
            </select>
            {errors.periodId && (
              <p className="text-xs text-destructive">{errors.periodId.message}</p>
            )}
          </div>
        )}

        {/* Members (only on create) */}
        {!isEdit && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Integrantes <span className="text-destructive">*</span>
              <span className="text-muted-foreground font-normal ml-1">(mínimo 2)</span>
            </label>
            <Controller
              name="memberIds"
              control={control}
              rules={{ validate: (v) => v.length >= 2 || 'Se requieren al menos 2 integrantes' }}
              render={({ field }) => (
                <PersonCombobox
                  multiple
                  value={field.value}
                  onChange={field.onChange}
                  people={people}
                  placeholder="Buscar integrante..."
                  error={!!errors.memberIds}
                />
              )}
            />
            {errors.memberIds && (
              <p className="text-xs text-destructive">{errors.memberIds.message}</p>
            )}
            {memberIds.length > 0 && memberIds.length < 2 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Agrega al menos 2 integrantes
              </p>
            )}
          </div>
        )}

        {/* Audience type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Audiencia</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'none', label: 'Iglesia (general)' },
              { value: 'small-group', label: 'Grupo pequeño' },
              { value: 'sabbath-class', label: 'Clase ES directa' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleAudienceTypeChange(opt.value as typeof audienceType)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  audienceType === opt.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Small group selector */}
        {audienceType === 'small-group' && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Grupo pequeño</label>
            <select
              {...register('smallGroupId')}
              data-testid="team-small-group-select"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Seleccionar grupo...</option>
              {smallGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name ?? g.actionUnit}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sabbath class selector */}
        {audienceType === 'sabbath-class' && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Clase de Escuela Sabática</label>
            <select
              {...register('sabbathClassId')}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Seleccionar clase...</option>
              {sabbathClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Active */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            {...register('isActive')}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/40"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-foreground">
            Equipo activo
          </label>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Notas</label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            placeholder="Observaciones opcionales..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/misionero/equipos')}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            data-testid="team-save-button"
            style={{
              flex: 1,
              background: isDark ? 'hsl(219,70%,60%)' : NAVY,
              color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
