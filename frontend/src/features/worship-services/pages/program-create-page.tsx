import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthUser } from '@/features/calendar/hooks/use-auth-user'
import { useTemplates, type ServiceTemplateType } from '../hooks/use-worship-services'
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
import { WorshipServicesProgramsService } from '@/lib/api'

const formSchema = z.object({
  templateId: z.string().min(1, 'Selecciona una plantilla'),
  date: z.string().min(1, 'La fecha es requerida'),
})

type FormValues = z.infer<typeof formSchema>

export function ProgramCreatePage() {
  const navigate = useNavigate()
  const user = useAuthUser()
  const canCreate = ['Admin', 'Pastor', 'Anciano', 'DirectorDepartamento'].includes(user?.role || '')
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: templates, isLoading } = useTemplates()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateId: '',
      date: '',
    },
  })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    setIsSubmitting(true)

    try {
      const program = await WorshipServicesProgramsService.programControllerCreate(values)
      navigate(`/cultos/programas/${program.id}`)
    } catch (err) {
      setServerError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
        <h2 className="text-xl font-semibold text-neutral-900">Acceso restringido</h2>
        <p className="text-sm text-neutral-500 mt-1">
          No tienes permisos para crear programas.
        </p>
      </div>
    )
  }

  const templateTypeLabels: Record<ServiceTemplateType, string> = {
    CULTO_SABATICO: 'Culto Sabático',
    CULTO_JA: 'Culto JA',
    CULTO_ORACION: 'Culto de Oración',
    OTRO: 'Otro',
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </Button>

      <div>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
          Nuevo programa de culto
        </h2>
        <p className="text-neutral-500 mt-1">
          Selecciona una plantilla y la fecha para crear el programa
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha del culto *</Label>
            <Input id="date" type="date" {...register('date')} />
            {errors.date && (
              <p className="text-xs text-red-500">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Plantilla *</Label>
            <Controller
              control={control}
              name="templateId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="loading" disabled>
                        Cargando...
                      </SelectItem>
                    ) : (
                      templates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} ({templateTypeLabels[template.type]})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.templateId && (
              <p className="text-xs text-red-500">{errors.templateId.message}</p>
            )}
          </div>

          {templates && templates.length === 0 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
              No hay plantillas activas. Crea una plantilla primero.
              <Button
                type="button"
                variant="link"
                size="sm"
                className="ml-2"
                onClick={() => navigate('/cultos/plantillas/nuevo')}
              >
                Crear plantilla
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting ? 'Creando...' : 'Crear programa'}
          </Button>
        </div>
      </form>
    </div>
  )
}