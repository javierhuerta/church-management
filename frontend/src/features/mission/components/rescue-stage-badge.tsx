import { useTheme } from '@/components/theme-provider'

type StageCode =
  | 'PorRescatar'
  | 'Visitado'
  | 'AsisteEsporadica'
  | 'AsisteIglesia'
  | 'DecisionRequerida'

interface StageConfig {
  label: string
  light: string
  dark: string
  text: string
}

const STAGES: Record<StageCode, StageConfig> = {
  PorRescatar:       { label: 'Por rescatar',  light: '#DC2626', dark: '#EF4444', text: '#fff' },
  Visitado:          { label: 'Visitado',       light: '#B45309', dark: '#D97706', text: '#fff' },
  AsisteEsporadica:  { label: 'Esporádica',    light: '#7C3AED', dark: '#A78BFA', text: '#fff' },
  AsisteIglesia:     { label: 'En iglesia',     light: '#0F766E', dark: '#14B8A6', text: '#fff' },
  DecisionRequerida: { label: 'Decisión',       light: '#1B3A6B', dark: '#6B9FDB', text: '#fff' },
}

export function RescueStageBadge({ stage }: { stage: string | null | undefined }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  if (!stage) return <span className="text-muted-foreground text-xs">—</span>

  const cfg = STAGES[stage as StageCode]
  if (!cfg) return <span className="text-muted-foreground text-xs">{stage}</span>

  return (
    <span
      className="inline-flex items-center shrink-0 whitespace-nowrap text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: isDark ? cfg.dark : cfg.light, color: cfg.text }}
    >
      {cfg.label}
    </span>
  )
}
