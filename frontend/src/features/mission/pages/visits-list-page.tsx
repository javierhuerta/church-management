import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/components/theme-provider'
import { useVisitsList, useVisitStatuses } from '../hooks/use-visits-list'
import { VisitStatusBadge } from '../components/visit-status-badge'
import { hasMissionFullAccess } from '../lib/permissions'
import { formatShortDate } from '@/lib/date'
import {
  CalendarPlus, Pencil, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react'
import { MissionVisitsService } from '@/lib/api'
import type { VisitResponseDto } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { normalizeSearch } from '@/lib/utils'

type SortKey = 'personFullName' | 'lastAttemptDate' | 'attemptCount'
type SortDir = 'asc' | 'desc'

function SortIcon({ col, active, dir }: { col: string; active: string; dir: SortDir }) {
  if (col !== active) return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />
  return dir === 'asc'
    ? <ArrowUp className="h-3.5 w-3.5 ml-1 text-primary" />
    : <ArrowDown className="h-3.5 w-3.5 ml-1 text-primary" />
}

function sortValue(v: VisitResponseDto, key: SortKey): string | number {
  if (key === 'personFullName')  return (v.personFullName ?? '').toLowerCase()
  if (key === 'lastAttemptDate') return v.lastAttemptDate ?? ''
  if (key === 'attemptCount')    return v.attemptCount ?? 0
  return ''
}

export function VisitsListPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const canWrite = hasMissionFullAccess()

  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch]             = useState('')
  const [sortKey, setSortKey]           = useState<SortKey>('lastAttemptDate')
  const [sortDir, setSortDir]           = useState<SortDir>('desc')
  const [deleteId, setDeleteId]         = useState<string | null>(null)

  const { data: statuses = [] } = useVisitStatuses()
  const statusCodeToId: Record<string, string> = {}
  statuses.forEach((s: { code: string; id: string; color?: string | null }) => { statusCodeToId[s.code] = s.id })

  const { data: raw = [], isLoading } = useVisitsList(
    statusFilter ? statusCodeToId[statusFilter] : undefined,
  )
  const queryClient = useQueryClient()

  // ── Search + sort (client-side) ──────────────────────────────────────────
  const visits = useMemo(() => {
    const q = normalizeSearch(search.trim())
    const filtered = q
      ? raw.filter((v) => normalizeSearch(v.personFullName ?? '').includes(q))
      : raw

    return [...filtered].sort((a, b) => {
      const av = sortValue(a, sortKey)
      const bv = sortValue(b, sortKey)
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [raw, search, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => MissionVisitsService.visitControllerRemove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-visits'] })
      toast.success('Visita eliminada')
      setDeleteId(null)
    },
    onError: (err: { body?: { message?: string } }) => {
      toast.error(err.body?.message ?? 'Error al eliminar')
    },
  })

  // ── Th helper ─────────────────────────────────────────────────────────────
  function Th({ col, label, className = '' }: { col: SortKey; label: string; className?: string }) {
    return (
      <th
        className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors ${className}`}
        onClick={() => toggleSort(col)}
      >
        <span className="inline-flex items-center">
          {label}
          <SortIcon col={col} active={sortKey} dir={sortDir} />
        </span>
      </th>
    )
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-2xl font-bold text-foreground">Visitación</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {visits.length} visita{visits.length !== 1 ? 's' : ''}
            {raw.length !== visits.length && ` de ${raw.length}`}
          </p>
        </div>
        {canWrite && (
          <Link
            to="/misionero/visitas/nuevo"
            data-testid="visit-new-button"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: isDark ? 'hsl(219,70%,60%)' : '#1B3A6B',
              color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA',
              border: 'none', borderRadius: 8, padding: '8px 16px',
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
            }}
          >
            <CalendarPlus className="h-4 w-4" />
            Nueva visita
          </Link>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar persona..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-1 bg-muted rounded-lg p-1 w-fit">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              statusFilter === '' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Todas
          </button>
          {statuses.map((s: { id: string; name: string; code: string; color?: string | null }) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.code)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                statusFilter === s.code ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.color && (
                <span
                  className="inline-block h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
              )}
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">Cargando...</div>
      ) : visits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
          <CalendarPlus className="h-8 w-8 opacity-40" />
          <p className="text-sm">{search ? 'Sin resultados para esa búsqueda' : 'No hay visitas registradas'}</p>
        </div>
      ) : (
        <div data-testid="visit-list">

          {/* Desktop table */}
          <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <Th col="personFullName" label="Persona" />
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground w-32">Estado</th>
                  <Th col="attemptCount"   label="Intentos"       className="w-24" />
                  <Th col="lastAttemptDate" label="Última visita" className="w-36" />
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Responsable</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Notas</th>
                  {canWrite && <th className="w-20 px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{visit.personFullName ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 w-32">
                      <VisitStatusBadge name={visit.visitStatusName} color={visit.visitStatusColor} />
                    </td>
                    <td className="px-4 py-3 w-24 text-center">
                      <span className="text-sm font-medium text-foreground tabular-nums">
                        {visit.attemptCount ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 w-36">
                      {visit.lastAttemptDate ? (
                        <p className="text-sm text-foreground tabular-nums">{formatShortDate(visit.lastAttemptDate)}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Sin visitas</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-muted-foreground">
                        {visit.responsiblePersonNames?.length
                          ? visit.responsiblePersonNames.join(', ')
                          : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-muted-foreground line-clamp-1">{visit.notes ?? '—'}</p>
                    </td>
                    {canWrite && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link to={`/misionero/visitas/${visit.id}`}><Pencil className="h-3.5 w-3.5" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(visit.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {visits.map((visit) => (
              <div key={visit.id} className="rounded-xl border border-border bg-card p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground min-w-0 truncate">{visit.personFullName ?? '—'}</p>
                  <VisitStatusBadge name={visit.visitStatusName} color={visit.visitStatusColor} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>{visit.attemptCount ?? 0} intento{(visit.attemptCount ?? 0) !== 1 ? 's' : ''}</span>
                  {visit.lastAttemptDate && <span>Último: {formatShortDate(visit.lastAttemptDate)}</span>}
                </div>
                {visit.responsiblePersonNames?.length ? (
                  <p className="text-sm text-muted-foreground">
                    {visit.responsiblePersonNames.join(', ')}
                  </p>
                ) : null}
                {visit.notes && <p className="text-sm text-muted-foreground line-clamp-2">{visit.notes}</p>}
                {canWrite && (
                  <div className="flex gap-1 pt-1 border-t border-border">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link to={`/misionero/visitas/${visit.id}`}><Pencil className="h-3.5 w-3.5" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(visit.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Eliminar visita"
        description="¿Estás seguro? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}
