// pages-4.jsx — Programa del día (público solo lectura) y Calendario editable
const { useState: useS4, useMemo: useM4, useEffect: useE4 } = React;

// ═════════════════════════════════════════════════════════
// PROGRAMA DEL DÍA — público solo lectura
// ═════════════════════════════════════════════════════════
function PagePrograma() {
  const DEFAULT_PROGRAM = {
    date: null,
    upcoming: false,
    title: 'Culto Divino',
    preacher: null,
    theme: null,
    scripture: null,
    items: [
      { id: 'fallback-1', a: '', n: 'Doxología', d: 'Himno N° 61 — Santo, Santo, Santo', accent: false },
      { id: 'fallback-2', a: 'Predicador (a)', n: 'Oración de invocación', d: 'Predicador (a)', accent: false },
      { id: 'fallback-3', a: '', n: 'Himno', d: 'Himno N° 341 — Más cerca del hogar', accent: false },
      { id: 'fallback-4', a: '', n: 'Parte musical', d: '', accent: false },
      { id: 'fallback-5', a: '', n: 'Adoración infantil', d: '', accent: false },
      { id: 'fallback-6', a: '', n: 'Diezmos y ofrendas', d: 'Video «Probad y Ved» · Himno N° 55 — Grande Señor es Tu misericordia', accent: false },
      { id: 'fallback-7', a: '', n: 'Himno tema 1', d: '', accent: false },
      { id: 'fallback-8', a: '', n: 'Lectura bíblica', d: '', accent: false },
      { id: 'fallback-9', a: '', n: 'Oración intercesora', d: 'Himno N° 431 — A Él mis problemas le doy', accent: false },
      { id: 'fallback-10', a: '', n: 'Sermón', d: 'Predicador', accent: true },
      { id: 'fallback-11', a: '', n: 'Himno tema 2', d: '', accent: false },
      { id: 'fallback-12', a: 'Predicador (a)', n: 'Oración final', d: 'Predicador (a)', accent: false },
      { id: 'fallback-13', a: '', n: 'Himno de salida', d: 'Himno N° 181 — Oh qué esperanza', accent: false },
    ],
  };

  const [program, setProgram] = useS4(DEFAULT_PROGRAM);
  const [isPrinting, setIsPrinting] = useS4(false);

  function normalizeWorshipData(data) {
    return {
      upcoming: !!(data && data.upcoming),
      date: (data && data.date) || null,
      title: (data && data.title) || DEFAULT_PROGRAM.title,
      preacher: (data && data.preacher) || null,
      theme: (data && data.theme) || null,
      scripture: (data && data.scripture) || null,
      items: data && Array.isArray(data.items) && data.items.length > 0
        ? data.items
        : DEFAULT_PROGRAM.items,
    };
  }

  useE4(() => {
    if (!(window.IASD_API && window.IASD_API.fetchWorship)) return;
    var cancelled = false;
    window.IASD_API.fetchWorship()
      .then(function (data) {
        if (cancelled || !data) return;
        setProgram(normalizeWorshipData(data));
      })
      .catch(function () {
        if (!cancelled) setProgram(DEFAULT_PROGRAM);
      });
    return function () { cancelled = true; };
  }, []);

  var hasPublishedHeader = !!program.upcoming;
  var displayTitle = buildProgramDisplayTitle(program.title, program.date);

  async function handlePrintProgram() {
    if (isPrinting) return;
    setIsPrinting(true);
    try {
      if (window.IASD_API && window.IASD_API.fetchWorship) {
        var fresh = await window.IASD_API.fetchWorship();
        if (fresh) {
          var snapshot = normalizeWorshipData(fresh);
          setProgram(snapshot);
          printProgram(snapshot);
          return;
        }
      }
      printProgram(program);
    } catch (_e) {
      printProgram(program);
    } finally {
      setIsPrinting(false);
    }
  }

  return (
    <main className="page-enter" data-screen-label="Programa del día">
      <section className="section">
        <div className="container">
          <ToolbarBar onPrint={handlePrintProgram} printing={isPrinting} />

          {!program.upcoming && (
            <div className="card" style={{
              marginBottom: 20,
              padding: '12px 16px',
              border: '1px solid color-mix(in oklab, var(--gold) 35%, var(--line))',
              background: 'color-mix(in oklab, var(--gold) 10%, var(--surface))',
            }}>
              <div className="mono" style={{
                fontSize: 10,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                fontWeight: 700,
              }}>
                Programa aún no publicado
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                Te mostramos la plantilla base del culto de sábado a las 11:00.
              </p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="kicker">Programa del día</div>
            <h1 className="serif" style={{
              fontSize: 'clamp(40px, 6vw, 76px)', marginTop: 18, lineHeight: 1.02,
              maxWidth: 820, margin: '18px auto 0'
            }}>
              {displayTitle}
            </h1>
            <div style={{
              marginTop: 22, display: 'inline-flex', gap: 28, flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <Meta label="Predicador" value={program.preacher}
                muted={!hasPublishedHeader} />
              <Meta label="Tema" value={program.theme}
                muted={!hasPublishedHeader} />
              <Meta label="Pasaje" value={program.scripture}
                muted={!hasPublishedHeader} />
            </div>
          </div>

          {/* Tabla: ANUNCIA · PROGRAMA · DETALLE */}
          <div style={{
            maxWidth: 1040, margin: '0 auto',
            border: '1px solid var(--line)',
            borderRadius: 14,
            overflow: 'hidden',
            background: 'var(--bg)',
          }}>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '200px 1fr 1.6fr',
              background: 'var(--navy)',
              color: 'var(--cream)',
            }}>
              <ProgHeader>Anuncia</ProgHeader>
              <ProgHeader>Programa</ProgHeader>
              <ProgHeader>Detalle</ProgHeader>
            </div>
            {/* Rows */}
            {program.items.map((p, i) => (
              <div key={p.id} style={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr 1.6fr',
                borderTop: i === 0 ? 0 : '1px solid var(--line)',
                background: p.accent
                  ? 'color-mix(in oklab, var(--gold) 12%, var(--bg))'
                  : (i % 2 === 1 ? 'var(--surface)' : 'var(--bg)'),
                alignItems: 'stretch',
              }} className="prog-row">
                {/* Anuncia */}
                <ProgCell>
                  <span style={{
                    fontSize: 12.5, fontWeight: 700, fontFamily: 'var(--mono)',
                    textTransform: 'uppercase', letterSpacing: '.08em',
                    color: 'var(--navy)',
                  }}>{p.a || ''}</span>
                </ProgCell>
                {/* Programa */}
                <ProgCell>
                  <span style={{
                    fontSize: 14.5, fontWeight: p.accent ? 700 : 500,
                    textTransform: 'uppercase', letterSpacing: '.05em',
                    color: p.accent ? 'var(--gold)' : 'var(--fg)',
                  }}>{p.n}</span>
                </ProgCell>
                {/* Detalle */}
                <ProgCell>
                  {p.d
                    ? <span style={{ fontSize: 14, lineHeight: 1.5,
                        color: 'var(--fg)' }}
                        dangerouslySetInnerHTML={{ __html: formatDetail(p.d) }} />
                    : <span style={{ color: 'var(--muted)' }}>—</span>}
                </ProgCell>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <p className="muted" style={{ fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
              «Adorad a Jehová en la hermosura de la santidad.»
            </p>
            <div className="mono" style={{
              marginTop: 12, fontSize: 11, color: 'var(--gold)', letterSpacing: '.16em'
            }}>
              SALMO 96:9
            </div>
            {!program.upcoming && (
              <p className="muted" style={{ marginTop: 10, fontSize: 12 }}>
                Se actualizará automáticamente cuando el programa del sábado sea publicado.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

// Render helpers for the program table
function ProgHeader({ children }) {
  return (
    <div className="mono" style={{
      padding: '14px 20px',
      fontSize: 11, letterSpacing: '.16em',
      textTransform: 'uppercase', fontWeight: 700,
      color: 'var(--cream)',
      borderRight: '1px solid color-mix(in oklab, var(--cream) 12%, var(--navy))',
    }}>{children}</div>
  );
}

function ProgCell({ children }) {
  return (
    <div style={{
      padding: '16px 20px',
      borderRight: '1px solid var(--line)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>{children}</div>
  );
}

// Linkify "Himno N° X" references to nuevohimnario.com (with the title that follows it)
function formatDetail(text) {
  if (!text) return '';
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  // Pattern: "Himno N° X" or "Himno No X", optionally followed by "— Title"
  return escaped.replace(
    /(Himno\s*N[°o]?\s*)(\d{1,3})(\s*[—–-]\s*[^·\n<]+)?/gi,
    (match, _prefix, num) => {
      const safeMatch = match.trim();
      return `<a href="https://www.nuevohimnario.com/Himno?no=${num}" target="_blank" rel="noopener noreferrer" class="hymn-link" title="Ver letra del himno ${num} en nuevohimnario.com">${safeMatch}</a>`;
    }
  );
}

function buildProgramDisplayTitle(title, dateStr) {
  var baseTitle = title || 'Culto Divino';
  var date = parseProgramDate(dateStr);
  if (Number.isNaN(date.getTime())) return baseTitle;

  var dateLabel = date.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Evita duplicar la fecha si el título ya la incluye.
  var compactTitle = baseTitle.toLowerCase();
  if (compactTitle.includes(dateLabel.toLowerCase())) return baseTitle;

  var prefixedDate = 'sabado ' + dateLabel.replace(/^\w+\s*/, '').toLowerCase();
  if (compactTitle.includes(prefixedDate)) return baseTitle;

  return baseTitle + ' · ' + capitalizeFirst(dateLabel);
}

function resolveProgramDateLabel(dateStr) {
  var date = parseProgramDate(dateStr);
  if (Number.isNaN(date.getTime())) return null;
  return capitalizeFirst(date.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }));
}

function parseProgramDate(dateInput) {
  if (!dateInput) return new Date('invalid');

  if (dateInput instanceof Date) {
    return new Date(dateInput.getTime());
  }

  var raw = String(dateInput).trim();
  if (!raw) return new Date('invalid');

  // Prioriza YYYY-MM-DD para evitar desplazamientos por zona horaria.
  var isoMatch = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    var y = Number(isoMatch[1]);
    var m = Number(isoMatch[2]);
    var d = Number(isoMatch[3]);
    return new Date(y, m - 1, d, 12, 0, 0);
  }

  return new Date(raw);
}

function capitalizeFirst(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function Meta({ label, value, muted }) {
  return (
    <div style={{ textAlign: 'left', minWidth: 180 }}>
      <div className="mono" style={{
        fontSize: 10, letterSpacing: '.14em', color: 'var(--muted)',
        textTransform: 'uppercase', marginBottom: 6, fontWeight: 600
      }}>{label}</div>
      <div style={{
        fontSize: 15,
        fontWeight: 500,
        color: muted && !value ? 'var(--muted)' : 'var(--fg)',
      }}>{value || '—'}</div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// CALENDARIO EDITABLE — con toggle de vista Lista / Mes
// ═════════════════════════════════════════════════════════
const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const WEEK_DAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

function toISO(y, m, d) {
  return y + '-' + String(m + 1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
}

function PageCalendarioEditable({ store }) {
  const { session, can } = useAuth();
  const { events, setEvents, resetEvents } = store;
  const isEditor = can && can('edit');

  // View toggle persisted across navigations
  const [view, setView] = useS4(() => {
    return localStorage.getItem('iasd_cal_view') || 'lista';
  });
  React.useEffect(() => { localStorage.setItem('iasd_cal_view', view); }, [view]);

  // Default to first event's month (or today)
  const initialMonth = useM4(() => {
    const first = events[0]?.date || new Date().toISOString().slice(0,10);
    const [y, m] = first.split('-').map(Number);
    return { y, m: m - 1 };
  }, []); // only once
  const [cursor, setCursor] = useS4(initialMonth);

  const [selectedId, setSelectedId] = useS4(null);

  // Escuchar petición del MonthView mobile para cambiar a vista lista
  useE4(function () {
    function onSetView(e) {
      if (e && e.detail === 'lista') setView('lista');
    }
    window.addEventListener('iasd:cal:setView', onSetView);
    return function () { window.removeEventListener('iasd:cal:setView', onSetView); };
  }, []);

  const updateEvent = (id, patch) =>
    setEvents(events.map(e => e.id === id ? { ...e, ...patch } : e));

  const removeEvent = (id) =>
    setEvents(events.filter(e => e.id !== id));

  const addEvent = (date) => {
    const d = date || new Date().toISOString().slice(0, 10);
    const id = 'ev-' + Date.now();
    setEvents([...events, {
      id, date: d, start: '19:30',
      title: 'Nueva actividad', loc: 'Templo'
    }]);
    setSelectedId(id);
    if (view === 'mes') setView('lista'); // jump to list so user can edit fields
  };

  return (
    <main className="page-enter" data-screen-label="Calendario">
      <section className="section">
        <div className="container">
          <EditBanner
            scope="el calendario"
            onAdd={() => addEvent()}
            onReset={() => { if (confirm('¿Restaurar el calendario por defecto?')) resetEvents(); }} />

          <ToolbarBar onPrint={() => printCalendar(events)} />

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="kicker">Calendario</div>
            <h1 className="serif" style={{
              fontSize: 'clamp(44px, 6vw, 80px)', marginTop: 18, lineHeight: 1,
              maxWidth: 720, margin: '18px auto 0'
            }}>
              Próximas <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>actividades</span>
            </h1>
          </div>

          {/* Toggle de vista */}
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: 40
          }}>
            <ViewToggle view={view} setView={setView} />
          </div>

          {view === 'lista'
            ? <ListView events={events} isEditor={isEditor}
                selectedId={selectedId}
                onUpdate={updateEvent} onRemove={removeEvent} />
            : <MonthView events={events} cursor={cursor} setCursor={setCursor}
                isEditor={isEditor}
                onDayClick={(iso) => isEditor && addEvent(iso)}
                onEventClick={(id) => { setSelectedId(id); setView('lista'); }} />}
        </div>
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────────────────
// View toggle
function ViewToggle({ view, setView }) {
  return (
    <div role="tablist" aria-label="Vista del calendario"
      style={{
        display: 'inline-flex',
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 999,
        padding: 4,
        gap: 2,
      }}>
      {[
        { id: 'lista', label: 'Lista', icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 3.5h10M2 7h10M2 10.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        )},
        { id: 'mes', label: 'Mes', icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M1.5 5.5h11" stroke="currentColor" strokeWidth="1.3" />
            <path d="M4.5 1.5v2M9.5 1.5v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        )},
      ].map(opt => {
        const active = view === opt.id;
        return (
          <button key={opt.id}
            role="tab" aria-selected={active}
            onClick={() => setView(opt.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 18px',
              borderRadius: 999, border: 0, cursor: 'pointer',
              background: active ? 'var(--navy)' : 'transparent',
              color: active ? 'var(--cream)' : 'var(--fg)',
              fontSize: 13, fontWeight: 500, fontFamily: 'var(--sans)',
              transition: 'background .15s, color .15s',
            }}>
            {opt.icon}{opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// LIST VIEW
function ListView({ events, isEditor, selectedId, onUpdate, onRemove }) {
  const grouped = useM4(() => {
    const g = {};
    [...events].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
      .forEach(e => { (g[e.date] = g[e.date] || []).push(e); });
    return Object.entries(g);
  }, [events]);

  const dayLabel = (iso) => {
    const d = new Date(iso + 'T12:00');
    return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  if (!events.length) {
    return (
      <div className="muted" style={{ textAlign: 'center', padding: '40px 0', fontSize: 14 }}>
        No hay actividades programadas.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {grouped.map(([date, items]) => (
        <div key={date} style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 14 }}>
            <div className="serif" style={{ fontSize: 22, fontWeight: 500, textTransform: 'capitalize' }}>
              {dayLabel(date)}
            </div>
            <div className="rule" style={{ flex: 1 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((e) => (
              <div key={e.id} style={{
                background: e.featured ? 'var(--surface)' : 'transparent',
                border: '1px solid ' + (e.id === selectedId
                  ? 'var(--gold)'
                  : (e.featured ? 'var(--line)' : 'var(--line-2)')),
                borderLeft: `3px solid var(--gold)`,
                borderRadius: 10, padding: '18px 22px',
                display: 'grid',
                gridTemplateColumns: isEditor ? '130px 110px 1fr auto' : '90px 1fr',
                gap: 20, alignItems: 'center',
                boxShadow: e.id === selectedId ? '0 0 0 3px color-mix(in oklab, var(--gold) 25%, transparent)' : 'none',
              }}>
                {isEditor ? (
                  <>
                    <div className="cal-event-editor" style={{
                      display: 'grid',
                      gridTemplateColumns: '130px 110px 1fr auto',
                      gap: 10, alignItems: 'center',
                    }}>
                    <input
                      type="date"
                      value={e.date}
                      onChange={ev => onUpdate(e.id, { date: ev.target.value })}
                      style={{ ...inlineEdit, fontSize: 12, padding: '6px 8px' }} />
                    <input
                      type="time"
                      value={e.start}
                      onChange={ev => onUpdate(e.id, { start: ev.target.value })}
                      style={{ ...inlineEdit, fontSize: 14, fontFamily: 'var(--mono)', fontWeight: 500 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <InlineInput value={e.title} onChange={v => onUpdate(e.id, { title: v })}
                        style={{ fontSize: 17, fontWeight: 500, fontFamily: 'var(--serif)' }} />
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <InlineInput value={e.loc} onChange={v => onUpdate(e.id, { loc: v })}
                          style={{ fontSize: 13, color: 'var(--muted)' }} />
                        <label style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap'
                        }}>
                          <input type="checkbox" checked={!!e.featured}
                            onChange={ev => onUpdate(e.id, { featured: ev.target.checked })} />
                          Destacar
                        </label>
                      </div>
                    </div>
                    <IconBtn title="Eliminar"
                      onClick={() => { if (confirm('¿Eliminar este evento?')) onRemove(e.id); }}
                      danger>×</IconBtn>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mono" style={{ fontSize: 16, fontWeight: 500 }}>{e.start}</div>
                    <div>
                      <div className="serif" style={{ fontSize: 19, fontWeight: 500 }}>{e.title}</div>
                      <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{e.loc}</div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MONTH VIEW
function MonthView({ events, cursor, setCursor, isEditor, onDayClick, onEventClick }) {
  const { y, m } = cursor;

  // Detectar mobile: en pantallas chicas la grilla 7×6 es ilegible.
  // Mostrar mensaje + botón "Ver como lista" en lugar de la grilla.
  const [isMobile, setIsMobile] = useS4(false);
  useE4(function () {
    var mq = window.matchMedia('(max-width: 720px)');
    function onChange() { setIsMobile(mq.matches); }
    onChange();
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return function () {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  // First day of month, last day, weekday offset (Monday = 0)
  const firstDay = new Date(y, m, 1);
  const lastDay = new Date(y, m + 1, 0);
  const daysInMonth = lastDay.getDate();
  // JS getDay: 0=Sun..6=Sat. Sunday-first calendar, so the offset = getDay().
  const startOffset = firstDay.getDay();

  // Build 6 weeks (42 cells) including prev/next month leading/trailing days
  const cells = [];
  const prevMonthLast = new Date(y, m, 0).getDate();
  for (let i = 0; i < 42; i++) {
    let dayNum, mm, yy, inMonth = true;
    if (i < startOffset) {
      dayNum = prevMonthLast - (startOffset - 1 - i);
      mm = m - 1; yy = y;
      if (mm < 0) { mm = 11; yy = y - 1; }
      inMonth = false;
    } else if (i >= startOffset + daysInMonth) {
      dayNum = i - startOffset - daysInMonth + 1;
      mm = m + 1; yy = y;
      if (mm > 11) { mm = 0; yy = y + 1; }
      inMonth = false;
    } else {
      dayNum = i - startOffset + 1;
      mm = m; yy = y;
    }
    cells.push({ iso: toISO(yy, mm, dayNum), day: dayNum, inMonth,
      isSat: ((new Date(yy, mm, dayNum)).getDay() === 6) });
  }
  // Trim trailing all-next-month row if not needed
  const weeks = [];
  for (let i = 0; i < 6; i++) weeks.push(cells.slice(i * 7, i * 7 + 7));
  const lastWeek = weeks[5];
  if (lastWeek.every(c => !c.inMonth)) weeks.pop();

  // Index events by date
  const byDate = useM4(() => {
    const g = {};
    [...events].sort((a, b) => a.start.localeCompare(b.start))
      .forEach(e => { (g[e.date] = g[e.date] || []).push(e); });
    return g;
  }, [events]);

  const todayISO = new Date().toISOString().slice(0, 10);
  const prevMonth = () => setCursor(({ y, m }) => m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 });
  const nextMonth = () => setCursor(({ y, m }) => m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 });
  const goToday = () => {
    const t = new Date();
    setCursor({ y: t.getFullYear(), m: t.getMonth() });
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {isMobile ? (
        <div className="card" style={{
          marginTop: 24,
          padding: '32px 22px',
          textAlign: 'center',
          border: '1px solid var(--line)',
          background: 'var(--surface)',
          borderRadius: 14,
        }}>
          <div className="kicker" style={{ color: 'var(--gold)' }}>Vista Mes</div>
          <h3 className="serif" style={{
            fontSize: 22, fontWeight: 500, marginTop: 12, lineHeight: 1.2,
          }}>
            Esta vista no está optimizada para mobile
          </h3>
          <p className="muted" style={{
            marginTop: 12, fontSize: 14, lineHeight: 1.5, maxWidth: 360,
            marginLeft: 'auto', marginRight: 'auto',
          }}>
            Cambia a la vista de lista para ver las actividades del mes en formato vertical, una por una.
          </p>
          <button
            onClick={function () {
              // Disparar un evento custom que PageCalendarioEditable escucha
              window.dispatchEvent(new CustomEvent('iasd:cal:setView', { detail: 'lista' }));
            }}
            className="btn btn-primary"
            style={{ marginTop: 20 }}
          >
            Ver como lista
          </button>
        </div>
      ) : null}

      {/* Top nav: [← Anterior]  [Hoy]  [Siguiente →] */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: 10, marginBottom: 28, flexWrap: 'wrap',
      }}>
        <button onClick={prevMonth} className="cal-nav-btn" title="Mes anterior">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 3l-4 4 4 4" stroke="currentColor" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Anterior</span>
        </button>
        <button onClick={goToday} className="cal-nav-btn cal-nav-btn-primary" title="Ir al mes actual">
          Hoy
        </button>
        <button onClick={nextMonth} className="cal-nav-btn" title="Mes siguiente">
          <span>Siguiente</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Month title */}
      <div style={{
        textAlign: 'center', marginBottom: 22,
      }}>
        <h2 className="serif" style={{
          fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 500,
          textTransform: 'capitalize', letterSpacing: '-0.015em',
          lineHeight: 1.05, margin: 0,
        }}>
          {MONTH_NAMES[m]}
          {' '}
          <span style={{ color: 'var(--muted)', fontWeight: 400, fontStyle: 'italic' }}>{y}</span>
        </h2>
      </div>

      {/* Calendar grid — single bordered container so weekday + days align perfectly */}
      <div style={{
        border: '1px solid var(--line)',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'var(--bg)',
      }}>
        {/* Weekday headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          borderBottom: '1px solid var(--line)',
          background: 'var(--surface)',
        }}>
          {WEEK_DAYS.map((d, i) => (
            <div key={d} className="mono" style={{
              padding: '12px 10px',
              fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase',
              color: i === 6 ? 'var(--gold)' : 'var(--muted)',
              borderRight: i < 6 ? '1px solid var(--line)' : 0,
              fontWeight: 600, textAlign: 'center',
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gridAutoRows: 'minmax(120px, auto)',
        }}>
          {weeks.flat().map((cell, idx) => {
            const dayEvents = byDate[cell.iso] || [];
            const isToday = cell.iso === todayISO;
            const col = idx % 7;
            const row = Math.floor(idx / 7);
            const isLastRow = row === weeks.length - 1;
            return (
              <div key={idx}
                onClick={() => isEditor && cell.inMonth && onDayClick && onDayClick(cell.iso)}
                style={{
                  padding: 8,
                  borderRight: col < 6 ? '1px solid var(--line)' : 0,
                  borderBottom: !isLastRow ? '1px solid var(--line)' : 0,
                  background: !cell.inMonth ? 'var(--surface)'
                    : (cell.isSat ? 'color-mix(in oklab, var(--gold) 6%, var(--bg))' : 'var(--bg)'),
                  cursor: isEditor && cell.inMonth ? 'cell' : 'default',
                  position: 'relative',
                  display: 'flex', flexDirection: 'column', gap: 4,
                  transition: 'background .15s',
                  minHeight: 0, // allow grid auto-rows to take effect
                  overflow: 'hidden',
                }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 2, flexShrink: 0,
                }}>
                  <span className="mono" style={{
                    fontSize: 13, fontWeight: 600,
                    width: 26, height: 26, borderRadius: '50%',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: isToday ? 'var(--navy)' : 'transparent',
                    color: isToday ? 'var(--cream)'
                      : (!cell.inMonth ? 'var(--muted)'
                        : (cell.isSat ? 'var(--gold)' : 'var(--fg)')),
                    opacity: cell.inMonth ? 1 : 0.6,
                  }}>{cell.day}</span>
                </div>
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 3,
                  overflow: 'hidden',
                  opacity: cell.inMonth ? 1 : 0.5,
                }}>
                  {dayEvents.slice(0, 3).map(e => (
                    <button key={e.id}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onEventClick && onEventClick(e.id);
                      }}
                      title={e.start + ' · ' + e.title + (e.loc ? ' · ' + e.loc : '')}
                      style={{
                        textAlign: 'left',
                        background: e.featured
                          ? 'var(--gold)'
                          : 'color-mix(in oklab, var(--gold) 16%, var(--bg))',
                        color: e.featured ? 'var(--navy)' : 'var(--fg)',
                        border: e.featured
                          ? 0
                          : '1px solid color-mix(in oklab, var(--gold) 32%, transparent)',
                        borderRadius: 4,
                        padding: '3px 6px',
                        fontSize: 11, fontWeight: 500,
                        lineHeight: 1.3,
                        cursor: 'pointer',
                        fontFamily: 'var(--sans)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        display: 'block',
                        width: '100%',
                      }}>
                      <span className="mono" style={{
                        fontSize: 9.5, fontWeight: 700, marginRight: 5,
                        opacity: e.featured ? .85 : .7,
                      }}>{e.start}</span>
                      {e.title}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <div style={{
                      fontSize: 10.5, color: 'var(--muted)', paddingLeft: 6, fontWeight: 500,
                    }}>
                      + {dayEvents.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hint */}
      <div className="muted" style={{
        marginTop: 18, textAlign: 'center', fontSize: 12,
      }}>
        {isEditor
          ? 'Toca un día para añadir una actividad · Toca un evento para editarlo.'
          : 'Cambia a vista «Lista» para ver descripciones completas.'}
      </div>
    </div>
  );
}

const navArrowStyle = {
  width: 36, height: 36, borderRadius: 8,
  border: '1px solid var(--line)',
  background: 'var(--bg)',
  color: 'var(--fg)',
  cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};

// ─────────────────────────────────────────────────────────
// Toolbar bar — top-of-page actions (Print, etc.)
function ToolbarBar({ onPrint, printing }) {
  return (
    <div className="no-print" style={{
      display: 'flex', justifyContent: 'flex-end',
      marginBottom: 20, gap: 8, flexWrap: 'wrap',
    }}>
      <button onClick={onPrint} className="btn btn-ghost"
        disabled={!!printing}
        title="Generar archivo PDF imprimible"
        style={{ padding: '10px 18px', fontSize: 13 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M4 5V2h6v3M3 9h8v4H3V9zM2 6h10v3H2V6z"
            stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
        {printing ? 'Actualizando…' : 'Generar PDF'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PDF generation — opens a print-ready window for browser's "Save as PDF"
function printProgram(program) {
  const today = new Date().toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const worshipDate = resolveProgramDateLabel(program && program.date);
  const printedProgramDate = worshipDate || today;
  const headingTitle = buildProgramDisplayTitle(program && program.title, program && program.date);
  const rows = program.items.map(p => `
    <tr class="${p.accent ? 'row-accent' : ''}">
      <td class="anuncia">${escapeHtml(p.a || '')}</td>
      <td class="programa">${escapeHtml(p.n || '')}</td>
      <td class="detalle">${escapeHtml(p.d || '')}</td>
    </tr>
  `).join('');
  const html = printDocument({
    title: headingTitle,
    subtitle: `Iglesia Adventista Central de Osorno · ${printedProgramDate}`,
    meta: [
      ['Fecha',      printedProgramDate],
      ['Predicador', program.preacher || '—'],
      ['Tema',       program.theme || '—'],
      ['Pasaje',     program.scripture || '—'],
    ],
    body: `
      <table class="prog-table">
        <thead>
          <tr><th style="width:26%">Anuncia</th><th style="width:30%">Programa</th><th>Detalle</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `,
  });
  launchPrint(html, 'Programa-' + (program.date || 'culto'));
}

function printCalendar(events) {
  const today = new Date().toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  // Group by month for the printout
  const sorted = [...events].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const months = {};
  sorted.forEach(e => {
    const [y, m] = e.date.split('-');
    const key = y + '-' + m;
    (months[key] = months[key] || []).push(e);
  });
  const blocks = Object.entries(months).map(([key, items]) => {
    const [y, m] = key.split('-').map(Number);
    const monthName = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][m - 1];
    const rows = items.map(e => {
      const d = new Date(e.date + 'T12:00');
      const dayLabel = d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' });
      return `
        <tr class="${e.featured ? 'row-accent' : ''}">
          <td class="day">${escapeHtml(dayLabel)}</td>
          <td class="time">${escapeHtml(e.start)}</td>
          <td class="title">${escapeHtml(e.title)}</td>
          <td class="loc">${escapeHtml(e.loc || '')}</td>
        </tr>
      `;
    }).join('');
    return `
      <h2 class="month-title">${monthName} ${y}</h2>
      <table class="cal-table">
        <thead>
          <tr><th style="width:22%">Día</th><th style="width:14%">Hora</th><th>Actividad</th><th style="width:22%">Lugar</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }).join('');

  const html = printDocument({
    title: 'Calendario de actividades',
    subtitle: `Iglesia Adventista Central de Osorno · ${today}`,
    body: blocks,
  });
  launchPrint(html, 'Calendario');
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Shared print-document template (header, navy + cream palette, print CSS)
function printDocument({ title, subtitle, meta = [], body }) {
  const metaRow = meta.length ? `
    <div class="meta">
      ${meta.map(([k, v]) => `
        <div class="meta-cell">
          <div class="meta-k">${escapeHtml(k)}</div>
          <div class="meta-v">${escapeHtml(v)}</div>
        </div>`).join('')}
    </div>` : '';
  return `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #14213D;
    font-family: Georgia, 'Times New Roman', serif; }
  body { padding: 28mm 18mm; }
  .header { text-align: center; padding-bottom: 18px; border-bottom: 2px solid #14213D; margin-bottom: 24px; }
  .kicker { font-family: 'SF Mono', Consolas, monospace; font-size: 10pt; letter-spacing: 0.18em;
    color: #B89055; text-transform: uppercase; font-weight: 700; }
  h1 { font-size: 28pt; margin: 10px 0 6px; line-height: 1.05; font-weight: 500; letter-spacing: -0.01em; }
  .subtitle { font-size: 10pt; color: #5b6580; font-family: 'SF Mono', Consolas, monospace;
    letter-spacing: .08em; }
  .meta { display: flex; gap: 28px; justify-content: center; margin: 18px 0 28px;
    flex-wrap: wrap; }
  .meta-cell { text-align: center; }
  .meta-k { font-family: 'SF Mono', Consolas, monospace; font-size: 8pt; letter-spacing: .14em;
    text-transform: uppercase; color: #5b6580; font-weight: 700; margin-bottom: 4px; }
  .meta-v { font-size: 11pt; font-weight: 500; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px;
    font-family: Helvetica, Arial, sans-serif; }
  th { background: #14213D; color: #F5EFE0; padding: 10px 14px; text-align: left;
    font-size: 9pt; letter-spacing: .14em; text-transform: uppercase; font-weight: 700;
    font-family: 'SF Mono', Consolas, monospace; }
  td { padding: 10px 14px; border-bottom: 1px solid #E6DCC2; font-size: 10pt; vertical-align: top; }
  tbody tr:nth-child(even) { background: #FAF7EF; }
  .row-accent { background: #F7E9CC !important; }
  .row-accent td { font-weight: 600; }
  .anuncia { font-family: 'SF Mono', Consolas, monospace; font-size: 9pt; letter-spacing: .06em;
    text-transform: uppercase; font-weight: 700; color: #14213D; width: 26%; }
  .programa { text-transform: uppercase; letter-spacing: .04em; font-weight: 500;
    font-family: Helvetica, Arial, sans-serif; }
  .detalle { line-height: 1.5; }
  .day { text-transform: capitalize; font-weight: 600; font-family: Georgia, serif; }
  .time { font-family: 'SF Mono', Consolas, monospace; font-weight: 600; }
  .title { font-family: Georgia, serif; font-size: 11pt; }
  .loc { color: #5b6580; font-size: 9.5pt; }
  .month-title { font-size: 18pt; margin: 24px 0 12px; padding-bottom: 6px;
    border-bottom: 1px solid #B89055; color: #14213D; font-weight: 500; letter-spacing: -0.01em; }
  .month-title:first-of-type { margin-top: 0; }
  .footer { margin-top: 32px; padding-top: 18px; border-top: 1px solid #E6DCC2;
    font-size: 9pt; color: #5b6580; text-align: center; }
  @page { size: A4; margin: 0; }
  @media print {
    body { padding: 18mm 14mm; }
    table { page-break-inside: auto; }
    tr { page-break-inside: avoid; page-break-after: auto; }
    .month-title { page-break-before: auto; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="kicker">Iglesia Adventista Central · Osorno</div>
    <h1>${escapeHtml(title)}</h1>
    <div class="subtitle">${escapeHtml(subtitle)}</div>
  </div>
  ${metaRow}
  ${body}
  <div class="footer">
    Andrés Bello 748, Osorno · iasdcentralosorno.cl<br>
    Generado el ${new Date().toLocaleString('es-CL')}
  </div>
</body></html>`;
}

function launchPrint(html, suggestedName) {
  const w = window.open('', '_blank');
  if (!w) {
    alert('Permite que se abran ventanas emergentes para generar el PDF.');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  // Set the document title so the saved PDF has a useful filename
  try { w.document.title = suggestedName || 'documento'; } catch {}
  // Wait for layout, then open print dialog
  setTimeout(() => {
    try { w.focus(); w.print(); } catch (e) { console.warn(e); }
  }, 350);
}

const inlineEdit = {
  padding: '6px 10px',
  background: 'var(--bg)',
  border: '1px dashed color-mix(in oklab, var(--gold) 50%, var(--line))',
  borderRadius: 6,
  font: 'inherit',
  color: 'var(--fg)',
  outline: 'none',
};

Object.assign(window, { PagePrograma, PageCalendarioEditable });
