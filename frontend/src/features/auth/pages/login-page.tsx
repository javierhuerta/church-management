import { useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/login-form'
import { LoginControls } from '@/components/login-controls'
import logoFull from '@/assets/images/logo.png'

export function LoginPage() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-12 relative">
        <div className="flex flex-col items-center gap-8 max-w-sm text-center">
          <img
            src={logoFull}
            alt="Adventistas Central Osorno"
            className="w-48 h-auto"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <div>
            <p className="text-primary-foreground/80 text-sm font-light tracking-wide">
              Sistema de Gestión
            </p>
            <p className="text-primary-foreground/60 text-xs mt-1">
              Iglesia Adventista Central Osorno
            </p>
          </div>
        </div>
        {/* Decorative bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />
      </div>

      {/* Right: Form panel */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Controls bar */}
        <div className="flex justify-end p-4">
          <LoginControls />
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-sm">
            {/* Logo — visible only on mobile */}
            <div className="flex justify-center mb-8 lg:hidden">
              <img
                src={logoFull}
                alt="Adventistas Central Osorno"
                className="h-20 w-auto"
              />
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                Bienvenido
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            <LoginForm onSuccess={handleSuccess} />

            <p className="text-center text-xs text-muted-foreground mt-8">
              © 2026 Iglesia Adventista del Séptimo Día de Osorno Central
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
