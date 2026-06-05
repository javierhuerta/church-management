import { useRef, useState, useEffect, useCallback } from 'react'
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react'

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

export type ConfigTab = {
  id: string
  label: string
  path: string
  icon?: React.ComponentType<{ className?: string }>
}

const BASE_TABS: ConfigTab[] = [
  { id: 'inicio', label: 'Inicio', path: 'inicio' },
  { id: 'liderazgo', label: 'Liderazgo', path: 'liderazgo' },
  { id: 'horarios', label: 'Horarios', path: 'horarios' },
  { id: 'calendario', label: 'Calendario', path: 'calendario' },
  { id: 'cultos', label: 'Cultos', path: 'cultos' },
  { id: 'galeria', label: 'Galería', path: 'galeria' },
  { id: 'transmisiones', label: 'Transmisiones', path: 'transmisiones' },
]

export function ConfiguracionesLayout() {
  const role = getUserRole()
  const location = useLocation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

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

  if (role !== 'Admin') {
    return <Navigate to="/" replace />
  }

  const tabs = BASE_TABS

  return (
    <div className="space-y-6">
      <div>
        <p className="text-3xl font-bold tracking-tight text-muted-foreground">Configuraciones</p>
        <p className="text-muted-foreground mt-1">Personaliza el contenido del sitio público</p>
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
          {tabs.map(({ path, label, icon: Icon }) => (
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
              {Icon && <Icon className="h-4 w-4" />}
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
