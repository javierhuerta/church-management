import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, BookOpen, Pencil, Trash2, Search, Filter, X, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '@/components/theme-provider'
import { useBibleStudiesList, useDeleteBibleStudy } from '../hooks/use-bible-studies'
import { useBibleCoursesList } from '../hooks/use-bible-courses'
import { useMissionaryTeamsList } from '../hooks/use-missionary-teams'
import { BibleStudyStatusBadge, BIBLE_STUDY_STATUSES } from '../components/bible-study-status-badge'
import { hasMissionFullAccess, getUserId } from '../lib/permissions'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { normalizeSearch } from '@/lib/utils'
import type { BibleStudyResponseDto } from '@/lib/api/models/BibleStudyResponseDto'
import type { BibleStudyTotalsDto } from '@/lib/api/models/BibleStudyTotalsDto'

const NAVY = '#1B3A6B'

type BibleStudyStatus = BibleStudyResponseDto['status']

function fullName(p?: { firstName: string; lastName?: string | null } | null): string {
  if (!p) return '—'
  return [p.firstName, p.lastName].filter(Boolean).join(' ')
}

function LessonProgressBadge({ progress }: { progress: BibleStudyResponseDto['lessonProgress'] }) {
  const map: Record<string, { label: string; cls: string }> = {
    NoIniciado: { label: 'No iniciado', cls: 'bg-muted text-muted-foreground' },
    EnCurso:    { label: 'En curso',    cls: 'bg-primary/10 text-primary' },
    Completo:   { label: 'Completo',    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  }
  const cfg = map[progress] ?? { label: progress, cls: 'bg-muted text-muted-foreground' }
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

function TotalsBar({ totals }: { totals: BibleStudyTotalsDto }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const items: { key: keyof BibleStudyTotalsDto; label: string; light: string; dark: string; textColor?: string }[] = [
    { key: 'Invitar',    label: 'Invitar',    light: '#1B3A6B', dark: '#6B9FDB' },
    { key: 'Estudiando', label: 'Estudiando', light: '#0F766E', dark: '#0D9488' },
    { key: 'Graduado',   label: 'Graduado',   light: '#C9A84C', dark: '#D4B566', textColor: '#102240' },
    { key: 'Bautismo',   label: 'Bautismo',   light: '#B45309', dark: '#D97706' },
    { key: 'Bautizado',  label: 'Bautizado',  light: '#475569', dark: '#64748B' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3" data-testid="bible-study-totals">
      {items.map(({ key, label, light, dark, textColor }) => {
        const bg = isDark ? dark : light
        const color = textColor ?? '#fff'
        return (
          <div
            key={key}
            className="rounded-xl p-4 flex flex-col gap-1"
            style={{ background: bg + '18' }}
          >
            <p className="text-2xl font-bold" style={{ color: bg }}>
              {totals[key]}
            </p>
            <p className="text-xs font-semibold" style={{ color: isDark ? color === '#fff' ? '#ccc' : color : bg }}>
              {label}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export function BibleStudiesListPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const navigate = useNavigate()
  const fullAccess = hasMissionFullAccess()
  const currentUserId = getUserId()

  // Filters
  const [statusFilter, setStatusFilter] = useState<BibleStudyStatus | ''>('')
  const [courseFilter, setCourseFilter] = useState('')
  const [teamFilter, setTeamFilter] = useState('')
  const [search, setSearch] = useState('')
  const [toDelete, setToDelete] = useState<BibleStudyResponseDto | null>(null)

  const query = useBibleStudiesList(
    statusFilter || teamFilter
      ? { status: statusFilter || undefined, instructorTeamId: teamFilter || undefined }
      : undefined,
  )
  const coursesQuery = useBibleCoursesList()
  const teamsQuery = useMissionaryTeamsList()
  const deleteMutation = useDeleteBibleStudy()

  const allStudies = query.data?.data ?? []
  const totals = query.data?.totals

  // For instructor-user: filter to only their studies
  // For full access: show all
  const visibleStudies = useMemo(() => {
    let list = allStudies

    // Instructor-user: backend already filters by role, no client-side filter needed

    // Course filter (client-side since API doesn't support it in the same call)
    if (courseFilter) {
      list = list.filter((s) => s.courseId === courseFilter)
    }

    // Search filter
    if (search.trim()) {
      const q = normalizeSearch(search)
      list = list.filter((s) => {
        const studentName = normalizeSearch(fullName(s.student))
        const instructorName = normalizeSearch(fullName(s.instructor))
        const teamName = normalizeSearch(s.instructorTeam?.label ?? s.instructorTeam?.audience ?? '')
        const courseName = normalizeSearch(s.course?.name ?? '')
        return studentName.includes(q) || instructorName.includes(q) || teamName.includes(q) || courseName.includes(q)
      })
    }

    return list
  }, [allStudies, fullAccess, currentUserId, courseFilter, teamFilter, search])

  const courses = coursesQuery.data ?? []
  const activeTeams = (teamsQuery.data?.data ?? []).filter((t) => t.isActive)

  function handleDeleteConfirm() {
    if (!toDelete) return
    deleteMutation.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success('Estudio eliminado correctamente')
        setToDelete(null)
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'No se pudo eliminar el estudio'
        toast.error(msg)
        setToDelete(null)
      },
    })
  }

  const hasFilters = !!statusFilter || !!courseFilter || !!teamFilter || !!search

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-2xl font-bold text-foreground">Interesados y estudios</p>
          {!query.isLoading && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {visibleStudies.length} estudio{visibleStudies.length !== 1 ? 's' : ''}
              {hasFilters ? ' (filtrado)' : ''}
            </p>
          )}
        </div>
        {fullAccess && (
          <button
            onClick={() => navigate('/misionero/estudios/nuevo')}
            data-testid="bible-study-new-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: isDark ? 'hsl(219,70%,60%)' : NAVY,
              color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus className="h-4 w-4" />
            Nuevo estudio
          </button>
        )}
      </div>

      {/* Totals */}
      {totals && !query.isLoading && (
        <TotalsBar totals={totals} />
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por estudiante, instructor o curso..."
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BibleStudyStatus | '')}
            data-testid="filter-status"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Todos los estados</option>
            {BIBLE_STUDY_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Course filter */}
        {courses.length > 0 && (
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Todos los cursos</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}

        {/* Team instructor filter (Task 8.3) */}
        {activeTeams.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              data-testid="filter-instructor-team"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Todos los equipos</option>
              {activeTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label ? `${t.label} — ` : ''}{t.audience}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={() => { setStatusFilter(''); setCourseFilter(''); setTeamFilter(''); setSearch('') }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {/* Loading */}
      {query.isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 bg-muted rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
                <div className="h-6 w-20 bg-muted rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!query.isLoading && visibleStudies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div
            className="flex items-center justify-center rounded-full p-5"
            style={{ background: isDark ? 'hsl(219,70%,60%,0.1)' : '#1B3A6B0D' }}
          >
            <BookOpen
              className="h-10 w-10"
              style={{ color: isDark ? 'hsl(219,70%,60%)' : NAVY, opacity: 0.5 }}
            />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-foreground">No hay estudios bíblicos</p>
            <p className="text-sm text-muted-foreground">
              {hasFilters ? 'Prueba con otros filtros.' : 'Crea el primer estudio para comenzar.'}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!query.isLoading && visibleStudies.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden" data-testid="bible-study-list">
          {/* Desktop header */}
          <div className="hidden md:grid md:grid-cols-[1fr_1fr_1fr_9rem_7rem_5rem] gap-4 px-5 py-3 border-b border-border bg-muted/40">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estudiante</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Instructor</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Curso</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Estado</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Progreso</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Acciones</p>
          </div>

          {visibleStudies.map((study, index) => (
            <StudyRow
              key={study.id}
              study={study}
              index={index}
              fullAccess={fullAccess}
              onDelete={() => setToDelete(study)}
            />
          ))}
        </div>
      )}

      {/* Legend for team instructor badge */}
      {!query.isLoading && visibleStudies.some((s) => s.instructorTeamId) && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>Equipo misionero como instructor</span>
        </div>
      )}

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => { if (!o) setToDelete(null) }}
        title="¿Eliminar estudio bíblico?"
        description={`Se eliminará el estudio de "${fullName(toDelete?.student)}". Esta acción no se puede deshacer.`}
        confirmLabel={deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

function StudyRow({
  study,
  index,
  fullAccess,
  onDelete,
}: {
  study: BibleStudyResponseDto
  index: number
  fullAccess: boolean
  onDelete: () => void
}) {
  return (
    <div
      className="flex flex-col md:grid md:grid-cols-[1fr_1fr_1fr_9rem_7rem_5rem] gap-2 md:gap-4 px-5 py-4 items-start md:items-center border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors"
      data-testid={`bible-study-row-${index}`}
    >
      {/* Student */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center justify-center rounded-lg h-7 w-7 shrink-0"
          style={{ background: '#1B3A6B12' }}
        >
          <BookOpen className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {fullName(study.student)}
          </p>
          {study.interestedInBaptism && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Interesado en bautismo</p>
          )}
        </div>
      </div>

      {/* Instructor (persona o equipo) */}
      <div className="flex items-center gap-2 md:gap-0">
        <span className="md:hidden text-xs text-muted-foreground shrink-0">Instructor:</span>
        {study.instructorTeam ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <Users className="h-3.5 w-3.5 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-foreground font-medium truncate">
                {study.instructorTeam.label ?? study.instructorTeam.audience}
              </p>
              {study.instructorTeam.label && (
                <p className="text-[10px] text-muted-foreground truncate">{study.instructorTeam.audience}</p>
              )}
            </div>
          </div>
        ) : study.instructor ? (
          <p className="text-sm text-muted-foreground truncate">{fullName(study.instructor)}</p>
        ) : (
          <span className="text-sm italic text-muted-foreground/60">Sin asignar</span>
        )}
      </div>

      {/* Course */}
      <div className="flex items-center gap-2 md:gap-0">
        <span className="md:hidden text-xs text-muted-foreground shrink-0">Curso:</span>
        <p className="text-sm text-muted-foreground truncate">
          {study.course?.name ?? <span className="italic text-muted-foreground/60">Sin curso</span>}
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 md:justify-center">
        <span className="md:hidden text-xs text-muted-foreground shrink-0">Estado:</span>
        <BibleStudyStatusBadge status={study.status} />
      </div>

      {/* Lesson progress */}
      <div className="flex items-center gap-2 md:justify-center">
        <span className="md:hidden text-xs text-muted-foreground shrink-0">Progreso:</span>
        <div className="flex flex-col items-start md:items-center gap-0.5">
          <LessonProgressBadge progress={study.lessonProgress} />
          {study.currentLesson != null && (
            <p className="text-[10px] text-muted-foreground">Lección {study.currentLesson}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 md:justify-end">
        <Link
          to={`/misionero/estudios/${study.id}`}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Editar"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Link>
        {fullAccess && (
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
