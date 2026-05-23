import { useTheme } from '@/components/theme-provider'
import { Clock, CheckCircle2, XCircle } from 'lucide-react'

type StatusCode = 'Planificada' | 'Completada' | 'Cancelada'

interface StatusConfig {
  label: string
  light: string
  dark: string
  text: string
  Icon: React.FC<{ className?: string }>
}

const STATUSES: Record<StatusCode, StatusConfig> = {
  Planificada: { label: 'Planificada', light: '#1B3A6B', dark: '#6B9FDB', text: '#fff', Icon: Clock         },
  Completada:  { label: 'Completada',  light: '#0F766E', dark: '#14B8A6', text: '#fff', Icon: CheckCircle2  },
  Cancelada:   { label: 'Cancelada',   light: '#DC2626', dark: '#EF4444', text: '#fff', Icon: XCircle       },
}

export function VisitStatusBadge({ status }: { status: string | null | undefined }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  if (!status) return <span className="text-muted-foreground text-xs">—</span>

  const cfg = STATUSES[status as StatusCode]
  if (!cfg) return <span className="text-muted-foreground text-xs">{status}</span>

  const { Icon } = cfg

  return (
    <span
      className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: isDark ? cfg.dark : cfg.light, color: cfg.text }}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}
