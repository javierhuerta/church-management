import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Loader2 } from 'lucide-react'
import type { EventResponseDto } from '@/lib/api'
import { EventCard } from './event-card'

interface CalendarListProps {
  events: EventResponseDto[]
  onLoadMore?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
}

function formatDayHeader(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function monthKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}`
}

function formatMonthHeader(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
}

export function CalendarList({
  events,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: CalendarListProps) {
  const topSentinelRef = useRef<HTMLDivElement>(null)
  const bottomSentinelRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // IntersectionObserver — load more when bottom sentinel enters viewport
  useEffect(() => {
    if (!onLoadMore) return
    const sentinel = bottomSentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [onLoadMore, hasMore, isLoadingMore])

  // IntersectionObserver — show FAB when top sentinel leaves viewport
  // Works with any scroll container (not tied to window.scrollY)
  useEffect(() => {
    const sentinel = topSentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        // FAB visible when the top of the list is out of view
        setShowScrollTop(!entries[0].isIntersecting)
      },
      { threshold: 0 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  function scrollToTop() {
    // Scroll the actual container (layout uses overflow-y-auto div, not window)
    const container = topSentinelRef.current?.closest<HTMLElement>('.overflow-y-auto')
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  )

  // Group by day, tracking month boundaries for separators
  const groups: { label: string; events: EventResponseDto[]; monthLabel?: string }[] = []
  let lastMonthKey = ''

  for (const event of sorted) {
    const mk = monthKey(event.startDate)

    const existing = groups.find((g) => g.label === formatDayHeader(event.startDate))
    if (existing) {
      existing.events.push(event)
    } else {
      const isNewMonth = mk !== lastMonthKey
      groups.push({
        label: formatDayHeader(event.startDate),
        events: [event],
        monthLabel: isNewMonth ? formatMonthHeader(event.startDate) : undefined,
      })
      if (isNewMonth) lastMonthKey = mk
    }
  }

  return (
    <div className="space-y-4" data-testid="calendar-list-mobile">
      {/* Top sentinel — used by FAB IntersectionObserver */}
      <div ref={topSentinelRef} className="h-0" aria-hidden />

      {groups.map((group) => (
        <div key={group.label}>
          {group.monthLabel && (
            <div className="flex items-center gap-3 mb-3 mt-6 first:mt-0">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-2 capitalize">
                {group.monthLabel}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground capitalize sticky top-0 bg-muted/40 py-1">
              {group.label}
            </h3>
            <div className="space-y-2">
              {group.events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Bottom sentinel — triggers load more via IntersectionObserver */}
      <div ref={bottomSentinelRef} data-testid="load-more-sentinel" className="h-1" />

      {/* Loading indicator */}
      {isLoadingMore && (
        <div
          data-testid="loading-more-indicator"
          className="flex justify-center py-6 text-muted-foreground"
        >
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {/* FAB — scroll to top, mobile only */}
      {showScrollTop && (
        <button
          data-testid="scroll-to-top-btn"
          onClick={scrollToTop}
          className="md:hidden fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
          aria-label="Volver al inicio"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
