import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Save,
  Loader2,
  Image as ImageIcon,
  Home,
  Images,
  Info,
  ArrowRight,
} from 'lucide-react'
import { GalleryService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const galeriaSchema = z.object({
  headerTitle: z.string().min(1, 'Requerido'),
  introText: z.string(),
  homeAlbumId: z.string(),
})

type GaleriaFormValues = z.infer<typeof galeriaSchema>

const DEFAULTS = {
  headerTitle: 'Vida de la congregación',
  introText: 'Momentos de adoración, comunión y servicio.',
}

const AUTO = '__auto__' // opción "automático (primer álbum)"

export function GaleriaConfigForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Config + álbumes en paralelo, una sola query
  const { data, isLoading } = useQuery({
    queryKey: ['gallery-config-page'],
    queryFn: async () => {
      const [config, albums] = await Promise.all([
        GalleryService.galleryAdminControllerGetConfig(),
        GalleryService.galleryAdminControllerListAlbums(),
      ])
      return { config, albums }
    },
  })

  const albums = data?.albums ?? []

  const form = useForm<GaleriaFormValues>({
    resolver: zodResolver(galeriaSchema),
    values: {
      headerTitle: data?.config.headerTitle || DEFAULTS.headerTitle,
      introText: data?.config.introText || DEFAULTS.introText,
      homeAlbumId: data?.config.homeAlbumId || AUTO,
    },
  })

  const saveMutation = useMutation({
    mutationFn: (values: GaleriaFormValues) =>
      GalleryService.galleryAdminControllerUpdateConfig({
        headerTitle: values.headerTitle,
        introText: values.introText,
        homeAlbumId: values.homeAlbumId === AUTO ? null : values.homeAlbumId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-config-page'] })
      toast.success('Configuración de galería guardada')
    },
    onError: () => toast.error('Error al guardar la configuración'),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))} className="space-y-6">
      {/* Aviso: dónde se gestionan las fotos */}
      <div className="rounded-xl border border-border bg-muted/40 p-4 flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Info className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">¿Dónde se gestionan las fotos?</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            En esta pantalla solo configuras los textos y el álbum destacado del inicio. Para
            crear álbumes, subir, recortar, reordenar, publicar u ocultar fotos, ve a la
            sección <span className="font-medium text-foreground">Galería</span>.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 gap-2"
            onClick={() => navigate('/galeria')}
          >
            <Images className="h-4 w-4" />
            Ir a gestionar fotos
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Encabezado de la sección Galería */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <ImageIcon className="h-4 w-4 text-primary" />
          <p className="text-sm font-bold text-foreground uppercase tracking-wider">
            Encabezado de la página Galería
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="headerTitle">Título del encabezado</Label>
          <Input id="headerTitle" {...form.register('headerTitle')} placeholder="Vida de la congregación" />
          {form.formState.errors.headerTitle && (
            <p className="text-sm text-destructive">{form.formState.errors.headerTitle.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="introText">Texto introductorio</Label>
          <Textarea
            id="introText"
            {...form.register('introText')}
            placeholder="Momentos de adoración, comunión y servicio."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Se muestra debajo del título en la página de Galería del sitio público.
          </p>
        </div>
      </div>

      {/* Álbum destacado del inicio */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Home className="h-4 w-4 text-primary" />
          <p className="text-sm font-bold text-foreground uppercase tracking-wider">
            Álbum destacado en el inicio
          </p>
        </div>

        <div className="space-y-2">
          <Label>Álbum a mostrar en la sección "Momentos" del inicio</Label>
          <Select
            value={form.watch('homeAlbumId')}
            onValueChange={(v) => form.setValue('homeAlbumId', v, { shouldDirty: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un álbum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AUTO}>Automático (primer álbum publicado)</SelectItem>
              {albums.map((album) => (
                <SelectItem key={album.id} value={album.id}>
                  {album.title}
                  {!album.isPublished ? ' (borrador)' : ''} · {album.imageCount ?? album.images?.length ?? 0} fotos
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            La página de inicio muestra una vista previa con las primeras fotos de este álbum y un
            botón "Ver galería completa". Solo se muestran álbumes y fotos publicados.
          </p>
        </div>
      </div>

      {/* Guardar */}
      <div className="flex justify-end">
        <Button type="submit" disabled={saveMutation.isPending || !form.formState.isDirty} className="gap-2">
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}
