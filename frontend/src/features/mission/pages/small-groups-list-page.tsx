import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  UsersRound,
  CalendarDays,
  MapPin,
  User,
  Edit,
  Trash2,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '@/components/theme-provider'
import {
  useSmallGroupsList,
  useMySmallGroups,
  useDeleteSmallGroup,
} from '../hooks/use-small-groups'
import { hasMissionFullAccess, isMaestroClase } from '../lib/permissions'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { SmallGroupResponseDto } from '@/lib/api/models/SmallGroupResponseDto'

const NAVY = '#1B3A6B'
const GOLD = '#C9A84C'

// Color por unidad de acción — hash simple sobre un set de hues
const ACTION_UNIT_HUES = [200, 160, 280, 30, 340, 60, 240, 100, 15, 190]
function actionUnitColor(unit: string): { bg: string; dot: string; text: string } {
  let hash = 0
  for (let i = 0; i < unit.length; i++) hash = unit.charCodeAt(i) + ((hash << 5) - hash)
  const hue = ACTION_UNIT_HUES[Math.abs(hash) % ACTION_UNIT_HUES.length]
  return {
    dot:  `hsl(${hue} 65% 40%)`,
    bg:   `hsl(${hue} 65% 40% / 0.12)`,
    text: `hsl(${hue} 65% 35%)`,
  }
}

const MODE_CFG: Record<string, { label: string; light: string; dark: string }> = {
  Presencial: { label: 'Presencial', light: '#0F766E', dark: '#0D9488' },
  Online:     { label: 'Online',     light: '#1B3A6B', dark: '#6B9FDB' },
  Mixto:      { label: 'Mixto',      light: '#B45309', dark: '#D97706' },
}

