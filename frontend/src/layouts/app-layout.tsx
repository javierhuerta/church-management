import { Outlet } from 'react-router-dom'

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">Iglesia Adventista</h1>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-neutral-500">
          © 2026 Iglesia Adventista del Séptimo Día de Osorno Central
        </div>
      </footer>
    </div>
  )
}