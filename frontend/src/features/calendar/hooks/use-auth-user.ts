import { useMemo } from 'react'

export interface AuthUser {
  userId: string
  name: string
  email: string
  role: string
}

interface DecodedToken {
  sub?: string
  userId?: string
  name?: string
  email?: string
  role?: string
}

export function useAuthUser(): AuthUser | null {
  return useMemo(() => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return null
      const payload = token.split('.')[1]
      const decoded = JSON.parse(atob(payload)) as DecodedToken
      return {
        userId: decoded.sub || decoded.userId || '',
        name: decoded.name || 'Usuario',
        email: decoded.email || '',
        role: decoded.role || '',
      }
    } catch {
      return null
    }
  }, [])
}
