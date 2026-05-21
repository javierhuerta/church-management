import { useState, useEffect } from 'react'

export interface SessionExpiry {
  /** Segundos restantes, null si no hay sesión o token inválido */
  secondsLeft: number | null
  /** Texto formateado: "1h 23m", "45m", "2m 10s", "Expirado" */
  label: string
  /** true cuando quedan menos de 5 minutos */
  warning: boolean
  /** true cuando el token ya expiró */
  expired: boolean
}

function getExpiryFromToken(): number | null {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number }
    return payload.exp ?? null
  } catch {
    return null
  }
}

function formatSeconds(secs: number): string {
  if (secs <= 0) return 'Expirada'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function useSessionExpiry(): SessionExpiry {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(() => {
    const exp = getExpiryFromToken()
    if (exp === null) return null
    return Math.max(0, exp - Math.floor(Date.now() / 1000))
  })

  useEffect(() => {
    const exp = getExpiryFromToken()
    if (exp === null) return

    const tick = () => {
      const remaining = Math.max(0, exp - Math.floor(Date.now() / 1000))
      setSecondsLeft(remaining)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  if (secondsLeft === null) {
    return { secondsLeft: null, label: '—', warning: false, expired: false }
  }

  return {
    secondsLeft,
    label: formatSeconds(secondsLeft),
    warning: secondsLeft > 0 && secondsLeft <= 5 * 60,
    expired: secondsLeft === 0,
  }
}
