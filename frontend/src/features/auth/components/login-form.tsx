import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthService, OpenAPI } from '@/lib/api'
import { Mail, Lock, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type LoginInput = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      setError(null)
      const response = (await AuthService.authControllerLogin(data)) as {
        accessToken?: string
        access_token?: string
      }
      const token = response.accessToken ?? response.access_token ?? ''
      OpenAPI.TOKEN = token
      localStorage.setItem('token', token)
      onSuccess?.()
    } catch (err: any) {
      setError(err.body?.message || 'Error al iniciar sesión')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
          <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-destructive text-sm">!</span>
          </div>
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Correo electrónico
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="pastor@iglesia.cl"
            className="pl-10 h-11 rounded-xl"
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">
          Contraseña
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="pl-10 h-11 rounded-xl"
            {...register('password')}
          />
        </div>
        {errors.password && (
          <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-11 rounded-xl font-medium shadow-md"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Iniciando sesión...
          </span>
        ) : (
          'Iniciar Sesión'
        )}
      </Button>
    </form>
  )
}