function leadersLabel(group: SmallGroupResponseDto): string {
  if (!group.leaders?.length) return 'Sin líder asignado'
  return group.leaders
    .map((l) => l.leaderUserName ?? l.leaderPersonName ?? '—')
    .join(' / ')
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function SmallGroupCard({
  group,
  idx,
  canEdit,
  canDelete,
  isDark,
  onDelete,
}: {
  group: SmallGroupResponseDto
  idx: number
  canEdit: boolean
  canDelete: boolean
  isDark: boolean
  onDelete: (g: SmallGroupResponseDto) => void
}) {
  const unitColor = actionUnitColor(group.actionUnit)
  const modeCfg = group.meetingMode ? MODE_CFG[group.meetingMode] : null
  const modeColor = modeCfg ? (isDark ? modeCfg.dark : modeCfg.light) : null
  const hasLeader = !!group.leaders?.length

  return (
    <div
      data-testid={`small-group-row-${idx}`}
      className={`group relative flex flex-col rounded-xl border bg-card overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-px ${
        group.isActive
          ? 'border-border hover:border-primary/30'
          : 'border-border/50 opacity-60'
      }`}
    >
      {/* Franja de color superior */}
      <div
        className="h-1.5 w-full"
        style={{ background: unitColor.dot }}
      />

      {/* Cuerpo */}
      <div className="flex flex-col flex-1 p-5 gap-4">

        {/* Encabezado: nombre + unidad */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-foreground leading-tight line-clamp-1">
              {group.name ?? group.actionUnit}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: unitColor.bg, color: unitColor.text }}
              >
                {group.actionUnit}
              </span>
              {!group.isActive && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: isDark ? '#47556933' : '#47556918',
                    color: isDark ? '#94A3B8' : '#64748B',
                  }}
                >
                  Inactivo
                </span>
              )}
            </div>
          </div>

          {/* Conteo de integrantes — destacado */}
          <div
            className="flex flex-col items-center justify-center rounded-xl px-3 py-2 shrink-0"
            style={{
              background: isDark ? 'hsl(219,70%,60%,0.12)' : '#1B3A6B12',
              minWidth: 52,
            }}
          >
            <p
              className="text-xl font-bold leading-none"
              style={{ color: isDark ? 'hsl(219,70%,65%)' : NAVY }}
            >
              {group.memberCount}
            </p>
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mt-0.5">
              {group.memberCount === 1 ? 'miembro' : 'miembros'}
            </p>
          </div>
        </div>

        {/* Separador dorado */}
        <div className="h-px" style={{ background: `${GOLD}33` }} />

        {/* Metadatos */}
        <div className="space-y-1.5">
          {/* Líder */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center rounded-md p-1 shrink-0"
              style={{ background: hasLeader ? `${GOLD}22` : undefined }}
            >
              <User
                className="h-3.5 w-3.5"
                style={{ color: hasLeader ? GOLD : undefined }}
              />
            </div>
            <p
              className={`text-sm truncate ${
                hasLeader ? 'text-foreground font-medium' : 'text-muted-foreground italic'
              }`}
            >
              {leadersLabel(group)}
            </p>
          </div>

          {/* Reunión */}
          {(group.meetingDay || group.meetingTime) && (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-md p-1 shrink-0 bg-muted">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="text-sm text-foreground">
                {[group.meetingDay, group.meetingTime].filter(Boolean).join(' · ')}
              </p>
            </div>
          )}

          {/* Lugar */}
          {group.meetingPlace && (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-md p-1 shrink-0 bg-muted">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground truncate">{group.meetingPlace}</p>
            </div>
          )}
        </div>

        {/* Modalidad badge */}
        {modeCfg && modeColor && (
          <div>
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: modeColor + '18', color: modeColor }}
            >
              {modeCfg.label}
            </span>
          </div>
        )}
      </div>

      {/* Footer con acciones */}
      <div className="flex items-center justify-between border-t border-border/60 px-5 py-3 bg-muted/30">
        <Link
          to={`/misionero/grupos/${group.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Ver detalle
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>

        <div className="flex items-center gap-1">
          {canEdit && (
            <Link
              to={`/misionero/grupos/${group.id}/editar`}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Editar"
            >
              <Edit className="h-3.5 w-3.5" />
            </Link>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(group)}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Eliminar"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SmallGroupsListPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const fullAccess = hasMissionFullAccess()
  const maestro = isMaestroClase()

  const allQuery = useSmallGroupsList()
  const myQuery = useMySmallGroups()
  const query = maestro ? myQuery : allQuery

  const deleteMutation = useDeleteSmallGroup()
  const [toDelete, setToDelete] = useState<SmallGroupResponseDto | null>(null)

  const groups = query.data ?? []
  const activeCount = groups.filter((g) => g.isActive).length

  function handleDeleteConfirm() {
    if (!toDelete) return
    deleteMutation.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success('Grupo eliminado correctamente')
        setToDelete(null)
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'No se pudo eliminar el grupo'
        toast.error(msg)
        setToDelete(null)
      },
    })
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-2xl font-bold text-foreground">
            {maestro ? 'Mi grupo pequeño' : 'Grupos pequeños'}
          </p>
          {!query.isLoading && groups.length > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeCount} activo{activeCount !== 1 ? 's' : ''}
              {groups.length !== activeCount && ` · ${groups.length - activeCount} inactivo${groups.length - activeCount !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        {fullAccess && (
          <Link
            to="/misionero/grupos/nuevo"
            data-testid="small-group-new-button"
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
            Nuevo grupo
          </Link>
        )}
      </div>

      {/* Loading */}
      {query.isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
              <div className="h-1.5 bg-muted" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/3" />
                <div className="h-px bg-muted" />
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!query.isLoading && groups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div
            className="flex items-center justify-center rounded-full p-5"
            style={{ background: isDark ? 'hsl(219,70%,60%,0.1)' : '#1B3A6B0D' }}
          >
            <UsersRound
              className="h-10 w-10"
              style={{ color: isDark ? 'hsl(219,70%,60%)' : NAVY, opacity: 0.5 }}
            />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-foreground">
              {maestro ? 'No eres líder de ningún grupo' : 'No hay grupos pequeños'}
            </p>
            <p className="text-sm text-muted-foreground">
              {maestro
                ? 'Contacta al coordinador para que te asigne un grupo.'
                : 'Crea el primer grupo para comenzar a organizar.'}
            </p>
          </div>
          {fullAccess && (
            <Link
              to="/misionero/grupos/nuevo"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Crear primer grupo
            </Link>
          )}
        </div>
      )}

      {/* Grid de tarjetas */}
      {!query.isLoading && groups.length > 0 && (
        <div
          className="grid gap-4"
          data-testid="small-group-list"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
        >
          {groups.map((g, i) => (
            <SmallGroupCard
              key={g.id}
              group={g}
              idx={i}
              canEdit={fullAccess || maestro}
              canDelete={fullAccess}
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
        title="¿Eliminar grupo pequeño?"
        description={`Se eliminará "${toDelete?.name ?? toDelete?.actionUnit}" y todos sus registros de integrantes. Las Personas no serán eliminadas.`}
        confirmLabel={deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
