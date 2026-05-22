import { useTheme } from '@/components/theme-provider'

/** Badge que indica si una Persona es miembro bautizado de la iglesia. */
export function BaptizedBadge({ isBaptized }: { isBaptized: boolean }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  if (isBaptized) {
    return (
      <span
        style={{
          background: isDark ? '#0D9488' : '#0F766E',
          color: '#fff',
          borderRadius: 9999,
          padding: '2px 10px',
          fontSize: 12,
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        Bautizado
      </span>
    )
  }

  return (
    <span
      style={{
        background: isDark ? '#64748B' : '#475569',
        color: '#fff',
        borderRadius: 9999,
        padding: '2px 10px',
        fontSize: 12,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      Interesado
    </span>
  )
}
