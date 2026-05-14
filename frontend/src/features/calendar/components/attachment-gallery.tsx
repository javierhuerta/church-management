import { useState } from 'react'
import { FileText, Video, Download } from 'lucide-react'
import type { AttachmentResponseDto } from '@/lib/api'
import { LightboxModal } from './lightbox-modal'

interface AttachmentGalleryProps {
  attachments: AttachmentResponseDto[]
  baseUrl?: string
}

function isImage(mime: string): boolean {
  return mime.startsWith('image/')
}

function isVideo(mime: string): boolean {
  return mime.startsWith('video/')
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AttachmentGallery({
  attachments,
  baseUrl = '',
}: AttachmentGalleryProps) {
  const [lightbox, setLightbox] = useState<AttachmentResponseDto | null>(null)
  const [videoOpen, setVideoOpen] = useState<AttachmentResponseDto | null>(null)

  if (!attachments?.length) return null

  const images = attachments.filter((a) => isImage(a.mimeType))
  const videos = attachments.filter((a) => isVideo(a.mimeType))
  const documents = attachments.filter(
    (a) => !isImage(a.mimeType) && !isVideo(a.mimeType),
  )

  function resolveUrl(url: string): string {
    if (url.startsWith('http')) return url
    return `${baseUrl}${url}`
  }

  return (
    <div className="space-y-6">
      {images.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">
            Imágenes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((a) => (
              <button
                key={a.id}
                onClick={() => setLightbox(a)}
                className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
              >
                <img
                  src={resolveUrl(a.url)}
                  alt={a.originalName}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">
            Videos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {videos.map((a) => (
              <button
                key={a.id}
                onClick={() => setVideoOpen(a)}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 hover:bg-neutral-50 text-left"
              >
                <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center">
                  <Video className="h-5 w-5 text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {a.originalName}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatSize(a.size)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {documents.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">
            Documentos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.map((a) => (
              <a
                key={a.id}
                href={resolveUrl(a.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 hover:bg-neutral-50"
              >
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {a.originalName}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatSize(a.size)}
                  </p>
                </div>
                <Download className="h-4 w-4 text-neutral-400" />
              </a>
            ))}
          </div>
        </section>
      )}

      {lightbox && (
        <LightboxModal
          url={resolveUrl(lightbox.url)}
          alt={lightbox.originalName}
          onClose={() => setLightbox(null)}
        />
      )}

      {videoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setVideoOpen(null)}
        >
          <video
            controls
            autoPlay
            src={resolveUrl(videoOpen.url)}
            className="max-h-[90vh] max-w-[90vw] rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
