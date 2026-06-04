// auth.jsx — simple demo auth + shared editable-data store (localStorage)
const { createContext: createCtxA, useContext: useCtxA, useState: useStA, useEffect: useEfA, useMemo: useMeA, useCallback: useCbA } = React;

// ─── INTEGRACIÓN (no parte del export original) ───────────────────────────
// El acceso administrativo real vive en la SPA del admin, montada en /admin/.
// El "Acceder" del sitio público redirige ahí en lugar de la pantalla demo.
const ADMIN_URL = '/admin/';

// ─────────────────────────────────────────────────────────
// Demo users. En producción esto vendría de un backend real.
// Roles:
//   admin  → puede editar todo + gestionar usuarios y eliminar cualquier documento
//   editor → puede editar calendario, programa y subir documentos
//   viewer → solo puede ver documentos (login requerido)
const DEMO_USERS = [
  // — Admin
  { user: 'admin',        pass: 'admin2026',       name: 'Administrador',           role: 'Administrador',       level: 'admin'  },
  // — Editores (junta directiva)
  { user: 'ijaramillo',   pass: 'pastor2026',      name: 'Pr. Israel Jaramillo',    role: 'Pastor',              level: 'editor' },
  { user: 'rgarcia',      pass: 'secretaria2026',  name: 'Ruth García',             role: 'Secretaria',          level: 'editor' },
  { user: 'jleal',        pass: 'tesorero2026',    name: 'Jaime Leal',              role: 'Tesorero',            level: 'editor' },
  // — Líderes (acceso solo lectura al repositorio)
  { user: 'blafontant',   pass: 'diaconos2026',    name: 'Beergreen Lafontant',     role: 'Min. Diáconos',         level: 'viewer' },
  { user: 'ydiaz',        pass: 'diaconisas2026',  name: 'Yessica Díaz',            role: 'Min. Diaconisas',       level: 'viewer' },
  { user: 'imatamala',    pass: 'jovenes2026',     name: 'Ignacio Matamala',        role: 'Min. Jóvenes',          level: 'viewer' },
  { user: 'jhuerta',      pass: 'adolesc2026',     name: 'Javier Huerta',           role: 'Min. Adolescentes',     level: 'viewer' },
  { user: 'ahuerta',      pass: 'infantil2026',    name: 'Alejandra Huerta',        role: 'Min. Infantil',         level: 'viewer' },
  { user: 'lcarrasco',    pass: 'mujer2026',       name: 'Ljubiza Carrasco',        role: 'Min. Mujer',            level: 'viewer' },
  { user: 'lcare',        pass: 'musica2026',      name: 'Luis Care',               role: 'Min. Música',           level: 'viewer' },
  { user: 'jcid',         pass: 'familia2026',     name: 'Javier Cid',              role: 'Min. Familia',          level: 'viewer' },
  { user: 'acare',        pass: 'comunic2026',     name: 'Alejandro Care',          role: 'Min. Comunicaciones',   level: 'viewer' },
  { user: 'gjaramillo',   pass: 'personal2026',    name: 'Glen Jaramillo',          role: 'Min. Personal',         level: 'viewer' },
  { user: 'pnavarrete',   pass: 'publi2026',       name: 'Palmenia Navarrete',      role: 'Min. Publicaciones',    level: 'viewer' },
  { user: 'projel',       pass: 'posib2026',       name: 'Paulina Rojel',           role: 'Min. Posibilidades',    level: 'viewer' },
  { user: 'jlopez',       pass: 'salud2026',       name: 'Jaime López',             role: 'Min. Salud',            level: 'viewer' },
  { user: 'fcobos',       pass: 'mayor2026',       name: 'Felipe Cobos',            role: 'Min. Mayordomía',       level: 'viewer' },
  { user: 'lcontreras',   pass: 'asa2026',         name: 'Luis Contreras',          role: 'Min. ASA',              level: 'viewer' },
  { user: 'anavarro',     pass: 'escsab2026',      name: 'Alejandra Navarro',       role: 'Min. Escuela Sabática', level: 'viewer' },
];

