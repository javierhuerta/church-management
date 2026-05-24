import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, UserMinus, Edit } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from '@/components/theme-provider'
import {
  useMissionaryTeam,
  useAddTeamMember,
  useRemoveTeamMember,
} from '../hooks/use-missionary-teams'
import { hasMissionFullAccess } from '../lib/permissions'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PersonCombobox } from '../components/person-combobox'
import { MissionPeopleService } from '@/lib/api/services/MissionPeopleService'
import type { MissionaryTeamMemberResponseDto } from '@/lib/api/models/MissionaryTeamMemberResponseDto'

const NAVY = '#1B3A6B'

export function MissionaryTeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const fullAccess = hasMissionFullAccess()

  const query = useMissionaryTeam(id ?? '')
  const addMemberMutation = useAddTeamMember(id ?? '')
  const removeMemberMutation = useRemoveTeamMember(id ?? '')

  const [toRemove, setToRemove] = useState<MissionaryTeamMemberResponseDto | null>(null)
  const [addPersonId, setAddPersonId] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const peopleQuery = useQuery({
    queryKey: ['people-all'],
    queryFn: () => MissionPeopleService.missionControllerFindAll(1, 500),
  })

  const people: Array<{ id: string; label: string }> = (() => {
    const data = peopleQuery.data
    if (!data) return []
    const arr = Array.isArray(data) ? data : (data as { data?: unknown[] }).data ?? []
    return (arr as Array<{ id: string; firstName: string; lastName?: string | null }>).map((p) => ({
      id: p.id,
      label: `${p.firstName} ${p.lastName ?? ''}`.trim(),
    }))
  })()

  const team = query.data
  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        Cargando...
      </div>
    )
  }
  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-foreground font-semibold">Equipo no encontrado</p>
        <Link to="/misionero/equipos" className="text-sm text-primary hover:underline">
          Volver al listado
        </Link>
      </div>
    )
  }

  const activeMembers = team.members.filter((m) => m.isActive)
  const historicalMembers = team.members.filter((m) => !m.isActive)

  function handleAddMember() {
    if (!addPersonId) return
    addMemberMutation.mutate(
      { personId: addPersonId },
      {
        onSuccess: () => {
          toast.success('Integrante agregado correctamente')
          setAddPersonId('')
          setShowAddForm(false)
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : 'No se pudo agregar el integrante'
          toast.error(msg)
        },
      },
    )
  }

  function handleRemoveConfirm() {
    if (!toRemove) return
    removeMemberMutation.mutate(
      { memberId: toRemove.id },
      {
        onSuccess: (result) => {
          toast.success('Integrante removido correctamente')
          if (result.warning) {
            toast.warning(result.warning)
          }
          setToRemove(null)
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : 'No se pudo remover el integrante'
          toast.error(msg)
          setToRemove(null)
        },
      },
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back */}
      <button
        onClick={() => navigate('/misionero/equipos')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al listado
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-2xl font-bold text-foreground">
            {activeMembers.length > 0
              ? activeMembers.map((m) => m.personName).join(' + ')
              : team.label ?? 'Equipo misionero'}
          </p>
          {team.label && (
            <p className="text-sm text-muted-foreground mt-0.5">{team.label}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: isDark ? 'hsl(219,70%,60%,0.12)' : '#1B3A6B12',
                color: isDark ? 'hsl(219,70%,65%)' : NAVY,
              }}
            >
              {team.audience}
            </span>
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
            <span className="text-[11px] text-muted-foreground px-2 py-1">
              Período {team.periodYear}
            </span>
          </div>
        </div>

        {fullAccess && (
          <Link
            to={`/misionero/equipos/${team.id}/editar`}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Edit className="h-4 w-4" />
            Editar equipo
          </Link>
        )}
      </div>

      {/* Notes */}
      {team.notes && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">{team.notes}</p>
        </div>
      )}

      {/* Active members */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-foreground">
            Integrantes activos ({activeMembers.length})
          </p>
          {fullAccess && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <UserPlus className="h-4 w-4" />
              Agregar
            </button>
          )}
        </div>

        {/* Add member form */}
        {showAddForm && fullAccess && (
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">Agregar integrante</p>
            <PersonCombobox
              value={addPersonId}
              onChange={setAddPersonId}
              people={people.filter((p) => !activeMembers.some((m) => m.personId === p.id))}
              placeholder="Buscar persona..."
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setAddPersonId('') }}
                className="flex-1 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddMember}
                disabled={!addPersonId || addMemberMutation.isPending}
                style={{
                  flex: 1,
                  background: isDark ? 'hsl(219,70%,60%)' : NAVY,
                  color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: !addPersonId || addMemberMutation.isPending ? 'not-allowed' : 'pointer',
                  opacity: !addPersonId || addMemberMutation.isPending ? 0.7 : 1,
                }}
              >
                {addMemberMutation.isPending ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </div>
        )}

        {/* Members list */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {activeMembers.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground italic">
              Sin integrantes activos
            </div>
          ) : (
            activeMembers.map((m, idx) => (
              <div
                key={m.id}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  idx < activeMembers.length - 1 ? 'border-b border-border/60' : ''
                } hover:bg-muted/30 transition-colors`}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{m.personName}</p>
                  {m.phone && (
                    <p className="text-xs text-muted-foreground">{m.phone}</p>
                  )}
                  {m.joinedAt && (
                    <p className="text-xs text-muted-foreground">
                      Desde {new Date(m.joinedAt).toLocaleDateString('es-CL')}
                    </p>
                  )}
                </div>
                {fullAccess && (
                  <button
                    onClick={() => setToRemove(m)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Remover integrante"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Historical members */}
      {historicalMembers.length > 0 && (
        <div className="space-y-3">
          <p className="text-base font-semibold text-foreground">
            Histórico de integrantes ({historicalMembers.length})
          </p>
          <div className="rounded-xl border border-border bg-card overflow-hidden opacity-70">
            {historicalMembers.map((m, idx) => (
              <div
                key={m.id}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  idx < historicalMembers.length - 1 ? 'border-b border-border/60' : ''
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-foreground line-through">{m.personName}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {m.joinedAt && (
                      <span>Ingresó: {new Date(m.joinedAt).toLocaleDateString('es-CL')}</span>
                    )}
                    {m.leftAt && (
                      <span>Salió: {new Date(m.leftAt).toLocaleDateString('es-CL')}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm remove */}
      <ConfirmDialog
        open={!!toRemove}
        onOpenChange={(o) => { if (!o) setToRemove(null) }}
        title="¿Remover integrante?"
        description={`Se registrará la fecha de salida de "${toRemove?.personName}". El registro histórico se conservará.${
          activeMembers.length <= 2
            ? '\n\n⚠️ El equipo quedará con menos de 2 integrantes activos.'
            : ''
        }`}
        confirmLabel={removeMemberMutation.isPending ? 'Removiendo...' : 'Remover'}
        variant="destructive"
        onConfirm={handleRemoveConfirm}
      />
    </div>
  )
}
