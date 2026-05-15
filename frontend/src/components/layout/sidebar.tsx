import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Calendar, FileText, Heart, LogOut, User, ChevronDown, ChevronLeft, Settings } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTextSize } from '@/lib/contexts/text-size-context'
import type { TextSize } from '@/lib/contexts/text-size-context'
import { AuthService } from '@/lib/api'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  matchPrefix?: string
  disabled?: boolean
}

const navItems: NavItem[] = [
  { id: 'calendario', label: 'Calendario', icon: Calendar, path: '/calendario' },
  { id: 'cultos', label: 'Cultos', icon: FileText, path: '/cultos/programas', matchPrefix: '/cultos' },
  { id: 'mision', label: 'Misión', icon: Heart, path: '/mision', disabled: true },
]

const adminNavItems: NavItem[] = [
  { id: 'mantenedores', label: 'Mantenedores', icon: Settings, path: '/mantenedores/usuarios', matchPrefix: '/mantenedores' },
]

function getUserFromStorage() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return {
      name: decoded.name || 'Usuario',
      email: decoded.email || '',
      role: decoded.role || 'Miembro',
    }
  } catch {
    return null
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { textSize, setTextSize } = useTextSize()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isCollapsedDropdownOpen, setIsCollapsedDropdownOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [openSections, setOpenSections] = useState<string[]>(['modules'])
  const user = getUserFromStorage()

  // Auto-collapse on small viewports; track isSmallScreen separately so the
  // expanded header can show a collapse button when manually opened on mobile.
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)')
    const handleChange = (e: MediaQueryListEvent) => {
      setIsSmallScreen(e.matches)
      setIsCollapsed(e.matches)
    }
    setIsSmallScreen(mediaQuery.matches)
    setIsCollapsed(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const handleLogout = async () => {
    try {
      await AuthService.authControllerLogout()
    } catch {
      // ignore errors on logout
    }
    localStorage.removeItem('token')
    navigate('/login')
  }

  function handleNavClick(item: NavItem) {
    if (!item.disabled) {
      navigate(item.path)
    }
  }

  return (
    <aside
      className={`flex flex-col bg-neutral-50 border-r border-neutral-200 h-full transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className={`border-b border-neutral-200 bg-white ${isCollapsed ? 'p-3 flex justify-center' : 'p-6'}`}>
        {isCollapsed ? (
          // Task 1.3: Clicking IA logo expands sidebar
          <button
            onClick={() => setIsCollapsed(false)}
            className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span className="text-white font-bold text-sm">IA</span>
          </button>
        ) : (
          // Task 2.3: Full header text when expanded
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">IA</span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Iglesia Adventista</h2>
                <p className="text-xs text-neutral-500">Osorno Central</p>
              </div>
            </div>
            {isSmallScreen && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                aria-label="Colapsar sidebar"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {isCollapsed ? (
          // Task 3.1, 3.2, 3.3: Icon-only nav in collapsed mode
          <div className="flex flex-col items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.matchPrefix
                ? location.pathname.startsWith(item.matchPrefix)
                : location.pathname === item.path
              return (
                <button
                  key={item.id}
                  disabled={item.disabled}
                  onClick={() => handleNavClick(item)}
                  title={item.label}
                  className={`
                    w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : item.disabled
                        ? 'text-neutral-400 cursor-not-allowed hover:bg-neutral-100'
                        : 'text-neutral-600 hover:bg-white hover:text-neutral-900 border border-transparent hover:shadow-sm'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-neutral-400'}`} />
                </button>
              )
            })}
            {(user?.role === 'Admin' || user?.role === 'Pastor') && adminNavItems.map((item) => {
              const Icon = item.icon
              const isActive = item.matchPrefix
                ? location.pathname.startsWith(item.matchPrefix)
                : location.pathname === item.path
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  title={item.label}
                  className={`
                    w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-neutral-600 hover:bg-white hover:text-neutral-900 border border-transparent hover:shadow-sm'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-neutral-400'}`} />
                </button>
              )
            })}
          </div>
        ) : (
          <Accordion type="single" value={openSections[0]} onValueChange={(v) => setOpenSections(v ? [v] : [])}>
            <AccordionItem value="modules">
              <AccordionTrigger>Modulos</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = item.matchPrefix
                      ? location.pathname.startsWith(item.matchPrefix)
                      : location.pathname === item.path
                    return (
                      <button
                        key={item.id}
                        disabled={item.disabled}
                        onClick={() => handleNavClick(item)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                          ${isActive
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                            : item.disabled
                              ? 'text-neutral-400 cursor-not-allowed hover:bg-neutral-100'
                              : 'text-neutral-600 hover:bg-white hover:text-neutral-900 border border-transparent hover:shadow-sm'
                          }
                        `}
                      >
                        <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-neutral-400'}`} />
                        <span>{item.label}</span>
                        {item.disabled && (
                          <span className="ml-auto text-xs px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-400">
                            Pronto
                          </span>
                        )}
                        {isActive && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
            {(user?.role === 'Admin' || user?.role === 'Pastor') && (
              <AccordionItem value="admin">
                <AccordionTrigger>Administración</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1">
                    {adminNavItems.map((item) => {
                      const Icon = item.icon
                      const isActive = item.matchPrefix
                        ? location.pathname.startsWith(item.matchPrefix)
                        : location.pathname === item.path
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item)}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                            ${isActive
                              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                              : 'text-neutral-600 hover:bg-white hover:text-neutral-900 border border-transparent hover:shadow-sm'
                            }
                          `}
                        >
                          <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-neutral-400'}`} />
                          <span>{item.label}</span>
                          {isActive && (
                            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-neutral-200 bg-white">
        {isCollapsed ? (
          // Task 4.2: Collapsed — avatar triggers dropdown positioned to the right
          <div className="flex justify-center">
            <DropdownMenu className="relative">
              <DropdownMenuTrigger
                onClick={() => setIsCollapsedDropdownOpen(!isCollapsedDropdownOpen)}
                className="rounded-full hover:opacity-90 transition-opacity"
              >
                <Avatar className="h-10 w-10 shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-neutral-700 to-neutral-800 text-white text-sm font-medium">
                    {user ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              {isCollapsedDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsCollapsedDropdownOpen(false)}
                  />
                  {/* Task 4.3, 4.4: Dropdown content with profile info, text size, logout */}
                  <DropdownMenuContent className="absolute bottom-0 left-full ml-3 w-56 z-50 rounded-xl shadow-lg border border-neutral-200 p-3">
                    <div className="mb-2 pb-2 border-b border-neutral-100">
                      <DropdownMenuLabel className="p-0 text-sm font-medium text-neutral-900 truncate">
                        {user?.name || 'Usuario'}
                      </DropdownMenuLabel>
                      <p className="text-xs text-neutral-500 truncate px-2">{user?.role || 'Miembro'}</p>
                    </div>
                    <DropdownMenuItem
                      onSelect={() => setIsCollapsedDropdownOpen(false)}
                      className="flex items-center gap-2 text-neutral-600"
                    >
                      <User className="h-4 w-4" />
                      Ver Perfil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1">
                      <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
                        Tamaño de texto
                      </p>
                      <div className="flex gap-1">
                        {(['small', 'medium', 'large'] as TextSize[]).map((size) => (
                          <button
                            key={size}
                            onClick={() => setTextSize(size)}
                            className={`
                              flex-1 py-1.5 text-xs font-medium rounded-lg transition-all
                              ${textSize === size
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                              }
                            `}
                          >
                            {size === 'small' ? 'Pequeño' : size === 'medium' ? 'Mediano' : 'Grande'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={handleLogout}
                      className="flex items-center gap-2 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </>
              )}
            </DropdownMenu>
          </div>
        ) : (
          // Expanded: original dropdown implementation
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-200"
            >
              <Avatar className="h-10 w-10 shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-neutral-700 to-neutral-800 text-white text-sm font-medium">
                  {user ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {user?.name || 'Usuario'}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {user?.role || 'Miembro'}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-white rounded-xl shadow-lg border border-neutral-200 z-50">
                  <div className="mb-2 pb-2 border-b border-neutral-100">
                    <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Mi Cuenta
                    </p>
                  </div>
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Ver Perfil
                  </button>
                  <div className="mt-3 mb-2 px-2">
                    <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
                      Tamaño de texto
                    </p>
                    <div className="flex gap-1">
                      {(['small', 'medium', 'large'] as TextSize[]).map((size) => (
                        <button
                          key={size}
                          onClick={() => setTextSize(size)}
                          className={`
                            flex-1 py-1.5 text-xs font-medium rounded-lg transition-all
                            ${textSize === size
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }
                          `}
                        >
                          {size === 'small' ? 'Pequeño' : size === 'medium' ? 'Mediano' : 'Grande'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-neutral-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
