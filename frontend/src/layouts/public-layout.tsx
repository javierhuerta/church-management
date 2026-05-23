import { Outlet, Link } from 'react-router-dom'
import { useTextSize } from '@/lib/contexts/text-size-context'
import { useTheme } from '@/components/theme-provider'
import { usePullToRefresh, PullToRefreshIndicator } from '@/lib/hooks/use-pull-to-refresh'
import logoFull from '@/assets/images/logo.png'

export function PublicLayout() {
  const { textSizeClass } = useTextSize()
  const isLoggedIn = !!localStorage.getItem('token')
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const logoFilter = isDark ? 'brightness(0) invert(1)' : undefined
  usePullToRefresh()

  return (
    <>
      <PullToRefreshIndicator progress={0} />
      <div className={`flex flex-col h-screen overflow-hidden ${textSizeClass}`}>
        <header className="border-b border-border bg-card shrink-0">
          <div className="container mx-auto px-6 py-3 flex items-center justify-between">
            <Link to={isLoggedIn ? '/calendario' : '/login'} className="flex items-center gap-3">
              <img src={logoFull} alt="Iglesia Adventista Osorno Central" className="h-10 w-auto" style={{ filter: logoFilter }} />
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
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
        <footer className="border-t border-border bg-card py-6 shrink-0">
          <div className="container mx-auto px-6 text-center">
            <img src={logoFull} alt="" className="h-6 w-auto mx-auto mb-2 opacity-60" style={{ filter: logoFilter }} />
            <p className="text-xs text-muted-foreground">
              © 2026 — Iglesia Adventista del Séptimo Día de Osorno Central
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
