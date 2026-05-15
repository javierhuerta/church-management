import { useState, useMemo, type ReactNode } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { ProgramLogResponseDto } from '@/lib/api'

const PAGE_SIZE = 8

function actionBadgeClass(action: string) {
  if (action.startsWith('eliminó')) return 'bg-red-50 text-red-700 border-red-100'
  if (action.startsWith('creó') || action.startsWith('agregó')) return 'bg-green-50 text-green-700 border-green-100'
  if (action.startsWith('publicó') || action.startsWith('archivó')) return 'bg-blue-50 text-blue-700 border-blue-100'
  return 'bg-neutral-100 text-neutral-600 border-neutral-200'
}

function LogDetail({ log }: { log: ProgramLogResponseDto }) {
  const { previousValue, newValue, section } = log
  const sectionName = section?.name ?? section?.templateSection?.name

  let valueDetail: ReactNode = null
  if (previousValue && newValue) {
    valueDetail = (
      <p className="flex items-center gap-1 text-xs text-neutral-500 min-w-0">
        <span className="truncate text-neutral-400 max-w-[80px]" title={previousValue}>{previousValue}</span>
        <ArrowRight className="h-3 w-3 shrink-0 text-neutral-300" />
        <span className="truncate font-medium text-neutral-600 max-w-[80px]" title={newValue}>{newValue}</span>
      </p>
    )
  } else if (previousValue) {
    valueDetail = (
      <p className="text-xs text-neutral-400 truncate" title={previousValue}>
        <span className="line-through">{previousValue}</span>
      </p>
    )
  } else if (newValue) {
    valueDetail = (
      <p className="text-xs text-neutral-500 truncate" title={newValue}>
        {newValue}
      </p>
    )
  }

  if (!sectionName && !valueDetail) return null

  return (
    <div className="space-y-0.5">
      {sectionName && (
        <p className="text-xs text-neutral-400">
          Sección: <span className="font-medium text-neutral-500">{sectionName}</span>
        </p>
      )}
      {valueDetail}
    </div>
  )
}

interface ProgramChangeHistoryProps {
  logs: ProgramLogResponseDto[] | undefined
}

export function ProgramChangeHistory({ logs }: ProgramChangeHistoryProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    if (!logs) return []
    const q = search.toLowerCase().trim()
    if (!q) return logs
    return logs.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        (l.user?.name ?? '').toLowerCase().includes(q) ||
        (l.previousValue ?? '').toLowerCase().includes(q) ||
        (l.newValue ?? '').toLowerCase().includes(q),
    )
  }, [logs, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function handleSearch(value: string) {
    setSearch(value)
    setPage(0)
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm sticky top-6 flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-neutral-100 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900">Historial de cambios</h3>
          {logs && logs.length > 0 && (
            <span className="text-xs text-neutral-400">{logs.length} registros</span>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por usuario, acción..."
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      <div className="divide-y divide-neutral-100">
        {pageItems.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-neutral-400">
            {search ? 'Sin resultados para esa búsqueda' : 'Sin cambios registrados'}
          </div>
        )}
        {pageItems.map((log) => (
          <div key={log.id} className="px-4 py-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-neutral-800 truncate">
                {log.user?.name ?? 'Usuario'}
              </span>
              <span className="text-xs text-neutral-400 shrink-0">
                {format(new Date(log.createdAt), "d MMM, HH:mm", { locale: es })}
              </span>
            </div>
            <span
              className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium border ${actionBadgeClass(log.action)}`}
            >
              {log.action}
            </span>
            <LogDetail log={log} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-2 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            Página {page + 1} de {totalPages}
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
              disabled={page >= totalPages - 1}
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
