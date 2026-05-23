import { useState, useMemo } from 'react'
import { useTheme } from '@/components/theme-provider'
import { Plus, Calendar, Settings, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthUser } from '@/features/calendar/hooks/use-auth-user'
import { usePeriods, usePeriodByYear, useDocumentsByYear } from '../hooks/use-document-center'
import { PeriodSelector } from '../components/period-selector'
import { LeadershipContextCard } from '../components/leadership-context-card'
import { DocumentList } from '../components/document-list'
import { CreatePeriodDialog } from '../components/create-period-dialog'
import { ManageElderShiftsDialog } from '../components/manage-elder-shifts-dialog'
import { UploadDocumentDialog } from '../components/upload-document-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const NAVY = '#1B3A6B'

const EDITOR_ROLES = ['Admin', 'Pastor', 'Secretaria']

interface Document {
  id: string
  originalName: string
  month: number
  year: number
  category?: string
  department?: { id: string; name: string } | null
}

export function DocumentCenterPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const authUser = useAuthUser()

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [createPeriodOpen, setCreatePeriodOpen] = useState(false)
  const [manageShiftsOpen, setManageShiftsOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('')

  const queryClient = useQueryClient()
  const { data: periods } = usePeriods()
  const { data: period } = usePeriodByYear(selectedYear)
  const { data: allDocuments, refetch: refetchDocuments } = useDocumentsByYear(selectedYear)

  const canEdit = authUser?.role ? EDITOR_ROLES.includes(authUser.role) : false

  const invalidatePeriod = () => {
    queryClient.invalidateQueries({ queryKey: ['period'] })
    queryClient.invalidateQueries({ queryKey: ['periods'] })
  }

  const departments = useMemo(() => {
    const deptMap = new Map<string, { id: string; name: string }>()
    allDocuments?.forEach((doc: Document) => {
      if (doc.department) {
        deptMap.set(doc.department.id, doc.department)
      }
    })
    return Array.from(deptMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [allDocuments])

  const filteredDocuments = useMemo(() => {
    if (!allDocuments) return []
    let docs = allDocuments as Document[]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      docs = docs.filter((d) => d.originalName.toLowerCase().includes(query))
    }

    if (departmentFilter) {
      docs = docs.filter((d) => d.department?.id === departmentFilter)
    }

    return docs
  }, [allDocuments, searchQuery, departmentFilter])

  const handleCreatePeriodSuccess = () => {
    invalidatePeriod()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4 border-b border-border">
        <div>
          <p
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 26,
              fontWeight: 600,
              color: isDark ? '#A8C4F0' : NAVY,
              lineHeight: 1.25,
            }}
          >
            Centro de Documentos
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Actas, planes e informes de la iglesia
          </p>
        </div>

        {canEdit && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCreatePeriodOpen(true)}
                className="gap-2 flex-1 sm:flex-none"
              >
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{period ? 'Editar Período' : 'Crear Período'}</span>
              </Button>
              {period && (
                <Button
                  variant="outline"
                  onClick={() => setManageShiftsOpen(true)}
                  className="gap-2 flex-1 sm:flex-none"
                >
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{period.rotationMode === 'AUTOMATIC' ? 'Rotación' : 'Turnos'}</span>
                </Button>
              )}
            </div>
            <Button
              onClick={() => setUploadOpen(true)}
              className="gap-2 w-full sm:w-auto"
              style={{
                background: isDark ? 'hsl(219,70%,60%)' : NAVY,
                color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA',
              }}
            >
              <Plus className="h-4 w-4 flex-shrink-0" />
              <span>Subir Documento</span>
            </Button>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Búsqueda — full width en mobile, primera en la fila en desktop */}
          <div className="relative order-1 sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre..."
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Año + departamento — comparten fila en mobile */}
          <div className="flex items-center gap-3 order-2 sm:order-none">
            <PeriodSelector
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
            {departments.length > 0 && (
              <Select value={departmentFilter || '__all__'} onValueChange={(v) => setDepartmentFilter(v === '__all__' ? '' : v)}>
                <SelectTrigger className="flex-1 sm:flex-none sm:w-[200px]">
                  <SelectValue placeholder="Todos los departamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todos los departamentos</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {period && (
          <LeadershipContextCard period={period} />
        )}

        <DocumentList
          documents={filteredDocuments}
          canEdit={canEdit}
        />
      </div>

      <CreatePeriodDialog
        open={createPeriodOpen}
        onOpenChange={setCreatePeriodOpen}
        editYear={period ? selectedYear : null}
        selectedYear={selectedYear}
        onSuccess={handleCreatePeriodSuccess}
      />

      {period && (
        <ManageElderShiftsDialog
          open={manageShiftsOpen}
          onOpenChange={setManageShiftsOpen}
          periodId={period.id}
        />
      )}

      <UploadDocumentDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        year={selectedYear}
        periods={periods ?? []}
        onSuccess={refetchDocuments}
      />
    </div>
  )
}