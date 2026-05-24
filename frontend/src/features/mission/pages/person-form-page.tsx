import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Clock, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MissionPeopleService } from '@/lib/api'
import type { CreatePersonDto } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DatePicker } from '@/components/ui/date-picker'
import { toast } from 'sonner'
import { VisitStatusBadge } from '../components/visit-status-badge'
import { BibleStudyStatusBadge } from '../components/bible-study-status-badge'
import { useBibleStudiesByStudent } from '../hooks/use-bible-studies'

const personSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().optional(),
  isBaptizedMember: z.boolean(),
  notes: z.string().optional(),
})

type PersonFormValues = z.infer<typeof personSchema>

export function PersonFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: existingPerson, isLoading: isLoadingPerson } = useQuery({
    queryKey: ['mission-people', id],
    queryFn: () => MissionPeopleService.missionControllerFindOne(id!),
    enabled: isEdit,
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PersonFormValues>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      birthDate: '',
      isBaptizedMember: false,
      notes: '',
    },
  })

  useEffect(() => {
    if (existingPerson) {
      reset({
        firstName: existingPerson.firstName,
        lastName: existingPerson.lastName ?? '',
        phone: existingPerson.phone ?? '',
        address: existingPerson.address ?? '',
        birthDate: existingPerson.birthDate ?? '',
        isBaptizedMember: existingPerson.isBaptizedMember,
        notes: existingPerson.notes ?? '',
      })
    }
  }, [existingPerson, reset])

  const mutation = useMutation({
    mutationFn: (values: PersonFormValues) => {
      const payload: CreatePersonDto = {
        firstName: values.firstName,
        lastName: values.lastName?.trim() || null,
        phone: values.phone?.trim() || null,
        address: values.address?.trim() || null,
        birthDate: values.birthDate?.trim() || null,
        isBaptizedMember: values.isBaptizedMember,
        notes: values.notes?.trim() || null,
      }
      return isEdit
        ? MissionPeopleService.missionControllerUpdate(id!, payload)
        : MissionPeopleService.missionControllerCreate(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-people'] })
      toast.success(isEdit ? 'Persona actualizada' : 'Persona registrada')
      navigate('/misionero/personas')
    },
    onError: (err: { body?: { message?: string } }) => {
      toast.error(err.body?.message ?? 'Error al guardar la persona')
    },
  })

  if (isEdit && isLoadingPerson) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Cargando persona...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate('/misionero/personas')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <p className="text-xl font-semibold text-foreground">
          {isEdit ? 'Editar persona' : 'Nueva persona'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="rounded-xl border border-border bg-card p-6 space-y-5"
      >
        {/* Datos de contacto */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-foreground">
            Datos de contacto
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="firstName">Nombre *</Label>
            <Input
              id="firstName"
              data-testid="person-firstName-input"
              {...register('firstName')}
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              id="lastName"
              data-testid="person-lastName-input"
              {...register('lastName')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              data-testid="person-phone-input"
              {...register('phone')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Domicilio</Label>
            <Input
              id="address"
              data-testid="person-address-input"
              {...register('address')}
            />
          </div>
        </div>

        {/* Datos personales */}
        <div className="space-y-4 border-t border-border pt-5">
          <p className="text-sm font-semibold text-foreground">
            Datos personales
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="birthDate">Fecha de nacimiento</Label>
            <Controller
              control={control}
              name="birthDate"
              render={({ field }) => (
                <DatePicker
                  id="birthDate"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Seleccionar fecha"
                />
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isBaptizedMember">Miembro bautizado</Label>
            <Controller
              control={control}
              name="isBaptizedMember"
              render={({ field }) => (
                <Switch
                  id="isBaptizedMember"
                  data-testid="person-isBaptizedMember-switch"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        {/* Notas */}
        <div className="space-y-4 border-t border-border pt-5">
          <p className="text-sm font-semibold text-foreground">Notas</p>
          <Textarea
            data-testid="person-notes-input"
            placeholder="Observaciones generales..."
            rows={3}
            {...register('notes')}
          />
        </div>

        {/* Equipo misionero */}
        {isEdit && (existingPerson as { missionaryTeam?: { id: string; label: string | null; periodYear: number; audience: string; isActive: boolean } | null } | undefined)?.missionaryTeam !== undefined && (
          <div className="space-y-3 border-t border-border pt-5">
            <p className="text-sm font-semibold text-foreground">Equipo misionero</p>
            {(existingPerson as { missionaryTeam?: { id: string; label: string | null; periodYear: number; audience: string; isActive: boolean } | null })?.missionaryTeam ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {(existingPerson as { missionaryTeam?: { id: string; label: string | null; periodYear: number; audience: string; isActive: boolean } | null })?.missionaryTeam?.label ?? 'Equipo misionero'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(existingPerson as { missionaryTeam?: { id: string; label: string | null; periodYear: number; audience: string; isActive: boolean } | null })?.missionaryTeam?.audience} · Período {(existingPerson as { missionaryTeam?: { id: string; label: string | null; periodYear: number; audience: string; isActive: boolean } | null })?.missionaryTeam?.periodYear}
                  </p>
                </div>
                <a
                  href={`/misionero/equipos/${(existingPerson as { missionaryTeam?: { id: string; label: string | null; periodYear: number; audience: string; isActive: boolean } | null })?.missionaryTeam?.id}`}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Ver equipo
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No pertenece a ningún equipo misionero activo</p>
            )}
          </div>
        )}

        {/* Historial de visitas */}
        {existingPerson?.visitHistory && existingPerson.visitHistory.length > 0 && (
          <div className="space-y-4 border-t border-border pt-5" data-testid="person-visit-history">
            <p className="text-sm font-semibold text-foreground">Historial de visitas</p>
            <div className="space-y-3">
              {existingPerson.visitHistory.map((visit) => (
                <div key={visit.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <Clock className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground">
                        {visit.completedDate ?? visit.scheduledDate ?? '—'}
                      </p>
                      <VisitStatusBadge name={visit.responsibleUserName ?? '—'} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {visit.responsibleUserName ?? visit.responsibleText ?? '—'}
                    </p>
                    {visit.outcome && (
                      <p className="text-sm text-muted-foreground mt-1">{visit.outcome}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border pt-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/misionero/personas')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            data-testid="person-save-button"
            disabled={isSubmitting || mutation.isPending}
          >
            {mutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>

      {/* Estudios bíblicos */}
      {isEdit && <PersonBibleStudiesSection personId={id!} />}
    </div>
  )
}

function PersonBibleStudiesSection({ personId }: { personId: string }) {
  const { data: studies = [], isLoading } = useBibleStudiesByStudent(personId)

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 space-y-3 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="h-16 bg-muted rounded" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4" data-testid="person-bible-studies">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Estudios bíblicos</p>
        </div>
        <Link
          to={`/misionero/estudios/nuevo`}
          className="text-xs font-semibold text-primary hover:underline"
        >
          + Nuevo estudio
        </Link>
      </div>

      {studies.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          Esta persona no tiene estudios bíblicos registrados.
        </p>
      ) : (
        <div className="space-y-3">
          {studies.map((study) => (
            <div
              key={study.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border"
            >
              <BookOpen className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <BibleStudyStatusBadge status={study.status} />
                  {study.course && (
                    <p className="text-xs font-medium text-foreground">{study.course.name}</p>
                  )}
                  {study.interestedInBaptism && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                      Interesado en bautismo
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {study.instructor && (
                    <span>
                      Instructor: {[study.instructor.firstName, study.instructor.lastName].filter(Boolean).join(' ')}
                    </span>
                  )}
                  {study.lessonProgress === 'EnCurso' && study.currentLesson != null && (
                    <span>Lección {study.currentLesson}</span>
                  )}
                  {study.lessonProgress === 'Completo' && (
                    <span className="text-emerald-600 dark:text-emerald-400">Completado</span>
                  )}
                </div>
                {study.notes && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{study.notes}</p>
                )}
              </div>
              <Link
                to={`/misionero/estudios/${study.id}`}
                className="text-xs font-semibold text-primary hover:underline shrink-0"
              >
                Editar
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