const AuthCtx = createCtxA(null);

function AuthProvider({ children }) {
  const [session, setSession] = useStA(() => {
    try { return JSON.parse(localStorage.getItem('iasd_session') || 'null'); }
    catch { return null; }
  });

  useEfA(() => {
    if (session) localStorage.setItem('iasd_session', JSON.stringify(session));
    else localStorage.removeItem('iasd_session');
  }, [session]);

  const login = useCbA((user, pass) => {
    const u = DEMO_USERS.find(x => x.user === user.trim().toLowerCase() && x.pass === pass);
    if (!u) return { ok: false, error: 'Usuario o contraseña incorrectos.' };
    setSession({ user: u.user, name: u.name, role: u.role, level: u.level, since: Date.now() });
    return { ok: true };
  }, []);

  const logout = useCbA(() => setSession(null), []);

  // Permission helpers
  const can = useCbA((action) => {
    if (!session) return false;
    const lvl = session.level;
    if (action === 'edit')      return lvl === 'admin' || lvl === 'editor';
    if (action === 'admin')     return lvl === 'admin';
    if (action === 'viewDocs')  return true; // any logged-in user
    if (action === 'uploadDocs') return lvl === 'admin' || lvl === 'editor';
    if (action === 'deleteDocs') return lvl === 'admin' || lvl === 'editor';
    return false;
  }, [session]);

  return (
    <AuthCtx.Provider value={{ session, login, logout, can, demoUsers: DEMO_USERS }}>
      {children}
    </AuthCtx.Provider>
  );
}

function useAuth() {
  return useCtxA(AuthCtx);
}

// ─────────────────────────────────────────────────────────
// Editable data store — persists user edits to calendar + program of the day.
// We seed with defaults if nothing in localStorage yet.

