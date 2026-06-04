// pages-4.jsx — Programa del día (público + editable) y Calendario editable
const { useState: useS4, useMemo: useM4, useCallback: useC4 } = React;

// ─────────────────────────────────────────────────────────
// Inline edit input — minimal text editor with auto-resize
function InlineInput({ value, onChange, multiline, placeholder, style }) {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <Tag
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={multiline ? 2 : undefined}
      style={{
        width: '100%',
        padding: '8px 10px',
        background: 'var(--bg)',
        border: '1px dashed color-mix(in oklab, var(--gold) 50%, var(--line))',
        borderRadius: 6,
        font: 'inherit',
        color: 'var(--fg)',
        outline: 'none',
        resize: multiline ? 'vertical' : 'none',
        ...style,
      }} />
  );
}

// ═════════════════════════════════════════════════════════
// PROGRAMA DEL DÍA — pública, editable con sesión
// ═════════════════════════════════════════════════════════
function PagePrograma({ store }) {
  const { session } = useAuth();
  const { program, setProgram, resetProgram } = store;
  const isEditor = !!session;

  const updateField = (key, value) => setProgram({ ...program, [key]: value });

  const updateItem = (id, patch) => setProgram({
    ...program,
    items: program.items.map(it => it.id === id ? { ...it, ...patch } : it),
  });

  const removeItem = (id) => setProgram({
    ...program,
    items: program.items.filter(it => it.id !== id),
  });

  const addItem = () => setProgram({
    ...program,
    items: [...program.items, {
      id: 'p-' + Date.now(),
      t: '12:00', k: 'Nuevo', n: 'Nueva parte', d: '',
    }],
  });

  const moveItem = (id, dir) => {
    const idx = program.items.findIndex(i => i.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= program.items.length) return;
    const arr = [...program.items];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    setProgram({ ...program, items: arr });
  };

  return (
    <main className="page-enter" data-screen-label="Programa del día">
      <section className="section">
        <div className="container">
          <EditBanner
            scope="el programa del día"
            onAdd={addItem}
            onReset={() => { if (confirm('¿Restaurar el programa por defecto?')) resetProgram(); }} />

          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="kicker">Programa del día</div>
            {isEditor ? (
              <div style={{ maxWidth: 720, margin: '18px auto 0' }}>
                <InlineInput
                  value={program.title}
                  onChange={v => updateField('title', v)}
                  style={{
                    fontSize: 'clamp(36px, 5.4vw, 68px)', fontFamily: 'var(--serif)',
                    fontWeight: 500, lineHeight: 1.02, textAlign: 'center',
                    letterSpacing: '-0.02em', padding: '14px 18px',
                  }} />
              </div>
            ) : (
              <h1 className="serif" style={{
                fontSize: 'clamp(40px, 6vw, 76px)', marginTop: 18, lineHeight: 1.02,
                maxWidth: 820, margin: '18px auto 0'
              }}>
                {program.title}
              </h1>
            )}
            <div style={{
              marginTop: 22, display: 'inline-flex', gap: 28, flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <Meta label="Predicador" value={program.preacher}
                editable={isEditor} onChange={v => updateField('preacher', v)} />
              <Meta label="Tema" value={program.theme}
                editable={isEditor} onChange={v => updateField('theme', v)} />
              <Meta label="Pasaje" value={program.scripture}
                editable={isEditor} onChange={v => updateField('scripture', v)} />
            </div>
          </div>

          {/* Lista del programa */}
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            {program.items.map((p, i) => (
              <div key={p.id} style={{
                display: 'grid',
                gridTemplateColumns: isEditor ? '100px 1fr auto' : '100px 1fr',
                gap: 28,
                padding: '26px 0',
                borderTop: '1px solid var(--line)',
                borderBottom: i === program.items.length - 1 ? '1px solid var(--line)' : 0,
                alignItems: 'start',
              }}>
                <div>
                  {isEditor ? (
                    <InlineInput value={p.t} onChange={v => updateItem(p.id, { t: v })}
                      style={{
                        fontSize: 18, fontWeight: 500, fontFamily: 'var(--mono)',
                        color: p.accent ? 'var(--gold)' : 'var(--fg)',
                      }} />
                  ) : (
                    <div className="mono" style={{
                      fontSize: 18, fontWeight: 500,
                      color: p.accent ? 'var(--gold)' : 'var(--fg)',
                    }}>{p.t}</div>
                  )}
                </div>
                <div>
                  {isEditor ? (
                    <>
                      <InlineInput value={p.k} onChange={v => updateItem(p.id, { k: v })}
                        style={{
                          fontSize: 10.5, letterSpacing: '.14em',
                          color: 'var(--muted)', textTransform: 'uppercase',
                          fontFamily: 'var(--mono)', fontWeight: 600
                        }} />
                      <div style={{ marginTop: 8 }}>
                        <InlineInput value={p.n} onChange={v => updateItem(p.id, { n: v })}
                          style={{
                            fontSize: 22, fontWeight: 500, fontFamily: 'var(--serif)',
                            fontStyle: p.accent ? 'italic' : 'normal',
                            color: p.accent ? 'var(--navy)' : 'var(--fg)',
                          }} />
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <InlineInput value={p.d} onChange={v => updateItem(p.id, { d: v })}
                          multiline
                          placeholder="Descripción opcional"
                          style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.55 }} />
                      </div>
                      <label style={{
                        marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8,
                        fontSize: 12, color: 'var(--muted)', cursor: 'pointer'
                      }}>
                        <input type="checkbox"
                          checked={!!p.accent}
                          onChange={e => updateItem(p.id, { accent: e.target.checked })} />
                        Destacar (predicación / momento principal)
                      </label>
                    </>
                  ) : (
                    <>
                      <div className="mono" style={{
                        fontSize: 10.5, letterSpacing: '.14em',
                        color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600
                      }}>{p.k}</div>
                      <div className="serif" style={{
                        fontSize: p.accent ? 28 : 22, fontWeight: 500, marginTop: 6,
                        fontStyle: p.accent ? 'italic' : 'normal',
                        color: p.accent ? 'var(--navy)' : 'var(--fg)',
                        lineHeight: 1.2
                      }}>{p.n}</div>
                      {p.d && (
                        <div className="muted" style={{ fontSize: 14, marginTop: 8, lineHeight: 1.55 }}>
                          {p.d}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {isEditor && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <IconBtn title="Subir" onClick={() => moveItem(p.id, -1)}>↑</IconBtn>
                    <IconBtn title="Bajar" onClick={() => moveItem(p.id, +1)}>↓</IconBtn>
                    <IconBtn title="Eliminar" onClick={() => {
                      if (confirm('¿Eliminar esta parte del programa?')) removeItem(p.id);
                    }} danger>×</IconBtn>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!isEditor && (
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <p className="muted" style={{ fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
                «Adorad a Jehová en la hermosura de la santidad.»
              </p>
              <div className="mono" style={{
                marginTop: 12, fontSize: 11, color: 'var(--gold)', letterSpacing: '.16em'
              }}>
                SALMO 96:9
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Meta({ label, value, editable, onChange }) {
  return (
    <div style={{ textAlign: 'left', minWidth: 180 }}>
      <div className="mono" style={{
        fontSize: 10, letterSpacing: '.14em', color: 'var(--muted)',
        textTransform: 'uppercase', marginBottom: 6, fontWeight: 600
      }}>{label}</div>
      {editable
        ? <InlineInput value={value} onChange={onChange}
            style={{ fontSize: 15, fontWeight: 500 }} />
        : <div style={{ fontSize: 15, fontWeight: 500 }}>{value}</div>}
    </div>
  );
}

function IconBtn({ children, onClick, danger, title }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 30, height: 30, borderRadius: 6,
      border: '1px solid var(--line)',
      background: 'var(--bg)',
      color: danger ? '#c14747' : 'var(--fg)',
      cursor: 'pointer', fontSize: 14, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>{children}</button>
  );
}

// ═════════════════════════════════════════════════════════
// CALENDARIO EDITABLE — con toggle de vista Lista / Mes
// ═════════════════════════════════════════════════════════
const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const WEEK_DAYS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

function toISO(y, m, d) {
  return y + '-' + String(m + 1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
}

function PageCalendarioEditable({ store }) {
  const { session } = useAuth();
  const { events, setEvents, resetEvents } = store;
  const isEditor = !!session;

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
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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

  // First day of month, last day, weekday offset (Monday = 0)
  const firstDay = new Date(y, m, 1);
  const lastDay = new Date(y, m + 1, 0);
  const daysInMonth = lastDay.getDate();
  // JS getDay: 0=Sun..6=Sat. Convert to Monday-first (0=Mon..6=Sun).
  const startOffset = (firstDay.getDay() + 6) % 7;

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
      {/* Month header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 22, gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <h2 className="serif" style={{
            fontSize: 'clamp(28px, 3.6vw, 40px)', fontWeight: 500,
            textTransform: 'capitalize', letterSpacing: '-0.01em'
          }}>
            {MONTH_NAMES[m]} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>{y}</span>
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={goToday} className="btn btn-ghost"
            style={{ padding: '8px 14px', fontSize: 13 }}>
            Hoy
          </button>
          <button onClick={prevMonth} title="Mes anterior" style={navArrowStyle}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 3l-4 4 4 4" stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button onClick={nextMonth} title="Mes siguiente" style={navArrowStyle}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        borderTop: '1px solid var(--line)',
        borderLeft: '1px solid var(--line)',
      }}>
        {WEEK_DAYS.map((d, i) => (
          <div key={d} className="mono" style={{
            padding: '12px 14px',
            fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase',
            color: i >= 5 ? 'var(--gold)' : 'var(--muted)',
            borderRight: '1px solid var(--line)',
            borderBottom: '1px solid var(--line)',
            background: 'var(--surface)',
            fontWeight: 600,
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        borderLeft: '1px solid var(--line)',
      }}>
        {weeks.flat().map((cell, idx) => {
          const dayEvents = byDate[cell.iso] || [];
          const isToday = cell.iso === todayISO;
          return (
            <div key={idx}
              onClick={() => isEditor && cell.inMonth && onDayClick && onDayClick(cell.iso)}
              style={{
                minHeight: 116,
                padding: 8,
                borderRight: '1px solid var(--line)',
                borderBottom: '1px solid var(--line)',
                background: !cell.inMonth ? 'transparent'
                  : (cell.isSat ? 'color-mix(in oklab, var(--gold) 6%, var(--bg))' : 'var(--bg)'),
                opacity: cell.inMonth ? 1 : 0.4,
                cursor: isEditor && cell.inMonth ? 'cell' : 'default',
                position: 'relative',
                display: 'flex', flexDirection: 'column', gap: 4,
                transition: 'background .15s',
              }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 2,
              }}>
                <span className="mono" style={{
                  fontSize: 13, fontWeight: 600,
                  width: 24, height: 24, borderRadius: '50%',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: isToday ? 'var(--navy)' : 'transparent',
                  color: isToday ? 'var(--cream)' : (cell.isSat ? 'var(--gold)' : 'var(--fg)'),
                }}>{cell.day}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden' }}>
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
                        : 'color-mix(in oklab, var(--gold) 18%, var(--bg))',
                      color: e.featured ? 'var(--navy)' : 'var(--fg)',
                      border: e.featured
                        ? 0
                        : '1px solid color-mix(in oklab, var(--gold) 35%, transparent)',
                      borderRadius: 4,
                      padding: '3px 6px',
                      fontSize: 11.5, fontWeight: 500,
                      lineHeight: 1.25,
                      cursor: 'pointer',
                      fontFamily: 'var(--sans)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                    <span className="mono" style={{
                      fontSize: 10, fontWeight: 600, marginRight: 5,
                      opacity: e.featured ? .85 : .75,
                    }}>{e.start}</span>
                    {e.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <div style={{
                    fontSize: 10.5, color: 'var(--muted)', paddingLeft: 6,
                  }}>
                    + {dayEvents.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
