import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import {
  FileText,
  Image,
  File,
  Download,
  Pencil,
  Building2,
  Paperclip,
  Info,
} from 'lucide-react'
import { DepartmentsService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthUser } from '@/features/calendar/hooks/use-auth-user'
import type { ShowcaseAttachmentResponseDto } from '@/lib/api'

// ─── Constants ───────────────────────────────────────────────────────────────

const NAVY = '#1B3A6B'

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

function getDownloadUrl(storedPath: string): string {
  return `/api/uploads/showcase/${storedPath}`
}

// ─── Attachment Item ──────────────────────────────────────────────────────────

function AttachmentItem({ attachment }: { attachment: ShowcaseAttachmentResponseDto }) {
  const Icon = getFileIcon(attachment.mimeType)
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow">
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{attachment.originalName}</p>
        <p className="text-xs text-muted-foreground">{formatBytes(attachment.sizeBytes)}</p>
      </div>
      <a
        href={getDownloadUrl(attachment.storedPath ?? '')}
        download={attachment.originalName}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0"
      >
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Download className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </a>
    </div>
  )
}

// ─── Markdown Section ─────────────────────────────────────────────────────────

function MarkdownSection({ title, content }: { title: string; content: string }) {
  if (!content || !content.trim()) return null
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-3">
      <p className="text-lg font-semibold text-foreground">{title}</p>
      <div className="prose prose-sm max-w-none text-foreground leading-relaxed
        prose-headings:text-foreground prose-headings:font-semibold
        prose-strong:text-foreground prose-a:text-primary
        prose-ul:text-foreground prose-ol:text-foreground
        prose-li:text-foreground">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  )
}

// ─── Skeleton Loading ─────────────────────────────────────────────────────────

function ShowcaseSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyShowcase({ deptColor, canEdit, onEdit }: {
  deptColor: string
  canEdit: boolean
  onEdit: () => void
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-12 text-center space-y-4">
      <div
        className="mx-auto h-14 w-14 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${deptColor}22` }}
      >
        <Info className="h-7 w-7" style={{ color: deptColor }} />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">
          Este departamento aún no ha publicado contenido
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {canEdit
            ? 'Haz clic en "Editar" para agregar descripción, misión y anuncios.'
            : 'El director del departamento aún no ha publicado información.'}
        </p>
      </div>
      {canEdit && (
        <Button onClick={onEdit} variant="outline" size="sm">
          <Pencil className="h-3.5 w-3.5 mr-1.5" />
          Editar showcase
        </Button>
      )}
    </div>
  )
}

// ─── Attachments Panel ────────────────────────────────────────────────────────

function AttachmentsPanel({ attachments }: { attachments: ShowcaseAttachmentResponseDto[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Paperclip className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-semibold text-foreground">
          Archivos adjuntos ({attachments.length})
        </p>
      </div>
      {attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin archivos adjuntos</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((a) => (
            <AttachmentItem key={a.id} attachment={a} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Mobile View ──────────────────────────────────────────────────────────────

function MobileShowcaseView({
  showcase,
  deptName,
  deptColor,
  deptSigla,
  canEdit,
  onEdit,
}: {
  showcase: { description: string; mission: string; announcements: string; attachments: ShowcaseAttachmentResponseDto[] } | null
  deptName: string
  deptColor: string
  deptSigla: string | null | undefined
  canEdit: boolean
  onEdit: () => void
}) {
  const isEmpty = !showcase || (
    !showcase.description?.trim() &&
    !showcase.mission?.trim() &&
    !showcase.announcements?.trim()
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-2"
        style={{ borderLeftWidth: 4, borderLeftColor: deptColor }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <p className="text-2xl font-bold text-foreground truncate">{deptName}</p>
            {deptSigla && (
              <span
                className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: deptColor }}
              >
                {deptSigla}
              </span>
            )}
          </div>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="shrink-0">
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {isEmpty ? (
        <EmptyShowcase deptColor={deptColor} canEdit={canEdit} onEdit={onEdit} />
      ) : (
        <>
          {/* Content sections */}
          <div className="space-y-3">
            <MarkdownSection title="Descripción" content={showcase!.description} />
            <MarkdownSection title="Misión" content={showcase!.mission} />
            <MarkdownSection title="Anuncios" content={showcase!.announcements} />
          </div>

          {/* Attachments at bottom on mobile */}
          <div className="rounded-xl border border-border bg-card p-4">
            <AttachmentsPanel attachments={showcase!.attachments ?? []} />
          </div>
        </>
      )}
    </div>
  )
}

// ─── Desktop View ─────────────────────────────────────────────────────────────

function DesktopShowcaseView({
  showcase,
  deptName,
  deptColor,
  deptSigla,
  canEdit,
  onEdit,
}: {
  showcase: { description: string; mission: string; announcements: string; attachments: ShowcaseAttachmentResponseDto[] } | null
  deptName: string
  deptColor: string
  deptSigla: string | null | undefined
  canEdit: boolean
  onEdit: () => void
}) {
  const isEmpty = !showcase || (
    !showcase.description?.trim() &&
    !showcase.mission?.trim() &&
    !showcase.announcements?.trim()
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6"
        style={{ borderLeftWidth: 4, borderLeftColor: deptColor }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${deptColor}22` }}
            >
              <Building2 className="h-6 w-6" style={{ color: deptColor }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-foreground">{deptName}</p>
                {deptSigla && (
                  <span
                    className="text-sm font-medium px-2.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: deptColor }}
                  >
                    {deptSigla}
                  </span>
                )}
              </div>
            </div>
          </div>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="shrink-0">
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Editar showcase
            </Button>
          )}
        </div>
      </div>

      {isEmpty ? (
        <EmptyShowcase deptColor={deptColor} canEdit={canEdit} onEdit={onEdit} />
      ) : (
        /* Two-column layout: 70% content + 30% sidebar */
        <div className="grid grid-cols-[1fr_300px] gap-4 items-start">
          {/* Main content */}
          <div className="space-y-3">
            <MarkdownSection title="Descripción" content={showcase!.description} />
            <MarkdownSection title="Misión" content={showcase!.mission} />
            <MarkdownSection title="Anuncios" content={showcase!.announcements} />
          </div>

          {/* Sidebar: attachments */}
          <div className="rounded-xl border border-border bg-card p-4 sticky top-4">
            <AttachmentsPanel attachments={showcase!.attachments ?? []} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ShowcaseViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthUser()

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

  const isLoading = deptLoading || showcaseLoading

  const deptColor = dept?.color ?? NAVY
  const deptName = dept?.name ?? ''
  const deptSigla = dept?.sigla

  // Can edit if Admin or DirectorDepartamento
  const canEdit =
    user?.role === 'Admin' ||
    user?.role === 'DirectorDepartamento'

  const handleEdit = () => navigate(`/departamentos/${id}/editar`)

  const showcaseData = showcase && showcase.id
    ? {
        description: showcase.description ?? '',
        mission: showcase.mission ?? '',
        announcements: showcase.announcements ?? '',
        attachments: showcase.attachments ?? [],
      }
    : null

  if (isLoading) return <ShowcaseSkeleton />

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        <MobileShowcaseView
          showcase={showcaseData}
          deptName={deptName}
          deptColor={deptColor}
          deptSigla={deptSigla}
          canEdit={canEdit}
          onEdit={handleEdit}
        />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopShowcaseView
          showcase={showcaseData}
          deptName={deptName}
          deptColor={deptColor}
          deptSigla={deptSigla}
          canEdit={canEdit}
          onEdit={handleEdit}
        />
      </div>
    </>
  )
}
