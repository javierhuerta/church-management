import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '@/components/theme-provider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UsersService } from '@/lib/api/services/UsersService'
import { useCreateSmallGroup, useUpdateSmallGroup, useSmallGroup } from '../hooks/use-small-groups'
import { hasMissionFullAccess } from '../lib/permissions'
import { PersonCombobox } from '../components/person-combobox'
import { usePeopleList } from '../hooks/use-people-list'
import type { SmallGroupLeaderInputDto } from '@/lib/api/models/SmallGroupLeaderInputDto'
import type { CreateSmallGroupDto } from '@/lib/api/models/CreateSmallGroupDto'

const NAVY = '#1B3A6B'

const MEETING_DAYS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']
const MEETING_MODES = ['Presencial', 'Online', 'Mixto']

const leaderSchema = z.object({
  leaderUserId: z.string().optional(),
  leaderPersonId: z.string().optional(),
}).refine(
  (v) => !!(v.leaderUserId) || !!(v.leaderPersonId),
  { message: 'Selecciona un usuario o una persona para este líder' },
).refine(
  (v) => !(v.leaderUserId && v.leaderPersonId),
  { message: 'No puede seleccionar usuario y persona al mismo tiempo' },
)

const groupSchema = z.object({
  actionUnit: z.string().min(1, 'La unidad de acción es requerida'),
  name: z.string().optional(),
  promoterPersonId: z.string().optional(),
  meetingDay: z.string().optional(),
  meetingTime: z.string().optional(),
  meetingMode: z.string().optional(),
  meetingPlace: z.string().optional(),
  contactPhone: z.string().optional(),
  isActive: z.boolean(),
  notes: z.string().optional(),
  leaders: z.array(leaderSchema),
})

type GroupFormValues = z.infer<typeof groupSchema>

// ─── LeaderRow ────────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
  MaestroClase:         'Maestro de clase',
  Admin:                'Administrador',
  Pastor:               'Pastor',
  Anciano:              'Anciano',
  CoordinadorMisionero: 'Coordinador misionero',
  DirectorDepartamento: 'Director de departamento',
  Secretaria:           'Secretaria',
}

interface LeaderRowProps {
  idx: number
  control: Control<GroupFormValues>
  errors: FieldErrors<GroupFormValues>
  users: Array<{ id: string; name: string; email: string; role: string }>
  peopleList: Array<{ id: string; label: string }>
  readOnly: boolean
  onRemove: () => void
}

