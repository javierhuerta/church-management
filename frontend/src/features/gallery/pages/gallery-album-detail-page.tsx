import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowLeft,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Pencil,
  Image as ImageIcon,
  GripVertical,
  Check,
  X,
} from 'lucide-react'
import { GalleryService } from '@/lib/api'
import type { GalleryImageResponseDto } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useTheme } from '@/components/theme-provider'
import { ImageCropDialog } from '../components/image-crop-dialog'

const STATUS_COLORS = {
  published: { light: '#0F766E', dark: '#0D9488' },
  draft: { light: '#C9A84C', dark: '#D4B566' },
}

// ─── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ isPublished }: { isPublished: boolean }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const variant = isPublished ? 'published' : 'draft'
  const bg = isDark ? STATUS_COLORS[variant].dark : STATUS_COLORS[variant].light
  return (
    <span
      style={{
        background: bg,
        color: variant === 'draft' ? '#102240' : '#fff',
        borderRadius: 9999,
        padding: '2px 8px',
        fontSize: 10,
        fontWeight: 600,
      }}
    >
      {isPublished ? 'Publicado' : 'Borrador'}
    </span>
  )
}

// ─── Sortable Image Card ─────────────────────────────────────────────────────
function SortableImageCard({
  image,
  albumId,
}: {
  image: GalleryImageResponseDto
  albumId: string
}) {
  const queryClient = useQueryClient()
  const [editingCaption, setEditingCaption] = useState(false)
  const [caption, setCaption] = useState(image.caption || '')

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['gallery-album', albumId] })

  const togglePublish = useMutation({
    mutationFn: () => GalleryService.galleryAdminControllerTogglePublishImage(image.id),
    onSuccess: () => {
      invalidate()
      toast.success(image.isPublished ? 'Imagen oculta' : 'Imagen publicada')
    },
  })

  const updateCaption = useMutation({
    mutationFn: () => GalleryService.galleryAdminControllerUpdateImage(image.id, { caption }),
    onSuccess: () => {
      invalidate()
      setEditingCaption(false)
      toast.success('Descripción actualizada')
    },
  })

  const deleteImage = useMutation({
    mutationFn: () => GalleryService.galleryAdminControllerDeleteImage(image.id),
    onSuccess: () => {
      invalidate()
      toast.success('Imagen eliminada')
    },
  })

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Imagen */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {image.url ? (
          <img src={image.url} alt={image.caption || ''} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}

        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 h-7 w-7 rounded-md bg-black/50 text-white flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Arrastrar para reordenar"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Badge estado */}
        <div className="absolute top-2 right-2">
          <StatusBadge isPublished={image.isPublished} />
        </div>

        {/* Acciones overlay */}
        <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => togglePublish.mutate()}
            className="h-7 w-7 rounded-md bg-white/90 hover:bg-white text-foreground flex items-center justify-center"
            title={image.isPublished ? 'Ocultar' : 'Publicar'}
          >
            {image.isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setEditingCaption(true)}
            className="h-7 w-7 rounded-md bg-white/90 hover:bg-white text-foreground flex items-center justify-center"
            title="Editar descripción"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => deleteImage.mutate()}
            className="h-7 w-7 rounded-md bg-white/90 hover:bg-white text-destructive flex items-center justify-center"
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Caption */}
      <div className="p-2.5">
        {editingCaption ? (
          <div className="flex items-center gap-1">
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Descripción..."
              className="h-7 text-xs"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && updateCaption.mutate()}
            />
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => updateCaption.mutate()}>
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingCaption(false)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <p className="text-xs text-foreground truncate">
            {image.caption || <span className="text-muted-foreground italic">Sin descripción</span>}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export function GalleryAlbumDetailPage() {
  const { albumId } = useParams<{ albumId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: album, isLoading } = useQuery({
    queryKey: ['gallery-album', albumId],
    queryFn: () => GalleryService.galleryAdminControllerGetAlbum(albumId!),
    enabled: !!albumId,
  })

  // Estado local de orden para DnD optimista
  const [orderedImages, setOrderedImages] = useState<GalleryImageResponseDto[]>([])
  useEffect(() => {
    if (album?.images) setOrderedImages(album.images)
  }, [album?.images])

  // Edición de info del álbum
  const [editingInfo, setEditingInfo] = useState(false)
  const [title, setTitle] = useState('')
  const [kicker, setKicker] = useState('')
  const [description, setDescription] = useState('')
  useEffect(() => {
    if (album) {
      setTitle(album.title)
      setKicker(album.kicker || '')
      setDescription(album.description || '')
    }
  }, [album])

  // Crop dialog
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropOpen, setCropOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['gallery-album', albumId] })

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      GalleryService.galleryAdminControllerUploadImage(albumId!, {
        file: file as unknown as string,
      }),
    onSuccess: () => {
      invalidate()
      toast.success('Imagen agregada')
    },
    onError: (err: any) => toast.error(err?.body?.message || 'Error al subir imagen'),
  })

  const updateAlbum = useMutation({
    mutationFn: () =>
      GalleryService.galleryAdminControllerUpdateAlbum(albumId!, {
        title,
        kicker: kicker || null,
        description: description || null,
      }),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['gallery-albums'] })
      setEditingInfo(false)
      toast.success('Álbum actualizado')
    },
  })

  const togglePublishAlbum = useMutation({
    mutationFn: () => GalleryService.galleryAdminControllerTogglePublishAlbum(albumId!),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['gallery-albums'] })
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setCropSrc(url)
      setCropOpen(true)
      e.target.value = ''
    }
  }

  const handleCropComplete = async (file: File) => {
    await uploadMutation.mutateAsync(file)
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = orderedImages.findIndex((i) => i.id === active.id)
    const newIndex = orderedImages.findIndex((i) => i.id === over.id)
    const reordered = arrayMove(orderedImages, oldIndex, newIndex)
    setOrderedImages(reordered) // optimista

    GalleryService.galleryAdminControllerReorderImages(albumId!, {
      images: reordered.map((img, idx) => ({ id: img.id, sortOrder: idx })),
    })
      .then(() => invalidate())
      .catch(() => {
        toast.error('Error al reordenar')
        invalidate()
      })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Álbum no encontrado</p>
        <Button variant="link" onClick={() => navigate('/galeria')}>
          Volver a galería
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/galeria')} className="-ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver a galería
      </Button>

      {/* Album header card */}
      <div className="rounded-xl border border-border bg-card p-5">
        {editingInfo ? (
          <div className="space-y-3 max-w-lg">
            <div className="space-y-1.5">
              <Label>Título</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Kicker</Label>
                <Input value={kicker} onChange={(e) => setKicker(e.target.value)} placeholder="Ej: Sábados" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => updateAlbum.mutate()} disabled={updateAlbum.isPending}>
                Guardar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingInfo(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xl font-bold text-foreground">{album.title}</p>
                <StatusBadge isPublished={album.isPublished} />
              </div>
              {album.kicker && <p className="text-sm text-muted-foreground">{album.kicker}</p>}
              {album.description && (
                <p className="text-sm text-muted-foreground mt-1 max-w-prose">{album.description}</p>
              )}
              <button
                onClick={() => setEditingInfo(true)}
                className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
              >
                <Pencil className="h-3 w-3" /> Editar información
              </button>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <Switch
                  checked={album.isPublished}
                  onCheckedChange={() => togglePublishAlbum.mutate()}
                  id="album-pub"
                />
                <Label htmlFor="album-pub" className="text-xs text-muted-foreground cursor-pointer">
                  {album.isPublished ? 'Publicado' : 'Borrador'}
                </Label>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                <Upload className="h-4 w-4" />
                Subir foto
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Images grid con DnD */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">
            Fotos ({orderedImages.length})
          </p>
          {orderedImages.length > 1 && (
            <p className="text-xs text-muted-foreground">
              Arrastra las fotos para reordenarlas
            </p>
          )}
        </div>

        {orderedImages.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedImages.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {orderedImages.map((image) => (
                  <SortableImageCard key={image.id} image={image} albumId={albumId!} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground">Sin fotos</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Sube la primera foto a este álbum
            </p>
            <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
              <Upload className="h-4 w-4" />
              Subir foto
            </Button>
          </div>
        )}
      </div>

      {/* Crop dialog */}
      <ImageCropDialog
        open={cropOpen}
        imageSrc={cropSrc}
        onClose={() => {
          setCropOpen(false)
          if (cropSrc) URL.revokeObjectURL(cropSrc)
          setCropSrc(null)
        }}
        onCropComplete={handleCropComplete}
      />
    </div>
  )
}
