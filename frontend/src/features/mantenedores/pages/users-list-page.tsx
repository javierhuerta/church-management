import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, UserX, Search } from 'lucide-react'
import { UsersService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'

const ROLE_LABELS: Record<string, string> = {
  Admin: 'Administrador',
  Pastor: 'Pastor',
  Anciano: 'Anciano',
  CoordinadorMisionero: 'Coordinador Misionero',
  DirectorDepartamento: 'Director de Departamento',
  Secretaria: 'Secretaria',
  MaestroClase: 'Maestro de Clase',
}

const ROLE_BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  Admin: { bg: '#1B3A6B22', color: '#1B3A6B' },
  Pastor: { bg: '#C9A84C22', color: '#92600A' },
  Anciano: { bg: '#0F766E22', color: '#0F766E' },
  CoordinadorMisionero: { bg: '#7C3AED22', color: '#5B21B6' },
  DirectorDepartamento: { bg: '#2563EB22', color: '#2563EB' },
  Secretaria: { bg: '#47556922', color: '#475569' },
  MaestroClase: { bg: '#16A34A22', color: '#16A34A' },
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-border bg-card p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <UserX className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-muted-foreground">No hay usuarios registrados</h3>
      <p className="text-sm text-muted-foreground mt-1">Crea el primer usuario para comenzar.</p>
    </div>
  )
}

export function UsersListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => UsersService.usersControllerFindAll(),
  })

  const filteredUsers = search.trim()
    ? users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users

  const deleteMutation = useMutation({
    mutationFn: (id: string) => UsersService.usersControllerRemove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuario eliminado')
      setDeleteId(null)
    },
    onError: (err: { body?: { message?: string } }) => {
      toast.error(err.body?.message ?? 'Error al eliminar el usuario')
      setDeleteId(null)
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3 px-1">
        <h2 className="text-xl font-semibold text-muted-foreground">Usuarios</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative min-w-0 w-full sm:w-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-sm w-full sm:w-48"
            />
          </div>
          <Link to="/mantenedores/usuarios/nuevo" className="shrink-0">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Nuevo usuario
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
        </div>
      )}

      {!isLoading && users.length === 0 && <EmptyState />}

      {!isLoading && filteredUsers.length === 0 && search && (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">No se encontraron usuarios para "{search}"</p>
        </div>
      )}

      {!isLoading && filteredUsers.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Departamentos</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => {
                const roleCfg = ROLE_BADGE_COLORS[user.role] ?? { bg: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-accent/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/mantenedores/usuarios/${user.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-primary/10 border border-border flex items-center justify-center text-xs font-semibold text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: roleCfg.bg, color: roleCfg.color }}
                      >
                        {ROLE_LABELS[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.departments.length > 0
                        ? user.departments.map((d) => d.name).join(', ')
                        : <span className="text-muted-foreground">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                        <Link to={`/mantenedores/usuarios/${user.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                          onClick={() => setDeleteId(user.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Eliminar usuario"
        description="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}