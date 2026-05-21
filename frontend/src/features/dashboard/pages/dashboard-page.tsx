import { Link } from 'react-router-dom'
import { Calendar, FileText, Heart, ArrowRight } from 'lucide-react'
import logoFull from '@/assets/images/logo.png'

const quickActions = [
  {
    id: 'calendario',
    title: 'Calendario',
    description: 'Próximos eventos y actividades de la iglesia',
    icon: Calendar,
    path: '/calendario',
    disabled: false,
  },
  {
    id: 'cultos',
    title: 'Cultos',
    description: 'Programas y plantillas de servicios de adoración',
    icon: FileText,
    path: '/cultos/programas',
    disabled: false,
  },
  {
    id: 'mision',
    title: 'Misión',
    description: 'Actividades evangelísticas y misioneras',
    icon: Heart,
    path: '/mision',
    disabled: true,
  },
]

export function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-5">
        <img src={logoFull} alt="Adventistas Central Osorno" className="h-16 w-auto shrink-0" />
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            Bienvenido
          </h2>
          <p className="text-muted-foreground mt-1">
            Sistema de gestión eclesiástica — Iglesia Adventista de Osorno Central
          </p>
        </div>
      </div>

      {/* Module cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          const cardClass = `
            relative overflow-hidden rounded-2xl border p-6 transition-all duration-200 block
            ${action.disabled
              ? 'bg-card border-border opacity-60 cursor-not-allowed'
              : 'bg-card border-border cursor-pointer shadow-sm hover:shadow-md hover:border-primary/40 hover:bg-primary/5'
            }
          `
          const content = (
            <>
              <div className="absolute top-4 right-4" style={{ color: '#C9A84C' }}>
                <Icon className="h-8 w-8" />
              </div>
              <div className="relative">
                <h3 className="text-lg font-semibold text-foreground">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {action.description}
                </p>
                {!action.disabled && (
                  <div className="flex items-center gap-1 mt-4 text-sm font-medium text-primary">
                    <span>Acceder</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
                {action.disabled && (
                  <div className="mt-4">
                    <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                      Próximamente
                    </span>
                  </div>
                )}
              </div>
            </>
          )

          if (action.disabled) {
            return (
              <div key={action.id} className={cardClass} aria-disabled="true">
                {content}
              </div>
            )
          }
          return (
            <Link key={action.id} to={action.path} className={cardClass}>
              {content}
            </Link>
          )
        })}
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Actividad Reciente
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Culto del Sábado</p>
              <p className="text-xs text-muted-foreground">Hoy, 10:00 AM</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#0F766E', color: '#fff' }}>
              Próximo
            </span>
          </div>
          <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Escuela Sabática</p>
              <p className="text-xs text-muted-foreground">Hoy, 9:00 AM</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-muted text-muted-foreground">
              Completado
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
