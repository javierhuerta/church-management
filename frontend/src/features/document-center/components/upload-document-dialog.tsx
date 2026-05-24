import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/components/theme-provider'
import { Upload, FileText, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DepartmentsService, DocumentsService } from '@/lib/api'
import type { CreateDocumentDto } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

const NAVY = '#1B3A6B'

interface Period {
  id: string
  year: number
  pastor?: { name: string } | null
}

interface UploadDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  year: number
  periods: Period[]
  onSuccess?: () => void
}

const CATEGORIES = [
  { value: 'CHURCH_MINUTES', label: 'Acta de Junta', abbr: 'ACTA' },
  { value: 'DEPARTMENT_PLAN', label: 'Plan de Trabajo', abbr: 'PLAN' },
  { value: 'TREASURY_REPORT', label: 'Informe de Tesorería', abbr: 'TESORERIA' },
  { value: 'MISSION_REPORT', label: 'Informe Misionero', abbr: 'MISION' },
  { value: 'OTHER', label: 'Otros', abbr: 'OTRO' },
]

const MONTHS = [
  { value: 1, label: 'Enero', abbr: '01' },
  { value: 2, label: 'Febrero', abbr: '02' },
  { value: 3, label: 'Marzo', abbr: '03' },
  { value: 4, label: 'Abril', abbr: '04' },
  { value: 5, label: 'Mayo', abbr: '05' },
  { value: 6, label: 'Junio', abbr: '06' },
  { value: 7, label: 'Julio', abbr: '07' },
  { value: 8, label: 'Agosto', abbr: '08' },
  { value: 9, label: 'Septiembre', abbr: '09' },
  { value: 10, label: 'Octubre', abbr: '10' },
  { value: 11, label: 'Noviembre', abbr: '11' },
  { value: 12, label: 'Diciembre', abbr: '12' },
]

interface Department {
  id: string
  name: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function generateSuggestedName(category: string, year: number, month: number, departmentName?: string): string {
  const cat = CATEGORIES.find((c) => c.value === category)
  const mo = MONTHS.find((m) => m.value === month)
  if (!cat || !mo) return ''
  const deptPart = departmentName ? `_${departmentName.replace(/\s+/g, '_')}` : ''
  return `${cat.abbr}${deptPart}_${year}_${mo.abbr}`
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  year,
  periods,
  onSuccess,
}: UploadDocumentDialogProps) {
  const [category, setCategory] = useState<string>('')
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
  const [periodId, setPeriodId] = useState<string>('')
  const [departmentId, setDepartmentId] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [customName, setCustomName] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const period = periods.find((p) => p.year === year)

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => DepartmentsService.departmentsControllerFindAll() as Promise<Department[]>,
    enabled: category === 'DEPARTMENT_PLAN',
  })

  const selectedDepartment = departments?.find((d) => d.id === departmentId)
  const fileExtension = file?.name.split('.').pop()?.toLowerCase() || 'pdf'

  useEffect(() => {
    if (category && month) {
      setCustomName(generateSuggestedName(category, year, month, selectedDepartment?.name))
    }
  }, [category, month, selectedDepartment?.name, year])

  useEffect(() => {
    if (category !== 'DEPARTMENT_PLAN') {
      setDepartmentId('')
    }
  }, [category])

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
  }

  const handleSubmit = async () => {
    if (!file || !category || !customName) return

    setUploading(true)
    try {
      const formData: CreateDocumentDto & { file: unknown } = {
        file: file,
        year,
        month,
        category: category as CreateDocumentDto.category,
        originalName: customName,
        ...(periodId ? { periodId } : {}),
        ...(departmentId ? { departmentId } : {}),
      }

      await DocumentsService.documentCenterControllerUpload(
        formData as unknown as CreateDocumentDto,
      )

      toast.success('Documento subido exitosamente')
      onOpenChange(false)
      setFile(null)
      setCategory('')
      setCustomName('')
      setPeriodId('')
      setDepartmentId('')
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al subir documento')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (validTypes.includes(droppedFile.type) || droppedFile.name.endsWith('.pdf') || droppedFile.name.endsWith('.docx')) {
        handleFileSelect(droppedFile)
      } else {
        toast.error('Solo se permiten archivos PDF y Word (.pdf, .docx)')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: '"Playfair Display", Georgia, serif', color: isDark ? '#A8C4F0' : NAVY }}>
            Subir Documento
          </DialogTitle>
          <DialogDescription>
            Agrega un documento al año {year}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mes</Label>
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {category === 'DEPARTMENT_PLAN' && (
            <div className="space-y-2">
              <Label>Departamento</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {period && (
            <div className="space-y-2">
              <Label>Asociar a período</Label>
              <Select value={periodId || 'none'} onValueChange={(v) => setPeriodId(v === 'none' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asociar</SelectItem>
                  <SelectItem value={period.id}>
                    {period.year}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Nombre del archivo</Label>
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Nombre sugerido"
              disabled={!category || !month}
              className="max-w-full truncate"
            />
            <p className="text-xs text-muted-foreground">
              Extensión: .{fileExtension}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Archivo</Label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0]
                  if (selectedFile) handleFileSelect(selectedFile)
                }}
              />
              {file ? (
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: isDark ? 'hsl(222,30%,16%)' : 'hsl(36,20%,93%)' }}
                  >
                    <FileText className="h-6 w-6" style={{ color: isDark ? '#6B9FDB' : NAVY }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate max-w-[200px]" title={file.name}>{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                      setCustomName('')
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Arrastra un archivo o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF o Word (.pdf, .docx)
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || !category || !customName || uploading}
            style={{
              background: isDark ? 'hsl(219,70%,60%)' : NAVY,
              color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA',
            }}
          >
            {uploading ? 'Subiendo...' : 'Subir Documento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}