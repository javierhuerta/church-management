import { useCallback, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { Button } from '@/components/ui/button'

interface LeaderPhotoCropperProps {
  source: string
  onCancel: () => void
  onApply: (blob: Blob, previewUrl: string) => void
}

const OUTPUT_SIZE = 800

export function LeaderPhotoCropper({ source, onCancel, onApply }: LeaderPhotoCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels)
  }, [])

  async function handleApply() {
    if (!croppedArea) return
    setBusy(true)
    setError(null)
    try {
      const blob = await renderCrop(source, croppedArea)
      const previewUrl = URL.createObjectURL(blob)
      onApply(blob, previewUrl)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative h-72 w-full overflow-hidden rounded-xl bg-foreground">
        <Cropper
          image={source}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          objectFit="contain"
        />
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <label className="flex items-center gap-2 flex-1">
          <span>Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-neutral-900"
          />
        </label>
      </div>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </p>
      )}
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={busy}>
          Cancelar
        </Button>
        <Button type="button" size="sm" onClick={handleApply} disabled={busy || !croppedArea}>
          {busy ? 'Procesando…' : 'Aplicar recorte'}
        </Button>
      </div>
    </div>
  )
}

async function renderCrop(source: string, area: Area): Promise<Blob> {
  const image = await loadImage(source)
  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo crear contexto de canvas')
  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  )
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Error generando imagen'))),
      'image/jpeg',
      0.85,
    )
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
    img.src = src
  })
}
