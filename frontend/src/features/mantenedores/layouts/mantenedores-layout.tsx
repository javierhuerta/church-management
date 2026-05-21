import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'
import { Users, Building2, FileText } from 'lucide-react'

function getUserRole(): string | null {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded.role || null
  } catch {
    return null
  }
}

const ADMIN_ONLY_PATHS = ['/mantenedores/usuarios', '/mantenedores/departamentos']

const subNav = [
  { path: '/mantenedores/usuarios', label: 'Usuarios', icon: Users },
  { path: '/mantenedores/departamentos', label: 'Departamentos', icon: Building2 },
  { path: '/mantenedores/plantillas', label: 'Plantillas', icon: FileText },
]

export function MantenedoresLayout() {
  const role = getUserRole()
  const location = useLocation()

  const isAdminOnlyPath = ADMIN_ONLY_PATHS.some((p) => location.pathname.startsWith(p))

  if (role !== 'Admin' && role !== 'Pastor') {
    return <Navigate to="/" replace />
  }

  if (isAdminOnlyPath && role !== 'Admin') {
    return <Navigate to="/mantenedores/plantillas" replace />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-muted-foreground">Mantenedores</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestión de usuarios, departamentos y plantillas</p>
      </div>

      <nav className="flex gap-1 border-b border-border pb-0">
        {subNav.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-muted-foreground hover:border-border'
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
