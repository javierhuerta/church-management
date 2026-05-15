import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Users } from 'lucide-react'
import { DepartmentsService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
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
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: existingDept ? { name: existingDept.name } : { name: '' },
  })

  const createMutation = useMutation({
    mutationFn: (data: FormValues) =>
      DepartmentsService.departmentsControllerCreate({ name: data.name }),
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
      DepartmentsService.departmentsControllerUpdate(id!, { name: data.name }),
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
    return <div className="text-sm text-neutral-500">Cargando departamento...</div>
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
        <h2 className="text-lg font-semibold text-neutral-900">
          {isEdit ? 'Editar departamento' : 'Nuevo departamento'}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white rounded-xl border border-neutral-200 p-6">
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

        <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/mantenedores/departamentos')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear departamento'}
          </Button>
        </div>
      </form>

      {isEdit && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-neutral-400" />
            <h3 className="text-sm font-semibold text-neutral-700">Directores</h3>
          </div>
          {isLoadingDirectors ? (
            <p className="text-sm text-neutral-400">Cargando directores...</p>
          ) : directors.length === 0 ? (
            <p className="text-sm text-neutral-400">Este departamento no tiene directores asignados.</p>
          ) : (
            <ul className="space-y-2">
              {directors.map((d) => (
                <li key={d.id} className="flex items-center gap-2 text-sm">
                  <div className="h-7 w-7 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-600">
                    {d.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">{d.name}</p>
                    <p className="text-xs text-neutral-500">{d.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-neutral-400">
            Los directores se asignan desde la gestión de usuarios.
          </p>
        </div>
      )}
    </div>
  )
}
