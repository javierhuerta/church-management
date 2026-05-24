import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useTheme } from '@/components/theme-provider'
import {
  useSabbathClass,
  useCreateSabbathClass,
  useUpdateSabbathClass,
} from '../hooks/use-sabbath-classes'

const NAVY = '#1B3A6B'

type FormValues = {
  name: string
  description: string
  displayOrder: number
  isActive: boolean
}

export function SabbathClassFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const query = useSabbathClass(id ?? '')
  const createMutation = useCreateSabbathClass()
  const updateMutation = useUpdateSabbathClass(id ?? '')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      displayOrder: 0,
      isActive: true,
    },
  })

  useEffect(() => {
    if (query.data) {
      reset({
        name: query.data.name,
        description: query.data.description ?? '',
        displayOrder: query.data.displayOrder,
        isActive: query.data.isActive,
      })
    }
  }, [query.data, reset])

  async function onSubmit(values: FormValues) {
    const dto = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      displayOrder: values.displayOrder,
      isActive: values.isActive,
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(dto)
        toast.success('Clase actualizada correctamente')
      } else {
        await createMutation.mutateAsync(dto)
        toast.success('Clase creada correctamente')
      }
      navigate('/misionero/clases-es')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la clase'
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

  return (
    <div className="max-w-lg space-y-6">
      <p className="text-2xl font-bold text-foreground">
        {isEdit ? 'Editar clase' : 'Nueva clase de Escuela Sabática'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Nombre <span className="text-destructive">*</span>
          </label>
          <input
            {...register('name', { required: 'El nombre es obligatorio' })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Ej. Clase 1"
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Descripción</label>
          <input
            {...register('description')}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Ej. Generación 215"
          />
        </div>

        {/* Display order */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Orden de presentación</label>
          <input
            type="number"
            min={0}
            {...register('displayOrder', { valueAsNumber: true })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Active */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            {...register('isActive')}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/40"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-foreground">
            Clase activa
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/misionero/clases-es')}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            data-testid="sabbath-class-save-button"
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
