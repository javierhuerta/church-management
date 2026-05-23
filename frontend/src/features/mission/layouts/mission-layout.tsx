import { useRef, useState, useEffect, useCallback } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Users, CalendarCheck, HeartHandshake, ChevronLeft, ChevronRight } from 'lucide-react'

const subNav = [
  {
    path: '/misionero/personas',
    label: 'Personas',
    icon: Users,
    testId: 'nav-misionero-personas',
  },
  {
    path: '/misionero/visitas',
    label: 'Visitación',
    icon: CalendarCheck,
    testId: 'nav-misionero-visitas',
  },
  {
    path: '/misionero/rescate',
    label: 'Miembros a rescatar',
    icon: HeartHandshake,
    testId: 'nav-misionero-rescate',
  },
]

export function MissionLayout() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft]   = useState(false)
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

      {/* Tab bar con botones de scroll en mobile */}
      <div className="relative flex items-end border-b border-border">
        {/* Flecha izquierda */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 z-10 flex items-center justify-center h-full px-1 bg-gradient-to-r from-background via-background to-transparent pr-4"
            aria-label="Desplazar tabs a la izquierda"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
        )}

        {/* Tabs scrollables */}
        <div
          ref={scrollRef}
          className="flex gap-1 overflow-x-auto pb-0 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {subNav.map(({ path, label, icon: Icon, testId }) => (
            <NavLink
              key={path}
              to={path}
              data-testid={testId}
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

        {/* Flecha derecha */}
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
