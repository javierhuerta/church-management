import { useEffect, useRef, useState, useCallback } from 'react'

// Pixels the user must drag to trigger a refresh
const PULL_THRESHOLD = 150
// Resistance factor: drag feels heavier (lower = more resistance)
const RESISTANCE = 0.4
// Dead zone: ignore the first N pixels of drag to avoid accidental triggers
const DEAD_ZONE = 20

export function usePullToRefresh() {
  const [isPulling, setIsPulling] = useState(false)
  const [pullProgress, setPullProgress] = useState(0)
  const touchStartRef = useRef<number | null>(null)
  const isAtTopRef = useRef(false)

  const isAtTop = useCallback(() => {
    return window.scrollY <= 0
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    isAtTopRef.current = isAtTop()
    if (isAtTopRef.current) {
      touchStartRef.current = e.touches[0].clientY
    }
  }, [isAtTop])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isAtTopRef.current || touchStartRef.current === null) return

    const currentY = e.touches[0].clientY
    const rawDelta = currentY - touchStartRef.current

    // Only activate after the dead zone to ignore micro-scrolls
    if (rawDelta > DEAD_ZONE) {
      e.preventDefault()
      // Apply resistance: drag feels progressively heavier
      const effectiveDelta = (rawDelta - DEAD_ZONE) * RESISTANCE
      const progress = Math.min(effectiveDelta / PULL_THRESHOLD, 1.5)
      setPullProgress(progress)
      setIsPulling(progress >= 1)
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (isPulling) {
      window.location.reload()
    }
    touchStartRef.current = null
    setIsPulling(false)
    setPullProgress(0)
  }, [isPulling])

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return { isPulling, pullProgress }
}

export function PullToRefreshIndicator({ progress }: { progress: number }) {
  if (progress === 0) return null

  const rotation = Math.min(progress * 360, 720)
  const scale = Math.min(progress, 1)
  const opacity = Math.min(progress, 1)

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        height: `${progress * 60}px`,
        opacity,
        background: 'linear-gradient(to bottom, rgba(var(--primary), 0.1), transparent)',
      }}
    >
      <div
        className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
        style={{
          transform: `rotate(${rotation}deg) scale(${scale})`,
          transition: progress >= 1 ? 'transform 0.2s ease-out' : 'none',
        }}
      />
    </div>
  )
}