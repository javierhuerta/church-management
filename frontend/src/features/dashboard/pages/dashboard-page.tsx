export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Bienvenido al sistema de gestión de la iglesia
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-lg font-semibold">Calendario</h3>
          <p className="text-sm text-neutral-500 mt-1">
            Próximos eventos y actividades
          </p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-lg font-semibold">Cultos</h3>
          <p className="text-sm text-neutral-500 mt-1">
            Gestión de cultos y partes
          </p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-lg font-semibold">Misión</h3>
          <p className="text-sm text-neutral-500 mt-1">
            Actividades evangelísticas
          </p>
        </div>
      </div>
    </div>
  )
}