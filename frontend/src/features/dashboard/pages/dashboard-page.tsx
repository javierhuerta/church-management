import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Calendar, FileText, Church, ArrowRight, Loader2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import logoFull from '@/assets/images/logo.png'
import { useTheme } from '@/components/theme-provider'
import { useCalendar } from '@/features/calendar/hooks/use-calendar'
import { usePrograms } from '@/features/worship-services/hooks/use-worship-services'
import { Button } from '@/components/ui/button'
import { SYSTEM_NAME } from '@/lib/seo'

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
    icon: Church,
    path: '/misionero/personas',
    disabled: false,
  },
]

const EVENT_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  published: { bg: '#0F766E22', color: '#0F766E' },
  draft:     { bg: '#C9A84C22', color: '#92600A' },
  archived:  { bg: '#47556922', color: '#475569' },
}

const PROGRAM_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  published: { bg: '#0F766E22', color: '#0F766E' },
  draft:     { bg: '#C9A84C22', color: '#92600A' },
  archived:  { bg: '#47556922', color: '#475569' },
}

function ActivityItem({
  icon: Icon,
  title,
  subtitle,
  badge,
  badgeStyle,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
  badge: string
  badgeStyle: { bg: string; color: string }
  href?: string
}) {
  const content = (
    <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl hover:bg-muted/60 transition-colors">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <span
        className="shrink-0 text-xs px-2 py-1 rounded-full font-medium"
        style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color }}
      >
        {badge}
      </span>
    </div>
  )

  if (href) {
    return (
      <Link to={href} className="block">
        {content}
      </Link>
    )
  }
  return content
}

export function DashboardPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const logoFilter = isDark ? 'brightness(0) invert(1)' : undefined

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString()

  const { data: calendarData, isLoading: loadingEvents } = useCalendar({
    startDate: todayStart,
    endDate: todayEnd,
  })

  const { data: programsData, isLoading: loadingPrograms } = usePrograms({
    dateFrom: today.toISOString().split('T')[0],
    dateTo: today.toISOString().split('T')[0],
  })

  const events = calendarData?.data ?? []
  const programs = programsData ?? []

  const isLoading = loadingEvents || loadingPrograms
  const hasActivity = events.length > 0 || programs.length > 0

  return (
    <>
      <Helmet>
        <title>Inicio — {SYSTEM_NAME}</title>
        <meta name="description" content="Sistema de gestión eclesiástica para la Iglesia Adventista Central Osorno — eventos, programas de culto, misión y administración." />
      </Helmet>
      <div className="space-y-8">
      <div className="flex items-center gap-5">
        <img src={logoFull} alt="Adventistas Central Osorno" className="h-20 w-auto shrink-0" style={{ filter: logoFilter }} />
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            Bienvenido
          </h2>
          <p className="text-muted-foreground mt-1">
            Sistema de gestión eclesiástica — Iglesia Adventista de Osorno Central
          </p>
        </div>
      </div>

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

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Actividad de Hoy
          </h3>
          <span className="text-sm text-muted-foreground">
            {format(today, "EEEE d 'de' MMMM", { locale: es })}
          </span>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && !hasActivity && (
          <div className="text-center py-8">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Sin actividad programada para hoy</p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Link to="/calendario">
                <Button variant="outline" size="sm">
                  Ver calendario
                </Button>
              </Link>
              <Link to="/cultos/programas">
                <Button variant="outline" size="sm">
                  Ver programas
                </Button>
              </Link>
            </div>
          </div>
        )}

        {!isLoading && hasActivity && (
          <div className="space-y-3">
            {programs.map((program) => {
              const style = PROGRAM_STATUS_COLORS[program.status?.toLowerCase() ?? 'draft'] ?? PROGRAM_STATUS_COLORS.draft
              const dateStr = format(parseISO(program.date), "h:mm a", { locale: es })
              return (
                <ActivityItem
                  key={`program-${program.id}`}
                  icon={FileText}
                  title={program.template?.name ?? 'Programa de Culto'}
                  subtitle={`${dateStr} — ${program.groups?.length ?? 0} grupos`}
                  badge={program.status === 'PUBLISHED' ? 'Publicado' : program.status === 'DRAFT' ? 'Borrador' : 'Archivado'}
                  badgeStyle={style}
                  href={`/cultos/programas/${program.id}`}
                />
              )
            })}

            {events.map((event) => {
              const style = EVENT_STATUS_COLORS[event.status?.toLowerCase() ?? 'draft'] ?? EVENT_STATUS_COLORS.draft
              const timeStr = format(parseISO(event.startDate), 'h:mm a', { locale: es })
              return (
                <ActivityItem
                  key={`event-${event.id}`}
                  icon={Calendar}
                  title={event.title}
                  subtitle={event.department?.name ? `${timeStr} — ${event.department.name}` : timeStr}
                  badge={event.status === 'published' ? 'Publicado' : event.status === 'draft' ? 'Borrador' : 'Archivado'}
                  badgeStyle={style}
                  href={`/calendario/${event.id}`}
                />
              )
            })}
          </div>
        )}
      </div>
      </div>
    </>
  )
}