import { Settings, Calendar, Users, Clock, Image, Radio, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

const sections = [
  {
    id: 'inicio',
    label: 'Inicio',
    path: 'inicio',
    icon: Settings,
    description: 'Textos e imágenes del hero, versículo destacado y horarios resumidos',
    type: 'editor' as const,
  },
  {
    id: 'liderazgo',
    label: 'Liderazgo',
    path: 'liderazgo',
    icon: Users,
    description: 'Junta directiva, foto grupal y ministerios',
    type: 'editor' as const,
  },
  {
    id: 'horarios',
    label: 'Horarios',
    path: 'horarios',
    icon: Clock,
    description: 'Lista de horarios de actividades públicas',
    type: 'editor' as const,
  },
  {
    id: 'calendario',
    label: 'Calendario',
    path: 'calendario',
    icon: Calendar,
    description: 'Los eventos publicados en el módulo Calendario aparecen automáticamente',
    type: 'redirect' as const,
    redirectTo: '/calendario',
    redirectLabel: 'Ir al Calendario',
  },
  {
    id: 'cultos',
    label: 'Cultos',
    path: 'cultos',
    icon: BookOpen,
    description: 'El programa publicado marcado para el sitio aparece automáticamente',
    type: 'redirect' as const,
    redirectTo: '/cultos',
    redirectLabel: 'Ir a Cultos',
  },
  {
    id: 'galeria',
    label: 'Galería',
    path: 'galeria',
    icon: Image,
    description: 'Álbumes e imágenes de la galería pública',
    type: 'editor' as const,
  },
  {
    id: 'transmisiones',
    label: 'Transmisiones',
    path: 'transmisiones',
    icon: Radio,
    description: 'Videos de YouTube y configuraciones de transmisiones',
    type: 'editor' as const,
  },
]

export function ConfiguracionesIndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-base text-muted-foreground">
          Selecciona una sección para personalizar su contenido en el sitio público.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon
          const isRedirect = section.type === 'redirect'

          return (
            <div
              key={section.id}
              className="rounded-xl border border-border bg-card p-5 space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-foreground">{section.label}</p>
                  <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                </div>
              </div>

              <div className="pt-2">
                {isRedirect ? (
                  <Link
                    to={section.redirectTo!}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {section.redirectLabel}
                    <span aria-hidden>→</span>
                  </Link>
                ) : (
                  <Link
                    to={section.path}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Configurar
                    <span aria-hidden>→</span>
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
