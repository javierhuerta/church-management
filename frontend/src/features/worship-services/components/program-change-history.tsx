import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'
import type { ProgramLogResponseDto } from '@/lib/api'

const PAGE_SIZE = 8

type LogCategory = 'todo' | 'creacion' | 'ediciones' | 'publicaciones' | 'eliminaciones'

const CATEGORY_PATTERNS: Record<LogCategory, string[]> = {
  todo: [],
  creacion: ['creó', 'agregó'],
  ediciones: ['cambió', 'editó', 'definió', 'actualizó', 'asignó'],
  publicaciones: ['publicó', 'archivó'],
  eliminaciones: ['eliminó'],
}

const STATUS_COLORS = {
  created: { light: '#0F766E', dark: '#0D9488' },
  deleted: { light: '#DC2626', dark: '#EF4444' },
  published: { light: '#1B3A6B', dark: '#6B9FDB' },
  edited: { light: '#475569', dark: '#64748B' },
}

function getActionCategory(action: string): LogCategory {
  const lower = action.toLowerCase()
  if (lower.includes('creó') || lower.includes('agregó')) return 'creacion'
  if (lower.includes('cambió') || lower.includes('editó') || lower.includes('definió') || lower.includes('actualizó') || lower.includes('asignó')) return 'ediciones'
  if (lower.includes('publicó') || lower.includes('archivó')) return 'publicaciones'
  if (lower.includes('eliminó')) return 'eliminaciones'
  return 'todo'
}

function actionBadgeStyle(action: string, isDark: boolean) {
  const category = getActionCategory(action)
  const colors = STATUS_COLORS[category === 'creacion' ? 'created' : category === 'eliminaciones' ? 'deleted' : category === 'publicaciones' ? 'published' : 'edited']
  return {
    background: isDark ? colors.dark : colors.light,
    color: '#fff',
    borderRadius: 9999,
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
  }
}

function LogDetail({ log }: { log: ProgramLogResponseDto }) {
  const { previousValue, newValue, section } = log
  const sectionName = section?.name ?? section?.templateSection?.name

  let valueDetail = null
  if (previousValue && newValue) {
    valueDetail = (
      <p className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
        <span className="truncate max-w-[60px]" title={previousValue}>{previousValue}</span>
        <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        <span className="truncate font-medium max-w-[60px]" title={newValue}>{newValue}</span>
      </p>
    )
  } else if (previousValue) {
    valueDetail = (
      <p className="text-xs text-muted-foreground truncate line-through" title={previousValue}>
        {previousValue}
      </p>
    )
  } else if (newValue) {
    valueDetail = (
      <p className="text-xs text-muted-foreground truncate" title={newValue}>
        {newValue}
      </p>
    )
  }

  if (!sectionName && !valueDetail) return null

  return (
    <div className="space-y-0.5">
      {sectionName && (
        <p className="text-xs text-muted-foreground">
          Sección: <span className="font-medium">{sectionName}</span>
        </p>
      )}
      {valueDetail}
    </div>
  )
}

interface GroupedLogs {
  dateLabel: string
  logs: ProgramLogResponseDto[]
}

function groupLogsByDate(logs: ProgramLogResponseDto[]): GroupedLogs[] {
  const groups: Map<string, ProgramLogResponseDto[]> = new Map()

  for (const log of logs) {
    const dateKey = format(new Date(log.createdAt), 'yyyy-MM-dd')
    if (!groups.has(dateKey)) {
      groups.set(dateKey, [])
    }
    groups.get(dateKey)!.push(log)
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, logs]) => ({
      dateLabel: format(new Date(logs[0].createdAt), "d 'de' MMMM 'de' yyyy", { locale: es }),
      logs,
    }))
}

interface ProgramChangeHistoryProps {
  logs: ProgramLogResponseDto[] | undefined
}

export function ProgramChangeHistory({ logs }: ProgramChangeHistoryProps) {
  const [filter, setFilter] = useState<LogCategory>('todo')
  const [page, setPage] = useState(0)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const filtered = useMemo(() => {
    if (!logs) return []
    if (filter === 'todo') return logs
    const patterns = CATEGORY_PATTERNS[filter]
    return logs.filter((l) =>
      patterns.some((p) => l.action.toLowerCase().includes(p)),
    )
  }, [logs, filter])

  const grouped = useMemo(() => groupLogsByDate(filtered), [filtered])

  const flatPage = grouped.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const filterOptions: { value: LogCategory; label: string }[] = [
    { value: 'todo', label: 'Todo' },
    { value: 'creacion', label: 'Creación' },
    { value: 'ediciones', label: 'Ediciones' },
    { value: 'publicaciones', label: 'Publicaciones' },
    { value: 'eliminaciones', label: 'Eliminaciones' },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm sticky top-6 flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-border space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm">Historial de cambios</h3>
          {logs && logs.length > 0 && (
            <span className="text-xs text-muted-foreground">{logs.length} registros</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setFilter(opt.value); setPage(0) }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                filter === opt.value
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border overflow-y-auto flex-1">
        {flatPage.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Sin cambios registrados
          </div>
        )}
        {flatPage.map((group) => (
          <div key={group.dateLabel}>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/30">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.dateLabel}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            {group.logs.map((log) => (
              <div key={log.id} className="px-4 py-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {log.user?.name ?? 'Usuario'}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {format(new Date(log.createdAt), 'HH:mm')}
                  </span>
                </div>
                <span style={actionBadgeStyle(log.action, isDark)}>
                  {log.action}
                </span>
                <LogDetail log={log} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {grouped.length > 1 && (
        <div className="px-4 py-2 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Página {page + 1} de {grouped.length}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              disabled={page >= grouped.length - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}