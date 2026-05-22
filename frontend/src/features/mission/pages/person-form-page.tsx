import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { MissionPeopleService } from '@/lib/api'
import type { CreatePersonDto } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DatePicker } from '@/components/ui/date-picker'
import { toast } from 'sonner'

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
    </div>
  )
}
