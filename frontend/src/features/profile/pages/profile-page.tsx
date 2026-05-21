import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Camera, Lock, User } from 'lucide-react'
import { AuthService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

type Tab = 'profile' | 'password'

export function ProfilePage() {
  const [tab, setTab] = useState<Tab>('profile')

  const { data: user, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => AuthService.authControllerGetProfile() as Promise<{ id: string; name: string; email: string; role: string; avatar: string | null }>,
  })

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-muted-foreground">Mi Perfil</h2>
        <p className="text-sm text-muted-foreground mt-1">Gestiona tu información personal</p>
      </div>

      <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
        {([
          { key: 'profile', label: 'Perfil', Icon: User },
          { key: 'password', label: 'Contraseña', Icon: Lock },
        ] as const).map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              tab === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Cargando...</div>
      ) : user ? (
        tab === 'profile' ? (
          <ProfileTab user={user} />
        ) : (
          <PasswordTab />
        )
      ) : null}
    </div>
  )
}

function ProfileTab({ user }: { user: { id: string; name: string; email: string; role: string; avatar: string | null } }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [name, setName] = useState(user.name)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar ?? '')

  const mutation = useMutation({
    mutationFn: (data: { name: string; avatar?: string | null }) =>
      AuthService.authControllerUpdateProfile({ name: data.name, avatar: data.avatar || null }),
    onSuccess: () => {
      toast.success('Perfil actualizado')
    },
    onError: (err: { body?: { message?: string } }) => {
      setServerError(err.body?.message ?? 'Error al actualizar el perfil')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    mutation.mutate({ name, avatar: avatarUrl || null })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-6">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-border overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xl font-semibold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
            <Camera className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar">Foto (URL)</Label>
        <Input
          id="avatar"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/foto.jpg"
        />
        <p className="text-xs text-muted-foreground">Pega una URL de imagen pública</p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}

function PasswordTab() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const mutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      AuthService.authControllerChangePassword(data),
    onSuccess: () => {
      toast.success('Contraseña actualizada')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
    onError: (err: { body?: { message?: string } }) => {
      setServerError(err.body?.message ?? 'Error al cambiar la contraseña')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    if (newPassword !== confirmPassword) {
      setServerError('Las contraseñas no coinciden')
      return
    }
    if (newPassword.length < 8) {
      setServerError('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }
    mutation.mutate({ currentPassword, newPassword })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-5">
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="current">Contraseña actual</Label>
        <Input
          id="current"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Tu contraseña actual"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new">Nueva contraseña</Label>
        <Input
          id="new"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm">Confirmar nueva contraseña</Label>
        <Input
          id="confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repite la nueva contraseña"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Cambiando...' : 'Cambiar contraseña'}
        </Button>
      </div>
    </form>
  )
}