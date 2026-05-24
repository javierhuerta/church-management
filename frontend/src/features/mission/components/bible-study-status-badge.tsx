import { useTheme } from '@/components/theme-provider'
import { BibleStudyResponseDto } from '@/lib/api/models/BibleStudyResponseDto'

// Use the enum from the generated DTO
const { status: StatusEnum } = BibleStudyResponseDto

export type BibleStudyStatus = BibleStudyResponseDto['status']

/**
 * Colores de estado misionero — paleta de la marca.
 * Cada estado tiene variante light y dark.
 */
const STATUS_CONFIG: Record<
  string,
  { label: string; light: string; dark: string; textColor?: string }
> = {
  [StatusEnum.INVITAR]:    { label: 'Invitar',    light: '#1B3A6B', dark: '#6B9FDB' },
  [StatusEnum.ESTUDIANDO]: { label: 'Estudiando', light: '#0F766E', dark: '#0D9488' },
  [StatusEnum.GRADUADO]:   { label: 'Graduado',   light: '#C9A84C', dark: '#D4B566', textColor: '#102240' },
  [StatusEnum.BAUTISMO]:   { label: 'Bautismo',   light: '#B45309', dark: '#D97706' },
  [StatusEnum.BAUTIZADO]:  { label: 'Bautizado',  light: '#475569', dark: '#64748B' },
}

interface BibleStudyStatusBadgeProps {
  status: BibleStudyStatus
  size?: 'sm' | 'md'
}

export function BibleStudyStatusBadge({ status, size = 'sm' }: BibleStudyStatusBadgeProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const cfg = STATUS_CONFIG[status as string]
  if (!cfg) return <span className="text-muted-foreground text-xs">—</span>

  const bg = isDark ? cfg.dark : cfg.light
  const color = cfg.textColor ?? '#fff'
  const fontSize = size === 'md' ? 13 : 11

  return (
    <span
      className="inline-flex items-center shrink-0 whitespace-nowrap font-semibold rounded-full"
      style={{
        backgroundColor: bg,
        color,
        fontSize,
        padding: size === 'md' ? '3px 12px' : '2px 8px',
      }}
    >
      {cfg.label}
    </span>
  )
}

/** Returns the label for a given status */
export function getBibleStudyStatusLabel(status: BibleStudyStatus): string {
  return STATUS_CONFIG[status as string]?.label ?? (status as string)
}

/** All statuses in order */
export const BIBLE_STUDY_STATUSES: BibleStudyStatus[] = [
  StatusEnum.INVITAR,
  StatusEnum.ESTUDIANDO,
  StatusEnum.GRADUADO,
  StatusEnum.BAUTISMO,
  StatusEnum.BAUTIZADO,
]
