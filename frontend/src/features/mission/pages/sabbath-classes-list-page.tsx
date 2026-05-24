import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, School, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '@/components/theme-provider'
import { useSabbathClassesList, useDeleteSabbathClass } from '../hooks/use-sabbath-classes'
import { hasMissionFullAccess } from '../lib/permissions'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { SabbathClassResponseDto } from '@/lib/api/models/SabbathClassResponseDto'

const NAVY = '#1B3A6B'

export function SabbathClassesListPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const fullAccess = hasMissionFullAccess()

  const query = useSabbathClassesList()
  const deleteMutation = useDeleteSabbathClass()
  const [toDelete, setToDelete] = useState<SabbathClassResponseDto | null>(null)

  const classes = query.data ?? []

  function handleDeleteConfirm() {
    if (!toDelete) return
    deleteMutation.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success('Clase eliminada correctamente')
        setToDelete(null)
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'No se pudo eliminar la clase'
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
            Clases de Escuela Sabática
          </p>
          {!query.isLoading && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {classes.filter((c) => c.isActive).length} activa{classes.filter((c) => c.isActive).length !== 1 ? 's' : ''}
              {classes.length !== classes.filter((c) => c.isActive).length &&
                ` · ${classes.length - classes.filter((c) => c.isActive).length} inactiva${classes.length - classes.filter((c) => c.isActive).length !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        {fullAccess && (
          <Link
            to="/misionero/clases-es/nuevo"
            data-testid="sabbath-class-new-button"
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
            Nueva clase
          </Link>
        )}
      </div>

      {/* Loading */}
      {query.isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 bg-muted rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!query.isLoading && classes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div
            className="flex items-center justify-center rounded-full p-5"
            style={{ background: isDark ? 'hsl(219,70%,60%,0.1)' : '#1B3A6B0D' }}
          >
            <School
              className="h-10 w-10"
              style={{ color: isDark ? 'hsl(219,70%,60%)' : NAVY, opacity: 0.5 }}
            />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-foreground">No hay clases de escuela sabática</p>
            <p className="text-sm text-muted-foreground">
              Crea la primera clase para comenzar.
            </p>
          </div>
          {fullAccess && (
            <Link
              to="/misionero/clases-es/nuevo"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Crear primera clase
            </Link>
          )}
        </div>
      )}

      {/* Table */}
      {!query.isLoading && classes.length > 0 && (
        <div
          className="rounded-xl border border-border bg-card overflow-hidden"
          data-testid="sabbath-classes-list"
        >
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-[3rem_1fr_2fr_6rem_5rem] gap-4 px-5 py-3 border-b border-border bg-muted/40">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">#</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nombre</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Descripción</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Orden</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Estado</p>
          </div>

          {classes.map((cls) => (
            <div
              key={cls.id}
              className={`flex flex-col md:grid md:grid-cols-[3rem_1fr_2fr_6rem_5rem] gap-2 md:gap-4 px-5 py-4 items-start md:items-center border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors ${
                !cls.isActive ? 'opacity-60' : ''
              }`}
            >
              {/* Order number */}
              <div className="flex items-center gap-3 md:block">
                <div
                  className="flex items-center justify-center rounded-lg h-8 w-8 shrink-0"
                  style={{
                    background: isDark ? 'hsl(219,70%,60%,0.12)' : '#1B3A6B12',
                  }}
                >
                  <p
                    className="text-sm font-bold"
                    style={{ color: isDark ? 'hsl(219,70%,65%)' : NAVY }}
                  >
                    {cls.displayOrder}
                  </p>
                </div>
                {/* Mobile: name inline with number */}
                <p className="text-sm font-semibold text-foreground md:hidden">{cls.name}</p>
              </div>

              {/* Name (desktop) */}
              <p className="hidden md:block text-sm font-semibold text-foreground">{cls.name}</p>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-1 md:line-clamp-none">
                {cls.description ?? <span className="italic">Sin descripción</span>}
              </p>

              {/* Display order (desktop) */}
              <p className="hidden md:block text-sm text-muted-foreground text-center">{cls.displayOrder}</p>

              {/* Status + actions */}
              <div className="flex items-center justify-between md:justify-center gap-2 w-full md:w-auto">
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: cls.isActive
                      ? isDark ? '#0D948822' : '#0F766E22'
                      : isDark ? '#47556922' : '#47556918',
                    color: cls.isActive
                      ? isDark ? '#0D9488' : '#0F766E'
                      : isDark ? '#94A3B8' : '#64748B',
                  }}
                >
                  {cls.isActive ? 'Activa' : 'Inactiva'}
                </span>

                {fullAccess && (
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/misionero/clases-es/${cls.id}/editar`}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => setToDelete(cls)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => { if (!o) setToDelete(null) }}
        title="¿Eliminar clase de escuela sabática?"
        description={`Se eliminará "${toDelete?.name}". Esta acción no se puede deshacer.`}
        confirmLabel={deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
