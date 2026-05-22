import { useState, useEffect, useRef } from 'react'
import { Sun, Moon, Monitor, Bell, Calendar, Users, Church, BookOpen, ChevronRight, Search, Plus, Check, AlertTriangle, MapPin, Video, Archive, Clock } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { useTextSize, type TextSize } from '@/lib/contexts/text-size-context'
import { Input } from '@/components/ui/input'
import logoFullPng from '@/assets/images/logo.png'
import logoMarkPng from '@/assets/images/logo-mark.png'
import defaultCover from '@/assets/images/default-cover.jpg'

/* ─── Brand constants ─── */
const NAVY = '#1B3A6B'
const GOLD = '#C9A84C'

/* ─── Unsplash images ─── */
const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=1200&q=80',
  'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&q=80',
  'https://images.unsplash.com/photo-1507692812060-98338d07aca3?w=1200&q=80',
  'https://images.unsplash.com/photo-1548625149-720fb8a193f3?w=1200&q=80',
]

/* ─── Status colors — fuente de verdad para toda la app ─── */
const STATUS_COLORS = {
  published: { light: '#0F766E', dark: '#0D9488' },  // teal
  draft:     { light: '#C9A84C', dark: '#D4B566' },  // dorado de marca
  pending:   { light: '#B45309', dark: '#D97706' },  // amber
  archived:  { light: '#475569', dark: '#64748B' },  // slate frío
  cancelled: { light: '#DC2626', dark: '#EF4444' },  // rojo destructive
  info:      { light: '#1B3A6B', dark: '#6B9FDB' },  // navy/primary
}

/* ─── Event type styles — coincide con labels.ts ─── */
const EVENT_TYPE_STYLE = {
  local:     { backgroundColor: '#1B3A6B22', color: '#1B3A6B', dotColor: '#1B3A6B', label: 'Local' },
  asach:     { backgroundColor: '#7C3AED22', color: '#5B21B6', dotColor: '#7C3AED', label: 'ASACH' },
  distrital: { backgroundColor: '#0F766E22', color: '#0F766E', dotColor: '#0F766E', label: 'Distrital' },
}

/* ─── Department palette hues — coincide con getDepartmentStyle ─── */
const DEPT_HUE_PALETTE = [200, 160, 280, 30, 340, 60, 240, 100, 15, 190, 310, 140]
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return hash
}
function getDeptStyle(name: string, color?: string) {
  if (color) return { dotColor: color, backgroundColor: `${color}22`, color }
  const hue = DEPT_HUE_PALETTE[hashString(name) % DEPT_HUE_PALETTE.length]
  return {
    dotColor: `hsl(${hue} 65% 40%)`,
    backgroundColor: `hsl(${hue} 65% 40% / 0.12)`,
    color: `hsl(${hue} 65% 35%)`,
  }
}

/* ─── Status config para event cards — coincide con event-card.tsx ─── */
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon?: React.ReactNode }> = {
  published: { label: 'Publicado', bg: '#0F766E', color: '#fff', icon: <Clock style={{ width: 8, height: 8, display: 'inline', marginRight: 2 }} /> },
  archived:  { label: 'Archivado', bg: '#475569', color: '#fff', icon: <Archive style={{ width: 8, height: 8, display: 'inline', marginRight: 2 }} /> },
  draft:     { label: 'Borrador',  bg: '#C9A84C', color: '#102240' },
}

/* ─── Logos ─── */
function LogoFull({ dark = false }: { dark?: boolean }) {
  return (
    <img
      src={logoFullPng}
      alt="Iglesia Adventista Central Osorno"
      className="w-full h-full object-contain"
      style={dark ? { filter: 'brightness(0) invert(1)' } : undefined}
    />
  )
}
function LogoMark({ dark = false }: { dark?: boolean }) {
  return (
    <img
      src={logoMarkPng}
      alt="Logo"
      className="w-full h-full object-contain"
      style={dark ? { filter: 'brightness(0) invert(1)' } : undefined}
    />
  )
}

