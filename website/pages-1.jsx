// pages-1.jsx — Inicio + Nosotros (con fotos)
const { useState: useS1, useMemo: useM1 } = React;

// ═════════════════════════════════════════════════════════
// INICIO — editorial / moderno con hero asimétrico
// ═════════════════════════════════════════════════════════
function PageInicio({ setPage, nextService: propNextService }) {
  // Datos por defecto (fallback si la API falla o no hay datos)
  const DEFAULT_HOME = {
    hero: {
      title: 'Central',
      titleAccent: 'Osorno',
      subtitle: 'Una comunidad que adora cada sábado al pie de la cordillera. Las puertas están abiertas para ti.',
      mainImageUrl: null,
      smallImageUrl: null,
    },
    verse: {
      text: '«Vengan a mí todos los que están cansados… y yo los haré descansar.»',
      reference: 'MATEO 11:28',
    },
    schedule: {
      title: 'Nuestros Horarios',
      subtitle: 'Te esperamos en cada una de nuestras actividades',
    },
    social: {
      facebookUrl: 'https://facebook.com',
      instagramUrl: 'https://instagram.com',
      youtubeUrl: 'https://youtube.com',
    },
    footerCta: {
      title: 'Te esperamos este sábado.',
      subtitle: 'Andrés Bello 748, Osorno.',
      buttonText: 'Ver Ubicación',
    },
    nextService: propNextService,
    scheduleItems: [
      ['Sábado',    '09:45', 'Escuela Sabática'],
      ['Sábado',    '11:00', 'Culto Divino'],
      ['Sábado',    '17:00', 'Culto Joven'],
    ],
  };

  const [homeData, setHomeData] = React.useState(DEFAULT_HOME);
  const [worshipData, setWorshipData] = React.useState(null);
  const [moments, setMoments] = React.useState([]);

  // Cargar las fotos del álbum destacado para la sección "Momentos" del inicio.
  React.useEffect(() => {
    if (window.IASD_API && window.IASD_API.fetchHomeAlbum) {
      window.IASD_API.fetchHomeAlbum()
        .then(function (album) {
          if (album && album.images && album.images.length > 0) {
            setMoments(
              album.images
                .filter(function (img) { return img.url; })
                .slice(0, 5)
                .map(function (img) {
                  return { url: img.url, caption: img.caption || album.title };
                })
            );
          }
        })
        .catch(function () {});
    }
  }, []);

  // Cargar datos desde la API al montar
  React.useEffect(() => {
    if (window.IASD_API && window.IASD_API.fetchHome) {
      window.IASD_API.fetchHome()
        .then(data => {
          // Merge con defaults para campos null
          setHomeData(prev => ({
            ...prev,
            hero: {
              title: data.hero.title || prev.hero.title,
              titleAccent: data.hero.titleAccent || prev.hero.titleAccent,
              subtitle: data.hero.subtitle || prev.hero.subtitle,
              mainImageUrl: data.hero.mainImageUrl,
              smallImageUrl: data.hero.smallImageUrl,
            },
            verse: {
              text: data.verse.text || prev.verse.text,
              reference: data.verse.reference || prev.verse.reference,
            },
            schedule: {
              title: data.schedule.title || prev.schedule.title,
              subtitle: data.schedule.subtitle || prev.schedule.subtitle,
            },
            social: {
              facebookUrl: data.social.facebookUrl || prev.social.facebookUrl,
              instagramUrl: data.social.instagramUrl || prev.social.instagramUrl,
              youtubeUrl: data.social.youtubeUrl || prev.social.youtubeUrl,
            },
            footerCta: {
              title: data.footerCta.title || prev.footerCta.title,
              subtitle: data.footerCta.subtitle || prev.footerCta.subtitle,
              buttonText: data.footerCta.buttonText || prev.footerCta.buttonText,
            },
            nextService: data.nextService || prev.nextService,
          }));
        })
        .catch(err => {
          console.warn('Error cargando inicio desde API:', err);
        });
    }

    if (window.IASD_API && window.IASD_API.fetchSchedule) {
      window.IASD_API.fetchSchedule()
        .then(data => {
          if (data && Array.isArray(data.days)) {
            // Tomar los primeros 3 items activos de cualquier día
            var items = [];
            data.days.forEach(day => {
              (day.items || []).forEach(item => {
                if (items.length < 3) {
                  items.push([day.label, item.time, item.title]);
                }
              });
            });
            if (items.length > 0) {
              setHomeData(prev => ({ ...prev, scheduleItems: items }));
            }
          }
        })
        .catch(() => {});
    }

    if (window.IASD_API && window.IASD_API.fetchWorship) {
      window.IASD_API.fetchWorship()
        .then(data => {
          if (!data) return;
          setWorshipData(data);
        })
        .catch(() => {
          setWorshipData(null);
        });
    }
  }, []);

  const nextService = React.useMemo(() => {
    if (worshipData && worshipData.date && worshipData.title) {
      return {
        title: worshipData.title,
        date: worshipData.date,
        where: 'Andrés Bello 748',
        location: 'Andrés Bello 748',
        imageUrl: homeData.nextService?.imageUrl || null,
        upcoming: !!worshipData.upcoming,
        preacher: worshipData.preacher || null,
        theme: worshipData.theme || null,
      };
    }
    return homeData.nextService;
  }, [worshipData, homeData.nextService]);

  const showPublishedDetails = !!(worshipData && worshipData.upcoming);
  const showUnpublishedHint = !!(worshipData && !worshipData.upcoming);

  return (
    <main className="page-enter" data-screen-label="Inicio">

      {/* HERO editorial: nombre grande izquierda, imagen alta derecha */}
      <section style={{
        paddingTop: 'clamp(36px, 5vw, 64px)',
        paddingBottom: 'clamp(40px, 6vw, 80px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="container">
          <div className="hero-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.05fr)',
            gap: 'clamp(28px, 4vw, 72px)',
            alignItems: 'center',
          }}>
            {/* Texto */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 14,
                marginBottom: 28,
              }}>
                <img src="assets/logo.png" alt="" style={{
                  width: 56, height: 56, objectFit: 'contain', flexShrink: 0
                }} />
                <div>
                  <div className="mono" style={{
                    fontSize: 10.5, color: 'var(--gold)', letterSpacing: '.18em',
                    textTransform: 'uppercase', fontWeight: 600,
                  }}>Iglesia Adventista</div>
                  <div className="mono" style={{
                    fontSize: 10.5, color: 'var(--muted)', letterSpacing: '.18em',
                    textTransform: 'uppercase', marginTop: 2,
                  }}>del Séptimo Día · Osorno</div>
                </div>
              </div>

              <h1 className="serif" style={{
                fontSize: 'clamp(56px, 9vw, 140px)',
                lineHeight: 0.92,
                letterSpacing: '-0.035em',
                fontWeight: 500,
                margin: 0,
              }}>
                {homeData.hero.title}
                {homeData.hero.titleAccent && (
                  <span style={{
                    display: 'block',
                    fontStyle: 'italic',
                    color: 'var(--gold)',
                    marginLeft: 'clamp(20px, 4vw, 60px)',
                  }}>{homeData.hero.titleAccent}</span>
                )}
              </h1>

              <div style={{
                marginTop: 'clamp(28px, 4vw, 44px)',
                maxWidth: 460,
              }}>
                <p style={{
                  fontSize: 'clamp(16px, 1.4vw, 19px)',
                  lineHeight: 1.55,
                  color: 'var(--fg)',
                }}>
                  {homeData.hero.subtitle}
                </p>
                <div style={{ marginTop: 28, display: 'inline-flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={() => setPage('programa')}>
                    Programa de hoy <Arrow />
                  </button>
                  <button className="btn btn-ghost" onClick={() => setPage('horarios')}>
                    Horarios
                  </button>
                </div>
              </div>

              {/* Mini-info bar */}
              <div style={{
                marginTop: 'clamp(40px, 5vw, 56px)',
                display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px, 3vw, 44px)',
                paddingTop: 24,
                borderTop: '1px solid var(--line)',
              }}>
                <MiniInfo label="Visítanos" value="Andrés Bello 748" sub="Osorno · Los Lagos" />
                {homeData.scheduleItems.map(([d, h, t], i) => (
                  <MiniInfo key={i} label={d} value={h} sub={t} gold />
                ))}
              </div>
            </div>

            {/* Imagen — slot principal alto + slot pequeño superpuesto */}
            <div style={{
              position: 'relative',
              minHeight: 'clamp(380px, 50vw, 640px)',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
              }}>
                <PhotoSlot id="home-hero-main"
                  label="Foto principal · interior / fachada"
                  height="100%"
                  radius={22}
                  src={homeData.hero.mainImageUrl}
                  style={{ height: '100%' }} />
              </div>
              {/* Pequeña foto offset abajo izquierda */}
              <div style={{
                position: 'absolute',
                left: '-8%',
                bottom: '-6%',
                width: '42%',
                aspectRatio: '4/5',
                boxShadow: '0 10px 40px rgba(27,44,92,.18)',
              }}>
                <PhotoSlot id="home-hero-small"
                  label="Detalle · congregación"
                  height="100%"
                  radius={16}
                  src={homeData.hero.smallImageUrl}
                  style={{ height: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verse band */}
      <section style={{
        background: 'var(--navy)', color: 'var(--cream)',
        padding: 'clamp(48px, 6vw, 88px) 0',
        marginTop: 'clamp(40px, 6vw, 80px)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p className="serif" style={{
            fontSize: 'clamp(28px, 3.4vw, 44px)',
            fontStyle: 'italic', lineHeight: 1.25, maxWidth: 820, margin: '0 auto',
            color: 'var(--cream)'
          }}>
            {homeData.verse.text}
          </p>
          <div className="mono" style={{
            marginTop: 22, fontSize: 12, opacity: .7, letterSpacing: '.16em'
          }}>
            {homeData.verse.reference.toUpperCase()}
          </div>
        </div>
      </section>

      {/* Próximo culto — tarjeta editorial */}
      {nextService && (
      <section className="section-tight">
        <div className="container">
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 18,
            padding: 'clamp(28px, 4vw, 52px)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, .9fr)',
            gap: 'clamp(28px, 4vw, 56px)',
            alignItems: 'center',
          }} className="next-service-card">
            <div>
              <div className="kicker">Próximo culto</div>
              <h2 className="serif" style={{
                fontSize: 'clamp(28px, 3.6vw, 44px)', marginTop: 14,
                lineHeight: 1.05,
              }}>
                {nextService.title}
              </h2>
              <div style={{
                marginTop: 18, display: 'flex', gap: 28, flexWrap: 'wrap'
              }}>
                <div>
                  <div className="mono" style={{
                    fontSize: 10.5, color: 'var(--muted)', letterSpacing: '.14em',
                    textTransform: 'uppercase', fontWeight: 600,
                  }}>Cuándo</div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4 }}>
                    {nextService.date
                      ? formatNextWorshipDate(nextService.date)
                      : nextService.when}
                  </div>
                </div>
                <div>
                  <div className="mono" style={{
                    fontSize: 10.5, color: 'var(--muted)', letterSpacing: '.14em',
                    textTransform: 'uppercase', fontWeight: 600,
                  }}>Dónde</div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4 }}>
                    {nextService.location || nextService.where}
                  </div>
                </div>
                {showPublishedDetails ? (
                  <>
                    {nextService.preacher && (
                      <div>
                        <div className="mono" style={{
                          fontSize: 10.5, color: 'var(--muted)', letterSpacing: '.14em',
                          textTransform: 'uppercase', fontWeight: 600,
                        }}>Predicador</div>
                        <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4 }}>
                          {nextService.preacher}
                        </div>
                      </div>
                    )}
                    {nextService.theme && (
                      <div>
                        <div className="mono" style={{
                          fontSize: 10.5, color: 'var(--muted)', letterSpacing: '.14em',
                          textTransform: 'uppercase', fontWeight: 600,
                        }}>Tema</div>
                        <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4 }}>
                          {nextService.theme}
                        </div>
                      </div>
                    )}
                  </>
                ) : showUnpublishedHint ? (
                  <div>
                    <div className="mono" style={{
                      fontSize: 10.5, color: 'var(--muted)', letterSpacing: '.14em',
                      textTransform: 'uppercase', fontWeight: 600,
                    }}>Estado</div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4, color: 'var(--muted)' }}>
                      Programa aun no publicado
                    </div>
                  </div>
                ) : null}
              </div>
              <div style={{ marginTop: 28, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => setPage('programa')}>
                  Ver programa <Arrow />
                </button>
                <button className="btn btn-ghost" onClick={() => setPage('envivo')}>
                  Transmisión en vivo
                </button>
              </div>
            </div>
            <div style={{ aspectRatio: '4/3' }}>
              <PhotoSlot id="home-next-service"
                label="Foto · ambiente del culto"
                height="100%"
                radius={14}
                src={nextService.imageUrl}
                style={{ height: '100%' }} />
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Tres horarios — barra rítmica */}
      <section className="section-tight" style={{ paddingTop: nextService ? 0 : 'clamp(40px, 6vw, 80px)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="kicker">{homeData.schedule.title}</div>
            <p className="muted" style={{ marginTop: 8 }}>{homeData.schedule.subtitle}</p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
            borderTop: '1px solid var(--line)'
          }}>
            {homeData.scheduleItems.map(([d, h, t], i) => (
              <div key={d + h + i} style={{
                padding: '32px 28px',
                borderRight: i < homeData.scheduleItems.length - 1 ? '1px solid var(--line)' : 0,
                borderBottom: '1px solid var(--line)'
              }}>
                <div className="mono" style={{
                  fontSize: 11, color: 'var(--gold)', letterSpacing: '.16em'
                }}>{d.toUpperCase()}</div>
                <div className="serif" style={{ fontSize: 36, fontWeight: 500, marginTop: 12,
                  fontFeatureSettings: '"tnum"' }}>{h}</div>
                <div className="muted" style={{ fontSize: 14, marginTop: 8 }}>{t}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button className="btn btn-ghost" onClick={() => setPage('horarios')}>
              Ver todos los horarios <Arrow />
            </button>
          </div>
        </div>
      </section>

      {/* MOMENTOS — galería editorial mixta */}
      <section className="section-tight">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div className="kicker">Momentos</div>
              <h2 className="serif" style={{ fontSize: 'clamp(30px, 3.8vw, 44px)', marginTop: 10 }}>
                Vida de la <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>congregación</span>
              </h2>
            </div>
            <button className="btn btn-ghost" onClick={() => setPage('galeria')}>
              Ver galería completa <Arrow />
            </button>
          </div>
          {/* Grid asimétrico editorial — alimentado desde el módulo de Galería */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gridAutoRows: '180px',
            gap: 14,
          }} className="moments-grid">
            {[
              { id: 'home-mom-1', label: 'Culto', span: 'span 3', row: 'span 2' },
              { id: 'home-mom-2', label: 'Bautismo', span: 'span 2' },
              { id: 'home-mom-3', label: 'Coro', span: 'span 1' },
              { id: 'home-mom-4', label: 'Niños', span: 'span 1' },
              { id: 'home-mom-5', label: 'Jóvenes', span: 'span 2' },
            ].map(function (cell, i) {
              var img = moments[i] || null;
              return (
                <div key={cell.id} style={{ gridColumn: cell.span, gridRow: cell.row }}>
                  <PhotoSlot
                    id={cell.id}
                    label={img ? img.caption : cell.label}
                    height="100%"
                    src={img ? img.url : null}
                    style={{ height: '100%' }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Síguenos en redes */}
      <section style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--line-2)',
        padding: 'clamp(48px, 6vw, 80px) 0'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="kicker">Síguenos en redes</div>
          <h2 className="serif" style={{
            fontSize: 'clamp(28px, 3.4vw, 40px)', marginTop: 12, marginBottom: 28
          }}>
            Conectados todos los días
          </h2>
          <div style={{ display: 'inline-flex', justifyContent: 'center' }}>
            <SocialLinks tone="navy" size="lg" />
          </div>
          <div style={{
            marginTop: 24, display: 'flex', justifyContent: 'center', gap: 28,
            flexWrap: 'wrap'
          }}>
            {[
              { name: 'Facebook', url: homeData.social.facebookUrl, handle: 'fb.com/iasdosornocentral' },
              { name: 'Instagram', url: homeData.social.instagramUrl, handle: '@iasdosornocentral' },
              { name: 'YouTube', url: homeData.social.youtubeUrl, handle: 'youtube.com/iasdosornocentral' },
            ].filter(s => s.url).map(s => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                className="mono" style={{
                  fontSize: 12, letterSpacing: '.12em', color: 'var(--muted)',
                  textTransform: 'uppercase'
                }}>
                {s.handle}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section style={{
        borderTop: '1px solid var(--line-2)',
        padding: 'clamp(56px, 7vw, 96px) 0'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="serif" style={{
            fontSize: 'clamp(32px, 4.4vw, 52px)',
            maxWidth: 720, margin: '0 auto'
          }}>
            {homeData.footerCta.title}
          </h2>
          <p className="muted" style={{ marginTop: 18, fontSize: 16, maxWidth: 480, margin: '18px auto 0' }}>
            {homeData.footerCta.subtitle}
          </p>
          <div style={{ marginTop: 32 }}>
            <button className="btn btn-primary" onClick={() => window.open('https://maps.google.com/?q=Andres+Bello+748+Osorno', '_blank')}>
              {homeData.footerCta.buttonText} <Arrow />
            </button>
          </div>
        </div>
      </section>
    </main>);

}

// Mini-info cell for hero footer-row
function MiniInfo({ label, value, sub, gold }) {
  return (
    <div>
      <div className="mono" style={{
        fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase',
        color: 'var(--muted)', fontWeight: 600,
      }}>{label}</div>
      <div className="serif" style={{
        fontSize: 22, fontWeight: 500, marginTop: 6,
        color: gold ? 'var(--gold)' : 'var(--fg)',
        fontFeatureSettings: '"tnum"',
      }}>{value}</div>
      {sub && (
        <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>);

}

function formatNextWorshipDate(dateStr) {
  var date = dateStr && dateStr.indexOf('T') !== -1
    ? new Date(dateStr)
    : new Date(dateStr + 'T11:00:00');
  if (Number.isNaN(date.getTime())) return dateStr;
  var label = date.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return label + ' · 11:00 h';
}

// ═════════════════════════════════════════════════════════
// LIDERAZGO (antes Nosotros) — junta directiva + ministerios
// ═════════════════════════════════════════════════════════
function PageNosotros({ setPage }) {
  // Datos por defecto (fallback si la API falla)
  const DEFAULT_BOARD = [
    { role: 'Pastor',     name: 'Israel Jaramillo', photoUrl: null },
    { role: 'Tesorero',   name: 'Jaime Leal',       photoUrl: null },
    { role: 'Secretaria', name: 'Ruth García',      photoUrl: null },
  ];

  const DEFAULT_MINISTRIES = [
    { role: 'Diáconos',          name: 'Beergreen Lafontant' },
    { role: 'Diaconisas',        name: 'Yessica Díaz' },
    { role: 'Jóvenes',           name: 'Ignacio Matamala' },
    { role: 'Adolescente',       name: 'Javier Huerta y Devora Aranda' },
    { role: 'Infantil',          name: 'Alejandra Huerta' },
    { role: 'Mujer',             name: 'Ljubiza Carrasco' },
    { role: 'Música',            name: 'Luis Care' },
    { role: 'Familia',           name: 'Javier Cid y Mariana Care' },
    { role: 'Comunicaciones',    name: 'Alejandro Care' },
    { role: 'Personal',          name: 'Glen Jaramillo' },
    { role: 'Publicaciones',     name: 'Palmenia Navarrete' },
    { role: 'Posibilidades',     name: 'Paulina Rojel' },
    { role: 'Salud',             name: 'Jaime López' },
    { role: 'Mayordomía',        name: 'Felipe Cobos' },
    { role: 'ASA',               name: 'Luis Contreras' },
    { role: 'Escuela Sabática',  name: 'Alejandra Navarro' },
  ];

  // Estado dinámico desde la API
  const [boardPhotoUrl, setBoardPhotoUrl] = React.useState(null);
  const [board, setBoard] = React.useState(DEFAULT_BOARD);
  const [ministries, setMinistries] = React.useState(DEFAULT_MINISTRIES);

  // Cargar datos desde la API al montar
  React.useEffect(() => {
    if (window.IASD_API && window.IASD_API.fetchLeadership) {
      window.IASD_API.fetchLeadership()
        .then(data => {
          if (data.boardPhotoUrl) setBoardPhotoUrl(data.boardPhotoUrl);
          if (data.board && data.board.length > 0) setBoard(data.board);
          if (data.ministries && data.ministries.length > 0) setMinistries(data.ministries);
        })
        .catch(err => {
          console.warn('Error cargando liderazgo desde API, usando datos por defecto:', err);
        });
    }
  }, []);

  return (
    <main className="page-enter" data-screen-label="Liderazgo">
      {/* Hero */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="kicker">Liderazgo</div>
          <h1 className="serif" style={{
            fontSize: 'clamp(44px, 6.4vw, 84px)',
            marginTop: 20, lineHeight: 1,
            maxWidth: 880, margin: '20px auto 0'
          }}>
            Quienes <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>sirven</span> cada semana
          </h1>
          <p className="muted" style={{
            marginTop: 28, fontSize: 18, maxWidth: 620, margin: '28px auto 0', lineHeight: 1.55
          }}>
            Nuestra junta directiva y los líderes de cada ministerio
            trabajan por el bienestar espiritual de la congregación.
          </p>
        </div>
      </section>

      {/* Foto grupal */}
      <section className="section-tight" style={{ paddingTop: 0 }}>
        <div className="container">
          {boardPhotoUrl ? (
            <img
              src={boardPhotoUrl}
              alt="Foto grupal · junta de iglesia"
              style={{
                width: '100%',
                height: 'clamp(280px, 42vw, 560px)',
                objectFit: 'cover',
                borderRadius: 18,
              }}
            />
          ) : (
            <PhotoSlot
              id="liderazgo-grupal"
              label="Foto grupal · junta de iglesia"
              height="clamp(280px, 42vw, 560px)"
              radius={18} />
          )}
        </div>
      </section>

      {/* Junta directiva */}
      <section className="section" style={{
        paddingTop: 'clamp(40px, 6vw, 72px)',
        paddingBottom: 'clamp(40px, 6vw, 72px)',
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="kicker">Junta directiva</div>
            <h2 className="serif" style={{
              fontSize: 'clamp(28px, 3.6vw, 40px)', marginTop: 12
            }}>
              Responsables principales
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
            maxWidth: 880, margin: '0 auto',
          }}>
            {board.map(p => (
              <div key={p.role} style={{
                textAlign: 'center',
                padding: '32px 24px',
                border: '1px solid var(--line)',
                borderRadius: 16,
                background: 'var(--surface)',
              }}>
                <div style={{
                  width: 120, height: 120, margin: '0 auto 18px',
                }}>
                  {p.photoUrl ? (
                    <img
                      src={p.photoUrl}
                      alt={p.name}
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <PhotoSlot id={p.slot || 'leader-' + p.role} label="Retrato"
                      height={120} shape="circle" radius={60} />
                  )}
                </div>
                <div className="mono" style={{
                  fontSize: 11, color: 'var(--gold)', letterSpacing: '.14em',
                  textTransform: 'uppercase', fontWeight: 600,
                }}>
                  {p.role}
                </div>
                <div className="serif" style={{
                  fontSize: 22, fontWeight: 500, marginTop: 8, lineHeight: 1.2,
                }}>
                  {p.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ministerios */}
      <section className="section" style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--line-2)',
        borderBottom: '1px solid var(--line-2)',
        paddingTop: 'clamp(56px, 7vw, 96px)',
        paddingBottom: 'clamp(56px, 7vw, 96px)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="kicker">Ministerios</div>
            <h2 className="serif" style={{
              fontSize: 'clamp(32px, 4vw, 48px)', marginTop: 14
            }}>
              Líderes por área
            </h2>
            <p className="muted" style={{
              marginTop: 16, fontSize: 15, maxWidth: 520, margin: '16px auto 0'
            }}>
              Cada ministerio cuenta con un líder responsable de coordinar su servicio en la iglesia.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 0,
            maxWidth: 1100, margin: '0 auto',
            borderTop: '1px solid var(--line)',
            borderLeft: '1px solid var(--line)',
            background: 'var(--bg)',
          }}>
            {ministries.map((m, i) => (
              <div key={m.role} style={{
                padding: '22px 24px',
                borderRight: '1px solid var(--line)',
                borderBottom: '1px solid var(--line)',
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 6,
              }}>
                <div className="mono" style={{
                  fontSize: 10.5, color: 'var(--gold)', letterSpacing: '.14em',
                  textTransform: 'uppercase', fontWeight: 600,
                }}>
                  Min. {m.role}
                </div>
                <div className="serif" style={{
                  fontSize: 18, fontWeight: 500, lineHeight: 1.3,
                }}>
                  {m.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <p className="serif" style={{
            fontSize: 'clamp(22px, 2.8vw, 30px)', fontStyle: 'italic',
            maxWidth: 720, margin: '0 auto', lineHeight: 1.4,
          }}>
            «Cada uno según el don que ha recibido, minístrelo a los otros,
            como buenos administradores de la multiforme gracia de Dios.»
          </p>
          <div className="mono" style={{
            marginTop: 18, fontSize: 11, color: 'var(--gold)', letterSpacing: '.16em'
          }}>
            1ª PEDRO 4:10
          </div>
          <button className="btn btn-primary" style={{ marginTop: 36 }}
            onClick={() => setPage('horarios')}>
            Ver horarios <Arrow />
          </button>
        </div>
      </section>
    </main>);

}

// ═════════════════════════════════════════════════════════
// GALERÍA — many photo slots
// ═════════════════════════════════════════════════════════
function PageGaleria() {
  // Datos por defecto (fallback si la API falla)
  const DEFAULT_COLLECTIONS = [
    {
      title: 'Cultos y predicaciones',
      kicker: 'Sábados',
      slots: [
        ['gal-cultos-1', 'Culto Divino', 360, 'wide'],
        ['gal-cultos-2', 'Predicación', 360, ''],
        ['gal-cultos-3', 'Escuela Sabática', 240, ''],
        ['gal-cultos-4', 'Coro', 240, ''],
        ['gal-cultos-5', 'Lectura bíblica', 240, ''],
      ]
    },
    {
      title: 'Bautismos y compromisos',
      kicker: 'Momentos especiales',
      slots: [
        ['gal-baut-1', 'Bautismo', 320, ''],
        ['gal-baut-2', 'Bautismo · río', 320, ''],
        ['gal-baut-3', 'Imposición de manos', 320, ''],
      ]
    },
    {
      title: 'Ministerios',
      kicker: 'Vida en comunidad',
      slots: [
        ['gal-min-1', 'Ministerio de Jóvenes', 260, ''],
        ['gal-min-2', 'Ministerio de Niños', 260, ''],
        ['gal-min-3', 'Conquistadores', 260, ''],
        ['gal-min-4', 'Damas', 260, ''],
        ['gal-min-5', 'Música', 260, ''],
        ['gal-min-6', 'Acción solidaria', 260, ''],
      ]
    },
    {
      title: 'Eventos especiales',
      kicker: 'A través del año',
      slots: [
        ['gal-ev-1', 'Semana Santa', 380, 'wide'],
        ['gal-ev-2', 'Día del Pastor', 280, ''],
        ['gal-ev-3', 'Aniversario de la iglesia', 280, ''],
      ]
    },
  ];

  const [collections, setCollections] = React.useState(DEFAULT_COLLECTIONS);
  const [galleryHeader, setGalleryHeader] = React.useState({
    title: 'Vida de la congregación',
    intro: 'Momentos de adoración, comunión y servicio.',
  });

  React.useEffect(() => {
    if (window.IASD_API && window.IASD_API.fetchGallery) {
      window.IASD_API.fetchGallery()
        .then(function (albums) {
          if (albums && albums.length > 0) {
            // Convertir álbumes de la API al formato de collections
            var mapped = albums.map(function (album) {
              return {
                title: album.title,
                kicker: album.kicker || 'Galería',
                slots: (album.images || []).map(function (img, idx) {
                  return [
                    img.id || ('gal-' + idx),
                    img.caption || '',
                    img.height || 360,
                    img.kind || '',
                    img.url || null,
                  ];
                }),
              };
            });
            setCollections(mapped);
          }
        })
        .catch(function (err) {
          console.warn('Error cargando galería desde API:', err);
        });
    }

    // Cargar configuración de galería (header_title, intro_text)
    if (window.IASD_API && window.IASD_API.apiGet) {
      Promise.all([
        window.IASD_API.apiGet('/site-config/settings/galeria.header_title').catch(function () { return null; }),
        window.IASD_API.apiGet('/site-config/settings/galeria.intro_text').catch(function () { return null; }),
      ]).then(function (results) {
        setGalleryHeader(function (prev) {
          return {
            title: (results[0] && results[0].value) || prev.title,
            intro: (results[1] && results[1].value) || prev.intro,
          };
        });
      }).catch(function () {});
    }
  }, []);

  return (
    <main className="page-enter" data-screen-label="Galería">
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="kicker">Galería</div>
            <h1 className="serif" style={{
              fontSize: 'clamp(44px, 6vw, 80px)', marginTop: 18, lineHeight: 1,
              maxWidth: 820, margin: '18px auto 0'
            }}>
              {galleryHeader.title.split(' ').length > 2 ? (
                <>{galleryHeader.title.split(' ').slice(0, -2).join(' ')} <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{galleryHeader.title.split(' ').slice(-2).join(' ')}</span></>
              ) : (
                galleryHeader.title
              )}
            </h1>
            <p className="muted" style={{
              marginTop: 22, fontSize: 16, maxWidth: 540, margin: '22px auto 0'
            }}>
              {galleryHeader.intro}
            </p>
          </div>

          {collections.map((c, ci) => (
            <div key={ci} style={{ marginBottom: 80 }}>
              <div style={{ marginBottom: 24 }}>
                <div className="kicker">{c.kicker}</div>
                <h2 className="serif" style={{
                  fontSize: 'clamp(26px, 3vw, 36px)', marginTop: 10
                }}>{c.title}</h2>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: 14
              }}>
                {c.slots.map((slot, si) => {
                  var id = slot[0], label = slot[1], h = slot[2], kind = slot[3], src = slot[4] || null;
                  return (
                    <div key={id} style={{
                      gridColumn: kind === 'wide'
                        ? 'span 3'
                        : (c.slots.length <= 3 ? 'span 2' : 'span 2'),
                    }}>
                      <PhotoSlot id={id} label={label} height={h} src={src} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { PageInicio, PageNosotros, PageGaleria, Arrow });
