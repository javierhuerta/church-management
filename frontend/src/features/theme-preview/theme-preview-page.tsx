import { useState, useEffect, useRef } from 'react'
import { Sun, Moon, Monitor, Bell, Calendar, Users, Church, BookOpen, ChevronRight, Search, Plus, Check, X, AlertTriangle } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { useTextSize, type TextSize } from '@/lib/contexts/text-size-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import logoFullPng from '@/assets/images/logo.png'
import logoMarkPng from '@/assets/images/logo-mark.png'

/* ─── Unsplash images ─── */
const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=1200&q=80',
  'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&q=80',
  'https://images.unsplash.com/photo-1507692812060-98338d07aca3?w=1200&q=80',
  'https://images.unsplash.com/photo-1548625149-720fb8a193f3?w=1200&q=80',
]

const NAVY = '#1B3A6B'
const GOLD = '#C9A84C'

/* ─── Logo usando PNG original procesado (fondo transparente) ─── */
// En dark mode: filter invert para convertir navy→blanco
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
          {/* Foto de fondo con fade */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${UNSPLASH_IMAGES[current]})`,
              opacity: fading ? 0 : 0.22,
              transition: 'opacity 0.7s ease-in-out',
            }}
          />
          {/* Overlay gradiente */}
          <div className="absolute inset-0" style={{
            background: `linear-gradient(160deg, ${NAVY}F0 0%, ${NAVY}C8 50%, ${NAVY}E8 100%)`
          }} />

          {/* Dots navegación */}
          <div className="absolute bottom-5 flex gap-2 z-10">
            {UNSPLASH_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => { setFading(true); setTimeout(() => { setCurrent(i); setFading(false) }, 300) }}
                style={{
                  width: i === current ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === current ? GOLD : 'rgba(255,255,255,0.35)',
                  transition: 'all 0.3s',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>

          {/* Logo */}
          <div className="relative z-10" style={{ width: 140 }}>
            <LogoFull dark />
          </div>

          {/* Tagline dorada */}
          <div className="relative z-10 mt-5 flex items-center gap-2">
            <div style={{ width: 24, height: 1, background: GOLD, opacity: 0.7 }} />
            <p style={{ color: GOLD, fontSize: 10, letterSpacing: '0.15em', fontWeight: 500 }}>
              CRISTO VIENE PRONTO
            </p>
            <div style={{ width: 24, height: 1, background: GOLD, opacity: 0.7 }} />
          </div>
        </div>

        {/* Right: formulario */}
        <div className="relative flex flex-col justify-center px-9 py-7" style={{ background: card }}>
          {/* Controles arriba derecha */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-lg p-1" style={{ background: controlBg }}>
              {[{ icon: Sun }, { icon: Moon }, { icon: Monitor }].map(({ icon: Icon }, i) => (
                <button
                  key={i}
                  className="p-1.5 rounded-md"
                  style={{ background: i === 0 && !isDark ? 'white' : i === 1 && isDark ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                >
                  <Icon style={{ width: 12, height: 12, color: muted }} />
                </button>
              ))}
            </div>
            <div className="flex items-center rounded-lg p-1" style={{ background: controlBg }}>
              {[{ size: 10, label: 'A' }, { size: 13, label: 'A' }, { size: 16, label: 'A' }].map(({ size, label }, i) => (
                <button
                  key={i}
                  className="px-2 py-0.5 rounded-md font-semibold"
                  style={{
                    fontSize: size,
                    color: i === 1 ? fg : muted,
                    background: i === 1 ? (isDark ? 'rgba(255,255,255,0.08)' : 'white') : 'transparent',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Logo mark pequeño */}
          <div style={{ width: 36, height: 40, marginBottom: 16 }}>
            <LogoMark dark={isDark} />
          </div>

          {/* Heading con Playfair simulado */}
          <h2 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 26,
            fontWeight: 700,
            color: isDark ? 'hsl(36,50%,95%)' : NAVY,
            marginBottom: 4,
            lineHeight: 1.2,
          }}>
            Bienvenido
          </h2>
          <p style={{ fontSize: 12, color: muted, marginBottom: 22 }}>
            Ingresa tus credenciales para continuar
          </p>

          {/* Formulario */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: muted, display: 'block', marginBottom: 5, letterSpacing: '0.03em' }}>
                CORREO ELECTRÓNICO
              </label>
              <div style={{
                border: `1.5px solid ${border}`,
                borderRadius: 8,
                background: inputBg,
                padding: '8px 12px',
                fontSize: 13,
                color: isDark ? 'hsl(36,50%,80%)' : 'hsl(219,40%,35%)',
              }}>
                pastor@central.cl
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: muted, display: 'block', marginBottom: 5, letterSpacing: '0.03em' }}>
                CONTRASEÑA
              </label>
              <div style={{
                border: `1.5px solid ${border}`,
                borderRadius: 8,
                background: inputBg,
                padding: '8px 12px',
                fontSize: 13,
                color: muted,
              }}>
                ••••••••
              </div>
            </div>
            <button style={{
              width: '100%',
              background: NAVY,
              color: '#fff',
              borderRadius: 8,
              padding: '10px 0',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.04em',
              marginTop: 4,
              border: 'none',
              cursor: 'pointer',
            }}>
              INICIAR SESIÓN
            </button>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 18, borderTop: `1px solid ${isDark ? 'rgba(201,168,76,0.2)' : 'rgba(201,168,76,0.35)'}`, paddingTop: 12 }}>
            <p style={{ fontSize: 10, color: muted, textAlign: 'center', letterSpacing: '0.03em' }}>
              Iglesia Adventista del Séptimo Día · Osorno Central
            </p>
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

/* ─── Paleta extendida de estado ─── */
const STATUS_COLORS = {
  published: { light: '#0F766E', dark: '#0D9488' },  // teal — armoniza con navy
  draft:     { light: '#C9A84C', dark: '#D4B566' },  // dorado de la marca
  pending:   { light: '#B45309', dark: '#D97706' },  // amber oscuro
  archived:  { light: '#475569', dark: '#64748B' },  // slate frío — coherente con navy
  cancelled: { light: '#DC2626', dark: '#EF4444' },  // rojo — destructive de la paleta
  info:      { light: '#1B3A6B', dark: '#6B9FDB' },  // navy/primary
}
function StatusBadge({ label, variant }: { label: string; variant: keyof typeof STATUS_COLORS }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const color = STATUS_COLORS[variant]
  const bg = isDark ? color.dark : color.light
  // El dorado es claro — usar texto navy oscuro para contraste
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

/* ─── Main Preview Page ─── */
export function ThemePreviewPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [activeTab, setActiveTab] = useState<'login' | 'colors' | 'type' | 'components'>('login')

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-9">
              <LogoMark dark={isDark} />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">Theme Preview</h1>
              <p className="text-xs text-muted-foreground">brand-identity-and-ui-polish</p>
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
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
          {([
            { key: 'login', label: 'Login' },
            { key: 'colors', label: 'Colores & Logo' },
            { key: 'type', label: 'Tipografía' },
            { key: 'components', label: 'Componentes' },
          ] as const).map(({ key, label }) => (
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

        {/* ── TAB: LOGIN ─────────────────────────────────────── */}
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
              Fotos vía Unsplash. En producción se usarían las fotos reales de la iglesia.
            </p>
          </div>
        )}

        {/* ── TAB: COLORS & LOGO ─────────────────────────────── */}
        {activeTab === 'colors' && (
          <div className="space-y-10">

            {/* Logos */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Logo SVG</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Estructura fiel al original: símbolo adventista sobre volcán Osorno.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Logo completo light */}
                <div className="rounded-xl border border-border p-6 flex flex-col items-center gap-2"
                  style={{ background: 'hsl(36,50%,97%)' }}>
                  <div style={{ width: 100, height: 110 }}><LogoFull dark={false} /></div>
                  <span className="text-xs text-muted-foreground">Completo · light</span>
                </div>
                {/* Logo completo dark */}
                <div className="rounded-xl border border-border p-6 flex flex-col items-center gap-2"
                  style={{ background: NAVY }}>
                  <div style={{ width: 100, height: 110 }}><LogoFull dark /></div>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Completo · dark</span>
                </div>
                {/* Logomark light */}
                <div className="rounded-xl border border-border p-6 flex flex-col items-center gap-2"
                  style={{ background: 'hsl(36,50%,97%)' }}>
                  <div style={{ width: 60, height: 68 }}><LogoMark dark={false} /></div>
                  <span className="text-xs text-muted-foreground">Mark · light</span>
                </div>
                {/* Logomark dark */}
                <div className="rounded-xl border border-border p-6 flex flex-col items-center gap-2"
                  style={{ background: NAVY }}>
                  <div style={{ width: 60, height: 68 }}><LogoMark dark /></div>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Mark · dark</span>
                </div>
              </div>
            </div>

            {/* Paleta */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Paleta de marca</h2>
              <p className="text-sm text-muted-foreground mb-6">Navy + Dorado + Crema — extraídos del logo oficial.</p>

              <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-widest">Light mode</h3>
              <div className="flex flex-wrap gap-6 mb-8">
                <Swatch color="#1B3A6B" label="Primary" hex="#1B3A6B" />
                <Swatch color="#C9A84C" label="Accent · Dorado" hex="#C9A84C" />
                <Swatch color="#FAF6F0" label="Background" hex="#FAF6F0" />
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
                <Swatch color="hsl(36,50%,95%)" label="Foreground" hex="Crema" />
                <Swatch color="hsl(222,30%,16%)" label="Muted" hex="hsl(222 30% 16%)" />
                <Swatch color="hsl(219,15%,65%)" label="Muted FG" hex="hsl(219 15% 65%)" />
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: TYPOGRAPHY ────────────────────────────────── */}
        {activeTab === 'type' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Tipografía</h2>
              <p className="text-sm text-muted-foreground">
                Lato (sans) para UI · Playfair Display (serif) para headings · Dorado como color de acento tipográfico
              </p>
            </div>

            {/* Jerarquía completa con contraste de color */}
            <div className="rounded-xl border border-border bg-card p-8 space-y-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Jerarquía tipográfica
              </p>

              {/* H1 — Playfair + dorado */}
              <div className="border-b border-border pb-5">
                <p className="text-xs text-muted-foreground mb-2">H1 · Display · Playfair Display 700 · Color dorado</p>
                <p style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: 38,
                  fontWeight: 700,
                  color: GOLD,
                  lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                }}>
                  Adventistas Central
                </p>
              </div>

              {/* H2 — Playfair + navy */}
              <div className="border-b border-border pb-5">
                <p className="text-xs text-muted-foreground mb-2">H2 · Section header · Playfair Display 600 · Color navy/primary</p>
                <p style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: 26,
                  fontWeight: 600,
                  color: isDark ? '#A8C4F0' : NAVY,
                  lineHeight: 1.25,
                }}>
                  Bienvenido al Sistema de Gestión
                </p>
              </div>

              {/* H3 — Lato + foreground */}
              <div className="border-b border-border pb-5">
                <p className="text-xs text-muted-foreground mb-2">H3 · Module title · Lato 700 · Foreground</p>
                <p className="text-2xl font-bold text-foreground">
                  Programas de Culto
                </p>
              </div>

              {/* H4 — Lato semibold + primary */}
              <div className="border-b border-border pb-5">
                <p className="text-xs text-muted-foreground mb-2">H4 · Subheading · Lato 600 · Primary con acento dorado</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-semibold text-foreground">Culto Sabático</p>
                  <span style={{ width: 32, height: 2, background: GOLD, display: 'inline-block', marginBottom: 2 }} />
                </div>
              </div>

              {/* Body */}
              <div className="border-b border-border pb-5 space-y-2">
                <p className="text-xs text-muted-foreground mb-2">Body · Lato 400/500 · Escala foreground → muted</p>
                <p className="text-base font-medium text-foreground">
                  Responsable: Pastor Juan González · Sábado 24 de mayo · 11:00 hrs
                </p>
                <p className="text-base text-foreground">
                  El culto divino incluye alabanza, lectura de la Biblia, oración pastoral y el sermón principal.
                </p>
                <p className="text-sm text-muted-foreground">
                  Última modificación: hace 2 horas · por Secretaria de Iglesia
                </p>
                <p className="text-xs text-muted-foreground">
                  ID: PRG-2024-0524 · Estado: Publicado
                </p>
              </div>

              {/* Contraste demostración */}
              <div>
                <p className="text-xs text-muted-foreground mb-3">Contraste de color — cómo se diferencian los niveles</p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: GOLD }} />
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 700, color: GOLD }}>
                      Display / Branding — Dorado {GOLD}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: isDark ? '#A8C4F0' : NAVY }} />
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 600, color: isDark ? '#A8C4F0' : NAVY }}>
                      Section header — {isDark ? 'Azul claro' : 'Navy'} {isDark ? '#A8C4F0' : NAVY}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-foreground" />
                    <span className="text-sm font-bold text-foreground">Título de módulo — Foreground</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-foreground opacity-70" />
                    <span className="text-sm text-foreground">Texto corrido — Foreground normal</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Texto secundario — Muted foreground</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground opacity-50" />
                    <span className="text-xs text-muted-foreground">Metadata / timestamps — Muted foreground xs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Escala de tamaño */}
            <div className="rounded-xl border border-border bg-card p-8">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
                Selector de tamaño de texto
              </p>
              <div className="grid grid-cols-3 divide-x divide-border">
                {(['small', 'medium', 'large'] as TextSize[]).map((s) => (
                  <div key={s} className="px-6 first:pl-0 last:pr-0 space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">{s}</p>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: s === 'small' ? 16 : s === 'medium' ? 20 : 25, fontWeight: 700, color: GOLD }}>
                      Cultos
                    </p>
                    <p style={{ fontSize: s === 'small' ? 13 : s === 'medium' ? 16 : 19 }} className="font-semibold text-foreground">
                      Programa del Sábado
                    </p>
                    <p style={{ fontSize: s === 'small' ? 11 : s === 'medium' ? 13 : 15 }} className="text-muted-foreground">
                      Sábado 09:45 · Escs. Sabática
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: COMPONENTS ────────────────────────────────── */}
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
                  {/* Primary — navy */}
                  <button style={{ background: isDark ? 'hsl(219,70%,60%)' : NAVY, color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Guardar programa
                  </button>
                  {/* Outline */}
                  <button style={{ background: 'transparent', color: isDark ? 'hsl(219,70%,60%)' : NAVY, border: `1.5px solid ${isDark ? 'hsl(219,70%,60%)' : NAVY}`, borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Cancelar
                  </button>
                  {/* Secondary — muted */}
                  <button style={{ background: isDark ? 'hsl(222,30%,16%)' : 'hsl(36,20%,93%)', color: isDark ? 'hsl(36,50%,95%)' : 'hsl(219,40%,12%)', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Ver detalle
                  </button>
                  {/* Destructive */}
                  <button style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Eliminar
                  </button>
                  {/* Ghost */}
                  <button style={{ background: 'transparent', color: isDark ? 'hsl(36,50%,95%)' : 'hsl(219,40%,12%)', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Editar
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {/* Primary sm */}
                  <button style={{ background: isDark ? 'hsl(219,70%,60%)' : NAVY, color: isDark ? 'hsl(222,47%,8%)' : '#FAFAFA', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Plus size={13} /> Nuevo evento
                  </button>
                  {/* Outline sm */}
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

              {/* Badges */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Badges de estado — mejorado light + dark
                </p>
                <div className="flex flex-wrap gap-3">
                  <StatusBadge label="Publicado" variant="published" />
                  <StatusBadge label="Borrador" variant="draft" />
                  <StatusBadge label="Archivado" variant="archived" />
                  <StatusBadge label="Pendiente" variant="pending" />
                  <StatusBadge label="Cancelado" variant="cancelled" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <StatusBadge label="Confirmado" variant="info" />
                  <StatusBadge label="Cancelado" variant="cancelled" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Fondo sólido de la paleta extendida + texto blanco
                </p>
              </div>

              {/* Card de evento con badge */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Card de evento</p>
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
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg p-2 shrink-0" style={{ background: isDark ? STATUS_COLORS.draft.dark : STATUS_COLORS.draft.light }}>
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">Escuela Sabática</h3>
                        <StatusBadge label="Borrador" variant="draft" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">Sábado 24 de mayo · 09:45 hrs</p>
                    </div>
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
                    <div
                      key={label}
                      className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                        active
                          ? 'bg-primary/10 text-primary font-semibold border-r-2 border-primary'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </div>
                  ))}
                  <div className="border-t border-border p-2 flex items-center justify-center gap-1">
                    {[Sun, Moon, Monitor].map((Icon, i) => (
                      <button
                        key={i}
                        className={`p-1.5 rounded-md transition-colors ${i === (isDark ? 1 : 0) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                      >
                        <Icon className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notificaciones */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Alertas — contraste corregido
                </p>
                <Alert
                  type="success"
                  title="Programa guardado"
                  body="Los cambios se han publicado correctamente."
                />
                <Alert
                  type="error"
                  title="Error al guardar"
                  body="No se pudo conectar con el servidor. Intenta nuevamente."
                />
                <Alert
                  type="info"
                  title="3 eventos pendientes"
                  body="Este sábado tienes eventos sin confirmar responsables."
                />
                <p className="text-xs text-muted-foreground">
                  Light: bg-*-50→100, text-*-800/900 · Dark: bg-*-900/20, text-*-200/300
                </p>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}
