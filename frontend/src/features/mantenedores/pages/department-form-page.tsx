import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Check, Users } from 'lucide-react'
import { DepartmentsService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

// Brand-aligned palette for department colors
const DEPT_COLOR_PALETTE = [
  '#1B3A6B', // navy (primary)
  '#C9A84C', // gold (accent)
  '#0F766E', // teal
  '#7C3AED', // violet
  '#DC2626', // red
  '#EA580C', // orange
  '#CA8A04', // amber
  '#16A34A', // green
  '#0891B2', // cyan
  '#2563EB', // blue
  '#9333EA', // purple
  '#DB2777', // pink
  '#475569', // slate
  '#92400E', // brown
  '#064E3B', // emerald dark
]

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido'),
  sigla: z.string().max(10, 'Máximo 10 caracteres').optional(),
})

type FormValues = z.infer<typeof formSchema>

export function DepartmentFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: existingDept, isLoading: isLoadingDept } = useQuery({
    queryKey: ['departments', id],
    queryFn: () => DepartmentsService.departmentsControllerFindOne(id!),
    enabled: isEdit,
  })

  const { data: directors = [], isLoading: isLoadingDirectors } = useQuery({
    queryKey: ['departments', id, 'directors'],
    queryFn: () => DepartmentsService.departmentsControllerGetDirectors(id!),
    enabled: isEdit,
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: existingDept
      ? { name: existingDept.name, color: existingDept.color ?? '#1B3A6B', sigla: existingDept.sigla ?? '' }
      : { name: '', color: '#1B3A6B', sigla: '' },
  })

  const selectedColor = watch('color')

  const createMutation = useMutation({
    mutationFn: (data: FormValues) =>
      DepartmentsService.departmentsControllerCreate({ name: data.name, color: data.color, sigla: data.sigla || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.success('Departamento creado')
      navigate('/mantenedores/departamentos')
    },
    onError: (err: { body?: { message?: string } }) => {
      setServerError(err.body?.message ?? 'Error al crear el departamento')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) =>
      DepartmentsService.departmentsControllerUpdate(id!, { name: data.name, color: data.color, sigla: data.sigla || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      queryClient.invalidateQueries({ queryKey: ['departments', id] })
      toast.success('Departamento actualizado')
      navigate('/mantenedores/departamentos')
    },
    onError: (err: { body?: { message?: string } }) => {
      setServerError(err.body?.message ?? 'Error al actualizar el departamento')
    },
  })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    if (isEdit) {
      updateMutation.mutate(values)
    } else {
      createMutation.mutate(values)
    }
  }

  if (isEdit && isLoadingDept) {
    return <div className="text-sm text-muted-foreground">Cargando departamento...</div>
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/mantenedores/departamentos')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold text-muted-foreground">
          {isEdit ? 'Editar departamento' : 'Nuevo departamento'}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} className="space-y-5 bg-card rounded-xl border border-border p-6">
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" {...register('name')} placeholder="Ej: Jóvenes" />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sigla">Sigla</Label>
          <Input
            id="sigla"
            {...register('sigla')}
            placeholder="Ej: JOV"
            maxLength={10}
            className="w-32 uppercase"
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase()
              register('sigla').onChange(e)
            }}
          />
          <p className="text-xs text-muted-foreground">Abreviatura corta que aparece en las tarjetas del calendario (máx. 10 caracteres).</p>
          {errors.sigla && <p className="text-xs text-red-500">{errors.sigla.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {DEPT_COLOR_PALETTE.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => field.onChange(hex)}
                      className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                      style={{
                        backgroundColor: hex,
                        borderColor: field.value === hex ? '#fff' : 'transparent',
                        boxShadow: field.value === hex ? `0 0 0 2px ${hex}` : undefined,
                      }}
                      title={hex}
                    >
                      {field.value === hex && (
                        <Check className="h-3.5 w-3.5 mx-auto" style={{ color: '#fff' }} />
                      )}
                    </button>
                  ))}
                </div>
                {/* Preview + manual hex input */}
                <div className="flex items-center gap-2">
                  <div
                    className="h-7 w-7 rounded-full border border-border shrink-0"
                    style={{ backgroundColor: field.value }}
                  />
                  <Input
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="#1B3A6B"
                    className="font-mono text-xs h-8 w-32"
                    maxLength={7}
                  />
                  {errors.color && <p className="text-xs text-red-500">{errors.color.message}</p>}
                </div>
              </div>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/mantenedores/departamentos')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} style={{ backgroundColor: selectedColor }}>
            {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear departamento'}
          </Button>
        </div>
      </form>

      {isEdit && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground">Directores</h3>
          </div>
          {isLoadingDirectors ? (
            <p className="text-sm text-muted-foreground">Cargando directores...</p>
          ) : directors.length === 0 ? (
            <p className="text-sm text-muted-foreground">Este departamento no tiene directores asignados.</p>
          ) : (
            <ul className="space-y-2">
              {directors.map((d) => (
                <li key={d.id} className="flex items-center gap-2 text-sm">
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {d.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground">
            Los directores se asignan desde la gestión de usuarios.
          </p>
        </div>
      )}
    </div>
  )
}
