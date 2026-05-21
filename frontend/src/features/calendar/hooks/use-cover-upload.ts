import { useState } from 'react'
import { CalendarService } from '@/lib/api/services/CalendarService'
import type { AttachmentResponseDto } from '@/lib/api'

export interface CoverMetadata {
  sourceAuthor?: string
  sourceUrl?: string
}

/**
 * Posts a (already-cropped) blob to `POST /calendar/:eventId/cover`.
 * Throws on non-2xx with the server's message.
 */
export async function uploadEventCover(
  eventId: string,
  blob: Blob,
  metadata: CoverMetadata = {},
): Promise<AttachmentResponseDto> {
  return CalendarService.calendarControllerUploadCover(eventId, {
    file: blob as unknown as string,
    sourceAuthor: metadata.sourceAuthor,
    sourceUrl: metadata.sourceUrl,
  }) as Promise<AttachmentResponseDto>
}

export interface PendingCover {
  blob: Blob
  previewUrl: string
  metadata: CoverMetadata
}

export interface UseCoverUploadResult {
  pending: PendingCover | null
  setPending: (next: PendingCover | null) => void
  uploading: boolean
  error: string | null
  uploadFor: (eventId: string) => Promise<AttachmentResponseDto | null>
}

/**
 * Tracks a pending cover image (chosen but not yet uploaded — useful while the
 * event itself is still being created) and provides an action to upload it once
 * an `eventId` is available.
 */
export function useCoverUpload(): UseCoverUploadResult {
  const [pending, setPendingState] = useState<PendingCover | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setPending(next: PendingCover | null) {
    setPendingState((prev) => {
      if (prev?.previewUrl && prev.previewUrl !== next?.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl)
      }
      return next
    })
    setError(null)
  }

  async function uploadFor(
    eventId: string,
  ): Promise<AttachmentResponseDto | null> {
    if (!pending) return null
    setUploading(true)
    setError(null)
    try {
      const result = await uploadEventCover(eventId, pending.blob, pending.metadata)
      if (pending.previewUrl) URL.revokeObjectURL(pending.previewUrl)
      setPendingState(null)
      return result
    } catch (err) {
      setError((err as Error).message)
      throw err
    } finally {
      setUploading(false)
    }
  }

  return { pending, setPending, uploading, error, uploadFor }
}
