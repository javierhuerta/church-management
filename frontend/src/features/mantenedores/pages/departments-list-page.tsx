import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Building2, Search, BookOpen } from 'lucide-react'
import { DepartmentsService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'

function EmptyState() {
  return (
    <div className="rounded-xl border border-border bg-card p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Building2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-muted-foreground">No hay departamentos registrados</h3>
      <p className="text-sm text-muted-foreground mt-1">Crea el primer departamento para comenzar.</p>
    </div>
  )
}

export function DepartmentsListPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => DepartmentsService.departmentsControllerFindAll(),
  })

  const filteredDepartments = search.trim()
    ? departments.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
    : departments

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3 px-1">
        <h2 className="text-xl font-semibold text-muted-foreground">Departamentos</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative min-w-0 w-full sm:w-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar departamento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-sm w-full sm:w-48"
            />
          </div>
          <Link to="/mantenedores/departamentos/nuevo" className="shrink-0">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Nuevo departamento
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Cargando departamentos...</p>
        </div>
      )}

      {!isLoading && departments.length === 0 && <EmptyState />}

      {!isLoading && filteredDepartments.length === 0 && search && (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">No se encontraron departamentos para "{search}"</p>
        </div>
      )}

      {!isLoading && filteredDepartments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDepartments.map((dept) => (
            <div
              key={dept.id}
              className="bg-card rounded-xl border border-border p-4 flex items-center justify-between hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => navigate(`/departamentos/${dept.id}`)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="h-8 w-8 rounded-full border-2 shrink-0"
                  style={{ backgroundColor: dept.color, borderColor: `${dept.color}44` }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">{dept.name}</p>
                    {dept.sigla && (
                      <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-border text-muted-foreground bg-muted">
                        {dept.sigla}
                      </span>
                    )}
                    {/* Task 9.3: Showcase indicator */}
                    {dept.hasShowcase && (
                      <BookOpen
                        className="h-3.5 w-3.5 shrink-0"
                        style={{ color: dept.color }}
                        title="Tiene showcase publicado"
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {dept.directors && dept.directors.length > 0
                      ? `${dept.directors.length} director${dept.directors.length > 1 ? 'es' : ''}`
                      : 'Sin directores'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <Link to={`/mantenedores/departamentos/${dept.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
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
