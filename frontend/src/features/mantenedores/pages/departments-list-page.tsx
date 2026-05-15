import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { DepartmentsService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DEPARTMENT_LABELS } from '@/features/calendar/utils/labels'
import { toast } from 'sonner'

export function DepartmentsListPage() {
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => DepartmentsService.departmentsControllerFindAll(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => DepartmentsService.departmentsControllerRemove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.success('Departamento eliminado')
      setDeleteId(null)
    },
    onError: (err: { body?: { message?: string } }) => {
      toast.error(err.body?.message ?? 'Error al eliminar el departamento')
      setDeleteId(null)
    },
  })

  function getDeptDisplayName(name: string): string {
    return DEPARTMENT_LABELS[name as keyof typeof DEPARTMENT_LABELS] ?? name
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Departamentos</h2>
        <Link to="/mantenedores/departamentos/nuevo">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Nuevo departamento
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="text-sm text-neutral-500">Cargando departamentos...</div>
      )}

      {!isLoading && departments.length === 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
          No hay departamentos registrados.
        </div>
      )}

      {!isLoading && departments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-neutral-900">{getDeptDisplayName(dept.name)}</p>
                {getDeptDisplayName(dept.name) !== dept.name && (
                  <p className="text-xs text-neutral-400 mt-0.5">{dept.name}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Link to={`/mantenedores/departamentos/${dept.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setDeleteId(dept.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Eliminar departamento"
        description="¿Estás seguro de que deseas eliminar este departamento? Los eventos asociados quedarán sin departamento."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}
