import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Camera, Upload, ExternalLink, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import {
  SiteConfigService,
  type PrincipalLeaderResponseDto,
  type MinistryLeadershipDto,
} from '@/lib/api'
import { LeaderPhotoCropper } from '../components/leader-photo-cropper'

type Leader = PrincipalLeaderResponseDto
type Ministry = MinistryLeadershipDto

type LeaderFormData = {
  role: string
  name: string
  displayOrder: number
  isActive: boolean
}

const DEFAULT_FORM: LeaderFormData = {
  role: '',
  name: '',
  displayOrder: 0,
  isActive: true,
}

export function LiderazgoConfigPage() {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null)
  const [formData, setFormData] = useState<LeaderFormData>(DEFAULT_FORM)
  const [leaderToDelete, setLeaderToDelete] = useState<Leader | null>(null)

  // Photo crop state
  const [photoSource, setPhotoSource] = useState<string | null>(null)
  const [pendingPhoto, setPendingPhoto] = useState<{ blob: Blob; previewUrl: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: leaders = [], isLoading: leadersLoading } = useQuery({
    queryKey: ['site-config', 'leaders'],
    queryFn: () => SiteConfigService.siteConfigControllerListLeaders(),
  })

  const { data: boardPhoto, isLoading: boardPhotoLoading } = useQuery({
    queryKey: ['site-config', 'board-photo'],
    queryFn: () => SiteConfigService.siteConfigControllerGetBoardPhoto(),
  })

  const { data: ministries = [], isLoading: ministriesLoading } = useQuery({
    queryKey: ['site-config', 'ministries'],
    queryFn: () => SiteConfigService.siteConfigControllerListMinistries(),
  })

  const createMutation = useMutation({
    mutationFn: (dto: LeaderFormData) =>
      SiteConfigService.siteConfigControllerCreateLeader(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config', 'leaders'] })
      toast.success('Líder creado')
      closeForm()
    },
    onError: () => toast.error('Error al crear líder'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: LeaderFormData }) =>
      SiteConfigService.siteConfigControllerUpdateLeader(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config', 'leaders'] })
      toast.success('Líder actualizado')
      closeForm()
    },
    onError: () => toast.error('Error al actualizar líder'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => SiteConfigService.siteConfigControllerRemoveLeader(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config', 'leaders'] })
      toast.success('Líder eliminado')
      setLeaderToDelete(null)
    },
    onError: () => toast.error('Error al eliminar líder'),
  })

  const photoMutation = useMutation({
    mutationFn: ({ id, blob }: { id: string; blob: Blob }) => {
      return SiteConfigService.siteConfigControllerSetLeaderPhoto(id, {
        file: blob as unknown as string,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config', 'leaders'] })
      toast.success('Foto actualizada')
    },
    onError: () => toast.error('Error al subir foto'),
  })

  const boardPhotoMutation = useMutation({
    mutationFn: (blob: Blob) => {
      return SiteConfigService.siteConfigControllerSetBoardPhoto({
        file: blob as unknown as string,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config', 'board-photo'] })
      toast.success('Foto grupal actualizada')
    },
    onError: () => toast.error('Error al subir foto grupal'),
  })

  function openCreateForm() {
    setEditingLeader(null)
    setFormData(DEFAULT_FORM)
    setPendingPhoto(null)
    setPhotoSource(null)
    setIsFormOpen(true)
  }

  function openEditForm(leader: Leader) {
    setEditingLeader(leader)
    setFormData({
      role: leader.role,
      name: leader.name,
      displayOrder: leader.displayOrder,
      isActive: leader.isActive,
    })
    setPendingPhoto(null)
    setPhotoSource(null)
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingLeader(null)
    setFormData(DEFAULT_FORM)
    setPendingPhoto(null)
    setPhotoSource(null)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 10 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhotoSource(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleCropApply(blob: Blob, previewUrl: string) {
    setPendingPhoto({ blob, previewUrl })
    setPhotoSource(null)
  }

  function handleCropCancel() {
    setPhotoSource(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.role.trim() || !formData.name.trim()) {
      toast.error('Rol y nombre son obligatorios')
      return
    }

    try {
      let leaderId = editingLeader?.id

      if (editingLeader) {
        await updateMutation.mutateAsync({ id: editingLeader.id, dto: formData })
      } else {
        const created = await createMutation.mutateAsync(formData)
        leaderId = created.id
      }

      // Upload photo if pending
      if (pendingPhoto && leaderId) {
        await photoMutation.mutateAsync({ id: leaderId, blob: pendingPhoto.blob })
      }
    } catch {
      // Error already handled by mutations
    }
  }

  function handlePhotoUpload(leaderId: string, blob: Blob) {
    photoMutation.mutate({ id: leaderId, blob })
  }

  function handleBoardPhotoUpload(blob: Blob) {
    boardPhotoMutation.mutate(blob)
  }

  const isLoading = leadersLoading || boardPhotoLoading || ministriesLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Junta directiva */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Junta directiva</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Líderes principales que aparecen en el sitio público
            </p>
          </div>
          <Button onClick={openCreateForm} data-testid="add-leader-button">
            <Plus className="h-4 w-4 mr-2" />
            Agregar
          </Button>
        </div>

        {leaders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">No hay líderes registrados</p>
            <Button variant="outline" className="mt-4" onClick={openCreateForm}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar primer líder
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-lg border border-border">
              <Table data-testid="leaders-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Foto</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="w-20 text-center">Orden</TableHead>
                    <TableHead className="w-20 text-center">Activo</TableHead>
                    <TableHead className="w-32 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaders.map((leader) => (
                    <LeaderRow
                      key={leader.id}
                      leader={leader}
                      onEdit={() => openEditForm(leader)}
                      onDelete={() => setLeaderToDelete(leader)}
                      onPhotoUpload={(blob) => handlePhotoUpload(leader.id, blob)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {leaders.map((leader) => (
                <LeaderCard
                  key={leader.id}
                  leader={leader}
                  onEdit={() => openEditForm(leader)}
                  onDelete={() => setLeaderToDelete(leader)}
                  onPhotoUpload={(blob) => handlePhotoUpload(leader.id, blob)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Foto grupal */}
      <section className="space-y-4" data-testid="board-photo-section">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Foto grupal</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Foto de la junta directiva que aparece en el sitio público
          </p>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-4">
          {boardPhoto?.boardPhotoUrl ? (
            <img
              src={boardPhoto.boardPhotoUrl}
              alt="Foto grupal"
              className="w-full h-48 object-cover rounded-lg"
              data-testid="board-photo-preview"
            />
          ) : (
            <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Sin foto grupal</p>
            </div>
          )}

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              data-testid="board-photo-upload"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const blob = new Blob([file], { type: file.type })
                  handleBoardPhotoUpload(blob)
                }
                e.target.value = ''
              }}
            />
            <Button variant="outline" asChild data-testid="change-board-photo-button">
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {boardPhoto?.boardPhotoUrl ? 'Cambiar foto' : 'Subir foto'}
              </span>
            </Button>
          </label>
        </div>
      </section>

      {/* Ministerios */}
      <section className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-foreground">Ministerios</h3>
            <Badge variant="secondary">Solo lectura</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Ministerios y sus responsables. Estos datos se gestionan en{' '}
            <a href="/admin/mantenedores/departamentos" className="text-primary hover:underline">
              Departamentos
            </a>
            .
          </p>
        </div>

        {ministries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">No hay ministerios registrados</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Color</TableHead>
                  <TableHead>Ministerio</TableHead>
                  <TableHead>Responsables</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ministries.map((ministry) => (
                  <TableRow key={ministry.id}>
                    <TableCell>
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: ministry.color }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{ministry.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {ministry.leaders || 'Sin responsable'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Form drawer */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="sm:max-w-md h-full flex flex-col">
          <SheetHeader className="px-6 flex-shrink-0">
            <SheetTitle>{editingLeader ? 'Editar líder' : 'Nuevo líder'}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {photoSource ? (
              <div className="mt-6 px-6">
                <LeaderPhotoCropper
                  source={photoSource}
                  onCancel={handleCropCancel}
                  onApply={handleCropApply}
                />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 mt-6 px-6 pb-6">
              {/* Photo upload area */}
              <div className="space-y-3 pb-2">
                <label className="text-sm font-medium block">Foto</label>
                <div className="flex items-center gap-4">
                  {pendingPhoto ? (
                    <div className="relative">
                      <img
                        src={pendingPhoto.previewUrl}
                        alt="Preview"
                        className="h-20 w-20 rounded-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setPendingPhoto(null)}
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : editingLeader?.photoUrl ? (
                    <img
                      src={editingLeader.photoUrl}
                      alt={editingLeader.name}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                      <Camera className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {pendingPhoto ? 'Cambiar foto' : 'Subir foto'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG. Máx 10 MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium block">Rol *</label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Ej: Pastor, Tesorero"
                  data-testid="leader-role-input"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium block">Nombre *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre completo"
                  data-testid="leader-name-input"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium block">Orden</label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                  }
                  data-testid="leader-order-input"
                />
                <p className="text-xs text-muted-foreground">
                  Orden de aparición en el sitio
                </p>
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="text-sm font-medium">Activo</label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              <div className="flex gap-3 pt-6">
                <Button type="button" variant="outline" onClick={closeForm} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="leader-save-button"
                >
                  {editingLeader ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </form>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!leaderToDelete} onOpenChange={(open) => !open && setLeaderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar líder?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar a <strong>{leaderToDelete?.name}</strong>?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => leaderToDelete && deleteMutation.mutate(leaderToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function LeaderRow({
  leader,
  onEdit,
  onDelete,
  onPhotoUpload,
}: {
  leader: Leader
  onEdit: () => void
  onDelete: () => void
  onPhotoUpload: (blob: Blob) => void
}) {
  return (
    <TableRow>
      <TableCell>
        {leader.photoUrl ? (
          <img
            src={leader.photoUrl}
            alt={leader.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <Camera className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </TableCell>
      <TableCell className="font-medium">{leader.role}</TableCell>
      <TableCell>{leader.name}</TableCell>
      <TableCell className="text-center">{leader.displayOrder}</TableCell>
      <TableCell className="text-center">
        <Badge variant={leader.isActive ? 'default' : 'secondary'}>
          {leader.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} title="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} title="Eliminar">
            <Trash2 className="h-4 w-4" />
          </Button>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const blob = new Blob([file], { type: file.type })
                  onPhotoUpload(blob)
                }
                e.target.value = ''
              }}
            />
            <Button variant="ghost" size="icon" asChild title="Subir foto">
              <span>
                <Camera className="h-4 w-4" />
              </span>
            </Button>
          </label>
        </div>
      </TableCell>
    </TableRow>
  )
}

function LeaderCard({
  leader,
  onEdit,
  onDelete,
  onPhotoUpload,
}: {
  leader: Leader
  onEdit: () => void
  onDelete: () => void
  onPhotoUpload: (blob: Blob) => void
}) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-start gap-3">
        {leader.photoUrl ? (
          <img
            src={leader.photoUrl}
            alt={leader.name}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <Camera className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{leader.name}</p>
          <p className="text-sm text-muted-foreground">{leader.role}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">Orden: {leader.displayOrder}</span>
            <Badge variant={leader.isActive ? 'default' : 'secondary'} className="text-xs">
              {leader.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
          <Pencil className="h-3 w-3 mr-1" />
          Editar
        </Button>
        <Button variant="outline" size="sm" onClick={onDelete} className="flex-1">
          <Trash2 className="h-3 w-3 mr-1" />
          Eliminar
        </Button>
        <label className="cursor-pointer flex-1">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) {
                const blob = new Blob([file], { type: file.type })
                onPhotoUpload(blob)
              }
              e.target.value = ''
            }}
          />
          <Button variant="outline" size="sm" asChild className="w-full">
            <span>
              <Camera className="h-3 w-3 mr-1" />
              Foto
            </span>
          </Button>
        </label>
      </div>
    </div>
  )
}
