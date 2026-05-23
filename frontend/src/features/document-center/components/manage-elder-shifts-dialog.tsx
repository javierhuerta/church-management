import { useState, useMemo, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { useTheme } from '@/components/theme-provider'
import { UsersService } from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Trash2, X, Users, RotateCw, ChevronRight, Loader2 } from 'lucide-react'
import { PeriodsService } from '@/lib/api'

const NAVY = '#1B3A6B'
const GOLD = '#C9A84C'

interface User {
  id: string
  name: string
  role: string
}

interface ElderShift {
  id: string
  elder?: { id: string; name: string } | null
  weekStart: string
  weekEnd: string
}

interface Period {
  id: string
  year: number
  rotationMode: string
  shiftWeeks: number
  startDate?: string
  elderShifts?: ElderShift[]
}

interface ManageElderShiftsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  periodId: string
}

const ELDER_ROLES = ['Admin', 'Anciano', 'CoordinadorMisionero']

function groupShiftsByDate(shifts: ElderShift[]) {
  const map = new Map<string, ElderShift[]>()
  for (const s of shifts) {
    const key = String(s.weekStart).split('T')[0]
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(s)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => ({ key, weekStart: items[0].weekStart, weekEnd: items[0].weekEnd, shifts: items }))
}

function fmtDate(d: string | Date) {
  const dateStr = typeof d === 'string' ? d.split('T')[0] : d.toISOString().split('T')[0]
  const [, month, day] = dateStr.split('-')
  const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${parseInt(day)} ${monthNames[parseInt(month) - 1]}`
}

export function ManageElderShiftsDialog({ open, onOpenChange, periodId }: ManageElderShiftsDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [weekStart, setWeekStart] = useState<string>('')
  const [weekEnd, setWeekEnd] = useState<string>('')
  const [regenStartDate, setRegenStartDate] = useState<string>('')

  const queryClient = useQueryClient()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  // Fetch the period data directly inside the dialog — always fresh
  const { data: period, isLoading } = useQuery({
    queryKey: ['period', periodId],
    queryFn: () => PeriodsService.periodControllerFindOne(periodId) as Promise<Period>,
    enabled: open && !!periodId,
  })

  // Seed regen start date from the period
  useEffect(() => {
    if (period?.startDate) {
      setRegenStartDate(String(period.startDate).split('T')[0])
    } else if (period?.year) {
      setRegenStartDate(`${period.year}-01-01`)
    }
  }, [period?.startDate, period?.year])

  const { data: allUsers } = useQuery({
    queryKey: ['users', 'elder-candidates'],
    queryFn: async () => {
      const users = await UsersService.usersControllerFindAll()
      return (users as User[]).filter((u) => ELDER_ROLES.includes(u.role))
    },
    enabled: open,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['period', periodId] })
    queryClient.invalidateQueries({ queryKey: ['period'] })
    queryClient.invalidateQueries({ queryKey: ['periods'] })
  }

  const addShiftMutation = useMutation({
    mutationFn: async (data: { periodId: string; elderIds: string[]; weekStart: string; weekEnd: string }) => {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/periods/elder-shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.message ?? 'Error') }
      return res.json()
    },
    onSuccess: () => { invalidate(); toast.success('Turno agregado'); setSelectedIds([]); setWeekStart(''); setWeekEnd('') },
    onError: (e: any) => toast.error(e.message ?? 'Error al agregar turno'),
  })

  const removeShiftMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/periods/elder-shifts/${shiftId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Error')
    },
    onSuccess: () => { invalidate(); toast.success('Turno eliminado') },
    onError: () => toast.error('Error al eliminar turno'),
  })

  const removeGroupMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const token = localStorage.getItem('token')
      await Promise.all(ids.map((id) => fetch(`/api/periods/elder-shifts/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      })))
    },
    onSuccess: () => { invalidate(); toast.success('Grupo eliminado') },
    onError: () => toast.error('Error al eliminar grupo'),
  })

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/periods/${periodId}/regenerate-rotation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          shiftWeeks: period?.shiftWeeks ?? 2,
          startDate: regenStartDate || undefined,
        }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.message ?? 'Error') }
      return res.json()
    },
    onSuccess: () => { invalidate(); toast.success('Rotación regenerada') },
    onError: (e: any) => toast.error(e.message ?? 'Error al regenerar'),
  })

  const isAutomatic = period?.rotationMode === 'AUTOMATIC'
  const groupedSlots = useMemo(() => groupShiftsByDate(period?.elderShifts ?? []), [period])
  const assignedIds = useMemo(() => new Set(period?.elderShifts?.map((s) => s.elder?.id).filter(Boolean)), [period])
  const available = (allUsers ?? []).filter((u) => !assignedIds.has(u.id))

  const today = new Date(); today.setHours(0, 0, 0, 0)

  const toggleMember = (id: string) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: '"Playfair Display", Georgia, serif', color: isDark ? '#A8C4F0' : NAVY }}>
            {isAutomatic ? 'Rotación automática' : 'Turnos manuales'}
          </DialogTitle>
          <DialogDescription>
            {isLoading ? 'Cargando...' : `Año ${period?.year} · ${isAutomatic ? `${period?.shiftWeeks} sem por turno` : 'Asignación manual'}`}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5 py-4">

            {/* MODO AUTOMÁTICO */}
            {isAutomatic && (
              <>
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                  <p className="text-sm text-foreground font-medium">Rotación generada automáticamente</p>
                  <p className="text-xs text-muted-foreground">
                    Turnos de {period?.shiftWeeks} semana{period?.shiftWeeks !== 1 ? 's' : ''} generados para todo el año.
                    Puedes cambiar la fecha de inicio y regenerar.
                  </p>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Fecha de inicio</Label>
                    <DatePicker
                      value={regenStartDate}
                      onChange={setRegenStartDate}
                      placeholder="Fecha de inicio"
                    />
                  </div>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => regenerateMutation.mutate()}
                    disabled={regenerateMutation.isPending}
                    className="gap-2"
                  >
                    <RotateCw className={`h-3.5 w-3.5 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
                    {regenerateMutation.isPending ? 'Regenerando...' : 'Regenerar rotación'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Rotación anual ({groupedSlots.length} turnos)</Label>
                  {groupedSlots.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center">
                      <p className="text-sm text-muted-foreground">Sin rotación generada.</p>
                      <p className="text-xs text-muted-foreground mt-1">Haz clic en "Regenerar rotación".</p>
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-72 overflow-y-auto rounded-lg border border-border p-2 bg-muted/20">
                      {groupedSlots.map((slot) => {
                        const weekStartLocal = slot.weekStart.split('T')[0]
                        const weekEndLocal = slot.weekEnd.split('T')[0]
                        const s = new Date(weekStartLocal + 'T00:00:00')
                        const e = new Date(weekEndLocal + 'T23:59:59')
                        const isCurrent = today >= s && today <= e
                        const isPast = e < today
                        return (
                          <div key={slot.key} className={['flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs',
                            isCurrent ? 'bg-primary/10' : isPast ? 'opacity-40' : 'hover:bg-muted/50',
                          ].join(' ')}>
                            <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground w-28 flex-shrink-0">
                              {fmtDate(slot.weekStart)} — {fmtDate(slot.weekEnd)}
                            </span>
                            <span className={`flex-1 truncate ${isCurrent ? 'font-semibold text-foreground' : 'text-foreground'}`}>
                              {slot.shifts.map((s) => s.elder?.name ?? '—').join(' · ')}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                style={{ background: GOLD + '30', color: GOLD }}>Hoy</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* MODO MANUAL */}
            {!isAutomatic && (
              <>
                <div className="space-y-2">
                  <Label>Nuevo turno — seleccionar personas</Label>
                  <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto rounded-lg border border-border p-2 bg-muted/20">
                    {available.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic p-2 text-center">
                        Todos los usuarios ya tienen turno asignado
                      </p>
                    ) : available.map((u) => {
                      const sel = selectedIds.includes(u.id)
                      return (
                        <button key={u.id} type="button" onClick={() => toggleMember(u.id)}
                          className={['flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left transition-colors',
                            sel ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'].join(' ')}>
                          <div className={['h-4 w-4 rounded border flex items-center justify-center flex-shrink-0',
                            sel ? 'border-primary bg-primary' : 'border-muted-foreground'].join(' ')}>
                            {sel && <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 text-white fill-current">
                              <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>}
                          </div>
                          <span className="flex-1 truncate">{u.name}</span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">{u.role}</span>
                        </button>
                      )
                    })}
                  </div>

                  {selectedIds.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedIds.map((id) => {
                        const u = allUsers?.find((x) => x.id === id)
                        return (
                          <span key={id} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                            style={{ background: isDark ? 'hsl(219,30%,22%)' : 'hsl(219,15%,92%)', color: isDark ? '#A8C4F0' : NAVY }}>
                            {u?.name ?? id}
                            <button onClick={() => toggleMember(id)} className="ml-0.5 opacity-60 hover:opacity-100">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Desde</p>
                    <DatePicker value={weekStart} onChange={setWeekStart} placeholder="Inicio" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Hasta</p>
                    <DatePicker value={weekEnd} onChange={setWeekEnd} placeholder="Fin" />
                  </div>
                </div>

                <Button
                  onClick={() => {
                    if (!period || selectedIds.length === 0 || !weekStart || !weekEnd) return
                    addShiftMutation.mutate({ periodId: period.id, elderIds: selectedIds, weekStart, weekEnd })
                  }}
                  disabled={selectedIds.length === 0 || !weekStart || !weekEnd || addShiftMutation.isPending}
                  className="gap-2 w-full sm:w-auto"
                  style={{ background: isDark ? 'hsl(219,70%,60%)' : NAVY, color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA' }}
                >
                  <Plus className="h-4 w-4" />
                  {addShiftMutation.isPending ? 'Agregando...' : 'Agregar Turno'}
                </Button>

                <div className="space-y-2">
                  <Label>Turnos asignados ({groupedSlots.length})</Label>
                  {groupedSlots.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center">
                      <p className="text-sm text-muted-foreground">Sin turnos asignados.</p>
                      <p className="text-xs text-muted-foreground mt-1">Selecciona personas y fechas arriba.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {groupedSlots.map((slot) => (
                        <div key={slot.key} className="rounded-lg border border-border bg-card p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs text-muted-foreground">
                                {fmtDate(slot.weekStart)} — {fmtDate(slot.weekEnd)}
                              </span>
                            </div>
                            <Button variant="ghost" size="sm"
                              onClick={() => removeGroupMutation.mutate(slot.shifts.map((s) => s.id))}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive flex-shrink-0">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {slot.shifts.map((s) => (
                              <span key={s.id} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                                style={{ background: isDark ? 'hsl(222,30%,16%)' : 'hsl(36,20%,93%)', color: isDark ? '#E2E8F0' : '#1a1a1a' }}>
                                {s.elder?.name ?? 'Desconocido'}
                                <button onClick={() => removeShiftMutation.mutate(s.id)} className="ml-0.5 opacity-50 hover:opacity-100">
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
