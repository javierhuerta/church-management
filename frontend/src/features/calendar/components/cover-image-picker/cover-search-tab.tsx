import { useEffect, useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  type CoverSuggestion,
  trackCoverSuggestion,
  useCoverSuggestions,
} from '../../hooks/use-cover-suggestions'

interface CoverSearchTabProps {
  defaultQuery: string
  onPicked: (dataUrl: string, suggestion: CoverSuggestion) => void
}

async function fetchAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url, { mode: 'cors' })
  if (!res.ok) throw new Error('No se pudo descargar la imagen sugerida')
  const blob = await res.blob()
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('Imagen ilegible'))
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.readAsDataURL(blob)
  })
}

export function CoverSearchTab({ defaultQuery, onPicked }: CoverSearchTabProps) {
  const [query, setQuery] = useState(defaultQuery)
  const { results, isLoading, isUnavailable, error } = useCoverSuggestions(query)
  const [pickingId, setPickingId] = useState<string | null>(null)
  const [pickError, setPickError] = useState<string | null>(null)

  useEffect(() => {
    setQuery(defaultQuery)
  }, [defaultQuery])

  async function handlePick(suggestion: CoverSuggestion) {
    setPickingId(suggestion.id)
    setPickError(null)
    try {
      trackCoverSuggestion(suggestion.id)
      const dataUrl = await fetchAsDataUrl(suggestion.fullUrl)
      onPicked(dataUrl, suggestion)
    } catch (err) {
      setPickError((err as Error).message)
    } finally {
      setPickingId(null)
    }
  }

  if (isUnavailable) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        La búsqueda de imágenes no está disponible. Configura{' '}
        <code className="font-mono">UNSPLASH_ACCESS_KEY</code> en el backend para
        habilitarla. Mientras tanto puedes subir una imagen desde tu equipo.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar (ej: retiro espiritual, jovenes)"
          className="pl-10"
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </p>
      )}
      {pickError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {pickError}
        </p>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Buscando…
        </div>
      )}

      {!isLoading && results.length === 0 && query.trim().length > 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Sin resultados para "{query}". Probá con otras palabras.
        </p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {results.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handlePick(s)}
              disabled={pickingId !== null}
              className="group relative rounded-lg overflow-hidden border border-border bg-muted hover:ring-2 hover:ring-neutral-900 transition focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:opacity-50"
              style={s.color ? { backgroundColor: s.color } : undefined}
              aria-label={`Elegir foto de ${s.author}`}
            >
              <img
                src={s.thumbUrl}
                alt={`Foto por ${s.author}`}
                loading="lazy"
                className="w-full aspect-[16/9] object-cover"
              />
              {pickingId === s.id && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 px-2 py-1 text-[10px] text-white bg-gradient-to-t from-black/70 to-transparent text-left">
                Foto: {s.author}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
