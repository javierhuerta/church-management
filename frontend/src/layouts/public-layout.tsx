import { Outlet, Link } from 'react-router-dom'
import { useTextSize } from '@/lib/contexts/text-size-context'

export function PublicLayout() {
  const { textSizeClass } = useTextSize()
  const isLoggedIn = !!localStorage.getItem('token')

  return (
    <div className={`min-h-screen flex flex-col bg-muted ${textSizeClass}`}>
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <Link to={isLoggedIn ? '/calendario' : '/login'} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-xs">IA</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              Iglesia Adventista — Osorno Central
            </span>
          </Link>
          {!isLoggedIn && (
            <Link
              to="/login"
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </header>
      <main className="flex-1 container mx-auto px-6 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-card py-4">
        <div className="container mx-auto px-6 text-center text-xs text-muted-foreground">
          © 2026 — Iglesia Adventista del Séptimo Día de Osorno Central
        </div>
      </footer>
    </div>
  )
}
