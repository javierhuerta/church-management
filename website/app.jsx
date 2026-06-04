// app.jsx — root, routing, tweaks
const { useState: useSA, useEffect: useEA, useMemo: useMA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "claro",
  "accent": "#B89055",
  "density": "regular",
  "live": true,
  "fontScale": 1
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = [
  '#B89055', // dorado (default)
  '#3B5BA8', // azul claro
  '#7E8E5C', // verde sur
  '#A65A4A', // terracota
];

const VALID_PAGES = ['inicio', 'nosotros', 'horarios', 'calendario', 'programa', 'galeria', 'envivo', 'acceso', 'documentos'];

function AppInner() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const store = useStore();
  const [page, setPage] = useSA(() => {
    const h = window.location.hash.slice(1);
    return VALID_PAGES.includes(h) ? h : 'inicio';
  });

  // Sync hash
  useEA(() => {
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);

  // theme attr
  useEA(() => {
    document.documentElement.setAttribute('data-theme', t.theme === 'oscuro' ? 'dark' : 'light');
  }, [t.theme]);

  // accent
  useEA(() => {
    document.documentElement.style.setProperty('--gold', t.accent);
    document.documentElement.style.setProperty('--gold-2',
      `color-mix(in oklab, ${t.accent} 70%, #fff)`);
  }, [t.accent]);

  // density
  useEA(() => {
    document.documentElement.style.fontSize = (t.fontScale * 16) + 'px';
  }, [t.fontScale]);

  const nextService = useMA(() => ({
    title: 'Culto Divino · No se preocupen por la vida',
    when: 'Sábado 23 · 11:00 h',
    where: 'Andrés Bello 748',
  }), []);

  const PageComp = useMA(() => {
    switch (page) {
      case 'inicio':     return <PageInicio setPage={setPage} nextService={nextService} />;
      case 'nosotros':   return <PageNosotros setPage={setPage} />;
      case 'horarios':   return <PageHorarios />;
      case 'envivo':     return <PageEnVivo isLive={t.live} />;
      case 'calendario': return <PageCalendarioEditable store={store} />;
      case 'programa':   return <PagePrograma store={store} />;
      case 'galeria':    return <PageGaleria />;
      case 'documentos': return <PageDocumentos store={store} setPage={setPage} />;
      case 'acceso':     return <PageAcceso setPage={setPage} />;
      default:           return <PageInicio setPage={setPage} nextService={nextService} />;
    }
  }, [page, t.live, nextService, store.events, store.program, store.docs]);

  return (
    <div className="shell">
      <Nav page={page} setPage={setPage} isLive={t.live} />
      {PageComp}
      <Footer setPage={setPage} />

      <TweaksPanel>
        <TweakSection label="Apariencia" />
        <TweakRadio
          label="Tema"
          value={t.theme}
          options={['claro', 'oscuro']}
          onChange={v => setTweak('theme', v)}
        />
        <TweakColor
          label="Color de acento"
          value={t.accent}
          options={ACCENT_OPTIONS}
          onChange={v => setTweak('accent', v)}
        />
        <TweakSlider
          label="Escala tipográfica"
          value={t.fontScale}
          min={0.9} max={1.15} step={0.05}
          onChange={v => setTweak('fontScale', v)}
        />

        <TweakSection label="Demo" />
        <TweakToggle
          label="Iglesia transmitiendo en vivo"
          value={t.live}
          onChange={v => setTweak('live', v)}
        />
      </TweaksPanel>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

try {
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
} catch (e) {
  console.error('App render error:', e && (e.stack || e.message || e));
  document.getElementById('root').innerHTML = '<pre style="padding:20px;color:#900">' + (e && e.stack || e) + '</pre>';
}
