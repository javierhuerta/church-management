import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, BookOpen, Users } from 'lucide-react'
import { toast } from 'sonner'

import { useBibleStudy, useCreateBibleStudy, useUpdateBibleStudy } from '../hooks/use-bible-studies'
import { useBibleCoursesList } from '../hooks/use-bible-courses'
import { usePeopleList } from '../hooks/use-people-list'
import { useMissionaryTeamsList } from '../hooks/use-missionary-teams'
import { hasMissionFullAccess } from '../lib/permissions'
import { BIBLE_STUDY_STATUSES } from '../components/bible-study-status-badge'
import { CreateBibleStudyDto, UpdateBibleStudyDto } from '@/lib/api'

import { Button } from '@/components/ui/button'
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
import { PersonCombobox } from '../components/person-combobox'

// ── Schema ────────────────────────────────────────────────────────────────────

const studySchema = z.object({
  studentId:           z.string().min(1, 'El estudiante es requerido'),
  instructorType:      z.enum(['persona', 'equipo']).default('persona'),
  instructorId:        z.string().optional(),
  instructorTeamId:    z.string().optional(),
  courseId:            z.string().optional(),
  status:              z.enum(['Invitar', 'Estudiando', 'Graduado', 'Bautismo', 'Bautizado']),
  lessonProgress:      z.enum(['NoIniciado', 'EnCurso', 'Completo']).optional(),
  currentLesson:       z.number().int().min(1).optional().nullable(),
  interestedInBaptism: z.boolean(),
  notes:               z.string().optional(),
}).refine(
  (data) => {
    if (data.instructorType === 'persona' && data.instructorTeamId) return false
    if (data.instructorType === 'equipo' && data.instructorId) return false
    return true
  },
  { message: 'El instructor debe ser Persona o Equipo, no ambos', path: ['instructorType'] },
)

type StudyFormValues = z.infer<typeof studySchema>

const STATUS_LABELS: Record<string, string> = {
  Invitar:    'Invitar',
  Estudiando: 'Estudiando',
  Graduado:   'Graduado',
  Bautismo:   'Bautismo',
  Bautizado:  'Bautizado',
}

