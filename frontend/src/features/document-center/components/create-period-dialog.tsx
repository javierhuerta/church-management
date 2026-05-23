import { useState, useMemo, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { useCreatePeriod, useUpdatePeriod } from '../hooks/use-document-center'
import { UsersService, PeriodsService } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from '@/components/theme-provider'
import { Plus, Trash2, RotateCw, Users, ChevronRight, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { parseDateString } from '@/lib/date'

const NAVY = '#1B3A6B'

interface User {
  id: string
  name: string
  role: string
}

interface RotationGroup {
  id: string
  memberIds: string[]
}

interface CreatePeriodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** If provided, opens in edit mode for this year */
  editYear?: number | null
  /** Year currently navigated in the page — used to preselect when creating */
  selectedYear?: number
  onSuccess?: () => void
}

const ELDER_ROLES = ['Admin', 'Anciano', 'CoordinadorMisionero']
const MONTH_ABBR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function CreatePeriodDialog({ open, onOpenChange, editYear, selectedYear, onSuccess }: CreatePeriodDialogProps) {
  const initialYear = selectedYear ?? new Date().getFullYear()
  const [year, setYear] = useState(initialYear)
  const [pastorId, setPastorId] = useState<string>('')
  const [rotationMode, setRotationMode] = useState<'AUTOMATIC' | 'MANUAL'>('AUTOMATIC')
  const [shiftWeeks, setShiftWeeks] = useState(2)
  const [notes, setNotes] = useState('')
  const [startDate, setStartDate] = useState<string>(`${initialYear}-01-01`)
  const [rotationGroups, setRotationGroups] = useState<RotationGroup[]>([])
  const [hydrated, setHydrated] = useState(false)

  const createPeriod = useCreatePeriod()
  const updatePeriod = useUpdatePeriod()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const isEditing = !!editYear

  // Load existing period when editing
  const { data: existingPeriod, isLoading: loadingPeriod } = useQuery({
    queryKey: ['period', 'byYear', editYear],
    queryFn: () => PeriodsService.periodControllerFindByYear(editYear!) as Promise<any>,
    enabled: open && !!editYear,
  })

  // Reset state when opening / closing
  useEffect(() => {
    if (!open) {
      setHydrated(false)
      return
    }
    if (!isEditing) {
      const y = selectedYear ?? new Date().getFullYear()
      setYear(y)
      setPastorId('')
      setRotationMode('AUTOMATIC')
      setShiftWeeks(2)
      setNotes('')
      setStartDate(`${y}-01-01`)
      setRotationGroups([])
      setHydrated(true)
    }
  }, [open, isEditing, selectedYear])

  // Keep startDate aligned with the year when creating (and year changes)
  useEffect(() => {
    if (!isEditing) setStartDate(`${year}-01-01`)
  }, [year, isEditing])

  // Hydrate form state from existing period
  useEffect(() => {
    if (!isEditing || !existingPeriod || hydrated) return
    setYear(existingPeriod.year)
    setPastorId(existingPeriod.pastor?.id ?? existingPeriod.pastorId ?? '')
    setRotationMode(existingPeriod.rotationMode ?? 'AUTOMATIC')
    setShiftWeeks(existingPeriod.shiftWeeks ?? 2)
    setNotes(existingPeriod.notes ?? '')
    setStartDate(
      existingPeriod.startDate
        ? String(existingPeriod.startDate).split('T')[0]
        : `${existingPeriod.year}-01-01`,
    )

    const groups: string[][] = existingPeriod.rotationGroups ?? []
    setRotationGroups(groups.map((memberIds) => ({ id: crypto.randomUUID(), memberIds })))
    setHydrated(true)
  }, [existingPeriod, isEditing, hydrated])

  const { data: pastors } = useQuery({
    queryKey: ['users', 'pastors'],
    queryFn: async () => {
      const all = await UsersService.usersControllerFindAll()
      return (all as User[]).filter((u) => u.role === 'Pastor')
    },
    enabled: open,
  })

  const { data: elderCandidates } = useQuery({
    queryKey: ['users', 'elder-candidates'],
    queryFn: async () => {
      const all = await UsersService.usersControllerFindAll()
      return (all as User[]).filter((u) => ELDER_ROLES.includes(u.role))
    },
    enabled: open,
  })

  const usedMemberIds = useMemo(
    () => new Set(rotationGroups.flatMap((g) => g.memberIds)),
    [rotationGroups],
  )

  const availableForGroup = (groupId: string) =>
    (elderCandidates ?? []).filter(
      (u) => !usedMemberIds.has(u.id) || rotationGroups.find((g) => g.id === groupId)?.memberIds.includes(u.id),
    )

  const addGroup = () => setRotationGroups((prev) => [...prev, { id: crypto.randomUUID(), memberIds: [] }])
  const removeGroup = (gid: string) => setRotationGroups((prev) => prev.filter((g) => g.id !== gid))
  const addMember = (gid: string, uid: string) =>
    setRotationGroups((prev) => prev.map((g) =>
      g.id === gid && !g.memberIds.includes(uid) ? { ...g, memberIds: [...g.memberIds, uid] } : g,
    ))
  const removeMember = (gid: string, uid: string) =>
    setRotationGroups((prev) => prev.map((g) =>
      g.id === gid ? { ...g, memberIds: g.memberIds.filter((id) => id !== uid) } : g,
    ))

  const rotationPreview = useMemo(() => {
    if (rotationMode !== 'AUTOMATIC') return []
    const groups = rotationGroups.filter((g) => g.memberIds.length > 0)
    if (groups.length === 0) return []

    const preview: { label: string; dates: string }[] = []
    const shiftDays = shiftWeeks * 7
    let current = parseDateString(startDate) ?? new Date(year, 0, 1)
    const end = new Date(year, 11, 31)
    let gi = 0

    while (current <= end && preview.length < 20) {
      const shiftEnd = new Date(current)
      shiftEnd.setDate(shiftEnd.getDate() + shiftDays - 1)
      const actualEnd = shiftEnd > end ? end : shiftEnd

      const group = groups[gi % groups.length]
      const names = group.memberIds
        .map((id) => elderCandidates?.find((u) => u.id === id)?.name ?? '')
        .filter(Boolean).join(' + ')

      preview.push({
        label: names,
        dates: `${current.getDate()} ${MONTH_ABBR[current.getMonth()]} – ${actualEnd.getDate()} ${MONTH_ABBR[actualEnd.getMonth()]}`,
      })

      current = new Date(shiftEnd)
      current.setDate(current.getDate() + 1)
      gi++
    }
    return preview
  }, [rotationGroups, shiftWeeks, year, startDate, elderCandidates, rotationMode])

  const handleSubmit = async () => {
    const groups = rotationGroups.filter((g) => g.memberIds.length > 0)
    const rotationGroupsPayload = rotationMode === 'AUTOMATIC' ? groups.map((g) => g.memberIds) : []

    try {
      if (isEditing && existingPeriod) {
        await updatePeriod.mutateAsync({
          id: existingPeriod.id,
          data: {
            pastorId: pastorId || null,
            rotationMode,
            shiftWeeks,
            notes: notes || undefined,
            rotationGroups: rotationGroupsPayload,
            startDate: startDate || undefined,
          },
        })
        toast.success('Período actualizado')
      } else {
        await createPeriod.mutateAsync({
          year,
          pastorId: pastorId || null,
          rotationMode: rotationMode as any,
          shiftWeeks,
          notes: notes || undefined,
          rotationGroups: rotationGroupsPayload.length > 0 ? rotationGroupsPayload : undefined,
          startDate: startDate || undefined,
        } as any)
        toast.success('Período creado exitosamente')
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (e: any) {
      console.error(e)
      toast.error(isEditing ? 'Error al actualizar período' : 'Error al crear período')
    }
  }

  const isPending = createPeriod.isPending || updatePeriod.isPending
  const showLoadingState = isEditing && loadingPeriod && !hydrated

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: '"Playfair Display", Georgia, serif', color: isDark ? '#A8C4F0' : NAVY }}>
            {isEditing ? 'Actualizar Período' : 'Crear Período Anual'}
          </DialogTitle>
          <DialogDescription>
            Configura el pastor y la rotación de ancianos para el año {year}.
          </DialogDescription>
        </DialogHeader>

        {showLoadingState ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5 py-4">
            {/* Año y Pastor */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Año</Label>
                {isEditing ? (
                  <div className="flex h-10 items-center rounded-md border border-border bg-muted px-3 text-sm font-medium text-muted-foreground">
                    {year}<span className="ml-2 text-xs font-normal opacity-60">(no editable)</span>
                  </div>
                ) : (
                  <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const cy = new Date().getFullYear()
                        const yearsList = [cy - 2, cy - 1, cy, cy + 1]
                        // ensure the navigated year is always present
                        if (!yearsList.includes(year)) yearsList.push(year)
                        return yearsList.sort((a, b) => a - b).map((y) => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))
                      })()}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label>Pastor</Label>
                <Select value={pastorId || '__none__'} onValueChange={(v) => setPastorId(v === '__none__' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin asignar</SelectItem>
                    {pastors?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Modo de rotación */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Modo de rotación</Label>
                <Select value={rotationMode} onValueChange={(v) => setRotationMode(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUTOMATIC">
                      <div className="flex items-center gap-2"><RotateCw className="h-4 w-4" />Automática</div>
                    </SelectItem>
                    <SelectItem value="MANUAL">
                      <div className="flex items-center gap-2"><ChevronRight className="h-4 w-4" />Manual</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {rotationMode === 'AUTOMATIC' && (
                <div className="space-y-2">
                  <Label>Duración turno</Label>
                  <Select value={String(shiftWeeks)} onValueChange={(v) => setShiftWeeks(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 semana</SelectItem>
                      <SelectItem value="2">2 semanas</SelectItem>
                      <SelectItem value="4">4 semanas</SelectItem>
                      <SelectItem value="8">8 semanas</SelectItem>
                      <SelectItem value="12">Trimestral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Fecha de inicio de la rotación */}
            {rotationMode === 'AUTOMATIC' && (
              <div className="space-y-2">
                <Label>Fecha de inicio de la rotación</Label>
                <DatePicker
                  value={startDate}
                  onChange={(v) => setStartDate(v)}
                  placeholder="Seleccionar fecha de inicio"
                />
                <p className="text-xs text-muted-foreground">
                  El primer turno arranca en esta fecha. Por defecto, el 1 de enero del año.
                </p>
              </div>
            )}

            {/* Grupos de rotación */}
            {rotationMode === 'AUTOMATIC' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Grupos de rotación</Label>
                  <Button variant="outline" size="sm" onClick={addGroup} className="gap-1 h-7 text-xs">
                    <Plus className="h-3 w-3" />Agregar grupo
                  </Button>
                </div>

                {rotationGroups.length === 0 && (
                  <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border p-3 text-center">
                    Sin grupos — se rotará entre todos los usuarios elegibles individualmente
                  </p>
                )}

                <div className="space-y-2">
                  {rotationGroups.map((group, idx) => {
                    const addable = availableForGroup(group.id).filter((u) => !group.memberIds.includes(u.id))
                    return (
                      <div key={group.id} className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Grupo {idx + 1}
                          </span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive"
                            onClick={() => removeGroup(group.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {group.memberIds.map((mid) => {
                            const u = elderCandidates?.find((x) => x.id === mid)
                            return (
                              <span key={mid} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                                style={{ background: isDark ? 'hsl(219,30%,22%)' : 'hsl(219,15%,92%)', color: isDark ? '#A8C4F0' : NAVY }}>
                                {u?.name ?? mid}
                                <button onClick={() => removeMember(group.id, mid)} className="ml-0.5 opacity-60 hover:opacity-100">
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            )
                          })}
                        </div>

                        {addable.length > 0 && (
                          <Select value="" onValueChange={(v) => addMember(group.id, v)}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Agregar persona..." />
                            </SelectTrigger>
                            <SelectContent>
                              {addable.map((u) => (
                                <SelectItem key={u.id} value={u.id}>
                                  {u.name}
                                  <span className="ml-2 text-xs text-muted-foreground">({u.role})</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    )
                  })}
                </div>

                {rotationPreview.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Vista previa</Label>
                    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1 max-h-40 overflow-y-auto">
                      {rotationPreview.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-foreground">{s.label}</span>
                          <span className="text-muted-foreground ml-auto">{s.dates}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {rotationMode === 'MANUAL' && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="text-sm text-primary">
                  Los turnos se asignarán manualmente después de guardar el período.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: Nuevo pastor inicia en marzo" />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || showLoadingState}
            style={{
              background: isDark ? 'hsl(219,70%,60%)' : NAVY,
              color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA',
            }}
          >
            {isPending ? 'Guardando...' : isEditing ? 'Actualizar Período' : 'Crear Período'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