const DEFAULT_EVENTS = [
  // ─────── Programa semanal regular (mayo–junio 2026) ───────
  { id: 'ev-101', date: '2026-05-23', start: '09:45', title: 'Escuela Sabática',           loc: 'Templo' },
  { id: 'ev-102', date: '2026-05-23', start: '11:00', title: 'Culto Divino',               loc: 'Templo', featured: true },
  { id: 'ev-103', date: '2026-05-23', start: '17:00', title: 'Culto Joven',                loc: 'Templo' },
  { id: 'ev-104', date: '2026-05-27', start: '06:00', title: 'Culto de Oración Matutino', loc: 'Vía Zoom' },
  { id: 'ev-105', date: '2026-05-27', start: '19:30', title: 'Culto de Oración',           loc: 'Templo' },
  { id: 'ev-106', date: '2026-05-30', start: '09:45', title: 'Escuela Sabática',           loc: 'Templo' },
  { id: 'ev-107', date: '2026-05-30', start: '11:00', title: 'Culto Divino',               loc: 'Templo' },
  { id: 'ev-108', date: '2026-05-30', start: '17:00', title: 'Culto Joven',                loc: 'Templo' },
  { id: 'ev-109', date: '2026-06-03', start: '06:00', title: 'Culto de Oración Matutino', loc: 'Vía Zoom' },
  { id: 'ev-110', date: '2026-06-03', start: '19:30', title: 'Culto de Oración',           loc: 'Templo' },
  { id: 'ev-111', date: '2026-06-06', start: '09:45', title: 'Escuela Sabática',           loc: 'Templo' },
  { id: 'ev-112', date: '2026-06-06', start: '11:00', title: 'Culto Divino',               loc: 'Templo' },
  { id: 'ev-113', date: '2026-06-06', start: '17:00', title: 'Culto Joven',                loc: 'Templo' },

  // ─────── Calendario de actividades · mayo–junio 2026 ───────
  // Abril (cierre)
  { id: 'ev-201', date: '2026-04-24', start: '18:00', title: 'Grupo Pequeño GTeen',                          loc: 'Templo · Devora Aranda, Javier Huerta' },
  { id: 'ev-202', date: '2026-04-25', start: '09:00', title: 'Capacitación Nuevo Tiempo',                    loc: 'Templo · ASACH' },
  { id: 'ev-203', date: '2026-04-30', start: '15:00', title: 'Grupo Pequeño Ministerio Infantil',             loc: 'Templo' },
  // Mayo
  { id: 'ev-204', date: '2026-05-01', start: '18:00', title: 'Grupo Pequeño GTeen',                          loc: 'Templo · Javier Huerta, Devora Aranda' },
  { id: 'ev-205', date: '2026-05-02', start: '10:00', title: 'Sábado Misionero',                              loc: 'Osorno · MIPES', featured: true },
  { id: 'ev-206', date: '2026-05-03', start: '10:00', title: 'Mañana Deportiva — Hogar y Familia',           loc: 'Colegio' },
  { id: 'ev-207', date: '2026-05-04', start: '18:30', title: 'Escuela para Padres — Colegio',                loc: 'Templo' },
  { id: 'ev-208', date: '2026-05-05', start: '18:30', title: 'Escuela para Padres — Colegio',                loc: 'Templo' },
  { id: 'ev-209', date: '2026-05-06', start: '18:00', title: 'Encuentro Universitario',                       loc: 'Templo · JA' },
  { id: 'ev-210', date: '2026-05-07', start: '15:00', title: 'Grupo Pequeño Ministerio Infantil',             loc: 'Templo · Alejandra Huerta' },
  { id: 'ev-211', date: '2026-05-07', start: '18:30', title: 'Escuela para Padres — Colegio',                loc: 'Templo' },
  { id: 'ev-212', date: '2026-05-08', start: '18:00', title: 'Grupo Pequeño GTeen',                          loc: 'Templo' },
  { id: 'ev-213', date: '2026-05-10', start: '10:00', title: 'Voleibol GTeen',                                loc: 'Colegio' },
  { id: 'ev-214', date: '2026-05-13', start: '19:00', title: 'Culto de Poder — Mayo 2026',                    loc: 'Templo · GTeen', featured: true },
  { id: 'ev-215', date: '2026-05-15', start: '18:00', title: 'Grupo Pequeño GTeen',                          loc: 'Templo' },
  { id: 'ev-216', date: '2026-05-16', start: '10:00', title: 'Día del Niño Adventista y del Aventurero',     loc: 'Templo · JA', featured: true },
  { id: 'ev-217', date: '2026-05-22', start: '18:00', title: 'Grupo Pequeño GTeen',                          loc: 'Templo · Javier Huerta' },
  { id: 'ev-218', date: '2026-05-26', start: '18:30', title: 'Escuela para Padres — Colegio',                loc: 'Templo' },
  { id: 'ev-219', date: '2026-05-28', start: '15:00', title: 'Grupo Pequeño Ministerio Infantil',             loc: 'Templo' },
  { id: 'ev-220', date: '2026-05-28', start: '18:30', title: 'Escuela para Padres — Colegio',                loc: 'Templo' },
  { id: 'ev-221', date: '2026-05-29', start: '18:00', title: 'Grupo Pequeño GTeen',                          loc: 'Templo' },
  { id: 'ev-222', date: '2026-05-30', start: '10:00', title: 'Sábado de la Acogida ADRA',                     loc: 'Templo · ADRA', featured: true },
  // Junio
  { id: 'ev-223', date: '2026-06-04', start: '15:00', title: 'Grupo Pequeño Ministerio Infantil',             loc: 'Templo' },
  { id: 'ev-224', date: '2026-06-05', start: '18:00', title: 'Grupo Pequeño GTeen',                          loc: 'Templo' },
  { id: 'ev-225', date: '2026-06-06', start: '10:00', title: 'Sábado Misionero de la Mujer Adventista',      loc: 'Templo · Mujer', featured: true },
  { id: 'ev-226', date: '2026-06-07', start: '10:00', title: 'Comparte tu Pan — Hospital',                    loc: 'Hospital de Osorno · GTeen' },
  { id: 'ev-227', date: '2026-06-13', start: '11:00', title: 'Sábado de Familia',                             loc: 'Templo', featured: true },
];

