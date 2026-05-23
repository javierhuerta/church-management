import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CreateUserDto, UpdateUserDto } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'
import { UsersService, DepartmentsService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { PersonCombobox } from '@/features/mission/components/person-combobox'
import { usePeopleList } from '@/features/mission/hooks/use-people-list'

const USER_ROLES = [
  { value: 'Admin',                label: 'Administrador' },
  { value: 'Pastor',               label: 'Pastor' },
  { value: 'Anciano',              label: 'Anciano' },
  { value: 'CoordinadorMisionero', label: 'Coordinador Misionero' },
  { value: 'DirectorDepartamento', label: 'Director de Departamento' },
  { value: 'Secretaria',           label: 'Secretaria' },
  { value: 'MaestroClase',         label: 'Maestro de Clase' },
]

const createSchema = z.object({
  name:          z.string().min(1, 'El nombre es requerido'),
  email:         z.string().email('Email inválido'),
  password:      z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role:          z.string().min(1, 'El rol es requerido'),
  departmentIds: z.array(z.string()).optional(),
  personId:      z.string().optional(),
})

const editSchema = z.object({
  name:          z.string().min(1, 'El nombre es requerido'),
  email:         z.string().email('Email inválido'),
  password:      z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
  role:          z.string().min(1, 'El rol es requerido'),
  departmentIds: z.array(z.string()).optional(),
  personId:      z.string().optional(),
})

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues   = z.infer<typeof editSchema>

export function UserFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>([])

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => DepartmentsService.departmentsControllerFindAll(),
  })

  const { data: existingUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['users', id],
    queryFn: () => UsersService.usersControllerFindOne(id!),
    enabled: isEdit,
  })

  // People list for the person selector
  const { data: peopleData } = usePeopleList('')
  const peopleList = (peopleData?.data ?? []).map((p) => ({
    id: p.id,
    label: [p.firstName, p.lastName].filter(Boolean).join(' '),
  }))

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormValues | EditFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(isEdit ? editSchema : createSchema) as Resolver<any>,
    defaultValues: {
      name: '', email: '', password: '', role: '',
      departmentIds: [], personId: '',
    },
  })

  useEffect(() => {
    if (existingUser) {
      const deptIds = existingUser.departments.map((d) => d.id)
      setSelectedDeptIds(deptIds)
      reset({
        name:          existingUser.name,
        email:         existingUser.email,
        password:      '',
        role:          existingUser.role,
        departmentIds: deptIds,
        personId:      existingUser.personId ?? '',
      })
    }
  }, [existingUser, reset])

  const createMutation = useMutation({
    mutationFn: (data: CreateFormValues) =>
      UsersService.usersControllerCreate({
        name:          data.name,
        email:         data.email,
        password:      data.password,
        role:          data.role as CreateUserDto['role'],
        departmentIds: selectedDeptIds,
        personId:      data.personId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuario creado')
      navigate('/mantenedores/usuarios')
    },
    onError: (err: { body?: { message?: string } }) => {
      setServerError(err.body?.message ?? 'Error al crear el usuario')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: EditFormValues) =>
      UsersService.usersControllerUpdate(id!, {
        name:          data.name,
        email:         data.email,
        password:      data.password || undefined,
        role:          data.role as UpdateUserDto['role'],
        departmentIds: selectedDeptIds,
        // empty string → desvincular (null); valor → vincular; undefined → no tocar
        personId:      data.personId === '' ? null : (data.personId || undefined),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', id] })
      toast.success('Usuario actualizado')
      navigate('/mantenedores/usuarios')
    },
    onError: (err: { body?: { message?: string } }) => {
      setServerError(err.body?.message ?? 'Error al actualizar el usuario')
    },
  })

  async function onSubmit(values: CreateFormValues | EditFormValues) {
    setServerError(null)
    if (isEdit) updateMutation.mutate(values as EditFormValues)
    else createMutation.mutate(values as CreateFormValues)
  }

  function toggleDepartment(deptId: string) {
    setSelectedDeptIds((prev) =>
      prev.includes(deptId)
        ? prev.filter((i) => i !== deptId)
        : [...prev, deptId],
    )
  }

  if (isEdit && isLoadingUser) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/mantenedores/usuarios')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">Cargando usuario...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/mantenedores/usuarios')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold text-foreground">
          {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 bg-card rounded-xl border border-border p-6"
      >
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" {...register('name')} placeholder="Nombre completo" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register('email')} placeholder="correo@ejemplo.com" />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        {/* Contraseña */}
        <div className="space-y-2">
          <Label htmlFor="password">
            {isEdit ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
          </Label>
          <Input id="password" type="password" {...register('password')} />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Rol */}
        <div className="space-y-2">
          <Label>Rol *</Label>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
        </div>

        {/* Persona vinculada */}
        <div className="space-y-2">
          <Label>
            Persona vinculada
            <span className="ml-1.5 text-xs text-muted-foreground font-normal">
              (opcional — conecta el usuario con su registro en el módulo misionero)
            </span>
          </Label>
          <Controller
            control={control}
            name="personId"
            render={({ field }) => (
              <PersonCombobox
                value={field.value ?? ''}
                onChange={(v) => field.onChange(v)}
                people={peopleList}
                clearable
                placeholder="Buscar persona por nombre..."
              />
            )}
          />
          {existingUser?.personName && (
            <p className="text-xs text-muted-foreground">
              Vinculado actualmente a: <span className="font-medium">{existingUser.personName}</span>
            </p>
          )}
        </div>

        {/* Departamentos */}
        <div className="space-y-2">
          <Label>Departamentos donde es director</Label>
          {departments.length === 0 ? (
            <p className="text-xs text-muted-foreground">No hay departamentos disponibles.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {departments.map((dept) => {
                const selected = selectedDeptIds.includes(dept.id)
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => toggleDepartment(dept.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                      selected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {dept.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/mantenedores/usuarios')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </div>
      </form>
    </div>
  )
}
