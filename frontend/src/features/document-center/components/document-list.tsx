import { useState } from 'react'
import { useTheme } from '@/components/theme-provider'
import { FileText, Download, Trash2, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useDeleteDocument } from '../hooks/use-document-center'
import { getDepartmentStyle } from '@/features/calendar/utils/labels'
import { toast } from 'sonner'

const NAVY = '#1B3A6B'

interface Document {
  id: string
  originalName: string
  month: number
  year: number
  category?: string
  department?: { id: string; name: string } | null
}

interface DocumentListProps {
  documents: Document[]
  canEdit: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  CHURCH_MINUTES: 'Acta de Junta',
  DEPARTMENT_PLAN: 'Plan de Trabajo',
  TREASURY_REPORT: 'Informe de Tesorería',
  MISSION_REPORT: 'Informe Misionero',
  OTHER: 'Otros',
}

const MONTH_LABELS = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function DocumentList({ documents, canEdit }: DocumentListProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const deleteDocument = useDeleteDocument()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteDocument.mutateAsync(deleteId)
      toast.success('Documento eliminado')
    } catch {
      toast.error('Error al eliminar documento')
    }
    setDeleteId(null)
  }

  const handleDownload = async (id: string, originalName: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/documents/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = originalName
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Error al descargar documento')
    }
  }

  const groupedByMonthAndCategory = documents.reduce((acc, doc) => {
    const monthKey = doc.month
    const categoryKey = doc.category ?? 'OTHER'
    if (!acc[monthKey]) acc[monthKey] = {}
    if (!acc[monthKey][categoryKey]) acc[monthKey][categoryKey] = []
    acc[monthKey][categoryKey].push(doc)
    return acc
  }, {} as Record<number, Record<string, Document[]>>)

  const sortedMonths = Object.keys(groupedByMonthAndCategory)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div className="space-y-6">
      {sortedMonths.map((month) => (
        <div key={month} className="space-y-3">
          <div className="flex items-center gap-2">
            <div
              className="h-px flex-1"
              style={{ background: isDark ? 'hsl(222,25%,22%)' : 'hsl(36,20%,85%)' }}
            />
            <span
              className="text-sm font-semibold px-3 py-1 rounded-full"
              style={{
                background: isDark ? 'hsl(219,70%,30%)' : 'hsl(219,15%,92%)',
                color: isDark ? '#A8C4F0' : NAVY,
              }}
            >
              {MONTH_LABELS[month]}
            </span>
            <div
              className="h-px flex-1"
              style={{ background: isDark ? 'hsl(222,25%,22%)' : 'hsl(36,20%,85%)' }}
            />
          </div>

          {Object.entries(groupedByMonthAndCategory[month]).map(([category, docs]) => (
            <div key={category} className="sm:ml-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {CATEGORY_LABELS[category] || category}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground/70">
                  {docs.length}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {docs.map((doc) => {
                  const deptStyle = doc.department
                    ? getDepartmentStyle(doc.department.name)
                    : null
                  return (
                    <div
                      key={doc.id}
                      className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-card hover:shadow-md hover:border-primary/40 transition-all sm:flex-row sm:items-center sm:gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: isDark ? 'hsl(222,30%,16%)' : 'hsl(36,20%,93%)' }}
                        >
                          <FileText className="h-5 w-5" style={{ color: isDark ? '#6B9FDB' : NAVY }} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                            {doc.originalName}
                          </p>
                          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1">
                            {doc.department && deptStyle && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full max-w-[14rem]"
                                style={{ backgroundColor: deptStyle.backgroundColor, color: deptStyle.color }}
                              >
                                <span
                                  className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: deptStyle.dotColor }}
                                />
                                <span className="truncate">{doc.department.name}</span>
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">{doc.year}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 flex-shrink-0 self-end sm:self-center border-t border-border pt-2 sm:border-t-0 sm:pt-0 w-full sm:w-auto justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc.id, doc.originalName)}
                          className="h-9 gap-1.5 px-2.5 sm:w-9 sm:px-0"
                          aria-label="Descargar documento"
                        >
                          <Download className="h-4 w-4" />
                          <span className="text-xs sm:hidden">Descargar</span>
                        </Button>

                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(doc.id)}
                            className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                            aria-label="Eliminar documento"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ))}

      {documents.length === 0 && (
        <div className="text-center py-12">
          <File className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No hay documentos para este período</p>
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar documento</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este documento? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}