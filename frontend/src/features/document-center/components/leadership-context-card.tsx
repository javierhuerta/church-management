import { useMemo } from 'react'
import { useTheme } from '@/components/theme-provider'
import { CalendarDays, Users, ChevronRight } from 'lucide-react'

const NAVY = '#1B3A6B'
const GOLD = '#C9A84C'

interface ElderShift {
  id: string
  elder?: { id: string; name: string } | null
  weekStart: string
  weekEnd: string
}

interface Period {
  id: string
  year: number
  pastor?: { id: string; name: string } | null
  rotationMode: 'AUTOMATIC' | 'MANUAL'
  shiftWeeks: number
  elderShifts?: ElderShift[]
  notes?: string | null
}

interface LeadershipContextCardProps {
  period: Period | null
}

function groupShiftsByDate(shifts: ElderShift[]) {
  const map = new Map<string, ElderShift[]>()
  for (const s of shifts) {
    const key = s.weekStart.slice(0, 10)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(s)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, items]) => items)
}

function fmtDate(d: string) {
  const dateStr = d.split('T')[0]
  const [, month, day] = dateStr.split('-')
  const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${parseInt(day)} ${monthNames[parseInt(month) - 1]}`
}

export function LeadershipContextCard({ period }: LeadershipContextCardProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const slots = useMemo(() => groupShiftsByDate(period?.elderShifts ?? []), [period])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const currentSlot = slots.find((s) => {
    const start = new Date(s[0].weekStart)
    const end = new Date(s[0].weekEnd)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    return today >= start && today <= end
  })

  const upcomingSlots = slots
    .filter((s) => new Date(s[0].weekStart) > today)
    .slice(0, 2)

  if (!period) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          No hay período configurado para este año.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 flex-shrink-0" style={{ color: isDark ? '#6B9FDB' : NAVY }} />
          <span className="text-sm font-semibold text-foreground">
            Año {period.year}
          </span>
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: period.rotationMode === 'AUTOMATIC'
              ? (isDark ? 'hsl(142,50%,25%)' : 'hsl(142,40%,92%)')
              : (isDark ? 'hsl(219,50%,25%)' : 'hsl(219,40%,92%)'),
            color: period.rotationMode === 'AUTOMATIC'
              ? (isDark ? 'hsl(142,60%,70%)' : 'hsl(142,50%,30%)')
              : (isDark ? '#A8C4F0' : NAVY),
          }}
        >
          {period.rotationMode === 'AUTOMATIC' ? `Auto · ${period.shiftWeeks}sem` : 'Manual'}
        </span>
      </div>

      {/* Pastor */}
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: isDark ? 'hsl(219,70%,60%)' : NAVY, color: '#fff' }}
        >
          Pastor
        </span>
        <span className="text-sm text-foreground">{period.pastor?.name ?? 'Por asignar'}</span>
      </div>

      {/* Turno actual */}
      {slots.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 flex-shrink-0" style={{ color: GOLD }} />
            <span className="text-xs font-semibold text-muted-foreground">
              {currentSlot ? 'De turno esta semana' : 'Próximos turnos'}
            </span>
          </div>

          {currentSlot && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: isDark ? 'hsl(36,30%,12%)' : 'hsl(36,60%,96%)', border: `1px solid ${isDark ? 'hsl(36,20%,22%)' : 'hsl(36,40%,85%)'}` }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">
                  {currentSlot.map((s) => s.elder?.name ?? '—').join(' · ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {fmtDate(currentSlot[0].weekStart)} — {fmtDate(currentSlot[0].weekEnd)}
                </p>
              </div>
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: GOLD + '30', color: GOLD }}
              >
                Hoy
              </span>
            </div>
          )}

          {upcomingSlots.length > 0 && (
            <>
              {currentSlot && (
                <p className="text-[11px] font-semibold text-muted-foreground pt-1">Próximos turnos</p>
              )}
              {upcomingSlots.map((slot, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40">
                  <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <p className="text-xs font-medium text-foreground flex-1 min-w-0 truncate">
                    {slot.map((s) => s.elder?.name ?? '—').join(' · ')}
                  </p>
                  <p className="text-xs text-muted-foreground flex-shrink-0">
                    {fmtDate(slot[0].weekStart)} — {fmtDate(slot[0].weekEnd)}
                  </p>
                </div>
              ))}
            </>
          )}

          {!currentSlot && upcomingSlots.length === 0 && (
            <p className="text-xs text-muted-foreground">Sin turnos próximos</p>
          )}
        </div>
      )}

      {slots.length === 0 && (
        <p className="text-xs text-muted-foreground">
          {period.rotationMode === 'AUTOMATIC'
            ? 'Sin turnos generados — ve a "Rotación" → "Regenerar rotación"'
            : 'Sin turnos asignados'}
        </p>
      )}

      {period.notes && (
        <p className="text-xs text-muted-foreground italic border-t border-border pt-2">{period.notes}</p>
      )}
    </div>
  )
}
