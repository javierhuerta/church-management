import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuthUser } from '../hooks/use-auth-user'
import { useEventBySlug } from '../hooks/use-calendar'
import { isEditorRole } from '../utils/labels'
import { EventForm } from '../components/event-form'
import { Button } from '@/components/ui/button'

interface EventFormPageProps {
  mode: 'create' | 'edit'
}

export function EventFormPage({ mode }: EventFormPageProps) {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()
  const user = useAuthUser()
  const canEdit = isEditorRole(user?.role)

  const { data: event, isLoading } = useEventBySlug(
    mode === 'edit' ? (slug ?? '') : '',
  )

  if (!canEdit) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
        <h2 className="text-xl font-semibold text-neutral-900">
          Acceso restringido
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Solo los editores pueden crear o modificar eventos.
        </p>
      </div>
    )
  }

  if (mode === 'edit' && isLoading) {
    return <div className="text-neutral-500">Cargando evento...</div>
  }

  if (mode === 'edit' && !event) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
        <h2 className="text-xl font-semibold text-neutral-900">
          Evento no encontrado
        </h2>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </Button>
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
          {mode === 'edit' ? 'Editar evento' : 'Nuevo evento'}
        </h2>
        <p className="text-neutral-500 mt-1">
          {mode === 'edit'
            ? 'Modifica los detalles del evento'
            : 'Crea un nuevo evento (se guardará como borrador)'}
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <EventForm
          event={event}
          onSaved={(saved) => navigate(`/calendario/${saved.shareSlug}`)}
        />
      </div>
    </div>
  )
}
