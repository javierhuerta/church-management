import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Calendar, FileText, Church, LogOut, User, ChevronDown, ChevronLeft, Settings, Sun, Moon, Monitor } from 'lucide-react'
import logoFull from '@/assets/images/logo.png'
import logoMark from '@/assets/images/logo-mark.png'
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
import { useTheme } from '@/components/theme-provider'
import { useSidebar } from '@/lib/contexts/sidebar-context'
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
  { id: 'mision', label: 'Misión', icon: Church, path: '/mision', disabled: true },
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

type Theme = 'light' | 'dark' | 'system'

const themeOptions: { value: Theme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { textSize, setTextSize } = useTextSize()
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  const logoFilter = isDark ? 'brightness(0) invert(1)' : undefined
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isCollapsedDropdownOpen, setIsCollapsedDropdownOpen] = useState(false)
  const [openSections, setOpenSections] = useState<string[]>(['modules'])
  const { isOpen, isSmallScreen, close, toggle } = useSidebar()
  const isCollapsed = !isOpen
  const user = getUserFromStorage()

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
      className={`flex flex-col bg-card border-r border-border h-full transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className={`border-b border-border bg-card ${isCollapsed ? 'p-3 flex justify-center' : 'px-4 py-5'}`}>
        {isCollapsed ? (
          <button
            onClick={() => isSmallScreen ? toggle() : navigate('/')}
            className="h-10 w-10 flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
            aria-label={isSmallScreen ? 'Expandir menú' : 'Ir al inicio'}
          >
            <img src={logoMark} alt="Logo" className="h-9 w-auto" style={{ filter: logoFilter }} />
          </button>
        ) : (
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer text-left w-full"
            >
              <img src={logoFull} alt="Adventistas Central Osorno" className="h-14 w-auto shrink-0" style={{ filter: logoFilter }} />
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight">Adventistas</p>
                <p className="text-sm text-muted-foreground leading-snug">Central Osorno</p>
              </div>
            </button>
            {isSmallScreen && (
              <button
                onClick={() => close()}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
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
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                      : item.disabled
                        ? 'text-muted-foreground cursor-not-allowed hover:bg-accent'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-transparent hover:shadow-sm'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
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
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-transparent hover:shadow-sm'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
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
                            ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                            : item.disabled
                              ? 'text-muted-foreground cursor-not-allowed hover:bg-accent'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-transparent hover:shadow-sm'
                          }
                        `}
                      >
                        <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span>{item.label}</span>
                        {item.disabled && (
                          <span className="ml-auto text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                            Pronto
                          </span>
                        )}
                        {isActive && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
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
                              ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-transparent hover:shadow-sm'
                            }
                          `}
                        >
                          <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span>{item.label}</span>
                          {isActive && (
                            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
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
      <div className="p-4 border-t border-border bg-card">
        {isCollapsed ? (
          <div className="flex justify-center">
            <DropdownMenu className="relative">
              <DropdownMenuTrigger
                onClick={() => setIsCollapsedDropdownOpen(!isCollapsedDropdownOpen)}
                className="rounded-full hover:opacity-90 transition-opacity"
              >
                <Avatar className="h-10 w-10 shadow-sm">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
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
                  <DropdownMenuContent className="absolute bottom-0 left-full ml-3 w-56 z-50 rounded-xl shadow-lg border border-border p-3">
                    <div className="mb-2 pb-2 border-b border-border">
                      <DropdownMenuLabel className="p-0 text-sm font-medium text-foreground truncate">
                        {user?.name || 'Usuario'}
                      </DropdownMenuLabel>
                      <p className="text-xs text-muted-foreground truncate px-2">{user?.role || 'Miembro'}</p>
                    </div>
                    <DropdownMenuItem
                      onSelect={() => setIsCollapsedDropdownOpen(false)}
                      className="flex items-center gap-2 px-2 py-1.5 text-foreground rounded-lg hover:bg-accent"
                    >
                      <User className="h-4 w-4" />
                      Ver Perfil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Tamaño de texto
                      </p>
<div className="flex gap-1 px-2">
                      {themeOptions.map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => setTheme(value)}
                          title={label}
                          className={`
                            flex-1 py-1.5 flex items-center justify-center rounded-lg transition-all
                            ${theme === value
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            }
                          `}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </button>
                      ))}
                    </div>
                    </div>
                    <div className="px-2 py-1 mt-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Tema
                      </p>
                      <div className="flex gap-1 px-2">
                        {themeOptions.map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            onClick={() => setTheme(value)}
                            title={label}
                            className={`
                              flex-1 py-1.5 flex items-center justify-center rounded-lg transition-all
                              ${theme === value
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                              }
                            `}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={handleLogout}
                      className="flex items-center gap-2 px-2 py-1.5 text-destructive rounded-lg hover:bg-destructive/10"
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
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-accent transition-colors border border-border"
            >
              <Avatar className="h-10 w-10 shadow-sm">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {user ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name || 'Usuario'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role || 'Miembro'}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-card rounded-xl shadow-lg border border-border z-50">
                  <div className="mb-2 pb-2 border-b border-border">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Mi Cuenta
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      navigate('/perfil')
                    }}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Ver Perfil
                  </button>
                  <div className="mt-3 mb-2 px-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
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
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            }
                          `}
                        >
                          {size === 'small' ? 'Pequeño' : size === 'medium' ? 'Mediano' : 'Grande'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 mb-2 px-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Tema
                    </p>
                    <div className="flex gap-1">
                      {themeOptions.map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => setTheme(value)}
                          className={`
                            flex-1 py-1.5 flex items-center justify-center gap-1 text-xs font-medium rounded-lg transition-all
                            ${theme === value
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            }
                          `}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
