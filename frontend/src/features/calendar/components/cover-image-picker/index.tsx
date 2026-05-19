import { Suspense, lazy, useMemo, useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CoverUploadTab } from './cover-upload-tab'
import { CoverCropper } from './cover-cropper'
import type { CoverSuggestion } from '../../hooks/use-cover-suggestions'
import type { CoverMetadata } from '../../hooks/use-cover-upload'

const CoverSearchTab = lazy(() =>
  import('./cover-search-tab').then((m) => ({ default: m.CoverSearchTab })),
)

export interface CoverImagePickerProps {
  /**
   * Currently displayed cover (server URL or temporary preview). Used to render
   * the "Actual" preview.
   */
  currentCoverUrl: string | null
  eventTitle: string
  departmentName?: string | null
  onCoverPicked: (result: { blob: Blob; previewUrl: string; metadata: CoverMetadata }) => void
  onCoverCleared?: () => void
}

type Stage =
  | { kind: 'idle' }
  | { kind: 'crop'; source: string; suggestion?: CoverSuggestion }

export function CoverImagePicker({
  currentCoverUrl,
  eventTitle,
  departmentName,
  onCoverPicked,
}: CoverImagePickerProps) {
  const [tab, setTab] = useState<'current' | 'upload' | 'search'>(
    currentCoverUrl ? 'current' : 'upload',
  )
  const [stage, setStage] = useState<Stage>({ kind: 'idle' })

  const defaultQuery = useMemo(
    () => [eventTitle, departmentName].filter(Boolean).join(' ').trim(),
    [eventTitle, departmentName],
  )

  function handleApplyCrop(blob: Blob, previewUrl: string) {
    if (stage.kind !== 'crop') return
    const metadata: CoverMetadata = stage.suggestion
      ? {
          sourceAuthor: stage.suggestion.author,
          sourceUrl: stage.suggestion.authorUrl,
        }
      : {}
    onCoverPicked({ blob, previewUrl, metadata })
    setStage({ kind: 'idle' })
    setTab('current')
  }

  if (stage.kind === 'crop') {
    return (
      <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
        <header className="flex items-center gap-2 text-sm text-neutral-700">
          <ImagePlus className="h-4 w-4" />
          <span className="font-medium">Recortar imagen (16:9)</span>
        </header>
        <CoverCropper
          source={stage.source}
          onCancel={() => setStage({ kind: 'idle' })}
          onApply={handleApplyCrop}
        />
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
      <header className="flex items-center gap-2 text-sm text-neutral-700">
        <ImagePlus className="h-4 w-4" />
        <span className="font-medium">Imagen de portada</span>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="current">Actual</TabsTrigger>
          <TabsTrigger value="upload">Subir</TabsTrigger>
          <TabsTrigger value="search">Buscar</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          {currentCoverUrl ? (
            <>
              <div className="relative w-full overflow-hidden rounded-xl bg-neutral-100 aspect-[16/9]">
                <img
                  src={currentCoverUrl}
                  alt="Portada actual"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Esta es la portada que verán los visitantes. Cambiala desde "Subir" o "Buscar".
              </p>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
              Aún no hay portada elegida. Subí una imagen o buscala en Unsplash.
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload">
          <CoverUploadTab
            onFileSelected={(dataUrl) => setStage({ kind: 'crop', source: dataUrl })}
          />
        </TabsContent>

        <TabsContent value="search">
          <Suspense fallback={<div className="py-8 text-center text-sm text-neutral-500">Cargando…</div>}>
            <CoverSearchTab
              defaultQuery={defaultQuery}
              onPicked={(dataUrl, suggestion) =>
                setStage({ kind: 'crop', source: dataUrl, suggestion })
              }
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
