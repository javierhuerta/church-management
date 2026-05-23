import { useEffect, useRef, useState, useCallback } from 'react'

const PULL_THRESHOLD = 80

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
    const delta = currentY - touchStartRef.current

    if (delta > 0) {
      e.preventDefault()
      const progress = Math.min(delta / PULL_THRESHOLD, 1.5)
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