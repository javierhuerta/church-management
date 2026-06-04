// auth.jsx — simple demo auth + shared editable-data store (localStorage)
const { createContext: createCtxA, useContext: useCtxA, useState: useStA, useEffect: useEfA, useMemo: useMeA, useCallback: useCbA } = React;

// ─────────────────────────────────────────────────────────
// Demo users. In producción esto vendría de un backend real.
// Estas credenciales se muestran en pantalla de login (modo demo).
const DEMO_USERS = [
  { user: 'pastor',   pass: 'iasd2026',  name: 'Pr. Daniel Cárcamo', role: 'Pastor' },
  { user: 'musica',   pass: 'coral123',  name: 'Marta Vidal',        role: 'Ministerio de Música' },
  { user: 'jovenes',  pass: 'jovenes23', name: 'Esteban Soto',       role: 'Ministerio Joven' },
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
    setSession({ user: u.user, name: u.name, role: u.role, since: Date.now() });
    return { ok: true };
  }, []);

  const logout = useCbA(() => setSession(null), []);

  return (
    <AuthCtx.Provider value={{ session, login, logout, demoUsers: DEMO_USERS }}>
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
  { id: 'ev-001', date: '2026-05-22', start: '19:30', title: 'Bienvenida del Sábado',           loc: 'Templo' },
  { id: 'ev-002', date: '2026-05-23', start: '09:30', title: 'Escuela Sabática y Culto Divino', loc: 'Templo', featured: true },
  { id: 'ev-003', date: '2026-05-27', start: '19:30', title: 'Reunión de Oración',              loc: 'Templo' },
  { id: 'ev-004', date: '2026-05-29', start: '19:30', title: 'Bienvenida del Sábado',           loc: 'Templo' },
  { id: 'ev-005', date: '2026-05-30', start: '11:00', title: 'Culto de Bautismo',               loc: 'Templo', featured: true },
  { id: 'ev-006', date: '2026-06-03', start: '19:30', title: 'Reunión de Oración',              loc: 'Templo' },
  { id: 'ev-007', date: '2026-06-06', start: '09:30', title: 'Escuela Sabática y Culto Divino', loc: 'Templo' },
  { id: 'ev-008', date: '2026-06-13', start: '09:30', title: 'Sábado de Familia',               loc: 'Templo', featured: true },
];

const DEFAULT_PROGRAM = {
  date: '2026-05-23',
  title: 'Culto Divino · Sábado 23 de mayo',
  preacher: 'Pr. Daniel Cárcamo',
  theme: 'No se preocupen por la vida',
  scripture: 'Mateo 6:25–34',
  items: [
    { id: 'p-1', t: '11:00', k: 'Apertura',     n: 'Llamado a la adoración',      d: 'Lectura responsiva del Salmo y himno de apertura.' },
    { id: 'p-2', t: '11:05', k: 'Oración',      n: 'Oración invocatoria',         d: 'Invocando la presencia del Espíritu Santo.' },
    { id: 'p-3', t: '11:10', k: 'Cantos',       n: 'Servicio de cantos',          d: 'Adoración congregacional dirigida por el ministerio de música.' },
    { id: 'p-4', t: '11:20', k: 'Ofrendas',     n: 'Diezmos y ofrendas',          d: 'Lectura sobre mayordomía y recolección.' },
    { id: 'p-5', t: '11:30', k: 'Lectura',      n: 'Lectura bíblica',             d: 'Mateo 6:25–34.' },
    { id: 'p-6', t: '11:35', k: 'Predicación',  n: 'No se preocupen por la vida', d: 'Mensaje del Pr. Daniel Cárcamo.', accent: true },
    { id: 'p-7', t: '12:05', k: 'Llamado',      n: 'Llamado y oración final',     d: 'Invitación, himno de cierre y bendición pastoral.' },
  ],
};

function loadLS(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function useStore() {
  const [events, setEvents] = useStA(() => loadLS('iasd_events', DEFAULT_EVENTS));
  const [program, setProgram] = useStA(() => loadLS('iasd_program', DEFAULT_PROGRAM));

  useEfA(() => { localStorage.setItem('iasd_events', JSON.stringify(events)); }, [events]);
  useEfA(() => { localStorage.setItem('iasd_program', JSON.stringify(program)); }, [program]);

  return { events, setEvents, program, setProgram,
           resetEvents: () => setEvents(DEFAULT_EVENTS),
           resetProgram: () => setProgram(DEFAULT_PROGRAM) };
}

// ─────────────────────────────────────────────────────────
// User badge for nav — shows initials when logged in, "Acceder" otherwise
function UserBadge({ setPage }) {
  const { session, logout } = useAuth();
  const [open, setOpen] = useStA(false);

  if (!session) {
    return (
      <button
        className="nav-link"
        onClick={() => setPage('acceso')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          border: '1px solid var(--line)', padding: '7px 14px', borderRadius: 999,
        }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.3" />
          <path d="M2.5 12c.6-2 2.4-3.2 4.5-3.2S10.9 10 11.5 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        Acceder
      </button>
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
            minWidth: 240, background: 'var(--bg)',
            border: '1px solid var(--line)', borderRadius: 12,
            boxShadow: 'var(--shadow-soft)', padding: 14, zIndex: 41,
          }}>
            <div className="mono" style={{
              fontSize: 10, color: 'var(--gold)', letterSpacing: '.14em', textTransform: 'uppercase'
            }}>Sesión activa</div>
            <div className="serif" style={{ fontSize: 18, fontWeight: 500, marginTop: 6 }}>
              {session.name}
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
              {session.role}
            </div>
            <hr style={{ border: 0, height: 1, background: 'var(--line-2)', margin: '14px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button className="nav-link" style={{ textAlign: 'left' }}
                onClick={() => { setOpen(false); setPage('programa'); }}>
                · Editar Programa del día
              </button>
              <button className="nav-link" style={{ textAlign: 'left' }}
                onClick={() => { setOpen(false); setPage('calendario'); }}>
                · Editar Calendario
              </button>
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

// ─────────────────────────────────────────────────────────
// LOGIN PAGE
function PageAcceso({ setPage }) {
  const { session, login, demoUsers } = useAuth();
  const [user, setUser] = useStA('');
  const [pass, setPass] = useStA('');
  const [err, setErr] = useStA(null);
  const [showDemo, setShowDemo] = useStA(false);

  useEfA(() => {
    if (session) setPage('programa');
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
                  Este es un prototipo. Usa cualquiera de estas credenciales para probar la edición:
                </p>
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {demoUsers.map(u => (
                    <div key={u.user} style={{
                      display: 'grid', gridTemplateColumns: '1fr auto', gap: 14,
                      padding: '10px 12px', background: 'var(--bg)',
                      border: '1px solid var(--line-2)', borderRadius: 8,
                      fontSize: 13, alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{u.role}</div>
                        <div className="mono" style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                          {u.user} · {u.pass}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setUser(u.user); setPass(u.pass); }}
                        className="mono"
                        style={{
                          background: 'transparent', border: '1px solid var(--line)',
                          borderRadius: 6, padding: '6px 10px', cursor: 'pointer',
                          fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
                          color: 'var(--fg)'
                        }}>
                        Usar
                      </button>
                    </div>
                  ))}
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

Object.assign(window, { AuthProvider, useAuth, UserBadge, PageAcceso, EditBanner, useStore });
