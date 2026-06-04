// pages-2.jsx — Horarios + Calendario (simplified)
const { useState: useS2, useMemo: useM2 } = React;

// ═════════════════════════════════════════════════════════
// HORARIOS
// ═════════════════════════════════════════════════════════
function PageHorarios() {
  const week = [
    { d: 'Sábado', accent: true, items: [
      ['09:45', 'Escuela Sabática', 'Estudio bíblico por grupos. Para niños, jóvenes y adultos.'],
      ['11:00', 'Culto Divino', 'Adoración con cantos, oración y predicación. Transmisión en vivo.'],
      ['17:00', 'Culto Joven', 'Espacio de adoración y compañerismo para jóvenes y adolescentes.'],
    ]},
    { d: 'Miércoles', items: [
      ['06:00', 'Culto de Oración Matutino', 'Encuentro de oración temprano. Vía Zoom.'],
      ['19:30', 'Culto de Oración', 'Estudio breve y oración en el templo.'],
    ]},
  ];

  return (
    <main className="page-enter" data-screen-label="Horarios">
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <div className="kicker">Horarios</div>
            <h1 className="serif" style={{
              fontSize: 'clamp(44px, 6vw, 80px)', marginTop: 18, lineHeight: 1,
              maxWidth: 820, margin: '18px auto 0'
            }}>
              Cada semana,
              <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}> un lugar</span> para ti.
            </h1>
            <p className="muted" style={{
              marginTop: 24, fontSize: 17, maxWidth: 560, margin: '24px auto 0'
            }}>
              Todas las visitas son bienvenidas. No es necesario registrarse.
            </p>
          </div>

          {/* programa */}
          <div className="mt-6" style={{ maxWidth: 920, margin: '64px auto 0' }}>
            {week.map((day) => (
              <div key={day.d} style={{
                borderTop: '1px solid var(--line)',
                padding: '40px 0',
                display: 'grid', gridTemplateColumns: '200px 1fr', gap: 40,
              }}>
                <div>
                  <div className="serif" style={{
                    fontSize: day.accent ? 36 : 28, fontWeight: 500,
                    color: day.accent ? 'var(--gold)' : 'var(--fg)',
                    fontStyle: day.accent ? 'italic' : 'normal',
                  }}>
                    {day.d}
                  </div>
                </div>
                <div>
                  {day.items.map(([time, title, copy], i) => (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '90px 1fr', gap: 24,
                      padding: '16px 0',
                      borderBottom: i < day.items.length - 1 ? '1px solid var(--line-2)' : 0,
                    }}>
                      <div className="mono" style={{ fontSize: 16, color: 'var(--fg)', fontWeight: 500 }}>
                        {time}
                      </div>
                      <div>
                        <div className="serif" style={{ fontSize: 22, fontWeight: 500 }}>{title}</div>
                        <div className="muted" style={{ fontSize: 14, marginTop: 6, maxWidth: 480 }}>{copy}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--line)' }} />
          </div>
        </div>
      </section>

      {/* Puesta de sol */}
      <section style={{
        background: 'var(--navy)',
        color: 'var(--cream)',
        padding: 'clamp(64px, 8vw, 112px) 0'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="kicker" style={{ color: 'var(--gold-2)' }}>Puesta de sol</div>
            <h2 className="serif" style={{
              fontSize: 'clamp(30px, 3.8vw, 44px)', marginTop: 14, color: 'var(--cream)',
              maxWidth: 680, margin: '14px auto 0'
            }}>
              «Acuérdate del día de reposo, para santificarlo.»
            </h2>
            <div className="mono" style={{
              marginTop: 16, fontSize: 11, opacity: .65, letterSpacing: '.16em'
            }}>
              ÉXODO 20:8
            </div>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
            maxWidth: 880, margin: '0 auto'
          }}>
            {[
              ['22 may', '17:38'],
              ['29 may', '17:32'],
              ['05 jun', '17:28'],
              ['12 jun', '17:27'],
            ].map(([w, t], i) => (
              <div key={w} style={{
                padding: 24,
                textAlign: 'center',
                borderLeft: i > 0 ? '1px solid rgba(245,239,224,.18)' : 0,
              }}>
                <div className="mono" style={{
                  fontSize: 11, opacity: .7, letterSpacing: '.14em', textTransform: 'uppercase'
                }}>
                  Viernes
                </div>
                <div className="serif" style={{ fontSize: 20, fontWeight: 500, marginTop: 6 }}>{w}</div>
                <div className="mono" style={{
                  marginTop: 14, fontSize: 22, color: 'var(--gold-2)', fontWeight: 500
                }}>{t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

// ═════════════════════════════════════════════════════════
// CALENDARIO (legacy — kept for reference, replaced by PageCalendarioEditable)
// ═════════════════════════════════════════════════════════
function PageCalendarioLegacy() {
  const events = useM2(() => [
    { date: '2026-05-22', start: '19:30', title: 'Bienvenida del Sábado', loc: 'Templo' },
    { date: '2026-05-23', start: '09:30', title: 'Escuela Sabática y Culto Divino', loc: 'Templo', featured: true },
    { date: '2026-05-27', start: '19:30', title: 'Reunión de Oración', loc: 'Templo' },
    { date: '2026-05-29', start: '19:30', title: 'Bienvenida del Sábado', loc: 'Templo' },
    { date: '2026-05-30', start: '11:00', title: 'Culto de Bautismo', loc: 'Templo', featured: true },
    { date: '2026-06-03', start: '19:30', title: 'Reunión de Oración', loc: 'Templo' },
    { date: '2026-06-06', start: '09:30', title: 'Escuela Sabática y Culto Divino', loc: 'Templo' },
    { date: '2026-06-13', start: '09:30', title: 'Sábado de Familia', loc: 'Templo', featured: true },
  ], []);

  const grouped = useM2(() => {
    const g = {};
    events.forEach(e => { (g[e.date] = g[e.date] || []).push(e); });
    return Object.entries(g).sort((a, b) => a[0].localeCompare(b[0]));
  }, [events]);

  const dayLabel = (iso) => {
    const d = new Date(iso + 'T12:00');
    return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <main className="page-enter" data-screen-label="Calendario">
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="kicker">Mayo · Junio 2026</div>
            <h1 className="serif" style={{
              fontSize: 'clamp(44px, 6vw, 80px)', marginTop: 18, lineHeight: 1,
              maxWidth: 720, margin: '18px auto 0'
            }}>
              Próximas <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>actividades</span>
            </h1>
          </div>

          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            {grouped.map(([date, items]) => (
              <div key={date} style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 14 }}>
                  <div className="serif" style={{ fontSize: 22, fontWeight: 500, textTransform: 'capitalize' }}>
                    {dayLabel(date)}
                  </div>
                  <div className="rule" style={{ flex: 1 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map((e, i) => (
                    <div key={i} style={{
                      background: e.featured ? 'var(--surface)' : 'transparent',
                      border: '1px solid ' + (e.featured ? 'var(--line)' : 'var(--line-2)'),
                      borderLeft: `3px solid var(--gold)`,
                      borderRadius: 10, padding: '18px 22px',
                      display: 'grid', gridTemplateColumns: '90px 1fr', gap: 20, alignItems: 'center'
                    }}>
                      <div className="mono" style={{ fontSize: 16, fontWeight: 500 }}>{e.start}</div>
                      <div>
                        <div className="serif" style={{ fontSize: 19, fontWeight: 500 }}>{e.title}</div>
                        <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{e.loc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { PageHorarios });