function LeaderRow({ idx, control, errors, users, peopleList, readOnly, onRemove }: LeaderRowProps) {
  const leaderUserId   = useWatch({ control, name: `leaders.${idx}.leaderUserId` })
  const leaderPersonId = useWatch({ control, name: `leaders.${idx}.leaderPersonId` })

  // Tab mode is independent from field values: clicking a tab changes the view
  // without requiring the field to already have a value.
  // Syncs from form data when reset() populates the fields (e.g. on edit load).
  const [tabMode, setTabMode] = useState<'user' | 'person'>(
    leaderUserId ? 'user' : 'person'
  )

  useEffect(() => {
    if (leaderUserId) setTabMode('user')
    else if (leaderPersonId) setTabMode('person')
  }, [leaderUserId, leaderPersonId])

  return (
    <div className="rounded-lg border border-border p-3 space-y-3">
      {/* Toggle user / person */}
      <div className="flex items-center gap-2">
        <div className="flex bg-muted rounded-lg p-0.5 text-xs font-medium gap-0.5">
          <Controller
            control={control}
            name={`leaders.${idx}.leaderUserId`}
            render={({ field: fUser }) => (
              <Controller
                control={control}
                name={`leaders.${idx}.leaderPersonId`}
                render={({ field: fPerson }) => (
                  <>
                    <button
                      type="button"
                      disabled={readOnly}
                      onClick={() => {
                        setTabMode('user')
                        fPerson.onChange(undefined)
                      }}
                      className={`px-3 py-1 rounded-md transition-all ${
                        tabMode === 'user'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Usuario (con login)
                    </button>
                    <button
                      type="button"
                      disabled={readOnly}
                      onClick={() => {
                        setTabMode('person')
                        fUser.onChange(undefined)
                      }}
                      className={`px-3 py-1 rounded-md transition-all ${
                        tabMode === 'person'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Persona (sin login)
                    </button>
                  </>
                )}
              />
            )}
          />
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-auto p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            title="Quitar líder"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Selector según modo */}
      {tabMode === 'user' ? (
        <Controller
          control={control}
          name={`leaders.${idx}.leaderUserId`}
          render={({ field: f }) => (
            <Select
              value={f.value ?? '__none__'}
              onValueChange={(v) => f.onChange(v === '__none__' ? undefined : v)}
              disabled={readOnly}
              data-testid="group-leader-select"
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar usuario líder..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Sin usuario —</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                    {ROLE_LABEL[u.role] ? (
                      <span className="text-muted-foreground ml-1 text-xs">
                        · {ROLE_LABEL[u.role]}
                      </span>
                    ) : null}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      ) : (
        <Controller
          control={control}
          name={`leaders.${idx}.leaderPersonId`}
          render={({ field: f }) => (
            <PersonCombobox
              value={f.value ?? ''}
              onChange={(v) => f.onChange(v || undefined)}
              people={peopleList}
              clearable
              placeholder="Buscar persona líder..."
            />
          )}
        />
      )}

      {/* Validation error */}
      {(errors.leaders?.[idx] as { message?: string } | undefined)?.message && (
        <p className="text-xs text-destructive">
          {(errors.leaders?.[idx] as { message?: string }).message}
        </p>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SmallGroupFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const fullAccess = hasMissionFullAccess()

  const { data: existing, isLoading: loadingGroup } = useSmallGroup(id ?? '')

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => UsersService.usersControllerFindAll(),
  })

  const { data: peopleData } = usePeopleList('')
  const peopleList = (peopleData?.data ?? []).map((p) => ({
    id: p.id,
    label: [p.firstName, p.lastName].filter(Boolean).join(' '),
  }))

  const createMutation = useCreateSmallGroup()
  const updateMutation = useUpdateSmallGroup(id ?? '')

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      actionUnit: '',
      name: '',
      promoterPersonId: '',
      meetingDay: '',
      meetingTime: '',
      meetingMode: '',
      meetingPlace: '',
      contactPhone: '',
      isActive: true,
      notes: '',
      leaders: [],
    },
  })

  const { fields: leaderFields, append: appendLeader, remove: removeLeader } =
    useFieldArray({ control, name: 'leaders' })

  useEffect(() => {
    if (existing) {
      reset({
        actionUnit: existing.actionUnit,
        name: existing.name ?? '',
        promoterPersonId: existing.promoterPersonId ?? '',
        meetingDay: existing.meetingDay ?? '',
        meetingTime: existing.meetingTime ?? '',
        meetingMode: existing.meetingMode ?? '',
        meetingPlace: existing.meetingPlace ?? '',
        contactPhone: existing.contactPhone ?? '',
        isActive: existing.isActive,
        notes: existing.notes ?? '',
        leaders: existing.leaders.map((l) => ({
          leaderUserId: l.leaderUserId ?? undefined,
          leaderPersonId: l.leaderPersonId ?? undefined,
        })),
      })
    }
  }, [existing, reset])

  async function onSubmit(values: GroupFormValues) {
    const leaders: SmallGroupLeaderInputDto[] = values.leaders
      .filter((l) => l.leaderUserId || l.leaderPersonId)
      .map((l) => ({
        leaderUserId: l.leaderUserId || undefined,
        leaderPersonId: l.leaderPersonId || undefined,
      }))

    const payload = {
      actionUnit: values.actionUnit,
      name: values.name || undefined,
      promoterPersonId: values.promoterPersonId || undefined,
      meetingDay: (values.meetingDay || undefined) as CreateSmallGroupDto.meetingDay | undefined,
      meetingTime: values.meetingTime || undefined,
      meetingMode: (values.meetingMode || undefined) as CreateSmallGroupDto.meetingMode | undefined,
      meetingPlace: values.meetingPlace || undefined,
      contactPhone: values.contactPhone || undefined,
      isActive: values.isActive,
      notes: values.notes || undefined,
      leaders,
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload)
        toast.success('Grupo actualizado correctamente')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Grupo creado correctamente')
      }
      navigate('/misionero/grupos')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el grupo'
      toast.error(msg)
    }
  }

  if (isEdit && loadingGroup) {
    return <p className="text-muted-foreground text-sm">Cargando grupo...</p>
  }

  const isSaving = isSubmitting || createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <p className="text-2xl font-bold text-foreground">
          {isEdit ? 'Editar grupo pequeño' : 'Nuevo grupo pequeño'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Identidad */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Identidad
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="actionUnit">Unidad de acción *</Label>
              <Input
                id="actionUnit"
                data-testid="group-actionUnit-input"
                placeholder="Clase 4"
                {...register('actionUnit')}
              />
              {errors.actionUnit && (
                <p className="text-xs text-destructive">{errors.actionUnit.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre del grupo</Label>
              <Input
                id="name"
                data-testid="group-name-input"
                placeholder="Bereanos"
                {...register('name')}
              />
            </div>
          </div>
        </div>

        {/* Líderes */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Líderes
            </p>
            {fullAccess && (
              <button
                type="button"
                onClick={() => appendLeader({ leaderUserId: undefined, leaderPersonId: undefined })}
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Agregar líder
              </button>
            )}
          </div>

          {leaderFields.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin líderes asignados.</p>
          )}

          {leaderFields.map((field, idx) => (
            <LeaderRow
              key={field.id}
              idx={idx}
              control={control}
              errors={errors}
              users={users}
              peopleList={peopleList}
              readOnly={!fullAccess}
              onRemove={() => removeLeader(idx)}
            />
          ))}
        </div>

        {/* Promotor */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Promotor misionero
          </p>
          <div className="space-y-1.5">
            <Label>Persona promotora (opcional)</Label>
            <Controller
              control={control}
              name="promoterPersonId"
              render={({ field }) => (
                <PersonCombobox
                  value={field.value ?? ''}
                  onChange={(v) => field.onChange(v)}
                  people={peopleList}
                  clearable
                  placeholder="Buscar persona..."
                />
              )}
            />
          </div>
        </div>

        {/* Reunión */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Datos de reunión
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Día de reunión</Label>
              <Controller
                control={control}
                name="meetingDay"
                render={({ field }) => (
                  <Select
                    value={field.value || '__none__'}
                    onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                    data-testid="group-meetingDay-select"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar día" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Sin día —</SelectItem>
                      {MEETING_DAYS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meetingTime">Horario</Label>
              <Input
                id="meetingTime"
                data-testid="group-meetingTime-input"
                placeholder="19:00 hrs"
                {...register('meetingTime')}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Modalidad</Label>
              <Controller
                control={control}
                name="meetingMode"
                render={({ field }) => (
                  <Select
                    value={field.value || '__none__'}
                    onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar modalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Sin modalidad —</SelectItem>
                      {MEETING_MODES.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meetingPlace">Lugar</Label>
              <Input
                id="meetingPlace"
                placeholder="Templo"
                {...register('meetingPlace')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactPhone">Teléfono de contacto</Label>
              <Input
                id="contactPhone"
                placeholder="+56 9 1234 5678"
                {...register('contactPhone')}
              />
            </div>
          </div>
        </div>

        {/* Estado y notas */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Estado y notas
          </p>
          <div className="flex items-center gap-3">
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="isActive"
                />
              )}
            />
            <Label htmlFor="isActive">Grupo activo</Label>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Observaciones adicionales..."
              {...register('notes')}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            data-testid="group-save-button"
            disabled={isSaving}
            style={{
              background: isDark ? 'hsl(219,70%,60%)' : NAVY,
              color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA',
              border: 'none',
              borderRadius: 8,
              padding: '8px 20px',
              fontSize: 14,
              fontWeight: 600,
              opacity: isSaving ? 0.7 : 1,
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
