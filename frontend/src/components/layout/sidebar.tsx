import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Calendar, FileText, Heart, LogOut, User, ChevronDown } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { useTextSize } from '@/lib/contexts/text-size-context'
import type { TextSize } from '@/lib/contexts/text-size-context'
import { AuthService } from '@/lib/api'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  disabled?: boolean
}

const navItems: NavItem[] = [
  { id: 'calendario', label: 'Calendario', icon: Calendar, path: '/calendario' },
  { id: 'cultos', label: 'Cultos', icon: FileText, path: '/cultos', disabled: true },
  { id: 'mision', label: 'Misión', icon: Heart, path: '/mision', disabled: true },
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
  const [openSections, setOpenSections] = useState<string[]>(['modules'])
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
    <aside className="flex flex-col w-64 bg-neutral-50 border-r border-neutral-200 h-full">
      <div className="p-6 border-b border-neutral-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">IA</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              Iglesia Adventista
            </h2>
            <p className="text-xs text-neutral-500">Osorno Central</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <Accordion type="single" value={openSections[0]} onValueChange={(v) => setOpenSections(v ? [v] : [])}>
          <AccordionItem value="modules">
            <AccordionTrigger>Modulos</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
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
        </Accordion>
      </nav>

      <div className="p-4 border-t border-neutral-200 bg-white">
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
      </div>
    </aside>
  )
}