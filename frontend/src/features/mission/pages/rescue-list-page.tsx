import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTheme } from '@/components/theme-provider'
import { useRescueMembersList, useRescueStages } from '../hooks/use-visits-list'
import { RescueStageBadge } from '../components/rescue-stage-badge'
import { hasMissionFullAccess } from '../lib/permissions'
import {
  HeartHandshake, Plus, Pencil, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react'
import { MissionRescueMembersService } from '@/lib/api'
import type { RescueMemberResponseDto } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { normalizeSearch } from '@/lib/utils'
import { SYSTEM_NAME } from '@/lib/seo'

type SortKey = 'personFullName' | 'yearsSinceBaptism'
type SortDir = 'asc' | 'desc'

function SortIcon({ col, active, dir }: { col: string; active: string; dir: SortDir }) {
  if (col !== active) return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />
  return dir === 'asc'
    ? <ArrowUp className="h-3.5 w-3.5 ml-1 text-primary" />
    : <ArrowDown className="h-3.5 w-3.5 ml-1 text-primary" />
}

function sortValue(m: RescueMemberResponseDto, key: SortKey): string | number {
  if (key === 'personFullName')    return (m.personFullName ?? '').toLowerCase()
  if (key === 'yearsSinceBaptism') return m.yearsSinceBaptism ?? -1
  return ''
}

export function RescueListPage() {
  const navigate = useNavigate()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const canWrite = hasMissionFullAccess()

  const [stageFilter, setStageFilter] = useState('')
  const [search, setSearch]           = useState('')
  const [sortKey, setSortKey]         = useState<SortKey>('personFullName')
  const [sortDir, setSortDir]         = useState<SortDir>('asc')
  const [deleteId, setDeleteId]       = useState<string | null>(null)

  const { data: stages = [] } = useRescueStages()
  const stageCodeToId: Record<string, string> = {}
  const stageCodeToColor: Record<string, string | null> = {}
  stages.forEach((s: { code: string; id: string; color?: string | null }) => {
    stageCodeToId[s.code] = s.id
    stageCodeToColor[s.code] = s.color ?? null
  })

  const { data: raw = [], isLoading } = useRescueMembersList(
    stageFilter ? stageCodeToId[stageFilter] : undefined,
  )
  const queryClient = useQueryClient()

  // ── Search + sort (client-side) ──────────────────────────────────────────
  const members = useMemo(() => {
    const q = normalizeSearch(search.trim())
    const filtered = q
      ? raw.filter((m) => normalizeSearch(m.personFullName ?? '').includes(q))
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
    mutationFn: (id: string) => MissionRescueMembersService.rescueMemberControllerRemove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-rescue-members'] })
      toast.success('Registro eliminado')
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
    <>
      <Helmet>
        <title>Miembros a Rescatar — {SYSTEM_NAME}</title>
        <meta name="description" content="Seguimiento de miembros bautizados que dejaron de asistir — etapas de rescate, responsables y notas." />
      </Helmet>
      <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-2xl font-bold text-foreground">Miembros a rescatar</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {members.length} miembro{members.length !== 1 ? 's' : ''}
            {raw.length !== members.length && ` de ${raw.length}`}
          </p>
        </div>
        {canWrite && (
          <Link
            to="/misionero/rescate/nuevo"
            data-testid="rescue-new-button"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: isDark ? 'hsl(219,70%,60%)' : '#1B3A6B',
              color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA',
              border: 'none', borderRadius: 8, padding: '8px 16px',
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
            }}
          >
            <Plus className="h-4 w-4" />
            Nuevo registro
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar persona..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Stage tabs — fila propia para que puedan hacer wrap sin romper el buscador */}
        <div className="flex flex-wrap gap-1 bg-muted rounded-lg p-1 w-fit">
          <button
            onClick={() => setStageFilter('')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              stageFilter === '' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Todas
          </button>
          {stages.map((s: { id: string; name: string; code: string; color?: string | null }) => (
            <button
              key={s.id}
              onClick={() => setStageFilter(s.code)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                stageFilter === s.code ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
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
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
          <HeartHandshake className="h-8 w-8 opacity-40" />
          <p className="text-sm">{search ? 'Sin resultados para esa búsqueda' : 'No hay miembros registrados'}</p>
        </div>
      ) : (
        <div data-testid="rescue-list">

          {/* Desktop table */}
          <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <Th col="personFullName" label="Persona" />
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground w-36">Etapa</th>
                  <Th col="yearsSinceBaptism" label="Años bautismo" className="w-36" />
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Responsable</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Notas</th>
                  {canWrite && <th className="w-20 px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{member.personFullName ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 w-36">
                      <RescueStageBadge name={member.rescueStageName} color={member.rescueStageColor} />
                    </td>
                    <td className="px-4 py-3 w-36">
                      <p className="text-sm text-foreground tabular-nums">
                        {member.yearsSinceBaptism != null ? `${member.yearsSinceBaptism} años` : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      {member.responsiblePersonNames?.length ? (
                        <p className="text-sm text-muted-foreground truncate" title={member.responsiblePersonNames.join(', ')}>
                          {member.responsiblePersonNames.length === 1
                            ? member.responsiblePersonNames[0]
                            : `${member.responsiblePersonNames[0]} +${member.responsiblePersonNames.length - 1}`}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">—</p>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-sm text-muted-foreground line-clamp-1">{member.notes ?? '—'}</p>
                    </td>
                    {canWrite && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link to={`/misionero/rescate/${member.id}`}><Pencil className="h-3.5 w-3.5" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(member.id)}>
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
            {members.map((member) => (
              <div
                key={member.id}
                onClick={() => navigate(`/misionero/rescate/${member.id}`)}
                className="rounded-xl border border-border bg-card p-4 space-y-2.5 hover:shadow-md transition-shadow cursor-pointer"
                style={member.rescueStageColor ? {
                  borderLeft: `3px solid ${member.rescueStageColor}`,
                } : undefined}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground min-w-0 truncate">{member.personFullName ?? '—'}</p>
                  <RescueStageBadge name={member.rescueStageName} color={member.rescueStageColor} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {member.yearsSinceBaptism != null && (
                    <span>{member.yearsSinceBaptism} años bautismo</span>
                  )}
                  {member.responsiblePersonNames?.length ? (
                    <span>
                      {member.responsiblePersonNames.length === 1
                        ? member.responsiblePersonNames[0]
                        : `${member.responsiblePersonNames[0]} +${member.responsiblePersonNames.length - 1}`}
                    </span>
                  ) : null}
                </div>
                {member.notes && <p className="text-sm text-muted-foreground line-clamp-2">{member.notes}</p>}
                {canWrite && (
                  <div className="flex items-center gap-1 pt-1 border-t border-border" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link to={`/misionero/rescate/${member.id}`}><Pencil className="h-3.5 w-3.5" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(member.id)}>
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
        title="Eliminar registro"
        description="¿Estás seguro? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
      </div>
    </>
  )
}
