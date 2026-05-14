import { useRef, useState } from 'react'
import { Upload, Star, Trash2, Loader2 } from 'lucide-react'
import type { AttachmentResponseDto } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { API_URL } from '@/lib/api-client'

interface AttachmentUploaderProps {
  eventId: string
  attachments: AttachmentResponseDto[]
  onChange: (next: AttachmentResponseDto[]) => void
  maxAttachments?: number
}

export function AttachmentUploader({
  eventId,
  attachments,
  onChange,
  maxAttachments = 10,
}: AttachmentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setError(null)

    if (attachments.length + files.length > maxAttachments) {
      setError(`Máximo ${maxAttachments} adjuntos por evento`)
      return
    }

    setUploading(true)
    const uploaded: AttachmentResponseDto[] = []
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch(`${API_URL}/api/calendar/${eventId}/attachments`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: formData,
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.message || 'Error subiendo archivo')
        }
        uploaded.push(await res.json())
      } catch (err) {
        setError((err as Error).message)
      }
    }
    onChange([...attachments, ...uploaded])
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleDelete(attachmentId: string) {
    if (!confirm('¿Eliminar este adjunto?')) return
    try {
      await fetch(`${API_URL}/api/calendar/${eventId}/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      onChange(attachments.filter((a) => a.id !== attachmentId))
    } catch {
      setError('No se pudo eliminar el adjunto')
    }
  }

  async function handleSetCover(attachmentId: string) {
    try {
      await fetch(`${API_URL}/api/calendar/${eventId}/attachments/${attachmentId}/cover`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      onChange(
        attachments.map((a) => ({ ...a, isCover: a.id === attachmentId })),
      )
    } catch {
      setError('No se pudo marcar como portada')
    }
  }

  function resolveUrl(url: string): string {
    return url.startsWith('http') ? url : `${API_URL}${url}`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-700">
          Adjuntos ({attachments.length}/{maxAttachments})
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || attachments.length >= maxAttachments}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-1" />
          )}
          Agregar adjunto
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,video/mp4,video/webm"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </p>
      )}

      {attachments.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {attachments.map((a) => {
            const isImage = a.mimeType.startsWith('image/')
            return (
              <div
                key={a.id}
                className="relative rounded-xl border border-neutral-200 bg-white p-2"
              >
                {isImage ? (
                  <img
                    src={resolveUrl(a.url)}
                    alt={a.originalName}
                    className="h-24 w-full rounded object-cover"
                  />
                ) : (
                  <div className="h-24 w-full rounded bg-neutral-100 flex items-center justify-center text-xs text-neutral-500 p-2 text-center">
                    {a.originalName}
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between">
                  {isImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSetCover(a.id)}
                      className={
                        a.isCover ? 'text-amber-500' : 'text-neutral-400'
                      }
                      title={a.isCover ? 'Portada' : 'Marcar como portada'}
                    >
                      <Star
                        className="h-4 w-4"
                        fill={a.isCover ? 'currentColor' : 'none'}
                      />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(a.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
