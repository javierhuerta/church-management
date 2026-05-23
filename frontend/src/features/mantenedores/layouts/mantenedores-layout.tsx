import { useRef, useState, useEffect, useCallback } from 'react'
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'
import { Users, Building2, FileText, ListChecks, ChevronLeft, ChevronRight } from 'lucide-react'

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

const ADMIN_ONLY_PATHS = ['/mantenedores/usuarios', '/mantenedores/departamentos', '/mantenedores/catalogos']

const subNav = [
  { path: '/mantenedores/usuarios', label: 'Usuarios', icon: Users },
  { path: '/mantenedores/departamentos', label: 'Departamentos', icon: Building2 },
  { path: '/mantenedores/plantillas', label: 'Plantillas', icon: FileText },
  { path: '/mantenedores/catalogos', label: 'Catálogos', icon: ListChecks },
]

export function MantenedoresLayout() {
  const role = getUserRole()
  const location = useLocation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const isAdminOnlyPath = ADMIN_ONLY_PATHS.some((p) => location.pathname.startsWith(p))

  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    const ro = new ResizeObserver(updateArrows)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', updateArrows); ro.disconnect() }
  }, [updateArrows])

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -120 : 120, behavior: 'smooth' })
  }

  if (role !== 'Admin' && role !== 'Pastor') {
    return <Navigate to="/" replace />
  }

  if (isAdminOnlyPath && role !== 'Admin') {
    return <Navigate to="/mantenedores/plantillas" replace />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-muted-foreground">Mantenedores</h2>
        <p className="text-muted-foreground mt-1">Gestión de usuarios, departamentos y plantillas</p>
      </div>

      <div className="relative flex items-end border-b border-border">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 z-10 flex items-center justify-center h-full px-1 bg-gradient-to-r from-background via-background to-transparent pr-4"
            aria-label="Desplazar tabs a la izquierda"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-1 overflow-x-auto pb-0 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {subNav.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap shrink-0 ${
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
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 z-10 flex items-center justify-center h-full px-1 bg-gradient-to-l from-background via-background to-transparent pl-4"
            aria-label="Desplazar tabs a la derecha"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div>
        <Outlet />
      </div>
    </div>
  )
}