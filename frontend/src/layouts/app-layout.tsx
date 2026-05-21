import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/sidebar'
import { useTextSize } from '@/lib/contexts/text-size-context'

export function AppLayout() {
  const { textSizeClass } = useTextSize()

  return (
    <div className={`flex h-screen overflow-hidden ${textSizeClass}`}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-y-auto bg-muted">
        <main className="flex-1 container mx-auto px-6 py-6">
          <Outlet />
        </main>
        <footer className="border-t border-border bg-card py-4">
          <div className="container mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">IA</span>
              </div>
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