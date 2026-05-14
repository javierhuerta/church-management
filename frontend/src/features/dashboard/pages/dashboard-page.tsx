import { Link } from 'react-router-dom'
import { Calendar, FileText, Heart, ArrowRight } from 'lucide-react'

const quickActions = [
  {
    id: 'calendario',
    title: 'Calendario',
    description: 'Próximos eventos y actividades de la iglesia',
    icon: Calendar,
    color: 'blue',
    path: '/calendario',
  },
  {
    id: 'cultos',
    title: 'Cultos',
    description: 'Programas y plantillas de servicios de adoración',
    icon: FileText,
    color: 'emerald',
    path: '/cultos/programas',
  },
  {
    id: 'mision',
    title: 'Misión',
    description: 'Actividades evangelísticas y misioneras',
    icon: Heart,
    color: 'rose',
    path: '/mision',
    disabled: true,
  },
]

const colorStyles: Record<string, { bg: string; border: string; icon: string; hover: string }> = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    hover: 'hover:bg-blue-100 hover:border-blue-300',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    hover: 'hover:bg-emerald-100 hover:border-emerald-300',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    icon: 'text-rose-600',
    hover: 'hover:bg-rose-100 hover:border-rose-300',
  },
}

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
            Bienvenido
          </h2>
          <p className="text-neutral-500 mt-1">
            Sistema de gestión eclesiástica — Iglesia Adventista de Osorno Central
          </p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
          <span className="text-white font-bold">IA</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          const colors = colorStyles[action.color]
          const className = `
            relative overflow-hidden rounded-2xl border ${colors.bg} ${colors.border}
            p-6 transition-all duration-200 block ${action.disabled ? 'opacity-60 cursor-not-allowed' : colors.hover + ' cursor-pointer shadow-sm'}
          `
          const content = (
            <>
              <div className={`absolute top-4 right-4 ${colors.icon}`}>
                <Icon className="h-8 w-8" />
              </div>
              <div className="relative">
                <h3 className="text-lg font-semibold text-neutral-900">
                  {action.title}
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {action.description}
                </p>
                {!action.disabled && (
                  <div className="flex items-center gap-1 mt-4 text-sm font-medium text-blue-600">
                    <span>Acceder</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
                {action.disabled && (
                  <div className="mt-4">
                    <span className="text-xs px-2 py-1 bg-neutral-200 text-neutral-600 rounded-full">
                      Próximamente
                    </span>
                  </div>
                )}
              </div>
            </>
          )

          if (action.disabled) {
            return (
              <div key={action.id} className={className} aria-disabled="true">
                {content}
              </div>
            )
          }
          return (
            <Link key={action.id} to={action.path} className={className}>
              {content}
            </Link>
          )
        })}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Actividad Reciente
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900">Culto del Sábado</p>
              <p className="text-xs text-neutral-500">Hoy, 10:00 AM</p>
            </div>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
              Próximo
            </span>
          </div>
          <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900">Escuela Sabática</p>
              <p className="text-xs text-neutral-500">Hoy, 9:00 AM</p>
            </div>
            <span className="text-xs px-2 py-1 bg-neutral-200 text-neutral-600 rounded-full">
              Completado
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}