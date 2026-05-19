import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CoverUploadTabProps {
  onFileSelected: (dataUrl: string) => void
}

const MAX_BYTES = 10 * 1024 * 1024

export function CoverUploadTab({ onFileSelected }: CoverUploadTabProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('La imagen no puede pesar más de 10 MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onFileSelected(reader.result)
      }
    }
    reader.onerror = () => setError('No se pudo leer el archivo')
    reader.readAsDataURL(file)

    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
        <Upload className="mx-auto h-8 w-8 text-neutral-400" />
        <p className="mt-2 text-sm text-neutral-600">
          Selecciona una imagen desde tu equipo
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          Formatos: JPG, PNG, WebP. Máximo 10 MB.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => inputRef.current?.click()}
        >
          Elegir archivo
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </p>
      )}
    </div>
  )
}
