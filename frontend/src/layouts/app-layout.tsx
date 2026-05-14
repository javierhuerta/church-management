import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/sidebar'
import { useTextSize } from '@/lib/contexts/text-size-context'

export function AppLayout() {
  const { textSizeClass } = useTextSize()

  return (
    <div className={`flex h-screen ${textSizeClass}`}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-h-screen bg-neutral-50">
        <main className="flex-1 container mx-auto px-6 py-6">
          <Outlet />
        </main>
        <footer className="border-t border-neutral-200 bg-white py-4">
          <div className="container mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-xs">IA</span>
              </div>
              <span className="text-sm text-neutral-500">
                Iglesia Adventista del Séptimo Día de Osorno Central
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              © 2026 — Sistema de Gestión Eclesiástica
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}