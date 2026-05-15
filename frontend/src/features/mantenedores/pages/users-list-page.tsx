import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { UsersMantenedoresService } from '@/lib/api'
import { Button } from '@/components/ui/button'
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

export function UsersListPage() {
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => UsersMantenedoresService.usersControllerFindAll(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => UsersMantenedoresService.usersControllerRemove(id),
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Usuarios</h2>
        <Link to="/mantenedores/usuarios/nuevo">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Nuevo usuario
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="text-sm text-neutral-500">Cargando usuarios...</div>
      )}

      {!isLoading && users.length === 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
          No hay usuarios registrados.
        </div>
      )}

      {!isLoading && users.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Rol</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Departamentos</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-neutral-900">{user.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {user.departments.length > 0
                      ? user.departments.map((d) => d.name).join(', ')
                      : <span className="text-neutral-400">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/mantenedores/usuarios/${user.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteId(user.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
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
