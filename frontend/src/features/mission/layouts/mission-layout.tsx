import { NavLink, Outlet } from 'react-router-dom'
import { Users } from 'lucide-react'

const subNav = [
  {
    path: '/misionero/personas',
    label: 'Personas',
    icon: Users,
    testId: 'nav-misionero-personas',
  },
]

export function MissionLayout() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-3xl font-bold tracking-tight text-muted-foreground">
          Misionero
        </p>
        <p className="text-muted-foreground mt-1">
          Gestión de personas, estudios bíblicos y actividades misioneras
        </p>
      </div>

      <nav className="flex gap-1 border-b border-border pb-0">
        {subNav.map(({ path, label, icon: Icon, testId }) => (
          <NavLink
            key={path}
            to={path}
            data-testid={testId}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div>
        <Outlet />
      </div>
    </div>
  )
}
