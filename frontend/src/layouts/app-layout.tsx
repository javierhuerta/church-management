import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/sidebar'
import { useTextSize } from '@/lib/contexts/text-size-context'
import logoMark from '@/assets/images/logo-mark.png'

export function AppLayout() {
  const { textSizeClass } = useTextSize()

  return (
    <div className={`flex h-screen overflow-hidden ${textSizeClass}`}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto min-h-0 bg-muted">
          <div className="container mx-auto px-6 py-6 min-h-full">
            <Outlet />
          </div>
        </main>
        <footer className="shrink-0 border-t border-border bg-card py-4">
          <div className="container mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logoMark} alt="" className="h-5 w-auto opacity-50" />
              <span className="text-sm text-muted-foreground">
                Iglesia Adventista del Séptimo Día de Osorno Central
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 — Sistema de Gestión Eclesiástica
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
