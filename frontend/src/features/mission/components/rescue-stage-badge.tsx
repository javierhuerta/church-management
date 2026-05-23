import { useTheme } from '@/components/theme-provider'

interface RescueStageBadgeProps {
  /** Nombre a mostrar */
  name?: string | null
  /** Color hex del catálogo (ej. #DC2626) */
  color?: string | null
}

const FALLBACK_LIGHT = '#1B3A6B'
const FALLBACK_DARK  = '#6B9FDB'

export function RescueStageBadge({ name, color }: RescueStageBadgeProps) {
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
