import { useTheme } from '@/components/theme-provider'

interface VisitStatusBadgeProps {
  /** Nombre a mostrar */
  name?: string | null
  /** Color hex del catálogo (ej. #0F766E) */
  color?: string | null
}

const FALLBACK_LIGHT = '#475569'
const FALLBACK_DARK  = '#64748B'

export function VisitStatusBadge({ name, color }: VisitStatusBadgeProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  if (!name) return <span className="text-muted-foreground text-xs">—</span>

  const bg = color ?? (isDark ? FALLBACK_DARK : FALLBACK_LIGHT)

  return (
    <span
      className="inline-flex items-center shrink-0 whitespace-nowrap text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: bg, color: '#fff' }}
    >
      {name}
    </span>
  )
}