const LESSON_PROGRESS_LABELS: Record<string, string> = {
  NoIniciado: 'No iniciado',
  EnCurso:    'En curso',
  Completo:   'Completo',
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BibleStudyFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id && id !== 'nuevo'
  const fullAccess = hasMissionFullAccess()

  const { data: existing, isLoading: isLoadingExisting } = useBibleStudy(id ?? '')
  const { data: courses = [] } = useBibleCoursesList()
  const { data: peopleData } = usePeopleList('')
  const { data: teamsData } = useMissionaryTeamsList()

  const createMutation = useCreateBibleStudy()
  const updateMutation = useUpdateBibleStudy(id ?? '')

  const peopleOptions = (peopleData?.data ?? []).map((p) => ({
    id: p.id,
    label: [p.firstName, p.lastName].filter(Boolean).join(' '),
  }))

  const activeTeams = (teamsData?.data ?? []).filter((t) => t.isActive)

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudyFormValues>({
    resolver: zodResolver(studySchema),
    defaultValues: {
      studentId:           '',
      instructorType:      'persona',
      instructorId:        '',
      instructorTeamId:    '',
      courseId:            '',
      status:              'Invitar',
      lessonProgress:      'NoIniciado',
      currentLesson:       null,
      interestedInBaptism: false,
      notes:               '',
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (existing) {
      const hasTeam = !!existing.instructorTeamId
      reset({
        studentId:           existing.studentId,
        instructorType:      hasTeam ? 'equipo' : 'persona',
        instructorId:        existing.instructorId ?? '',
        instructorTeamId:    existing.instructorTeamId ?? '',
        courseId:            existing.courseId ?? '',
        status:              existing.status,
        lessonProgress:      existing.lessonProgress,
        currentLesson:       existing.currentLesson ?? null,
        interestedInBaptism: existing.interestedInBaptism,
        notes:               existing.notes ?? '',
      })
    }
  }, [existing, reset])

  const lessonProgress = watch('lessonProgress')
  const instructorType = watch('instructorType')
  const selectedCourseId = watch('courseId')
  const selectedCourse = courses.find((c) => c.id === selectedCourseId)

  function onSubmit(values: StudyFormValues) {
    const isTeamInstructor = values.instructorType === 'equipo'
    const basePayload = {
      instructorId:        isTeamInstructor ? null : (values.instructorId || null),
      instructorTeamId:    isTeamInstructor ? (values.instructorTeamId || null) : null,
      courseId:            values.courseId || null,
      status:              values.status as CreateBibleStudyDto['status'],
      lessonProgress:      (values.lessonProgress ?? 'NoIniciado') as CreateBibleStudyDto['lessonProgress'],
      currentLesson:       lessonProgress === 'EnCurso' ? (values.currentLesson ?? null) : null,
      interestedInBaptism: values.interestedInBaptism,
      notes:               values.notes?.trim() || null,
    }

    if (isEdit) {
      const updatePayload: UpdateBibleStudyDto = {
        ...basePayload,
        studentId: values.studentId,
        status: values.status as UpdateBibleStudyDto['status'],
        lessonProgress: (values.lessonProgress ?? 'NoIniciado') as UpdateBibleStudyDto['lessonProgress'],
      }
      updateMutation.mutate(updatePayload, {
        onSuccess: () => {
          toast.success('Estudio actualizado correctamente')
          navigate('/misionero/estudios')
        },
        onError: (err: unknown) => {
          const msg = (err as { body?: { message?: string } })?.body?.message ?? 'Error al actualizar el estudio'
          toast.error(msg)
        },
      })
    } else {
      const createPayload: CreateBibleStudyDto = {
        ...basePayload,
        studentId: values.studentId,
        status: values.status as CreateBibleStudyDto['status'],
        lessonProgress: (values.lessonProgress ?? 'NoIniciado') as CreateBibleStudyDto['lessonProgress'],
      }
      createMutation.mutate(createPayload, {
        onSuccess: () => {
          toast.success('Estudio creado correctamente')
          navigate('/misionero/estudios')
        },
        onError: (err: unknown) => {
          const msg = (err as { body?: { message?: string } })?.body?.message ?? 'Error al crear el estudio'
          toast.error(msg)
        },
      })
    }
  }

  if (isEdit && isLoadingExisting) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Cargando estudio...</p>
      </div>
    )
  }

  // Instructor-user: limited fields
  const isInstructorOnly = !fullAccess

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate('/misionero/estudios')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <p className="text-xl font-semibold text-foreground">
            {isEdit ? 'Editar estudio bíblico' : 'Nuevo estudio bíblico'}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl border border-border bg-card p-6 space-y-6"
      >
        {/* Personas */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-foreground border-b border-border pb-2">
            Personas
          </p>

          {/* Student */}
          <div className="space-y-1.5">
            <Label htmlFor="studentId">
              Estudiante {!isInstructorOnly && <span className="text-destructive">*</span>}
            </Label>
            {/* Instructor-only editing: student is read-only */}
            {isInstructorOnly && isEdit ? (
              <div
                data-testid="study-student-select"
                className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
              >
                {peopleOptions.find((p) => p.id === existing?.studentId)?.label ?? '—'}
              </div>
            ) : (
              <div data-testid="study-student-select">
                <Controller
                  control={control}
                  name="studentId"
                  render={({ field }) => (
                    <PersonCombobox
                      value={field.value}
                      onChange={field.onChange}
                      people={peopleOptions}
                      placeholder="Buscar estudiante..."
                      error={!!errors.studentId}
                      clearable
                    />
                  )}
                />
              </div>
            )}
            {errors.studentId && (
              <p className="text-xs text-destructive">{errors.studentId.message}</p>
            )}
          </div>

          {/* Instructor — only full access can assign */}
          {!isInstructorOnly && (
            <div className="space-y-3">
              {/* Instructor type toggle */}
              <div className="space-y-1.5">
                <Label>Tipo de instructor</Label>
                <Controller
                  control={control}
                  name="instructorType"
                  render={({ field }) => (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => field.onChange('persona')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          field.value === 'persona'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-muted-foreground border-border hover:border-primary/40'
                        }`}
                      >
                        Persona
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange('equipo')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          field.value === 'equipo'
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-muted-foreground border-border hover:border-primary/40'
                        }`}
                      >
                        <Users className="h-3.5 w-3.5" />
                        Equipo misionero
                      </button>
                    </div>
                  )}
                />
              </div>

              {/* Instructor persona */}
              {instructorType === 'persona' && (
                <div className="space-y-1.5">
                  <Label htmlFor="instructorId">Instructor (Persona)</Label>
                  <div data-testid="study-instructor-select">
                    <Controller
                      control={control}
                      name="instructorId"
                      render={({ field }) => (
                        <PersonCombobox
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          people={peopleOptions}
                          placeholder="Buscar instructor..."
                          clearable
                        />
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Instructor equipo */}
              {instructorType === 'equipo' && (
                <div className="space-y-1.5">
                  <Label>Equipo instructor</Label>
                  <Controller
                    control={control}
                    name="instructorTeamId"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ''}
                        onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                      >
                        <SelectTrigger data-testid="study-instructor-team-select">
                          <SelectValue placeholder="Seleccionar equipo..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Sin equipo asignado</SelectItem>
                          {activeTeams.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.label ? `${t.label} — ` : ''}{t.audience}
                              {` (${t.activeMemberCount} miembro${t.activeMemberCount !== 1 ? 's' : ''})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {activeTeams.length === 0 && (
                    <p className="text-xs text-muted-foreground">No hay equipos misioneros activos disponibles.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Curso */}
        {!isInstructorOnly && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground border-b border-border pb-2">
              Curso bíblico
            </p>
            <div className="space-y-1.5">
              <Label>Curso</Label>
              <Controller
                control={control}
                name="courseId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                  >
                    <SelectTrigger data-testid="study-course-select">
                      <SelectValue placeholder="Sin curso asignado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Sin curso</SelectItem>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                          {c.audience ? ` (${c.audience})` : ''}
                          {` — ${c.lessonCount} lecciones`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        )}

        {/* Estado y progreso */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-foreground border-b border-border pb-2">
            Estado y progreso
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status — full access can change all; instructor-user can change all */}
            <div className="space-y-1.5">
              <Label>Estado misionero <span className="text-destructive">*</span></Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger data-testid="study-status-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BIBLE_STUDY_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Lesson progress */}
            <div className="space-y-1.5">
              <Label>Progreso de lección</Label>
              <Controller
                control={control}
                name="lessonProgress"
                render={({ field }) => (
                  <Select value={field.value ?? 'NoIniciado'} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LESSON_PROGRESS_LABELS).map(([val, label]) => (
                        <SelectItem key={val} value={val}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Current lesson — only when EnCurso */}
          {lessonProgress === 'EnCurso' && (
            <div className="space-y-1.5">
              <Label htmlFor="currentLesson">
                Lección actual
                {selectedCourse && (
                  <span className="text-muted-foreground font-normal ml-1">
                    (máx. {selectedCourse.lessonCount})
                  </span>
                )}
              </Label>
              <Input
                id="currentLesson"
                type="number"
                min={1}
                max={selectedCourse?.lessonCount ?? undefined}
                data-testid="study-lesson-input"
                {...register('currentLesson', {
                  valueAsNumber: true,
                  min: { value: 1, message: 'Mínimo 1' },
                  ...(selectedCourse
                    ? { max: { value: selectedCourse.lessonCount, message: `Máximo ${selectedCourse.lessonCount}` } }
                    : {}),
                })}
                className="max-w-[120px]"
              />
              {errors.currentLesson && (
                <p className="text-xs text-destructive">{errors.currentLesson.message}</p>
              )}
            </div>
          )}

          {/* Interested in baptism */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="interestedInBaptism">Interesado en bautismo</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Marcar si la persona ha expresado interés en bautizarse
              </p>
            </div>
            <Controller
              control={control}
              name="interestedInBaptism"
              render={({ field }) => (
                <Switch
                  id="interestedInBaptism"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-foreground border-b border-border pb-2">
            Notas
          </p>
          <Textarea
            placeholder="Observaciones sobre el estudio, progreso, necesidades especiales..."
            rows={3}
            {...register('notes')}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-border pt-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/misionero/estudios')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            data-testid="study-save-button"
            disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
          >
            {(createMutation.isPending || updateMutation.isPending) ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </div>
  )
}
