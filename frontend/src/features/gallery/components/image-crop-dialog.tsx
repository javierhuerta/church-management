import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { ZoomIn, ZoomOut, Crop as CropIcon, Loader2, RotateCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getCroppedBlob, blobToFile } from '../utils/crop-image'

type AspectOption = { label: string; value: number | undefined }

const ASPECT_OPTIONS: AspectOption[] = [
  { label: 'Libre', value: undefined },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '1:1', value: 1 },
  { label: '3:4', value: 3 / 4 },
]

interface ImageCropDialogProps {
  open: boolean
  imageSrc: string | null
  onClose: () => void
  onCropComplete: (file: File) => Promise<void> | void
  /** Aspect ratio inicial (por defecto 4:3) */
  initialAspect?: number
}

export function ImageCropDialog({
  open,
  imageSrc,
  onClose,
  onCropComplete,
  initialAspect = 4 / 3,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [aspect, setAspect] = useState<number | undefined>(initialAspect)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)

  const onCropAreaChange = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    setSaving(true)
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels)
      const file = blobToFile(blob, `gallery-${Date.now()}.jpg`)
      await onCropComplete(file)
      handleClose()
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setAspect(initialAspect)
    setCroppedAreaPixels(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5 text-primary" />
            Ajustar imagen
          </DialogTitle>
        </DialogHeader>

        {/* Cropper area */}
        <div className="relative w-full h-[360px] bg-muted rounded-lg overflow-hidden">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropAreaChange}
              showGrid
            />
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Aspect ratios */}
          <div className="flex flex-wrap items-center gap-1 bg-muted rounded-lg p-1 w-fit">
            {ASPECT_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setAspect(opt.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  aspect === opt.value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Zoom slider */}
          <div className="flex items-center gap-3">
            <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-primary"
              aria-label="Zoom"
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 shrink-0"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              aria-label="Rotar 90°"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !croppedAreaPixels} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CropIcon className="h-4 w-4" />}
            Aplicar y subir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