/* ─── Theme Toggle ─── */
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const options = [
    { key: 'light', icon: Sun, label: 'Claro' },
    { key: 'dark', icon: Moon, label: 'Oscuro' },
    { key: 'system', icon: Monitor, label: 'Sistema' },
  ] as const
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      {options.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          title={label}
          onClick={() => setTheme(key)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            theme === key
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}

/* ─── Text Size Toggle ─── */
function TextSizeToggle() {
  const { textSize, setTextSize } = useTextSize()
  const sizes: { key: TextSize; label: string }[] = [
    { key: 'small', label: 'A' },
    { key: 'medium', label: 'A' },
    { key: 'large', label: 'A' },
  ]
  const sizeClass = { small: 'text-xs', medium: 'text-sm', large: 'text-base' }
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      {sizes.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setTextSize(key)}
          className={`px-2.5 py-1 rounded-md font-medium transition-all ${sizeClass[key]} ${
            textSize === key
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/* ─── Login Preview ─── */
function LoginPreview({ isDark }: { isDark: boolean }) {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent((c) => (c + 1) % UNSPLASH_IMAGES.length)
        setFading(false)
      }, 700)
    }, 4500)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const card = isDark ? 'hsl(222,35%,12%)' : '#ffffff'
  const fg = isDark ? 'hsl(36,50%,95%)' : NAVY
  const muted = isDark ? 'hsl(219,15%,65%)' : 'hsl(219,15%,45%)'
  const border = isDark ? 'hsl(222,25%,22%)' : 'hsl(36,20%,85%)'
  const inputBg = isDark ? 'hsl(222,30%,16%)' : '#fff'
  const controlBg = isDark ? 'hsl(222,30%,18%)' : 'hsl(36,20%,91%)'

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-xl" style={{ minHeight: 460 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 460 }}>
        {/* Left: branding con slideshow */}
        <div className="relative flex flex-col items-center justify-center p-10 overflow-hidden" style={{ background: NAVY }}>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${UNSPLASH_IMAGES[current]})`,
              opacity: fading ? 0 : 0.22,
              transition: 'opacity 0.7s ease-in-out',
            }}
          />
          <div className="absolute inset-0" style={{
            background: `linear-gradient(160deg, ${NAVY}F0 0%, ${NAVY}C8 50%, ${NAVY}E8 100%)`
          }} />
          <div className="absolute bottom-5 flex gap-2 z-10">
            {UNSPLASH_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => { setFading(true); setTimeout(() => { setCurrent(i); setFading(false) }, 300) }}
                style={{
                  width: i === current ? 20 : 6, height: 6, borderRadius: 3,
                  background: i === current ? GOLD : 'rgba(255,255,255,0.35)',
                  transition: 'all 0.3s', border: 'none', cursor: 'pointer', padding: 0,
                }}
              />
            ))}
          </div>
          <div className="relative z-10" style={{ width: 140 }}><LogoFull dark /></div>
          <div className="relative z-10 mt-5 flex items-center gap-2">
            <div style={{ width: 24, height: 1, background: GOLD, opacity: 0.7 }} />
            <p style={{ color: GOLD, fontSize: 10, letterSpacing: '0.15em', fontWeight: 500 }}>CRISTO VIENE PRONTO</p>
            <div style={{ width: 24, height: 1, background: GOLD, opacity: 0.7 }} />
          </div>
        </div>

        {/* Right: formulario */}
        <div className="relative flex flex-col justify-center px-9 py-7" style={{ background: card }}>
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-lg p-1" style={{ background: controlBg }}>
              {[{ icon: Sun }, { icon: Moon }, { icon: Monitor }].map(({ icon: Icon }, i) => (
                <button key={i} className="p-1.5 rounded-md"
                  style={{ background: i === 0 && !isDark ? 'white' : i === 1 && isDark ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
                  <Icon style={{ width: 12, height: 12, color: muted }} />
                </button>
              ))}
            </div>
            <div className="flex items-center rounded-lg p-1" style={{ background: controlBg }}>
              {[{ size: 10 }, { size: 13 }, { size: 16 }].map(({ size }, i) => (
                <button key={i} className="px-2 py-0.5 rounded-md font-semibold"
                  style={{ fontSize: size, color: i === 1 ? fg : muted, background: i === 1 ? (isDark ? 'rgba(255,255,255,0.08)' : 'white') : 'transparent' }}>
                  A
                </button>
              ))}
            </div>
          </div>
          <div style={{ width: 36, height: 40, marginBottom: 16 }}><LogoMark dark={isDark} /></div>
          <h2 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 26, fontWeight: 700, color: isDark ? 'hsl(36,50%,95%)' : NAVY, marginBottom: 4, lineHeight: 1.2 }}>
            Bienvenido
          </h2>
          <p style={{ fontSize: 12, color: muted, marginBottom: 22 }}>Ingresa tus credenciales para continuar</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: muted, display: 'block', marginBottom: 5, letterSpacing: '0.03em' }}>CORREO ELECTRÓNICO</label>
              <div style={{ border: `1.5px solid ${border}`, borderRadius: 8, background: inputBg, padding: '8px 12px', fontSize: 13, color: isDark ? 'hsl(36,50%,80%)' : 'hsl(219,40%,35%)' }}>pastor@central.cl</div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: muted, display: 'block', marginBottom: 5, letterSpacing: '0.03em' }}>CONTRASEÑA</label>
              <div style={{ border: `1.5px solid ${border}`, borderRadius: 8, background: inputBg, padding: '8px 12px', fontSize: 13, color: muted }}>••••••••</div>
            </div>
            <button style={{ width: '100%', background: NAVY, color: '#fff', borderRadius: 8, padding: '10px 0', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', marginTop: 4, border: 'none', cursor: 'pointer' }}>
              INICIAR SESIÓN
            </button>
          </div>
          <div style={{ marginTop: 18, borderTop: `1px solid ${isDark ? 'rgba(201,168,76,0.2)' : 'rgba(201,168,76,0.35)'}`, paddingTop: 12 }}>
            <p style={{ fontSize: 10, color: muted, textAlign: 'center', letterSpacing: '0.03em' }}>Iglesia Adventista del Séptimo Día · Osorno Central</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Color Swatch ─── */
function Swatch({ color, label, hex }: { color: string; label: string; hex: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="w-14 h-14 rounded-xl shadow-sm border border-border" style={{ background: color }} />
      <span className="text-xs font-medium text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground font-mono">{hex}</span>
    </div>
  )
}

/* ─── Status Badge ─── */
function StatusBadge({ label, variant }: { label: string; variant: keyof typeof STATUS_COLORS }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const color = STATUS_COLORS[variant]
  const bg = isDark ? color.dark : color.light
  const textColor = variant === 'draft' ? '#102240' : '#fff'
  return (
    <span style={{ background: bg, color: textColor, borderRadius: 9999, padding: '2px 10px', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
      {label}
    </span>
  )
}

/* ─── Alert ─── */
function Alert({ type, title, body }: { type: 'success' | 'error' | 'info'; title: string; body: string }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const map = {
    success: { key: 'published' as const, Icon: Check },
    error:   { key: 'cancelled' as const, Icon: AlertTriangle },
    info:    { key: 'info' as const, Icon: Bell },
  }
  const { key, Icon } = map[type]
  const bg = isDark ? STATUS_COLORS[key].dark : STATUS_COLORS[key].light
  return (
    <div style={{ background: bg, borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <Icon style={{ color: '#fff', width: 16, height: 16, marginTop: 2, flexShrink: 0 }} />
      <div>
        <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{title}</p>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, margin: '2px 0 0' }}>{body}</p>
      </div>
    </div>
  )
}

/* ─── Mock event data ─── */
const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Culto Divino — Semana de Oración',
    startDate: '2026-05-24T11:00:00',
    endDate: '2026-05-24T12:30:00',
    status: 'published',
    eventType: 'local',
    location: 'Templo Central, Osorno',
    meetingUrl: null,
    department: { name: 'Departamento Pastoral', sigla: 'PAS', color: NAVY },
    organizers: [{ name: 'Pastor Juan González' }],
    coverImageUrl: null,
    shareSlug: 'culto-divino',
    description: 'Culto de adoración semanal con predicación especial y momento de oración congregacional.',
  },
  {
    id: '2',
    title: 'Escuela Sabática — Adultos',
    startDate: '2026-05-24T09:45:00',
    endDate: '2026-05-24T10:45:00',
    status: 'draft',
    eventType: 'local',
    location: null,
    meetingUrl: null,
    department: { name: 'Ministerio Personal', sigla: 'MP', color: null },
    organizers: [],
    coverImageUrl: null,
    shareSlug: 'escuela-sabatica',
    description: null,
  },
  {
    id: '3',
    title: 'Congreso Distrital de Jóvenes',
    startDate: '2026-05-30T08:00:00',
    endDate: '2026-06-01T17:00:00',
    status: 'published',
    eventType: 'distrital',
    location: 'Salón de Usos Múltiples',
    meetingUrl: 'https://meet.google.com/abc-defg',
    department: { name: 'Jóvenes Adventistas', sigla: 'JA', color: null },
    organizers: [{ name: 'Coord. Distrito Osorno' }, { name: 'Dir. Jóvenes' }],
    coverImageUrl: null,
    shareSlug: 'congreso-distrital',
    description: 'Tres días de encuentro, talleres y actividades para jóvenes del distrito.',
  },
  {
    id: '4',
    title: 'Asamblea Anual ASACH',
    startDate: '2026-06-15T09:00:00',
    endDate: '2026-06-15T18:00:00',
    status: 'archived',
    eventType: 'asach',
    location: 'Centro de Convenciones',
    meetingUrl: null,
    department: { name: 'Administración', sigla: 'ADM', color: null },
    organizers: [{ name: 'Unión Austral' }],
    coverImageUrl: null,
    shareSlug: 'asamblea-asach',
    description: null,
  },
]

/* ─── Mini Event Card Mobile ─── */
function MiniMobileCard({ event }: { event: typeof MOCK_EVENTS[0] }) {
  const typeStyle = EVENT_TYPE_STYLE[event.eventType as keyof typeof EVENT_TYPE_STYLE] ?? EVENT_TYPE_STYLE.local
  const deptStyle = event.department ? getDeptStyle(event.department.name, event.department.color ?? undefined) : null
  const status = event.status
  const isDraft = status === 'draft'
  const isArchived = status === 'archived'

  function formatDateRange(start: string, end: string) {
    const s = new Date(start), e = new Date(end)
    const sameDay = s.toDateString() === e.toDateString()
    const dateOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
    const timeOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
    if (sameDay) return `${s.toLocaleDateString('es-CL', dateOpts)} · ${s.toLocaleTimeString('es-CL', timeOpts)}–${e.toLocaleTimeString('es-CL', timeOpts)}`
    return `${s.toLocaleDateString('es-CL', dateOpts)} – ${e.toLocaleDateString('es-CL', dateOpts)}`
  }

  const statusCfg = STATUS_CONFIG[status]

  return (
    <div className={`
      block rounded-xl border bg-card overflow-hidden
      transition-all duration-200 hover:shadow-md hover:-translate-y-px cursor-pointer
      ${isDraft ? 'border-dashed border-accent/60 opacity-80' : isArchived ? 'border-border/50 opacity-60' : 'border-border hover:border-primary/40'}
    `}>
      {/* Cover header */}
      <div
        className="w-full h-32 overflow-hidden relative bg-muted"
        style={{ backgroundColor: (deptStyle?.dotColor ?? typeStyle.dotColor) + '33' }}
      >
        <img src={defaultCover} alt="" aria-hidden className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-start gap-2 min-w-0">
          <span className="mt-1 h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: deptStyle ? deptStyle.dotColor : typeStyle.dotColor }} />
          <p className="text-sm font-semibold leading-snug line-clamp-2 flex-1 text-foreground min-w-0">{event.title}</p>
          {event.meetingUrl && <Video className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />}
        </div>

        <div className="pl-4 space-y-0.5 text-xs text-muted-foreground">
          <span className="font-medium">{formatDateRange(event.startDate, event.endDate)}</span>
          {event.location && (
            <div className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        {event.department?.name && (
          <div className="pl-4 flex items-center gap-1 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: deptStyle?.dotColor }} />
            <span className="truncate">{event.department.name}</span>
          </div>
        )}

        {event.organizers.length > 0 && (
          <div className="pl-4 flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{event.organizers.map(o => o.name).join(', ')}</span>
          </div>
        )}

        <div className="pl-4 flex flex-wrap items-center gap-1">
          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: typeStyle.backgroundColor, color: typeStyle.color }}>
            {typeStyle.label}
          </span>
          {statusCfg && status !== 'published' && (
            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto" style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
              {statusCfg.icon}{statusCfg.label}
            </span>
          )}
        </div>
      </div>

      {status === 'published' && <div className="h-0.5 bg-primary/30" />}
    </div>
  )
}

/* ─── Mini Event Card Desktop ─── */
function MiniDesktopCard({ event }: { event: typeof MOCK_EVENTS[0] }) {
  const typeStyle = EVENT_TYPE_STYLE[event.eventType as keyof typeof EVENT_TYPE_STYLE] ?? EVENT_TYPE_STYLE.local
  const deptStyle = event.department ? getDeptStyle(event.department.name, event.department.color ?? undefined) : null
  const status = event.status
  const isDraft = status === 'draft'
  const isArchived = status === 'archived'
  const statusCfg = STATUS_CONFIG[status]

  function formatDateRange(start: string, end: string) {
    const s = new Date(start), e = new Date(end)
    const sameDay = s.toDateString() === e.toDateString()
    const dateOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
    const timeOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
    if (sameDay) return `${s.toLocaleDateString('es-CL', dateOpts)} · ${s.toLocaleTimeString('es-CL', timeOpts)}–${e.toLocaleTimeString('es-CL', timeOpts)}`
    return `${s.toLocaleDateString('es-CL', dateOpts)} – ${e.toLocaleDateString('es-CL', dateOpts)}`
  }

  return (
    <div className={`
      rounded-xl border bg-card overflow-hidden
      transition-all duration-200 hover:shadow-md hover:-translate-y-px cursor-pointer
      ${isDraft ? 'border-dashed border-accent/60 opacity-80' : isArchived ? 'border-border/50 opacity-60' : 'border-border hover:border-primary/40'}
    `}>
      <div className="p-3 space-y-1.5">
        <div className="flex items-start gap-2 min-w-0">
          <span className="mt-1 h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: deptStyle ? deptStyle.dotColor : typeStyle.dotColor }} />
          <p className="text-sm font-semibold leading-snug line-clamp-2 flex-1 text-foreground min-w-0">{event.title}</p>
          {event.meetingUrl && <Video className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />}
        </div>

        <div className="pl-4 space-y-0.5 text-xs text-muted-foreground">
          <span className="font-medium">{formatDateRange(event.startDate, event.endDate)}</span>
          {event.location && (
            <div className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        <div className="pl-4 flex flex-wrap items-center gap-1">
          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: typeStyle.backgroundColor, color: typeStyle.color }}>
            {typeStyle.label}
          </span>
          {event.department?.sigla && deptStyle && (
            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full" title={event.department.name} style={{ backgroundColor: deptStyle.backgroundColor, color: deptStyle.color }}>
              {event.department.sigla}
            </span>
          )}
          {statusCfg && status !== 'published' && (
            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto" style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
              {statusCfg.icon}{statusCfg.label}
            </span>
          )}
        </div>
      </div>

      {status === 'published' && <div className="h-0.5 bg-primary/30" />}
    </div>
  )
}

/* ─── Main Preview Page ─── */
export function ThemePreviewPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [activeTab, setActiveTab] = useState<'login' | 'colors' | 'type' | 'components' | 'events'>('login')

  const tabs = [
    { key: 'login',      label: 'Login' },
    { key: 'colors',     label: 'Colores & Logo' },
    { key: 'type',       label: 'Tipografía' },
    { key: 'components', label: 'Componentes' },
    { key: 'events',     label: 'Tarjetas de evento' },
  ] as const

  return (
    <div className="h-screen overflow-y-auto bg-background text-foreground">

      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-9"><LogoMark dark={isDark} /></div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">Theme Preview</h1>
              <p className="text-xs text-muted-foreground">design-system · church-management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TextSizeToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Tab nav */}
        <div className="flex flex-wrap gap-1 bg-muted rounded-lg p-1 w-fit">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB: LOGIN ─── */}
        {activeTab === 'login' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Pantalla de Login</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Slideshow automático · Toggle tema y tamaño sin autenticar · Layout 2 columnas
              </p>
            </div>
            <LoginPreview isDark={isDark} />
            <p className="text-xs text-muted-foreground">
              Fotos vía Unsplash. En producción se usan fotos reales de la iglesia.
            </p>
          </div>
        )}

        {/* ── TAB: COLORS & LOGO ─── */}
        {activeTab === 'colors' && (
          <div className="space-y-10">

            {/* Logos */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Logo</h2>
              <p className="text-sm text-muted-foreground mb-6">
                PNG con fondo transparente. Dark mode: <code className="text-xs bg-muted px-1 py-0.5 rounded">filter: brightness(0) invert(1)</code>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border p-6 flex flex-col items-center gap-2" style={{ background: 'hsl(36,50%,97%)' }}>
                  <div style={{ width: 100, height: 110 }}><LogoFull dark={false} /></div>
                  <span className="text-xs text-muted-foreground">Completo · light</span>
                </div>
                <div className="rounded-xl border border-border p-6 flex flex-col items-center gap-2" style={{ background: NAVY }}>
                  <div style={{ width: 100, height: 110 }}><LogoFull dark /></div>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Completo · dark</span>
                </div>
                <div className="rounded-xl border border-border p-6 flex flex-col items-center gap-2" style={{ background: 'hsl(36,50%,97%)' }}>
                  <div style={{ width: 60, height: 68 }}><LogoMark dark={false} /></div>
                  <span className="text-xs text-muted-foreground">Mark · light</span>
                </div>
                <div className="rounded-xl border border-border p-6 flex flex-col items-center gap-2" style={{ background: NAVY }}>
                  <div style={{ width: 60, height: 68 }}><LogoMark dark /></div>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Mark · dark</span>
                </div>
              </div>
            </div>

            {/* Paleta base */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Paleta de marca</h2>
              <p className="text-sm text-muted-foreground mb-6">Navy + Dorado + Crema — extraídos del logo oficial.</p>

              <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-widest">Light mode</h3>
              <div className="flex flex-wrap gap-6 mb-8">
                <Swatch color="#1B3A6B" label="Primary / Navy" hex="#1B3A6B" />
                <Swatch color="#C9A84C" label="Accent · Dorado" hex="#C9A84C" />
                <Swatch color="#FAF6F0" label="Background · Crema" hex="#FAF6F0" />
                <Swatch color="#FFFFFF" label="Card" hex="#FFFFFF" />
                <Swatch color="#0F1D35" label="Foreground" hex="#0F1D35" />
                <Swatch color="#EDE9E3" label="Muted" hex="#EDE9E3" />
                <Swatch color="#5A6A85" label="Muted FG" hex="#5A6A85" />
                <Swatch color="#DDD7CE" label="Border" hex="#DDD7CE" />
                <Swatch color="#DC2626" label="Destructive" hex="#DC2626" />
              </div>

              <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-widest">Dark mode</h3>
              <div className="flex flex-wrap gap-6 p-6 rounded-xl" style={{ background: 'hsl(222,47%,8%)' }}>
                <Swatch color="#6B9FDB" label="Primary" hex="#6B9FDB" />
                <Swatch color="#D4B060" label="Accent · Dorado" hex="#D4B060" />
                <Swatch color="hsl(222,47%,8%)" label="Background" hex="hsl(222 47% 8%)" />
                <Swatch color="hsl(222,35%,12%)" label="Card" hex="hsl(222 35% 12%)" />
                <Swatch color="hsl(36,50%,95%)" label="Foreground · Crema" hex="Crema" />
                <Swatch color="hsl(222,30%,16%)" label="Muted" hex="hsl(222 30% 16%)" />
                <Swatch color="hsl(219,15%,65%)" label="Muted FG" hex="hsl(219 15% 65%)" />
              </div>
            </div>

            {/* Paleta de estado */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Paleta de estado</h2>
              <p className="text-sm text-muted-foreground mb-6">Usada en badges, alertas y bandas del calendario.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(Object.entries(STATUS_COLORS) as [keyof typeof STATUS_COLORS, { light: string; dark: string }][]).map(([key, val]) => (
                  <div key={key} className="rounded-xl border border-border overflow-hidden">
                    <div className="grid grid-cols-2">
                      <div className="h-12 flex items-center justify-center text-[10px] font-semibold" style={{ background: val.light, color: key === 'draft' ? '#102240' : '#fff' }}>Light {val.light}</div>
                      <div className="h-12 flex items-center justify-center text-[10px] font-semibold" style={{ background: val.dark, color: key === 'draft' ? '#102240' : '#fff' }}>Dark {val.dark}</div>
                    </div>
                    <div className="px-3 py-2 bg-card">
                      <p className="text-xs font-semibold text-foreground capitalize">{key}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Paleta de tipos de evento */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Tipos de evento</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Colores hardcoded en <code className="text-xs bg-muted px-1 py-0.5 rounded">labels.ts → EVENT_TYPE_STYLE</code>
              </p>
              <div className="flex flex-wrap gap-4">
                {Object.entries(EVENT_TYPE_STYLE).map(([key, style]) => (
                  <div key={key} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 min-w-48">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: style.backgroundColor }}>
                      <span className="w-3 h-3 rounded-full block" style={{ backgroundColor: style.dotColor }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{style.label}</p>
                      <p className="text-xs font-mono text-muted-foreground">{style.dotColor}</p>
                      <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1" style={{ backgroundColor: style.backgroundColor, color: style.color }}>
                        {style.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Paleta de departamentos */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Colores de departamento</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Generados determinísticamente desde el nombre vía hash sobre 12 hues.
                Si el departamento tiene color en BD, ese prevalece.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  'Departamento Pastoral', 'Jóvenes Adventistas', 'Ministerio Personal',
                  'Escuela Sabática', 'Diaconado', 'Coro', 'Familia', 'Comunicaciones',
                  'Stewardship', 'Evangelismo', 'Mujeres', 'Infantes',
                ].map(name => {
                  const s = getDeptStyle(name)
                  return (
                    <div key={name} className="flex flex-col items-center gap-1.5">
                      <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: s.backgroundColor, border: `2px solid ${s.dotColor}40` }} />
                      <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.backgroundColor, color: s.color }}>
                        {name.split(' ')[0]}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Hues disponibles: {DEPT_HUE_PALETTE.join(', ')} · Saturación 65% · Luminosidad 40%
              </p>
            </div>
          </div>
        )}

        {/* ── TAB: TYPOGRAPHY ─── */}
        {activeTab === 'type' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Tipografía</h2>
              <p className="text-sm text-muted-foreground">
                Lato (sans) para UI · Playfair Display (serif) para headings · Dorado como color de acento tipográfico
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-8 space-y-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Jerarquía tipográfica</p>

              <div className="border-b border-border pb-5">
                <p className="text-xs text-muted-foreground mb-2">H1 · Display · Playfair Display 700 · Color dorado</p>
                <p style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 38, fontWeight: 700, color: GOLD, lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                  Adventistas Central
                </p>
              </div>

              <div className="border-b border-border pb-5">
                <p className="text-xs text-muted-foreground mb-2">H2 · Section header · Playfair Display 600 · Color navy/primary</p>
                <p style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 26, fontWeight: 600, color: isDark ? '#A8C4F0' : NAVY, lineHeight: 1.25 }}>
                  Bienvenido al Sistema de Gestión
                </p>
              </div>

              <div className="border-b border-border pb-5">
                <p className="text-xs text-muted-foreground mb-2">H3 · Module title · Lato 700 · Foreground</p>
                <p className="text-2xl font-bold text-foreground">Programas de Culto</p>
              </div>

              <div className="border-b border-border pb-5">
                <p className="text-xs text-muted-foreground mb-2">H4 · Subheading · Lato 600 · con acento dorado</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-semibold text-foreground">Culto Sabático</p>
                  <span style={{ width: 32, height: 2, background: GOLD, display: 'inline-block', marginBottom: 2 }} />
                </div>
              </div>

              <div className="border-b border-border pb-5 space-y-2">
                <p className="text-xs text-muted-foreground mb-2">Body · Lato 400/500 · Escala foreground → muted</p>
                <p className="text-base font-medium text-foreground">Responsable: Pastor Juan González · Sábado 24 de mayo · 11:00 hrs</p>
                <p className="text-base text-foreground">El culto divino incluye alabanza, lectura de la Biblia, oración pastoral y el sermón principal.</p>
                <p className="text-sm text-muted-foreground">Última modificación: hace 2 horas · por Secretaria de Iglesia</p>
                <p className="text-xs text-muted-foreground">ID: PRG-2024-0524 · Estado: Publicado</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-3">Contraste de color — niveles de jerarquía</p>
                <div className="flex flex-col gap-1.5">
                  {[
                    { dot: GOLD, style: { fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 700, color: GOLD }, label: `Display / Branding — Dorado ${GOLD}` },
                    { dot: isDark ? '#A8C4F0' : NAVY, style: { fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 600, color: isDark ? '#A8C4F0' : NAVY }, label: `Section header — ${isDark ? 'Azul claro #A8C4F0' : `Navy ${NAVY}`}` },
                  ].map(({ dot, style, label }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: dot }} />
                      <span style={style}>{label}</span>
                    </div>
                  ))}
                  {[
                    { cls: 'text-sm font-bold text-foreground', label: 'Título de módulo — Foreground bold' },
                    { cls: 'text-sm text-foreground', label: 'Texto corrido — Foreground normal' },
                    { cls: 'text-sm text-muted-foreground', label: 'Texto secundario — Muted foreground' },
                    { cls: 'text-xs text-muted-foreground', label: 'Metadata / timestamps — Muted foreground xs' },
                  ].map(({ cls, label }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0 bg-muted-foreground" />
                      <span className={cls}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-8">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">Selector de tamaño de texto</p>
              <div className="grid grid-cols-3 divide-x divide-border">
                {(['small', 'medium', 'large'] as TextSize[]).map((s) => (
                  <div key={s} className="px-6 first:pl-0 last:pr-0 space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">{s}</p>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: s === 'small' ? 16 : s === 'medium' ? 20 : 25, fontWeight: 700, color: GOLD }}>Cultos</p>
                    <p style={{ fontSize: s === 'small' ? 13 : s === 'medium' ? 16 : 19 }} className="font-semibold text-foreground">Programa del Sábado</p>
                    <p style={{ fontSize: s === 'small' ? 11 : s === 'medium' ? 13 : 15 }} className="text-muted-foreground">Sábado 09:45 · Escs. Sabática</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: COMPONENTS ─── */}
        {activeTab === 'components' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Componentes</h2>
              <p className="text-sm text-muted-foreground">Vista previa con paleta de marca. Cambia el tema para ver ambos modos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Botones */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Botones</p>
                <p className="text-xs text-muted-foreground">Con paleta de marca aplicada (navy + dorado)</p>
                <div className="flex flex-wrap gap-3">
                  <button style={{ background: isDark ? 'hsl(219,70%,60%)' : NAVY, color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Guardar programa</button>
                  <button style={{ background: 'transparent', color: isDark ? 'hsl(219,70%,60%)' : NAVY, border: `1.5px solid ${isDark ? 'hsl(219,70%,60%)' : NAVY}`, borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Cancelar</button>
                  <button style={{ background: isDark ? 'hsl(222,30%,16%)' : 'hsl(36,20%,93%)', color: isDark ? 'hsl(36,50%,95%)' : 'hsl(219,40%,12%)', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Ver detalle</button>
                  <button style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Eliminar</button>
                  <button style={{ background: 'transparent', color: isDark ? 'hsl(36,50%,95%)' : 'hsl(219,40%,12%)', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Editar</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button style={{ background: isDark ? 'hsl(219,70%,60%)' : NAVY, color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Plus size={13} /> Nuevo evento
                  </button>
                  <button style={{ background: 'transparent', color: isDark ? 'hsl(219,70%,60%)' : NAVY, border: `1.5px solid ${isDark ? 'hsl(219,70%,60%)' : NAVY}`, borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Search size={13} /> Buscar
                  </button>
                </div>
              </div>

              {/* Inputs */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inputs</p>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nombre del evento</label>
                  <Input placeholder="Culto Sabático — Escuela Sabática" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Departamento</label>
                  <Input placeholder="Jóvenes Adventistas" />
                </div>
              </div>

              {/* Badges de estado */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Badges de estado</p>
                <div className="flex flex-wrap gap-3">
                  <StatusBadge label="Publicado" variant="published" />
                  <StatusBadge label="Borrador" variant="draft" />
                  <StatusBadge label="Archivado" variant="archived" />
                  <StatusBadge label="Pendiente" variant="pending" />
                  <StatusBadge label="Cancelado" variant="cancelled" />
                  <StatusBadge label="Confirmado" variant="info" />
                </div>
                <p className="text-xs text-muted-foreground">Fondo sólido · texto blanco (draft: navy oscuro)</p>
              </div>

              {/* Card de evento genérica */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Card de módulo</p>
                <div className="rounded-lg border border-border bg-card hover:shadow-md transition-shadow p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">Culto Divino</h3>
                        <StatusBadge label="Publicado" variant="published" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">Sábado 24 de mayo · 11:00 hrs</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Pastoral</span>
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> 8 partes</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sidebar (fragmento)</p>
                <div className="rounded-lg overflow-hidden border border-border" style={{ maxWidth: 210 }}>
                  <div className="bg-card border-b border-border p-3 flex items-center gap-2">
                    <div style={{ width: 28, height: 32 }}><LogoMark dark={isDark} /></div>
                    <div>
                      <p className="text-xs font-bold text-foreground leading-none">Central</p>
                      <p className="text-xs text-muted-foreground leading-none mt-0.5">Osorno</p>
                    </div>
                  </div>
                  {[
                    { icon: Calendar, label: 'Calendario', active: true },
                    { icon: Church, label: 'Cultos', active: false },
                    { icon: Users, label: 'Mantenedores', active: false },
                  ].map(({ icon: Icon, label, active }) => (
                    <div key={label} className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${active ? 'bg-primary/10 text-primary font-semibold border-r-2 border-primary' : 'text-muted-foreground hover:bg-muted'}`}>
                      <Icon className="h-4 w-4" />
                      {label}
                    </div>
                  ))}
                  <div className="border-t border-border p-2 flex items-center justify-center gap-1">
                    {[Sun, Moon, Monitor].map((Icon, i) => (
                      <button key={i} className={`p-1.5 rounded-md transition-colors ${i === (isDark ? 1 : 0) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
                        <Icon className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alertas */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alertas</p>
                <Alert type="success" title="Programa guardado" body="Los cambios se han publicado correctamente." />
                <Alert type="error" title="Error al guardar" body="No se pudo conectar con el servidor. Intenta nuevamente." />
                <Alert type="info" title="3 eventos pendientes" body="Este sábado tienes eventos sin confirmar responsables." />
              </div>

            </div>
          </div>
        )}

        {/* ── TAB: EVENT CARDS ─── */}
        {activeTab === 'events' && (
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Tarjetas de evento</h2>
              <p className="text-sm text-muted-foreground">
                Responsive: <strong>mobile</strong> con cover como header · <strong>desktop</strong> minimal + popover on hover.
                Estados: published · draft · archived.
              </p>
            </div>

            {/* Mobile cards */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Mobile</h3>
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground font-mono">max-width: md · cover h-32</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Cover como header · dot de color de departamento · nombre completo de departamento · badges tipo + estado · línea accent en publicado
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                {MOCK_EVENTS.map(event => (
                  <MiniMobileCard key={event.id} event={event} />
                ))}
              </div>
            </div>

            {/* Desktop cards */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Desktop</h3>
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground font-mono">md+ · minimal + popover on hover</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Sin cover · dot de color · sigla de departamento (no nombre completo) · badges tipo + sigla + estado · popover con detalle completo y cover aspect-video
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl">
                {MOCK_EVENTS.map(event => (
                  <MiniDesktopCard key={event.id} event={event} />
                ))}
              </div>
            </div>

            {/* Estados visuales explicados */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Estados visuales</h3>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Published</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>· Border: <code className="bg-muted px-1 rounded">border-border</code></li>
                    <li>· Hover: <code className="bg-muted px-1 rounded">hover:border-primary/40</code></li>
                    <li>· Acento: línea <code className="bg-muted px-1 rounded">h-0.5 bg-primary/30</code> al fondo</li>
                    <li>· Opacidad: 100%</li>
                  </ul>
                </div>
                <div className="rounded-xl border-dashed border-accent/60 border bg-card p-4 space-y-2 opacity-80">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Draft</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>· Border: <code className="bg-muted px-1 rounded">border-dashed border-accent/60</code></li>
                    <li>· Sin hover border change</li>
                    <li>· Sin línea de acento al fondo</li>
                    <li>· Opacidad: 80%</li>
                  </ul>
                </div>
                <div className="rounded-xl border-border/50 border bg-card p-4 space-y-2 opacity-60">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Archived</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>· Border: <code className="bg-muted px-1 rounded">border-border/50</code></li>
                    <li>· Sin hover border change</li>
                    <li>· Sin línea de acento al fondo</li>
                    <li>· Opacidad: 60%</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Badges de tipo y departamento */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Badges de tipo y departamento</h3>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <p className="text-xs text-muted-foreground">
                  Clase base: <code className="bg-muted px-1 rounded">text-[10px] font-semibold px-2 py-0.5 rounded-full</code> · colores vía <code className="bg-muted px-1 rounded">style</code> inline
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(EVENT_TYPE_STYLE).map(([key, style]) => (
                    <span key={key} className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: style.backgroundColor, color: style.color }}>
                      {style.label}
                    </span>
                  ))}
                  {['Pastoral', 'JA', 'MP', 'ADM', 'COR'].map(sigla => {
                    const s = getDeptStyle(sigla + ' ' + sigla)
                    return (
                      <span key={sigla} className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.backgroundColor, color: s.color }}>
                        {sigla}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