const DEFAULT_PROGRAM = {
  date: '2026-05-23',
  title: 'Culto Divino · Sábado 23 de mayo',
  preacher: 'Pr. Daniel Cárcamo',
  theme: 'No se preocupen por la vida',
  scripture: 'Mateo 6:25–34',
  // Estructura: a = anuncia (responsable); n = parte del programa; d = detalle (himno, video, etc.)
  items: [
    { id: 'p-01', a: '',                n: 'Doxología',          d: 'Himno N° 61 — Santo, Santo, Santo' },
    { id: 'p-02', a: 'Predicador (a)',  n: 'Oración de invocación', d: 'Predicador (a)' },
    { id: 'p-03', a: '',                n: 'Himno',              d: 'Himno N° 341 — Más cerca del hogar' },
    { id: 'p-04', a: '',                n: 'Parte musical',      d: '' },
    { id: 'p-05', a: '',                n: 'Adoración infantil', d: '' },
    { id: 'p-06', a: '',                n: 'Diezmos y ofrendas', d: 'Video «Probad y Ved» · Himno N° 55 — Grande Señor es Tu misericordia' },
    { id: 'p-07', a: '',                n: 'Himno tema 1',       d: '' },
    { id: 'p-08', a: '',                n: 'Lectura bíblica',    d: '' },
    { id: 'p-09', a: '',                n: 'Oración intercesora', d: 'Himno N° 431 — A Él mis problemas le doy' },
    { id: 'p-10', a: '',                n: 'Sermón',             d: 'Predicador', accent: true },
    { id: 'p-11', a: '',                n: 'Himno tema 2',       d: '' },
    { id: 'p-12', a: 'Predicador (a)',  n: 'Oración final',      d: 'Predicador (a)' },
    { id: 'p-13', a: '',                n: 'Himno de salida',    d: 'Himno N° 181 — Oh qué esperanza' },
  ],
};

const DEFAULT_DOCS = [
  { id: 'd-001', title: 'Acta de Junta · 12 abril 2026',  category: 'Actas de Junta',
    uploader: 'Ruth García', uploadedAt: '2026-04-13T20:00', sizeKB: 184, fileType: 'application/pdf', dataUrl: null },
  { id: 'd-002', title: 'Acta de Junta · 8 marzo 2026',   category: 'Actas de Junta',
    uploader: 'Ruth García', uploadedAt: '2026-03-09T19:00', sizeKB: 162, fileType: 'application/pdf', dataUrl: null },
  { id: 'd-003', title: 'Presupuesto 2026',                category: 'Tesorería',
    uploader: 'Jaime Leal', uploadedAt: '2026-01-20T18:00', sizeKB: 96, fileType: 'application/pdf', dataUrl: null },
  { id: 'd-004', title: 'Plan anual de ministerios 2026', category: 'Planes y Programas',
    uploader: 'Pr. Israel Jaramillo', uploadedAt: '2026-02-05T18:30', sizeKB: 220, fileType: 'application/pdf', dataUrl: null },
  { id: 'd-005', title: 'Reglamento interno · vigente',    category: 'Reglamentos',
    uploader: 'Administrador', uploadedAt: '2025-12-15T11:00', sizeKB: 304, fileType: 'application/pdf', dataUrl: null },
];

