import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, BookOpen, Users, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from '@/components/theme-provider'
import { useMissionaryTeamsList, useDeleteMissionaryTeam } from '../hooks/use-missionary-teams'
import { useSabbathClassesActive } from '../hooks/use-sabbath-classes'
import { hasMissionFullAccess } from '../lib/permissions'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PeriodsService } from '@/lib/api/services/PeriodsService'
import { MissionSmallGroupsService } from '@/lib/api/services/MissionSmallGroupsService'
import type { MissionaryTeamResponseDto } from '@/lib/api/models/MissionaryTeamResponseDto'

const NAVY = '#1B3A6B'
const GOLD = '#C9A84C'

// ─── Audience badge ────────────────────────────────────────────────────────────

const AUDIENCE_HUES: Record<string, number> = {
  'M. infantil': 200,
  'M. adolescente': 280,
  'Iglesia': 219,
}

function audienceColor(audience: string, isDark: boolean) {
  const hue = AUDIENCE_HUES[audience] ?? 160
  return {
    bg: `hsl(${hue} 65% 40% / 0.12)`,
    text: isDark ? `hsl(${hue} 65% 65%)` : `hsl(${hue} 65% 35%)`,
  }
}

// ─── Team card ─────────────────────────────────────────────────────────────────

function TeamCard({
  team,
  idx,
  canEdit,
  isDark,
  onDelete,
}: {
  team: MissionaryTeamResponseDto
  idx: number
  canEdit: boolean
  isDark: boolean
  onDelete: (t: MissionaryTeamResponseDto) => void
}) {
  const audienceClr = audienceColor(team.audience, isDark)
  const activeMembers = team.members.filter((m) => m.isActive)

  return (
    <div
      data-testid={`team-row-${idx}`}
      className={`group relative flex flex-col rounded-xl border bg-card overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-px ${
        team.isActive
          ? 'border-border hover:border-primary/30'
          : 'border-border/50 opacity-60'
      }`}
    >
      {/* Top accent */}
      <div
        className="h-1.5 w-full"
        style={{ background: isDark ? 'hsl(219,70%,60%)' : NAVY }}
      />

      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Members as title */}
            <p className="text-base font-bold text-foreground leading-tight line-clamp-2">
              {activeMembers.length > 0
                ? activeMembers.map((m) => m.personName).join(' + ')
                : team.label ?? 'Equipo sin integrantes'}
            </p>
            {team.label && (
              <p className="text-xs text-muted-foreground mt-0.5">{team.label}</p>
            )}
          </div>

          {/* Active member count */}
          <div
            className="flex flex-col items-center justify-center rounded-xl px-3 py-2 shrink-0"
            style={{
              background: isDark ? 'hsl(219,70%,60%,0.12)' : '#1B3A6B12',
              minWidth: 48,
            }}
          >
            <p
              className="text-xl font-bold leading-none"
              style={{ color: isDark ? 'hsl(219,70%,65%)' : NAVY }}
            >
              {team.activeMemberCount}
            </p>
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mt-0.5">
              {team.activeMemberCount === 1 ? 'activo' : 'activos'}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px" style={{ background: `${GOLD}33` }} />

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {/* Audience badge */}
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: audienceClr.bg, color: audienceClr.text }}
          >
            {team.audience}
          </span>

          {/* Status badge */}
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: team.isActive
                ? isDark ? '#0D948822' : '#0F766E22'
                : isDark ? '#47556922' : '#47556918',
              color: team.isActive
                ? isDark ? '#0D9488' : '#0F766E'
                : isDark ? '#94A3B8' : '#64748B',
            }}
          >
            {team.isActive ? 'Activo' : 'Inactivo'}
          </span>

          {/* Incomplete warning */}
          {team.isIncomplete && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: isDark ? '#B4530922' : '#B4530918',
                color: isDark ? '#D97706' : '#B45309',
              }}
            >
              <AlertTriangle className="h-3 w-3" />
              Incompleto
            </span>
          )}
        </div>

        {/* Period */}
        <p className="text-xs text-muted-foreground">
          Período {team.periodYear}
          {team.smallGroupName && ` · ${team.smallGroupName}`}
          {team.sabbathClassName && !team.smallGroupName && ` · ${team.sabbathClassName}`}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/60 px-5 py-3 bg-muted/30">
        <Link
          to={`/misionero/equipos/${team.id}`}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Ver detalle
        </Link>

        {canEdit && (
          <div className="flex items-center gap-1">
            <Link
              to={`/misionero/equipos/${team.id}/editar`}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Editar"
            >
              <Users className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => onDelete(team)}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Eliminar"
            >
              <BookOpen className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function MissionaryTeamsListPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const fullAccess = hasMissionFullAccess()

  // Filters
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('')
  const [selectedSmallGroupId, setSelectedSmallGroupId] = useState<string>('')
  const [selectedSabbathClassId, setSelectedSabbathClassId] = useState<string>('')

  const teamsQuery = useMissionaryTeamsList(
    selectedPeriodId || undefined,
    selectedSmallGroupId || undefined,
    selectedSabbathClassId || undefined,
  )

  const periodsQuery = useQuery({
    queryKey: ['periods'],
    queryFn: () => PeriodsService.periodControllerFindAll(),
  })

  const smallGroupsQuery = useQuery({
    queryKey: ['small-groups'],
    queryFn: () => MissionSmallGroupsService.smallGroupControllerFindAll(),
  })

  const sabbathClassesQuery = useSabbathClassesActive()
  const deleteMutation = useDeleteMissionaryTeam()
  const [toDelete, setToDelete] = useState<MissionaryTeamResponseDto | null>(null)

  const teams = teamsQuery.data?.data ?? []
  const activeCount = teamsQuery.data?.activeCount ?? 0

  function handleDeleteConfirm() {
    if (!toDelete) return
    deleteMutation.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success('Equipo eliminado correctamente')
        setToDelete(null)
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'No se pudo eliminar el equipo'
        toast.error(msg)
        setToDelete(null)
      },
    })
  }

  const periods: Array<{ id: string; year: number }> = Array.isArray(periodsQuery.data)
    ? periodsQuery.data
    : []

  const smallGroups: Array<{ id: string; actionUnit: string; name: string | null }> =
    Array.isArray(smallGroupsQuery.data)
      ? smallGroupsQuery.data.map((g) => ({ id: g.id, actionUnit: g.actionUnit, name: g.name ?? null }))
      : []

  const sabbathClasses = sabbathClassesQuery.data ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-2xl font-bold text-foreground">Equipos misioneros</p>
          {!teamsQuery.isLoading && (
            <p
              className="text-sm text-muted-foreground mt-0.5"
              data-testid="teams-count"
            >
              {activeCount} activo{activeCount !== 1 ? 's' : ''}
              {teams.length !== activeCount &&
                ` · ${teams.length - activeCount} inactivo${teams.length - activeCount !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        {fullAccess && (
          <Link
            to="/misionero/equipos/nuevo"
            data-testid="team-new-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: isDark ? 'hsl(219,70%,60%)' : NAVY,
              color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Plus className="h-4 w-4" />
            Nuevo equipo
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Period filter */}
        <select
          data-testid="team-period-select"
          value={selectedPeriodId}
          onChange={(e) => setSelectedPeriodId(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">Todos los períodos</option>
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.year}
            </option>
          ))}
        </select>

        {/* Small group filter */}
        <select
          value={selectedSmallGroupId}
          onChange={(e) => setSelectedSmallGroupId(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">Todos los grupos</option>
          {smallGroups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name ?? g.actionUnit}
            </option>
          ))}
        </select>

        {/* Sabbath class filter */}
        <select
          value={selectedSabbathClassId}
          onChange={(e) => setSelectedSabbathClassId(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">Todas las clases</option>
          {sabbathClasses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {teamsQuery.isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
              <div className="h-1.5 bg-muted" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-px bg-muted" />
                <div className="flex gap-2">
                  <div className="h-6 bg-muted rounded-full w-20" />
                  <div className="h-6 bg-muted rounded-full w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!teamsQuery.isLoading && teams.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div
            className="flex items-center justify-center rounded-full p-5"
            style={{ background: isDark ? 'hsl(219,70%,60%,0.1)' : '#1B3A6B0D' }}
          >
            <BookOpen
              className="h-10 w-10"
              style={{ color: isDark ? 'hsl(219,70%,60%)' : NAVY, opacity: 0.5 }}
            />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-foreground">No hay equipos misioneros</p>
            <p className="text-sm text-muted-foreground">
              {selectedPeriodId || selectedSmallGroupId || selectedSabbathClassId
                ? 'No hay equipos con los filtros seleccionados.'
                : 'Crea el primer equipo para comenzar.'}
            </p>
          </div>
          {fullAccess && !selectedPeriodId && !selectedSmallGroupId && !selectedSabbathClassId && (
            <Link
              to="/misionero/equipos/nuevo"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Crear primer equipo
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      {!teamsQuery.isLoading && teams.length > 0 && (
        <div
          className="grid gap-4"
          data-testid="teams-list"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
        >
          {teams.map((t, i) => (
            <TeamCard
              key={t.id}
              team={t}
              idx={i}
              canEdit={fullAccess}
              isDark={isDark}
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => { if (!o) setToDelete(null) }}
        title="¿Eliminar equipo misionero?"
        description={`Se eliminará el equipo "${toDelete?.label ?? toDelete?.members.filter((m) => m.isActive).map((m) => m.personName).join(' + ') ?? ''}". Esta acción no se puede deshacer.`}
        confirmLabel={deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
