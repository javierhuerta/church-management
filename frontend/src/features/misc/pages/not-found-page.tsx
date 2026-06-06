import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Compass } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import logoFull from '@/assets/images/logo.png'

const NAVY = '#1B3A6B'
const GOLD = '#C9A84C'

function getIsLoggedIn(): boolean {
  return !!localStorage.getItem('token')
}

export function NotFoundPage() {
  const navigate = useNavigate()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const loggedIn = getIsLoggedIn()

  return (
    <div className="h-screen overflow-y-auto bg-background flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <img
        src={logoFull}
        alt="Iglesia Adventista Central Osorno"
        className="w-28 h-auto mb-8 opacity-90"
        style={isDark ? { filter: 'brightness(0) invert(1)' } : undefined}
      />

      {/* 404 grande estilo display */}
      <p
        style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 'clamp(72px, 14vw, 140px)',
          fontWeight: 700,
          lineHeight: 1,
          color: GOLD,
          letterSpacing: '-0.02em',
        }}
      >
        404
      </p>

      {/* Separador dorado */}
      <span
        style={{ width: 48, height: 3, background: GOLD, display: 'inline-block', borderRadius: 2 }}
        className="my-5"
      />

      {/* Título */}
      <p
        style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 'clamp(24px, 3.4vw, 34px)',
          fontWeight: 600,
          color: isDark ? '#A8C4F0' : NAVY,
          lineHeight: 1.2,
        }}
      >
        Página no encontrada
      </p>

      {/* Descripción */}
      <p className="text-muted-foreground text-base mt-3 max-w-md">
        La página que buscas no existe o fue movida. Revisa la dirección o vuelve a un lugar
        conocido.
      </p>

      {/* Acciones */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver atrás
        </Button>
        {loggedIn ? (
          <Button onClick={() => navigate('/')} className="gap-2">
            <Home className="h-4 w-4" />
            Ir al panel
          </Button>
        ) : (
          <Button onClick={() => navigate('/login')} className="gap-2">
            <Compass className="h-4 w-4" />
            Iniciar sesión
          </Button>
        )}
      </div>

      {/* Footer sutil */}
      <p className="text-xs text-muted-foreground mt-12">
        Iglesia Adventista del Séptimo Día — Osorno Central
      </p>
    </div>
  )
}