function loadLS(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function useStore() {
  const [events, setEvents] = useStA(() => loadLS('iasd_events_v3', DEFAULT_EVENTS));
  const [program, setProgram] = useStA(() => loadLS('iasd_program_v2', DEFAULT_PROGRAM));
  const [docs, setDocs] = useStA(() => loadLS('iasd_docs_v1', DEFAULT_DOCS));

  useEfA(() => { localStorage.setItem('iasd_events_v3', JSON.stringify(events)); }, [events]);

  // ─── INTEGRACIÓN: calendario en vivo desde la API del backend ───────────
  // Reemplaza los eventos demo por los publicados reales. Si la API falla
  // (offline/error) se conservan los datos en caché/DEFAULT como fallback.
  useEfA(() => {
    if (!(window.IASD_API && window.IASD_API.fetchEvents)) return;
    let cancelled = false;
    window.IASD_API.fetchEvents()
      .then((live) => { if (!cancelled && Array.isArray(live)) setEvents(live); })
      .catch((e) => console.warn('No se pudieron cargar eventos en vivo:', e));
    return () => { cancelled = true; };
  }, []);

  useEfA(() => { localStorage.setItem('iasd_program_v2', JSON.stringify(program)); }, [program]);
  useEfA(() => {
    try { localStorage.setItem('iasd_docs_v1', JSON.stringify(docs)); }
    catch (e) { console.warn('No se pudo guardar documentos (storage lleno):', e); }
  }, [docs]);

  return { events, setEvents, program, setProgram, docs, setDocs,
           resetEvents: () => setEvents(DEFAULT_EVENTS),
           resetProgram: () => setProgram(DEFAULT_PROGRAM),
           resetDocs: () => setDocs(DEFAULT_DOCS) };
}

// ─────────────────────────────────────────────────────────
// User badge for nav — shows initials when logged in, "Acceder" otherwise
function UserBadge({ setPage }) {
  const { session, logout } = useAuth();
  const [open, setOpen] = useStA(false);

  if (!session) {
    return (
      <a
        className="nav-link"
        href={ADMIN_URL}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          border: '1px solid var(--line)', padding: '7px 14px', borderRadius: 999,
          textDecoration: 'none',
        }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.3" />
          <path d="M2.5 12c.6-2 2.4-3.2 4.5-3.2S10.9 10 11.5 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        Acceder
      </a>
    );
  }

  const initials = session.name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer',
        border: '1px solid var(--line)', background: 'transparent',
        padding: '6px 12px 6px 6px', borderRadius: 999,
        font: 'inherit', color: 'var(--fg)',
      }}>
        <span style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--gold)', color: 'var(--navy)',
          fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--mono)',
        }}>{initials}</span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{session.name.split(' ').slice(-1)[0]}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{
            position: 'fixed', inset: 0, zIndex: 40
          }} />
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            minWidth: 260, background: 'var(--bg)',
            border: '1px solid var(--line)', borderRadius: 12,
            boxShadow: 'var(--shadow-soft)', padding: 14, zIndex: 41,
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: levelBg(session.level),
              color: levelFg(session.level),
              padding: '3px 9px', borderRadius: 999,
              fontSize: 9.5, fontWeight: 700, fontFamily: 'var(--mono)',
              letterSpacing: '.12em', textTransform: 'uppercase',
            }}>
              {levelLabel(session.level)}
            </div>
            <div className="serif" style={{ fontSize: 18, fontWeight: 500, marginTop: 10 }}>
              {session.name}
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
              {session.role}
            </div>
            <hr style={{ border: 0, height: 1, background: 'var(--line-2)', margin: '14px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button className="nav-link" style={{ textAlign: 'left' }}
                onClick={() => { setOpen(false); setPage('documentos'); }}>
                · Repositorio de documentos
              </button>
              {(session.level === 'admin' || session.level === 'editor') && (
                <>
                  <button className="nav-link" style={{ textAlign: 'left' }}
                    onClick={() => { setOpen(false); setPage('programa'); }}>
                    · Editar Programa del día
                  </button>
                  <button className="nav-link" style={{ textAlign: 'left' }}
                    onClick={() => { setOpen(false); setPage('calendario'); }}>
                    · Editar Calendario
                  </button>
                </>
              )}
            </div>
            <hr style={{ border: 0, height: 1, background: 'var(--line-2)', margin: '14px 0' }} />
            <button className="nav-link" style={{ textAlign: 'left', color: 'var(--muted)' }}
              onClick={() => { logout(); setOpen(false); }}>
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Level visual helpers
function levelLabel(lvl) {
  return lvl === 'admin' ? 'Administrador'
       : lvl === 'editor' ? 'Editor'
       : 'Líder';
}
function levelBg(lvl) {
  return lvl === 'admin' ? 'var(--navy)'
       : lvl === 'editor' ? 'color-mix(in oklab, var(--gold) 22%, var(--bg))'
       : 'var(--surface)';
}
function levelFg(lvl) {
  return lvl === 'admin' ? 'var(--cream)'
       : lvl === 'editor' ? 'var(--navy)'
       : 'var(--muted)';
}

// ─────────────────────────────────────────────────────────
// LOGIN PAGE
function PageAcceso({ setPage }) {
  const { session, login, demoUsers } = useAuth();
  const [user, setUser] = useStA('');
  const [pass, setPass] = useStA('');
  const [err, setErr] = useStA(null);
  const [showDemo, setShowDemo] = useStA(false);

  useEfA(() => {
    if (session) setPage('documentos');
    // eslint-disable-next-line
  }, [session]);

  const submit = (e) => {
    e.preventDefault();
    setErr(null);
    const r = login(user, pass);
    if (!r.ok) setErr(r.error);
  };

  return (
    <main className="page-enter" data-screen-label="Acceso">
      <section className="section">
        <div className="container" style={{ maxWidth: 520 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="kicker">Área privada</div>
            <h1 className="serif" style={{
              fontSize: 'clamp(36px, 5vw, 56px)', marginTop: 16, lineHeight: 1.02
            }}>
              Acceso para
              <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}> equipo</span>
            </h1>
            <p className="muted" style={{ marginTop: 16, fontSize: 15 }}>
              Para pastores, ancianos y ministerios autorizados a publicar contenido.
            </p>
          </div>

          <form onSubmit={submit} className="card" style={{ padding: 28 }}>
            <label className="eyebrow" style={{ display: 'block', marginBottom: 8 }}>Usuario</label>
            <input
              type="text"
              value={user}
              onChange={e => setUser(e.target.value)}
              autoComplete="username"
              autoFocus
              style={inputStyle} />

            <label className="eyebrow" style={{ display: 'block', marginTop: 18, marginBottom: 8 }}>
              Contraseña
            </label>
            <input
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              autoComplete="current-password"
              style={inputStyle} />

            {err && (
              <div style={{
                marginTop: 16, padding: '10px 14px',
                background: 'color-mix(in oklab, #E25C5C 14%, transparent)',
                border: '1px solid color-mix(in oklab, #E25C5C 30%, transparent)',
                borderRadius: 8, fontSize: 13, color: '#9c2b2b'
              }}>{err}</div>
            )}

            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 22 }}>
              Iniciar sesión
            </button>
          </form>

          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <button
              onClick={() => setShowDemo(v => !v)}
              className="mono"
              style={{
                background: 'transparent', border: 0, cursor: 'pointer',
                color: 'var(--muted)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase'
              }}>
              {showDemo ? '↑ Ocultar credenciales demo' : '↓ Ver credenciales demo'}
            </button>
            {showDemo && (
              <div style={{
                marginTop: 14, padding: 18, border: '1px dashed var(--line)',
                borderRadius: 12, background: 'var(--surface)',
                textAlign: 'left'
              }}>
                <div className="mono" style={{ fontSize: 11, color: 'var(--gold)',
                  letterSpacing: '.14em', textTransform: 'uppercase' }}>
                  Modo demostración
                </div>
                <p className="muted" style={{ fontSize: 13, marginTop: 8, lineHeight: 1.55 }}>
                  Este es un prototipo. Algunos accesos de prueba:
                </p>
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {['admin', 'editor', 'viewer'].map(lvl => {
                    const usersForLvl = demoUsers.filter(u => u.level === lvl);
                    if (!usersForLvl.length) return null;
                    return (
                      <div key={lvl}>
                        <div style={{
                          display: 'inline-flex', gap: 8, alignItems: 'center',
                          marginBottom: 8,
                        }}>
                          <span className="mono" style={{
                            fontSize: 9.5, fontWeight: 700, letterSpacing: '.14em',
                            textTransform: 'uppercase',
                            background: levelBg(lvl), color: levelFg(lvl),
                            padding: '3px 9px', borderRadius: 999,
                          }}>{levelLabel(lvl)}</span>
                          <span className="muted" style={{ fontSize: 11.5 }}>
                            {lvl === 'admin'  && 'Derechos extendidos · gestiona todo'}
                            {lvl === 'editor' && 'Edita calendario · programa · documentos'}
                            {lvl === 'viewer' && 'Solo lectura · acceso al repositorio'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {usersForLvl.slice(0, lvl === 'viewer' ? 3 : 10).map(u => (
                            <div key={u.user} style={{
                              display: 'grid', gridTemplateColumns: '1fr auto', gap: 14,
                              padding: '8px 12px', background: 'var(--bg)',
                              border: '1px solid var(--line-2)', borderRadius: 8,
                              fontSize: 12.5, alignItems: 'center'
                            }}>
                              <div>
                                <div style={{ fontWeight: 500 }}>{u.name}</div>
                                <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                                  {u.user} · {u.pass}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => { setUser(u.user); setPass(u.pass); }}
                                className="mono"
                                style={{
                                  background: 'transparent', border: '1px solid var(--line)',
                                  borderRadius: 6, padding: '5px 9px', cursor: 'pointer',
                                  fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase',
                                  color: 'var(--fg)'
                                }}>
                                Usar
                              </button>
                            </div>
                          ))}
                          {lvl === 'viewer' && usersForLvl.length > 3 && (
                            <div className="muted" style={{ fontSize: 11.5, paddingLeft: 4, marginTop: 2 }}>
                              + {usersForLvl.length - 3} líderes de ministerio adicionales
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  background: 'var(--bg)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  fontSize: 15,
  fontFamily: 'var(--sans)',
  color: 'var(--fg)',
  outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
};

// ─────────────────────────────────────────────────────────
// Edit-mode banner (shown to logged-in users on editable pages)
function EditBanner({ scope, onAdd, onReset }) {
  const { session } = useAuth();
  if (!session) return null;
  return (
    <div style={{
      background: 'color-mix(in oklab, var(--gold) 14%, var(--bg))',
      border: '1px solid color-mix(in oklab, var(--gold) 40%, transparent)',
      borderRadius: 12,
      padding: '14px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 18, marginBottom: 36, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          width: 8, height: 8, borderRadius: 4, background: 'var(--gold)',
          flexShrink: 0
        }} />
        <div>
          <div className="mono" style={{
            fontSize: 10.5, letterSpacing: '.14em', color: 'var(--gold)',
            textTransform: 'uppercase', fontWeight: 600
          }}>Modo edición</div>
          <div style={{ fontSize: 13.5, marginTop: 2 }}>
            Estás editando {scope} como <strong>{session.name}</strong>. Los cambios se guardan automáticamente.
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {onAdd && (
          <button onClick={onAdd} className="btn btn-gold" style={{ padding: '10px 16px', fontSize: 13 }}>
            + Añadir
          </button>
        )}
        {onReset && (
          <button onClick={onReset} className="btn btn-ghost" style={{ padding: '10px 16px', fontSize: 13 }}>
            Restaurar
          </button>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { AuthProvider, useAuth, UserBadge, PageAcceso, EditBanner, useStore, levelLabel, levelBg, levelFg });
