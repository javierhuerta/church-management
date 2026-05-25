import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'
import {
  Pencil,
  Eye,
  Upload,
  Trash2,
  FileText,
  Image,
  File,
  Loader2,
  ArrowLeft,
  Paperclip,
} from 'lucide-react'
import { DepartmentsService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { ShowcaseAttachmentResponseDto } from '@/lib/api'

// ─── Constants ───────────────────────────────────────────────────────────────

const NAVY = '#1B3A6B'
const ALLOWED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.gif,.webp,.docx,.xlsx'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShowcaseFormValues {
  description: string
  mission: string
  announcements: string
}

type PreviewField = 'description' | 'mission' | 'announcements' | null

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image
  if (mimeType === 'application/pdf') return FileText
  return File
}

// ─── Markdown Preview Toggle ──────────────────────────────────────────────────

function MarkdownField({
  label,
  name,
  value,
  onChange,
  placeholder,
  previewActive,
  onTogglePreview,
}: {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  previewActive: boolean
  onTogglePreview: () => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        <button
          type="button"
          onClick={onTogglePreview}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {previewActive ? (
            <>
              <Pencil className="h-3 w-3" />
              Editar
            </>
          ) : (
            <>
              <Eye className="h-3 w-3" />
              Previsualizar
            </>
          )}
        </button>
      </div>

      {previewActive ? (
        <div className="min-h-[120px] rounded-md border border-border bg-muted/30 p-3">
          {value.trim() ? (
            <div className="prose prose-sm max-w-none text-foreground
              prose-headings:text-foreground prose-headings:font-semibold
              prose-strong:text-foreground prose-a:text-primary
              prose-ul:text-foreground prose-ol:text-foreground
              prose-li:text-foreground">
              <ReactMarkdown>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Sin contenido</p>
          )}
        </div>
      ) : (
        <Textarea
          id={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[120px] font-mono text-sm resize-y"
        />
      )}
    </div>
  )
}

// ─── Attachment Row ───────────────────────────────────────────────────────────

function AttachmentRow({
  attachment,
  onDelete,
  isDeleting,
}: {
  attachment: ShowcaseAttachmentResponseDto
  onDelete: (id: string) => void
  isDeleting: boolean
}) {
  const Icon = getFileIcon(attachment.mimeType)
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{attachment.originalName}</p>
        <p className="text-xs text-muted-foreground">{formatBytes(attachment.sizeBytes)}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10 shrink-0"
        onClick={() => onDelete(attachment.id)}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  )
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({
  onUpload,
  isUploading,
}: {
  onUpload: (file: File) => void
  isUploading: boolean
}) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) onUpload(file)
    },
    [onUpload],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
      e.target.value = '' // reset input
    }
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/40 hover:bg-muted/30'
      }`}
    >
      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Subiendo archivo...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-foreground font-medium">
            Arrastra un archivo aquí
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, imágenes, Word, Excel — máx. 10MB
          </p>
          <label className="cursor-pointer">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
              style={{ color: NAVY }}
            >
              <Paperclip className="h-3 w-3" />
              Seleccionar archivo
            </span>
            <input
              type="file"
              accept={ALLOWED_EXTENSIONS}
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ShowcaseEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [previewField, setPreviewField] = useState<PreviewField>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ─── Data fetching ──────────────────────────────────────────────────────

  const { data: dept, isLoading: deptLoading } = useQuery({
    queryKey: ['department', id],
    queryFn: () => DepartmentsService.departmentsControllerFindOne(id!),
    enabled: !!id,
  })

  const { data: showcase, isLoading: showcaseLoading } = useQuery({
    queryKey: ['showcase', id],
    queryFn: () => DepartmentsService.showcaseControllerGetShowcase(id!),
    enabled: !!id,
  })

  const { data: attachments = [], isLoading: attachmentsLoading } = useQuery({
    queryKey: ['showcase-attachments', id],
    queryFn: () => DepartmentsService.showcaseControllerListAttachments(id!),
    enabled: !!id,
  })

  // ─── Form ───────────────────────────────────────────────────────────────

  const { register, handleSubmit, watch, setValue } = useForm<ShowcaseFormValues>({
    defaultValues: {
      description: '',
      mission: '',
      announcements: '',
    },
    values: showcase
      ? {
          description: showcase.description ?? '',
          mission: showcase.mission ?? '',
          announcements: showcase.announcements ?? '',
        }
      : undefined,
  })

  const descriptionValue = watch('description')
  const missionValue = watch('mission')
  const announcementsValue = watch('announcements')

  // ─── Mutations ──────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: (data: ShowcaseFormValues) =>
      DepartmentsService.showcaseControllerUpdateShowcase(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['showcase', id] })
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.success('Showcase guardado correctamente')
      navigate(`/departamentos/${id}`)
    },
    onError: (err: { body?: { message?: string } }) => {
      toast.error(err.body?.message ?? 'Error al guardar el showcase')
    },
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      DepartmentsService.showcaseControllerUploadAttachment(id!, { file }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['showcase-attachments', id] })
      toast.success('Archivo subido correctamente')
    },
    onError: (err: { body?: { message?: string } }) => {
      toast.error(err.body?.message ?? 'Error al subir el archivo')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) =>
      DepartmentsService.showcaseControllerDeleteAttachment(id!, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['showcase-attachments', id] })
      toast.success('Archivo eliminado')
      setDeletingId(null)
    },
    onError: (err: { body?: { message?: string } }) => {
      toast.error(err.body?.message ?? 'Error al eliminar el archivo')
      setDeletingId(null)
    },
  })

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleUpload = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error('El archivo excede el límite de 10MB')
      return
    }
    uploadMutation.mutate(file)
  }

  const handleDeleteAttachment = (attachmentId: string) => {
    setDeletingId(attachmentId)
    deleteMutation.mutate(attachmentId)
  }

  const togglePreview = (field: PreviewField) => {
    setPreviewField((prev) => (prev === field ? null : field))
  }

  const onSubmit = handleSubmit((data) => saveMutation.mutate(data))

  const isLoading = deptLoading || showcaseLoading || attachmentsLoading
  const deptColor = dept?.color ?? NAVY
  const deptName = dept?.name ?? ''
  const deptSigla = dept?.sigla

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Header */}
      <div
        className="rounded-xl border border-border bg-card p-5"
        style={{ borderLeftWidth: 4, borderLeftColor: deptColor }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => navigate(`/departamentos/${id}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-xl font-bold text-foreground truncate">{deptName}</p>
              {deptSigla && (
                <span
                  className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: deptColor }}
                >
                  {deptSigla}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(`/departamentos/${id}`)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saveMutation.isPending}
              style={{ backgroundColor: deptColor, color: '#fff', border: 'none' }}
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content fields */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-5">
        <p className="text-base font-semibold text-foreground">Contenido del showcase</p>

        <MarkdownField
          label="Descripción"
          name="description"
          value={descriptionValue}
          onChange={(v) => setValue('description', v)}
          placeholder={`## Descripción\nSomos el departamento de Jóvenes de la iglesia...\n\n**Actividades**: reuniones semanales, campamentos, etc.`}
          previewActive={previewField === 'description'}
          onTogglePreview={() => togglePreview('description')}
        />

        <MarkdownField
          label="Misión"
          name="mission"
          value={missionValue}
          onChange={(v) => setValue('mission', v)}
          placeholder={`## Misión\nAlcanzar a los jóvenes de la ciudad con el mensaje del evangelio...`}
          previewActive={previewField === 'mission'}
          onTogglePreview={() => togglePreview('mission')}
        />

        <MarkdownField
          label="Anuncios"
          name="announcements"
          value={announcementsValue}
          onChange={(v) => setValue('announcements', v)}
          placeholder={`## Anuncios\n- Reunión el sábado a las 10am\n- Campamento en enero`}
          previewActive={previewField === 'announcements'}
          onTogglePreview={() => togglePreview('announcements')}
        />

        {/* Hidden inputs for react-hook-form registration */}
        <input type="hidden" {...register('description')} />
        <input type="hidden" {...register('mission')} />
        <input type="hidden" {...register('announcements')} />
      </div>

      {/* Attachments section */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <p className="text-base font-semibold text-foreground">
            Archivos adjuntos ({attachments.length}/10)
          </p>
        </div>

        {/* Existing attachments */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((a) => (
              <AttachmentRow
                key={a.id}
                attachment={a}
                onDelete={handleDeleteAttachment}
                isDeleting={deletingId === a.id && deleteMutation.isPending}
              />
            ))}
          </div>
        )}

        {/* Upload zone */}
        {attachments.length < 10 && (
          <UploadZone
            onUpload={handleUpload}
            isUploading={uploadMutation.isPending}
          />
        )}

        {attachments.length >= 10 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Se ha alcanzado el límite de 10 archivos adjuntos.
          </p>
        )}
      </div>
    </form>
  )
}
