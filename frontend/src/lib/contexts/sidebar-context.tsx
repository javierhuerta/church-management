import { createContext, useContext, useState, useEffect } from 'react'

interface SidebarContextType {
  isOpen: boolean
  isSmallScreen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const handle = (e: MediaQueryListEvent) => {
      setIsSmallScreen(e.matches)
      setIsOpen(!e.matches)
    }
    setIsSmallScreen(mq.matches)
    setIsOpen(!mq.matches)
    mq.addEventListener('change', handle)
    return () => mq.removeEventListener('change', handle)
  }, [])

  return (
    <SidebarContext.Provider value={{
      isOpen,
      isSmallScreen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen(v => !v),
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used inside SidebarProvider')
  return ctx
}
