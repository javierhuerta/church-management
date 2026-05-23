import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { keepPreviousData } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, UserX, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { MissionPeopleService } from '@/lib/api'
import type { PersonResponseDto } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'
import { useTheme } from '@/components/theme-provider'
import { BaptizedBadge } from '../components/baptized-badge'
import { hasMissionFullAccess } from '../lib/permissions'

const PAGE_SIZE = 20

function EmptyState() {
  return (
    <div className="rounded-xl border border-border bg-card p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <UserX className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-base font-semibold text-muted-foreground">
        No hay personas registradas
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        Registra la primera persona para comenzar.
      </p>
    </div>
  )
}

function fullName(person: PersonResponseDto): string {
  return [person.firstName, person.lastName].filter(Boolean).join(' ')
}

export function PeopleListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const canEdit = hasMissionFullAccess()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['mission-people', { page, search }],
    queryFn: () =>
      MissionPeopleService.missionControllerFindAll(
        page,
        PAGE_SIZE,
        search.trim() || undefined,
      ),
    placeholderData: keepPreviousData,
  })

  const people = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      MissionPeopleService.missionControllerRemove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission-people'] })
      toast.success('Persona eliminada')
      setDeleteId(null)
    },
    onError: (err: { body?: { message?: string } }) => {
      toast.error(err.body?.message ?? 'Error al eliminar la persona')
      setDeleteId(null)
    },
  })

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-2xl font-bold text-foreground">Personas</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} persona{total !== 1 ? 's' : ''}
          </p>
        </div>
        {canEdit && (
          <Link
            to="/misionero/personas/nuevo"
            data-testid="people-new-button"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: isDark ? 'hsl(219,70%,60%)' : '#1B3A6B',
              color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA',
              border: 'none', borderRadius: 8, padding: '8px 16px',
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
            }}
          >
            <Plus className="h-4 w-4" />
            Nueva persona
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          data-testid="people-search-input"
          placeholder="Buscar persona..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      {isLoading && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Cargando personas...</p>
        </div>
      )}

      {!isLoading && total === 0 && !search && <EmptyState />}

      {!isLoading && people.length === 0 && search && (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No se encontraron personas para "{search}"
          </p>
        </div>
      )}

      {!isLoading && people.length > 0 && (
        <div data-testid="people-list">
          {/* Mobile: tarjetas apiladas */}
          <div className="md:hidden space-y-2">
            {people.map((person) => (
                <div
                  key={person.id}
                  onClick={() => navigate(`/misionero/personas/${person.id}`)}
                  className="rounded-xl border border-border bg-card p-4 space-y-2.5 hover:shadow-md transition-shadow cursor-pointer"
                  style={{ borderLeft: `3px solid ${person.isBaptizedMember ? '#0F766E' : '#475569'}` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {fullName(person)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {person.phone ?? 'Sin teléfono'}
                      </p>
                    </div>
                    <BaptizedBadge isBaptized={person.isBaptizedMember} />
                  </div>
                  {canEdit && (
                    <div
                      className="flex items-center gap-1 pt-1 border-t border-border"
                      onClick={(e) => e.stopPropagation()}
                    >
                    <Link to={`/misionero/personas/${person.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                      onClick={() => setDeleteId(person.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Miembro
                  </th>
                  {canEdit && <th className="px-4 py-3 w-24" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {people.map((person) => (
                  <tr
                    key={person.id}
                    className="hover:bg-accent/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/misionero/personas/${person.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-primary/10 border border-border flex items-center justify-center text-xs font-semibold text-primary">
                          {person.firstName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">
                          {fullName(person)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {person.phone ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <BaptizedBadge isBaptized={person.isBaptizedMember} />
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center gap-1 justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link to={`/misionero/personas/${person.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                            onClick={() => setDeleteId(person.id)}
                          >
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
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            {total} {total === 1 ? 'persona' : 'personas'} · página {page} de{' '}
            {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Eliminar persona"
        description="¿Estás seguro de que deseas eliminar esta persona? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}
