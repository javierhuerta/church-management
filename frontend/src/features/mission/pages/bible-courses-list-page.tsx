import { useState } from 'react'
import { Plus, BookMarked, Edit, Trash2, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { useTheme } from '@/components/theme-provider'
import {
  useBibleCoursesList,
  useCreateBibleCourse,
  useUpdateBibleCourse,
  useDeleteBibleCourse,
} from '../hooks/use-bible-courses'
import { hasMissionFullAccess } from '../lib/permissions'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { BibleCourseResponseDto } from '@/lib/api/models/BibleCourseResponseDto'
import type { CreateBibleCourseDto } from '@/lib/api/models/CreateBibleCourseDto'

const NAVY = '#1B3A6B'

const AUDIENCE_OPTIONS = [
  { value: '', label: 'Sin audiencia' },
  { value: 'Adultos', label: 'Adultos' },
  { value: 'Niños', label: 'Niños' },
  { value: 'Jóvenes', label: 'Jóvenes' },
  { value: 'Familia', label: 'Familia' },
]

type CourseFormValues = {
  name: string
  lessonCount: number
  audience: string
}

function CourseForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
}: {
  defaultValues?: Partial<CourseFormValues>
  onSubmit: (data: CourseFormValues) => void
  onCancel: () => void
  isPending: boolean
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<CourseFormValues>({
    defaultValues: {
      name: defaultValues?.name ?? '',
      lessonCount: defaultValues?.lessonCount ?? 1,
      audience: defaultValues?.audience ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
            Nombre *
          </label>
          <input
            {...register('name', { required: 'El nombre es requerido' })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Fe de Jesús"
            data-testid="course-name-input"
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
            Lecciones *
          </label>
          <input
            type="number"
            min={1}
            {...register('lessonCount', {
              required: 'Requerido',
              min: { value: 1, message: 'Mínimo 1' },
              valueAsNumber: true,
            })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            data-testid="course-lessons-input"
          />
          {errors.lessonCount && (
            <p className="text-xs text-destructive mt-1">{errors.lessonCount.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
            Audiencia
          </label>
          <select
            {...register('audience')}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {AUDIENCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          data-testid="course-save-button"
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          <Check className="h-3.5 w-3.5" />
          {isPending ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

export function BibleCoursesListPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const fullAccess = hasMissionFullAccess()

  const query = useBibleCoursesList()
  const createMutation = useCreateBibleCourse()
  const deleteMutation = useDeleteBibleCourse()

  const [showNewForm, setShowNewForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<BibleCourseResponseDto | null>(null)

  const courses = query.data ?? []

  function handleCreate(data: CourseFormValues) {
    const dto: CreateBibleCourseDto = {
      name: data.name,
      lessonCount: data.lessonCount,
      ...(data.audience ? { audience: data.audience as CreateBibleCourseDto['audience'] } : {}),
    }
    createMutation.mutate(dto, {
      onSuccess: () => {
        toast.success('Curso creado correctamente')
        setShowNewForm(false)
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'No se pudo crear el curso'
        toast.error(msg)
      },
    })
  }

  function handleDeleteConfirm() {
    if (!toDelete) return
    deleteMutation.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success('Curso eliminado correctamente')
        setToDelete(null)
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'No se pudo eliminar el curso'
        toast.error(msg)
        setToDelete(null)
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-2xl font-bold text-foreground">Cursos bíblicos</p>
          {!query.isLoading && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {courses.length} curso{courses.length !== 1 ? 's' : ''} configurado{courses.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {fullAccess && !showNewForm && (
          <button
            onClick={() => setShowNewForm(true)}
            data-testid="course-new-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: isDark ? 'hsl(219,70%,60%)' : NAVY,
              color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus className="h-4 w-4" />
            Nuevo curso
          </button>
        )}
      </div>

      {/* New course form */}
      {showNewForm && fullAccess && (
        <div className="rounded-xl border border-primary/30 bg-card p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Nuevo curso bíblico</p>
          <CourseForm
            onSubmit={handleCreate}
            onCancel={() => setShowNewForm(false)}
            isPending={createMutation.isPending}
          />
        </div>
      )}

      {/* Loading */}
      {query.isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 bg-muted rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-1/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!query.isLoading && courses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div
            className="flex items-center justify-center rounded-full p-5"
            style={{ background: isDark ? 'hsl(219,70%,60%,0.1)' : '#1B3A6B0D' }}
          >
            <BookMarked
              className="h-10 w-10"
              style={{ color: isDark ? 'hsl(219,70%,60%)' : NAVY, opacity: 0.5 }}
            />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-foreground">No hay cursos bíblicos</p>
            <p className="text-sm text-muted-foreground">
              Crea el primer curso para comenzar.
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!query.isLoading && courses.length > 0 && (
        <div
          className="rounded-xl border border-border bg-card overflow-hidden"
          data-testid="course-list"
        >
          {/* Desktop header */}
          <div className="hidden md:grid md:grid-cols-[1fr_8rem_8rem_5rem] gap-4 px-5 py-3 border-b border-border bg-muted/40">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Curso</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Audiencia</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Lecciones</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Acciones</p>
          </div>

          {courses.map((course) => (
            <div key={course.id}>
              {editingId === course.id && fullAccess ? (
                <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
                  <EditCourseRow
                    course={course}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div className="flex flex-col md:grid md:grid-cols-[1fr_8rem_8rem_5rem] gap-2 md:gap-4 px-5 py-4 items-start md:items-center border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors">
                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-lg h-8 w-8 shrink-0"
                      style={{ background: isDark ? 'hsl(219,70%,60%,0.12)' : '#1B3A6B12' }}
                    >
                      <BookMarked
                        className="h-4 w-4"
                        style={{ color: isDark ? 'hsl(219,70%,65%)' : NAVY }}
                      />
                    </div>
                    <p className="text-sm font-semibold text-foreground">{course.name}</p>
                  </div>

                  {/* Audience */}
                  <div className="flex items-center gap-2 md:justify-center">
                    <span className="md:hidden text-xs text-muted-foreground">Audiencia:</span>
                    <p className="text-sm text-muted-foreground">
                      {course.audience ?? <span className="italic text-muted-foreground/60">—</span>}
                    </p>
                  </div>

                  {/* Lesson count */}
                  <div className="flex items-center gap-2 md:justify-center">
                    <span className="md:hidden text-xs text-muted-foreground">Lecciones:</span>
                    <p className="text-sm font-medium text-foreground">{course.lessonCount}</p>
                  </div>

                  {/* Actions */}
                  {fullAccess && (
                    <div className="flex items-center gap-1 md:justify-end">
                      <button
                        onClick={() => setEditingId(course.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setToDelete(course)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => { if (!o) setToDelete(null) }}
        title="¿Eliminar curso bíblico?"
        description={`Se eliminará "${toDelete?.name}". Esta acción no se puede deshacer.`}
        confirmLabel={deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

function EditCourseRow({
  course,
  onCancel,
}: {
  course: BibleCourseResponseDto
  onCancel: () => void
}) {
  const updateMutation = useUpdateBibleCourse(course.id)

  function handleSubmit(data: CourseFormValues) {
    updateMutation.mutate(
      {
        name: data.name,
        lessonCount: data.lessonCount,
        ...(data.audience ? { audience: data.audience as CreateBibleCourseDto['audience'] } : {}),
      },
      {
        onSuccess: () => {
          toast.success('Curso actualizado correctamente')
          onCancel()
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : 'No se pudo actualizar el curso'
          toast.error(msg)
        },
      },
    )
  }

  return (
    <CourseForm
      defaultValues={{
        name: course.name,
        lessonCount: course.lessonCount,
        audience: course.audience ?? '',
      }}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isPending={updateMutation.isPending}
    />
  )
}


