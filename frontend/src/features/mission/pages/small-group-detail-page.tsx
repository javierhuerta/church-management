import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Phone,
  User,
  UsersRound,
  Edit,
  UserPlus,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '@/components/theme-provider'
import {
  useSmallGroup,
  useAddSmallGroupMember,
  useRemoveSmallGroupMember,
} from '../hooks/use-small-groups'
import { hasMissionFullAccess, isMaestroClase, getUserId } from '../lib/permissions'
import { PersonCombobox } from '../components/person-combobox'
import { usePeopleList } from '../hooks/use-people-list'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { SmallGroupMemberResponseDto } from '@/lib/api/models/SmallGroupMemberResponseDto'

const NAVY = '#1B3A6B'

const MODE_COLORS: Record<string, { light: string; dark: string }> = {
  Presencial: { light: '#0F766E', dark: '#0D9488' },
  Online:     { light: '#1B3A6B', dark: '#6B9FDB' },
  Mixto:      { light: '#B45309', dark: '#D97706' },
}

export function SmallGroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const { data: group, isLoading } = useSmallGroup(id ?? '')
  const addMember = useAddSmallGroupMember(id ?? '')
  const removeMember = useRemoveSmallGroupMember(id ?? '')

  const { data: peopleData } = usePeopleList('')
  const peopleList = (peopleData?.data ?? []).map((p) => ({
    id: p.id,
    label: [p.firstName, p.lastName].filter(Boolean).join(' '),
  }))

  const fullAccess = hasMissionFullAccess()
  const maestro = isMaestroClase()
  const currentUserId = getUserId()

  // A MaestroClase can manage members only if they lead this group
  const isLeader = group?.leaders?.some((l) => l.leaderUserId === currentUserId) ?? false
  const canManageMembers = fullAccess || (maestro && isLeader)

  const [addPersonId, setAddPersonId] = useState<string | null>(null)
  const [memberToRemove, setMemberToRemove] = useState<SmallGroupMemberResponseDto | null>(null)

  function handleAddMember() {
    if (!addPersonId) return
    addMember.mutate(addPersonId, {
      onSuccess: () => {
        toast.success('Integrante agregado')
        setAddPersonId(null)
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'No se pudo agregar el integrante'
        toast.error(msg)
      },
    })
  }

  function handleRemoveConfirm() {
    if (!memberToRemove) return
    removeMember.mutate(memberToRemove.personId, {
      onSuccess: () => {
        toast.success('Integrante removido')
        setMemberToRemove(null)
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'No se pudo remover el integrante'
        toast.error(msg)
        setMemberToRemove(null)
      },
    })
  }

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Cargando grupo...</p>
  }

  if (!group) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Grupo no encontrado.</p>
        <button onClick={() => navigate(-1)} className="text-primary text-sm hover:underline mt-2">
          Volver
        </button>
      </div>
    )
  }

  const modeColor = group.meetingMode
    ? (isDark ? MODE_COLORS[group.meetingMode]?.dark : MODE_COLORS[group.meetingMode]?.light)
    : undefined

  const members = group.members ?? []

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors mt-0.5"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-2xl font-bold text-foreground">
              {group.name ?? group.actionUnit}
            </p>
            {group.meetingMode && modeColor && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: modeColor + '22', color: modeColor }}
              >
                {group.meetingMode}
              </span>
            )}
            {!group.isActive && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: '#47556922', color: isDark ? '#94A3B8' : '#475569' }}
              >
                Inactivo
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{group.actionUnit}</p>
        </div>
        {(fullAccess || (maestro && isLeader)) && (
          <Link
            to={`/misionero/grupos/${group.id}/editar`}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0"
            title="Editar grupo"
          >
            <Edit className="h-4 w-4 text-muted-foreground" />
          </Link>
        )}
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Información del grupo
        </p>

        {/* Leaders */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Líder(es)
          </p>
          {group.leaders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin líderes asignados</p>
          ) : (
            group.leaders.map((l) => (
              <div key={l.id} className="flex items-center gap-1.5 text-sm">
                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-foreground">
                  {l.leaderUserName ?? l.leaderPersonName ?? '—'}
                </span>
                {l.leaderUserId && (
                  <span className="text-[10px] text-muted-foreground">(usuario)</span>
                )}
                {l.leaderPersonId && !l.leaderUserId && (
                  <span className="text-[10px] text-muted-foreground">(persona)</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Promoter */}
        {group.promoterPersonName && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Promotor misionero
            </p>
            <p className="text-sm text-foreground mt-0.5">{group.promoterPersonName}</p>
          </div>
        )}

        {/* Sabbath class */}
        {group.sabbathClassName && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Clase de Escuela Sabática
            </p>
            <p className="text-sm text-foreground mt-0.5">{group.sabbathClassName}</p>
          </div>
        )}

        {/* Meeting info */}
        {(group.meetingDay || group.meetingTime || group.meetingPlace) && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Reunión
            </p>
            {(group.meetingDay || group.meetingTime) && (
              <div className="flex items-center gap-1.5 text-sm text-foreground">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                {[group.meetingDay, group.meetingTime].filter(Boolean).join(' · ')}
              </div>
            )}
            {group.meetingPlace && (
              <div className="flex items-center gap-1.5 text-sm text-foreground">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                {group.meetingPlace}
              </div>
            )}
          </div>
        )}

        {/* Contact */}
        {group.contactPhone && (
          <div className="flex items-center gap-1.5 text-sm text-foreground">
            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            {group.contactPhone}
          </div>
        )}

        {/* Notes */}
        {group.notes && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Notas
            </p>
            <p className="text-sm text-foreground mt-0.5 whitespace-pre-line">{group.notes}</p>
          </div>
        )}
      </div>

      {/* Members */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">
              Integrantes ({members.length})
            </p>
          </div>
        </div>

        {/* Add member */}
        {canManageMembers && (
          <div className="flex gap-2 items-end" data-testid="group-add-member-section">
            <div className="flex-1 space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium">Agregar integrante</p>
              <PersonCombobox
                value={addPersonId ?? ''}
                onChange={(v) => setAddPersonId(v || null)}
                people={peopleList}
                clearable
                placeholder="Buscar persona..."
              />
            </div>
            <button
              onClick={handleAddMember}
              disabled={!addPersonId || addMember.isPending}
              data-testid="group-add-member-button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: addPersonId ? (isDark ? 'hsl(219,70%,60%)' : NAVY) : undefined,
                color: addPersonId ? (isDark ? 'hsl(222,47%,8%)' : '#FAFAFA') : undefined,
                border: 'none',
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 600,
                opacity: !addPersonId || addMember.isPending ? 0.5 : 1,
                cursor: !addPersonId || addMember.isPending ? 'not-allowed' : 'pointer',
              }}
              className={!addPersonId ? 'bg-muted text-muted-foreground' : ''}
            >
              <UserPlus className="h-4 w-4" />
              {addMember.isPending ? 'Agregando...' : 'Agregar'}
            </button>
          </div>
        )}

        {/* Members list */}
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin integrantes registrados.</p>
        ) : (
          <ul
            className="divide-y divide-border"
            data-testid="group-members-list"
          >
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2.5 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {m.personName}
                  </p>
                  {m.phone && (
                    <p className="text-xs text-muted-foreground">{m.phone}</p>
                  )}
                </div>
                {canManageMembers && (
                  <button
                    onClick={() => setMemberToRemove(m)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0"
                    title="Quitar integrante"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirm remove member */}
      <ConfirmDialog
        open={!!memberToRemove}
        onOpenChange={(o) => { if (!o) setMemberToRemove(null) }}
        title="¿Quitar integrante?"
        description={`Se quitará a "${memberToRemove?.personName}" del grupo. La persona no será eliminada del sistema.`}
        confirmLabel={removeMember.isPending ? 'Quitando...' : 'Quitar'}
        variant="destructive"
        onConfirm={handleRemoveConfirm}
      />
    </div>
  )
}
