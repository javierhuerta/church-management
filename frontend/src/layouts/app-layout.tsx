import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/sidebar'
import { useTextSize } from '@/lib/contexts/text-size-context'
import { SidebarProvider, useSidebar } from '@/lib/contexts/sidebar-context'
import { Menu } from 'lucide-react'

function AppLayoutInner() {
  const { textSizeClass } = useTextSize()
  const { isOpen, isSmallScreen, open, close } = useSidebar()

  return (
    <div className={`flex h-screen ${textSizeClass}`}>
      {/* Overlay semitransparente cuando sidebar está abierto en móvil */}
      {isSmallScreen && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={close}
        />
      )}

      {/* En móvil: sidebar fixed encima del contenido. En desktop: ocupa su lugar en el flex */}
      <div className={isSmallScreen
        ? `fixed inset-y-0 left-0 z-40 ${isOpen ? 'block' : 'hidden'}`
        : 'relative shrink-0'
      }>
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden min-w-0">
        {/* Barra superior en móvil con botón hamburguesa */}
        {isSmallScreen && (
          <div className="shrink-0 h-12 bg-card border-b border-border flex items-center px-4">
            <button
              onClick={open}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="flex-1 text-center text-sm font-semibold text-primary">
              Iglesia Adventista Osorno Central
            </span>
            {/* Spacer para balancear el botón y mantener el texto centrado */}
            <div className="h-8 w-8 shrink-0" />
          </div>
        )}

        <main className="flex-1 bg-muted">
          <div className="px-6 py-6">
            <Outlet />
          </div>
        </main>
        <footer className="shrink-0 border-t border-border bg-card py-3">
          <div className="px-6 flex items-center justify-between gap-4 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Iglesia Adventista del Séptimo Día — Osorno Central</span>
            <span className="sm:hidden">I.A. Osorno Central</span>
            <span>© 2026 — Gestión Eclesiástica</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppLayoutInner />
    </SidebarProvider>
  )
}
