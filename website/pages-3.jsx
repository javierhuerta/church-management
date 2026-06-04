// pages-3.jsx — En Vivo (YouTube)
const { useState: useS3, useEffect: useE3, useMemo: useM3 } = React;

// Canal de YouTube de la iglesia
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@IASDCentralOsorno';
const YOUTUBE_LIVE_URL    = 'https://www.youtube.com/@IASDCentralOsorno/live';
// Para incrustar el reproductor: live_stream con channel handle (YouTube redirige al stream activo)
const YOUTUBE_EMBED_URL   = 'https://www.youtube.com/embed/live_stream?channel=UC_PLACEHOLDER_CHANNEL_ID&autoplay=0';
// ↑ Reemplaza UC_PLACEHOLDER_CHANNEL_ID por el ID del canal cuando lo obtengan (formato UCxxxx…)
// Si no hay channel ID configurado, mostramos el thumbnail con botón de play que abre YouTube.
const HAS_EMBED = !YOUTUBE_EMBED_URL.includes('PLACEHOLDER');

// ═════════════════════════════════════════════════════════
// EN VIVO
// ═════════════════════════════════════════════════════════
function PageEnVivo({ isLive }) {
  const past = [
    { d: '17 may 2026', t: 'La paciencia de Job',           p: 'Pr. Esteban Soto',    url: YOUTUBE_CHANNEL_URL },
    { d: '10 may 2026', t: 'Cuando la fe se pone a prueba', p: 'Pr. Israel Jaramillo', url: YOUTUBE_CHANNEL_URL },
    { d: '03 may 2026', t: 'Un nuevo comienzo',             p: 'Anciano',             url: YOUTUBE_CHANNEL_URL },
  ];

  return (
    <main className="page-enter" data-screen-label="En Vivo"
      style={{ background: '#0E1730', color: '#F0E8D2', minHeight: '100vh' }}>

      <section style={{ padding: '64px 0 28px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          {isLive ? (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#E25C5C', color: '#fff', padding: '6px 14px', borderRadius: 999,
              fontSize: 11, fontWeight: 700, letterSpacing: '.12em'
            }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: '#fff' }} />
              EN VIVO AHORA
            </span>
          ) : (
            <span className="mono" style={{
              fontSize: 11, letterSpacing: '.16em',
              color: '#C9A26B', textTransform: 'uppercase'
            }}>Próxima transmisión · Sábado 11:00</span>
          )}
          <h1 className="serif" style={{
            fontSize: 'clamp(40px, 5.4vw, 68px)', marginTop: 18, color: '#F0E8D2',
            lineHeight: 1, maxWidth: 760, margin: '18px auto 0'
          }}>
            Culto Divino <span style={{ fontStyle: 'italic', color: '#D4B07A' }}>en vivo</span>
          </h1>
          <p style={{
            marginTop: 18, fontSize: 15, opacity: .75, maxWidth: 520, margin: '18px auto 0'
          }}>
            Únete cada sábado a las 11:00 h por nuestro canal de YouTube.
          </p>
        </div>
      </section>

      {/* Reproductor */}
      <section style={{ paddingBottom: 64 }}>
        <div className="container" style={{ maxWidth: 1040 }}>
          <div style={{
            position: 'relative', borderRadius: 20, overflow: 'hidden',
            background: '#000', aspectRatio: '16/9',
            border: '1px solid rgba(240,232,210,.1)',
          }}>
            {HAS_EMBED ? (
              <iframe
                src={YOUTUBE_EMBED_URL}
                title="Transmisión en vivo · IASD Central Osorno"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen />
            ) : (
              <>
                <Ph label={isLive ? 'TRANSMISIÓN · IASD Central Osorno' : 'Vista previa · IASD Central Osorno'}
                  dark height="100%" radius={0}
                  style={{ position: 'absolute', inset: 0 }} />
                <a href={YOUTUBE_LIVE_URL} target="_blank" rel="noopener noreferrer"
                  style={{
                    position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                    width: 96, height: 96, borderRadius: '50%',
                    background: 'rgba(245,239,224,.94)', color: '#1B2C5C',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', textDecoration: 'none',
                    boxShadow: '0 0 0 14px rgba(245,239,224,.18), 0 0 0 32px rgba(245,239,224,.08)',
                    transition: 'transform .2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.06)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translate(-50%, -50%)'}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4l14 8-14 8V4z" />
                  </svg>
                </a>
              </>
            )}

            {isLive && (
              <div style={{
                position: 'absolute', top: 20, left: 20,
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)',
                padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                color: '#fff', letterSpacing: '.08em',
                pointerEvents: 'none',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: '#E25C5C' }} />
                DIRECTO
              </div>
            )}

            <div style={{
              position: 'absolute', bottom: 20, right: 20,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)',
              padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
              color: '#fff',
              pointerEvents: 'none',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF0033">
                <path d="M21.6 7.2c-.2-1-1-1.8-2-2C17.5 4.8 12 4.8 12 4.8s-5.5 0-7.6.4c-1 .2-1.8 1-2 2C2 9.3 2 12 2 12s0 2.7.4 4.8c.2 1 1 1.8 2 2 2.1.4 7.6.4 7.6.4s5.5 0 7.6-.4c1-.2 1.8-1 2-2C22 14.7 22 12 22 12s0-2.7-.4-4.8zM9.8 15.6V8.4l6.2 3.6-6.2 3.6z" />
              </svg>
              YouTube · IASD Central Osorno
            </div>
          </div>

          {/* Buttons row */}
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'center',
            marginTop: 24, flexWrap: 'wrap',
          }}>
            <a href={YOUTUBE_LIVE_URL} target="_blank" rel="noopener noreferrer"
              className="btn"
              style={{
                background: '#FF0033', color: '#fff', padding: '14px 24px',
              }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.6 7.2c-.2-1-1-1.8-2-2C17.5 4.8 12 4.8 12 4.8s-5.5 0-7.6.4c-1 .2-1.8 1-2 2C2 9.3 2 12 2 12s0 2.7.4 4.8c.2 1 1 1.8 2 2 2.1.4 7.6.4 7.6.4s5.5 0 7.6-.4c1-.2 1.8-1 2-2C22 14.7 22 12 22 12s0-2.7-.4-4.8zM9.8 15.6V8.4l6.2 3.6-6.2 3.6z" />
              </svg>
              Ver en vivo en YouTube
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 4 }}>
                <path d="M3 9L9 3M5 3h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </a>
            <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer"
              className="btn"
              style={{
                background: 'transparent', color: '#F0E8D2',
                border: '1px solid rgba(240,232,210,.3)', padding: '14px 24px',
              }}>
              Suscribirse al canal
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 4 }}>
                <path d="M3 9L9 3M5 3h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </a>
          </div>

          {/* meta del culto */}
          <div style={{ textAlign: 'center', paddingTop: 32 }}>
            <div className="mono" style={{ fontSize: 11, color: '#C9A26B', letterSpacing: '.14em' }}>
              PREDICACIÓN · MATEO 6:25–34
            </div>
            <h2 className="serif" style={{
              fontSize: 'clamp(28px, 3.4vw, 40px)', marginTop: 10, color: '#F0E8D2'
            }}>
              No se preocupen por la vida
            </h2>
            <div style={{ marginTop: 10, fontSize: 14, opacity: .75 }}>
              Pr. Israel Jaramillo · Sábado 23 de mayo, 2026
            </div>
          </div>
        </div>
      </section>

      {/* Predicaciones anteriores */}
      <section style={{
        padding: '72px 0 96px',
        borderTop: '1px solid rgba(245,239,224,.12)'
      }}>
        <div className="container" style={{ maxWidth: 1040 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="kicker" style={{ color: '#C9A26B' }}>Predicaciones anteriores</div>
            <h2 className="serif" style={{
              fontSize: 'clamp(28px, 3.6vw, 40px)', marginTop: 12, color: '#F0E8D2'
            }}>
              Vuelve a escuchar
            </h2>
            <p style={{ marginTop: 14, fontSize: 14, opacity: .65, maxWidth: 460, margin: '14px auto 0' }}>
              Todas nuestras predicaciones quedan publicadas en el canal de YouTube de la iglesia.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}
            className="past-sermons-grid">
            {past.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: '#F0E8D2', cursor: 'pointer',
                  display: 'block', transition: 'transform .15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ position: 'relative' }}>
                  <Ph dark label="Predicación" height={200} radius={12} />
                  <div style={{
                    position: 'absolute', bottom: 12, right: 12,
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'rgba(0,0,0,.75)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                      <path d="M6 4l14 8-14 8V4z" />
                    </svg>
                  </div>
                </div>
                <div className="mono" style={{
                  fontSize: 11, color: '#C9A26B', marginTop: 14, letterSpacing: '.12em'
                }}>
                  {s.d.toUpperCase()}
                </div>
                <div className="serif" style={{
                  fontSize: 20, marginTop: 6, color: '#F0E8D2', lineHeight: 1.2
                }}>
                  {s.t}
                </div>
                <div style={{ fontSize: 13, marginTop: 8, opacity: .65 }}>
                  {s.p}
                </div>
              </a>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer"
              className="btn"
              style={{
                background: 'transparent', color: '#F0E8D2',
                border: '1px solid rgba(240,232,210,.3)',
                padding: '14px 24px',
              }}>
              Ver canal completo en YouTube
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 4 }}>
                <path d="M3 9L9 3M5 3h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </main>);

}

function PageCulto() { return null; }

Object.assign(window, { PageEnVivo, PageCulto });
