import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Image as ImageIcon,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Images,
} from 'lucide-react'
import { GalleryService } from '@/lib/api'
import type { GalleryAlbumResponseDto } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useTheme } from '@/components/theme-provider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const STATUS_COLORS = {
  published: { light: '#0F766E', dark: '#0D9488' },
  draft: { light: '#C9A84C', dark: '#D4B566' },
}

const API_BASE = '' // las URLs ya vienen como /uploads/...

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
        padding: '3px 10px',
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {isPublished ? 'Publicado' : 'Borrador'}
    </span>
  )
}

// ─── Album Card (cover grande) ───────────────────────────────────────────────
function AlbumCard({ album }: { album: GalleryAlbumResponseDto }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const coverUrl =
    album.coverImageUrl ||
    (album.images && album.images.length > 0 ? album.images[0].url : null)

  const previews = (album.images || []).slice(0, 4)

  const togglePublishMutation = useMutation({
    mutationFn: () => GalleryService.galleryAdminControllerTogglePublishAlbum(album.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-albums'] })
      toast.success(album.isPublished ? 'Álbum despublicado' : 'Álbum publicado')
    },
    onError: () => toast.error('Error al cambiar estado'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => GalleryService.galleryAdminControllerDeleteAlbum(album.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-albums'] })
      toast.success('Álbum eliminado')
    },
    onError: () => toast.error('Error al eliminar álbum'),
  })

  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Cover */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <button
          type="button"
          className="absolute inset-0 w-full h-full"
          onClick={() => navigate(`/galeria/${album.id}`)}
          aria-label={`Abrir álbum ${album.title}`}
        >
          {coverUrl ? (
            <img
              src={API_BASE + coverUrl}
              alt={album.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Images className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
        </button>

        {/* Overlay gradient + badge */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-3 left-3 pointer-events-none">
          <StatusBadge isPublished={album.isPublished} />
        </div>

        {/* Acciones (hover) */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => togglePublishMutation.mutate()}
            className="h-8 w-8 rounded-md bg-white/90 hover:bg-white text-foreground flex items-center justify-center shadow-sm"
            title={album.isPublished ? 'Despublicar' : 'Publicar'}
          >
            {album.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="h-8 w-8 rounded-md bg-white/90 hover:bg-white text-destructive flex items-center justify-center shadow-sm"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Strip de previews abajo */}
        {previews.length > 1 && (
          <div className="absolute bottom-2 right-2 flex -space-x-2 pointer-events-none">
            {previews.slice(1, 4).map((img) => (
              <div
                key={img.id}
                className="h-8 w-8 rounded-md border-2 border-white/80 overflow-hidden shadow-sm bg-muted"
              >
                {img.url && (
                  <img src={API_BASE + img.url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <button
        type="button"
        className="w-full text-left p-4 cursor-pointer"
        onClick={() => navigate(`/galeria/${album.id}`)}
      >
        <p className="text-base font-semibold text-foreground truncate">{album.title}</p>
        {album.kicker && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{album.kicker}</p>
        )}
        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
          <Images className="h-3.5 w-3.5" />
          {album.imageCount ?? album.images?.length ?? 0} fotos
          <span className="mx-1">·</span>
          <Pencil className="h-3 w-3" />
          Editar
        </div>
      </button>

      {/* Confirmar eliminación */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar álbum</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Seguro que quieres eliminar <span className="font-medium text-foreground">{album.title}</span> y
            todas sus fotos? Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteMutation.mutate()
                setConfirmDelete(false)
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Create Album Dialog ─────────────────────────────────────────────────────
function CreateAlbumDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [kicker, setKicker] = useState('')
  const [description, setDescription] = useState('')

  const createMutation = useMutation({
    mutationFn: () =>
      GalleryService.galleryAdminControllerCreateAlbum({
        title: title.trim() || 'Nuevo álbum',
        kicker: kicker.trim() || null,
        description: description.trim() || null,
      }),
    onSuccess: (newAlbum) => {
      queryClient.invalidateQueries({ queryKey: ['gallery-albums'] })
      toast.success('Álbum creado')
      onClose()
      navigate(`/galeria/${newAlbum.id}`)
    },
    onError: () => toast.error('Error al crear álbum'),
  })

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo álbum</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="album-title">Título</Label>
            <Input
              id="album-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Cultos y predicaciones"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="album-kicker">Kicker (etiqueta corta)</Label>
            <Input
              id="album-kicker"
              value={kicker}
              onChange={(e) => setKicker(e.target.value)}
              placeholder="Ej: Sábados"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="album-desc">Descripción</Label>
            <Textarea
              id="album-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción del álbum"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            Crear álbum
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export function GalleryAlbumListPage() {
  const [createOpen, setCreateOpen] = useState(false)

  const { data: albums, isLoading } = useQuery({
    queryKey: ['gallery-albums'],
    queryFn: () => GalleryService.galleryAdminControllerListAlbums(),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-foreground">Galería</p>
          <p className="text-sm text-muted-foreground mt-1">
            Administra los álbumes de fotos del sitio público
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo álbum
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
          ))}
        </div>
      ) : albums && albums.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-semibold text-foreground">No hay álbumes</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Crea tu primer álbum para comenzar a organizar las fotos
          </p>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Crear álbum
          </Button>
        </div>
      )}

      <CreateAlbumDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
