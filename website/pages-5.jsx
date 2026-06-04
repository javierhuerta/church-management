// pages-5.jsx — Repositorio de Documentos (requiere sesión)
const { useState: useS5, useMemo: useM5, useRef: useR5 } = React;

const DOC_CATEGORIES = [
  'Actas de Junta',
  'Tesorería',
  'Planes y Programas',
  'Reglamentos',
  'Comunicados',
  'Otros',
];

const MAX_UPLOAD_KB = 1500; // limit for embedded base64 storage (~1.5 MB)

// Pretty file-size + date
function formatSize(kb) {
  if (kb < 1024) return kb + ' KB';
  return (kb / 1024).toFixed(1) + ' MB';
}
function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

// File-type icon (simplified — based on extension)
function FileIcon({ type, name, size = 36 }) {
  const ext = (name?.split('.').pop() || '').toLowerCase();
  let label = ext.toUpperCase().slice(0, 4);
  let bg = 'var(--surface)';
  let fg = 'var(--muted)';
  if (ext === 'pdf')                       { bg = 'color-mix(in oklab, #E25C5C 22%, var(--bg))'; fg = '#9c2b2b'; }
  else if (['doc','docx'].includes(ext))   { bg = 'color-mix(in oklab, #3B5BA8 22%, var(--bg))'; fg = '#1c3d8a'; }
  else if (['xls','xlsx','csv'].includes(ext)) { bg = 'color-mix(in oklab, #2A7F4F 22%, var(--bg))'; fg = '#1a5c39'; }
  else if (['ppt','pptx'].includes(ext))   { bg = 'color-mix(in oklab, #D97757 22%, var(--bg))'; fg = '#9b4f3a'; }
  else if (['jpg','jpeg','png','gif','webp'].includes(ext)) { bg = 'color-mix(in oklab, var(--gold) 24%, var(--bg))'; fg = 'var(--navy)'; }

  if (!ext) { label = 'DOC'; }

  return (
    <div style={{
      width: size, height: size * 1.2,
      background: bg, color: fg,
      borderRadius: 4,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 700, fontFamily: 'var(--mono)',
      letterSpacing: '.04em', flexShrink: 0,
      border: '1px solid color-mix(in oklab, currentColor 22%, transparent)',
    }}>{label}</div>
  );
}

// ═════════════════════════════════════════════════════════
// REPOSITORIO DE DOCUMENTOS
// ═════════════════════════════════════════════════════════
function PageDocumentos({ store, setPage }) {
  const { session, can } = useAuth();
  const { docs, setDocs, resetDocs } = store;

  // Gate: login required
  if (!session) {
    return (
      <main className="page-enter" data-screen-label="Documentos · acceso">
        <section className="section">
          <div className="container" style={{ maxWidth: 540, textAlign: 'center' }}>
            <div style={{
              margin: '0 auto 28px',
              width: 64, height: 64, borderRadius: '50%',
              background: 'color-mix(in oklab, var(--gold) 20%, var(--bg))',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--gold)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div className="kicker">Área privada</div>
            <h1 className="serif" style={{
              fontSize: 'clamp(36px, 5vw, 56px)', marginTop: 16, lineHeight: 1.02
            }}>
              Repositorio de <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>documentos</span>
            </h1>
            <p className="muted" style={{ marginTop: 18, fontSize: 15, lineHeight: 1.55 }}>
              Acceso restringido a líderes de la iglesia. Inicia sesión para ver
              actas de junta, planes anuales, presupuestos y otros documentos internos.
            </p>
            <a className="btn btn-primary" style={{ marginTop: 32, textDecoration: 'none' }}
              href={ADMIN_URL}>
              Iniciar sesión
            </a>
          </div>
        </section>
      </main>
    );
  }

  const [categoryFilter, setCategoryFilter] = useS5('Todas');
  const [search, setSearch] = useS5('');
  const [showUpload, setShowUpload] = useS5(false);

  const canUpload = can('uploadDocs');
  const isAdmin = can('admin');

  const filtered = useM5(() => {
    let list = [...docs].sort((a, b) =>
      (b.uploadedAt || '').localeCompare(a.uploadedAt || ''));
    if (categoryFilter !== 'Todas') list = list.filter(d => d.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        (d.uploader || '').toLowerCase().includes(q));
    }
    return list;
  }, [docs, categoryFilter, search]);

  const grouped = useM5(() => {
    const g = {};
    filtered.forEach(d => { (g[d.category] = g[d.category] || []).push(d); });
    return Object.entries(g);
  }, [filtered]);

  const addDoc = (doc) => setDocs([{ ...doc, id: 'd-' + Date.now() }, ...docs]);
  const removeDoc = (id) => {
    if (!confirm('¿Eliminar este documento? Esta acción no se puede deshacer.')) return;
    setDocs(docs.filter(d => d.id !== id));
  };
  const downloadDoc = (d) => {
    if (!d.dataUrl) {
      alert('Este es un documento de demostración sin archivo adjunto.\n\nEn el sistema real, aquí descargarías el archivo.');
      return;
    }
    const a = document.createElement('a');
    a.href = d.dataUrl;
    a.download = d.title + '.' + (d.fileType?.split('/').pop() || 'pdf');
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <main className="page-enter" data-screen-label="Documentos">
      <section className="section">
        <div className="container">
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            gap: 24, flexWrap: 'wrap', marginBottom: 36,
          }}>
            <div>
              <div className="kicker">Área privada · {levelLabel(session.level)}</div>
              <h1 className="serif" style={{
                fontSize: 'clamp(40px, 5.4vw, 68px)', marginTop: 14, lineHeight: 1,
              }}>
                Repositorio de <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>documentos</span>
              </h1>
              <p className="muted" style={{ marginTop: 14, fontSize: 15, maxWidth: 540, lineHeight: 1.5 }}>
                {canUpload
                  ? 'Sube, organiza y comparte documentos importantes con la junta y líderes.'
                  : 'Consulta documentos disponibles. Para subir o eliminar archivos, contacta a la administración.'}
              </p>
            </div>
            {canUpload && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-primary"
                  onClick={() => setShowUpload(true)}>
                  + Subir documento
                </button>
                {isAdmin && (
                  <button className="btn btn-ghost"
                    onClick={() => { if (confirm('¿Restaurar documentos por defecto? Se perderán los subidos.')) resetDocs(); }}>
                    Restaurar
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Filtros */}
          <div style={{
            display: 'flex', gap: 12, marginBottom: 28,
            flexWrap: 'wrap', alignItems: 'center',
          }}>
            <input
              type="text"
              placeholder="Buscar por título, categoría o autor…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: '1 1 320px',
                minWidth: 220,
                padding: '12px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: 10,
                fontSize: 14,
                fontFamily: 'var(--sans)',
                color: 'var(--fg)',
                outline: 'none',
              }} />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{
                padding: '12px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: 10,
                fontSize: 14,
                fontFamily: 'var(--sans)',
                color: 'var(--fg)',
                outline: 'none',
                cursor: 'pointer',
              }}>
              <option value="Todas">Todas las categorías</option>
              {DOC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Doc list */}
          {filtered.length === 0 ? (
            <div className="muted" style={{
              textAlign: 'center', padding: '60px 20px',
              border: '1px dashed var(--line)', borderRadius: 12,
              fontSize: 14,
            }}>
              No se encontraron documentos {search ? 'con ese filtro' : ''}.
            </div>
          ) : (
            grouped.map(([cat, list]) => (
              <div key={cat} style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
                  <h2 className="serif" style={{ fontSize: 22, fontWeight: 500 }}>{cat}</h2>
                  <span className="mono muted" style={{ fontSize: 11, letterSpacing: '.1em' }}>
                    {list.length} {list.length === 1 ? 'doc.' : 'docs.'}
                  </span>
                  <div className="rule" style={{ flex: 1 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {list.map(d => (
                    <div key={d.id} style={{
                      display: 'grid',
                      gridTemplateColumns: '44px 1fr auto auto',
                      gap: 18,
                      alignItems: 'center',
                      padding: '14px 18px',
                      background: 'var(--bg)',
                      border: '1px solid var(--line-2)',
                      borderRadius: 10,
                      transition: 'border-color .15s, background .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'var(--surface)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line-2)'; e.currentTarget.style.background = 'var(--bg)'; }}>
                      <FileIcon type={d.fileType} name={d.fileName || (d.title + '.pdf')} />
                      <div style={{ minWidth: 0 }}>
                        <div className="serif" style={{
                          fontSize: 16, fontWeight: 500, lineHeight: 1.25,
                          overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {d.title}
                        </div>
                        <div className="muted" style={{
                          fontSize: 12, marginTop: 4,
                          display: 'flex', gap: 12, flexWrap: 'wrap',
                        }}>
                          <span>{d.uploader || 'Sin autor'}</span>
                          <span>·</span>
                          <span>{formatDate(d.uploadedAt)}</span>
                          <span>·</span>
                          <span className="mono" style={{ fontSize: 11, letterSpacing: '.04em' }}>
                            {formatSize(d.sizeKB || 0)}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => downloadDoc(d)}
                        className="mono"
                        title={d.dataUrl ? 'Descargar archivo' : 'Documento de demostración'}
                        style={{
                          background: 'transparent', border: '1px solid var(--line)',
                          borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
                          fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase',
                          fontWeight: 600, color: 'var(--fg)',
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                        }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M6 2v6m0 0L3 5m3 3l3-3M2 10h8" stroke="currentColor"
                            strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Descargar
                      </button>
                      {can('deleteDocs') && (
                        <button onClick={() => removeDoc(d.id)}
                          title="Eliminar"
                          style={{
                            background: 'transparent', border: '1px solid var(--line)',
                            borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
                            color: '#c14747',
                            display: 'inline-flex', alignItems: 'center',
                          }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 4h8m-6 0V3a1 1 0 011-1h2a1 1 0 011 1v1m-4 0v7a1 1 0 001 1h2a1 1 0 001-1V4"
                              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Footer hint */}
          <div className="muted" style={{
            marginTop: 24, textAlign: 'center', fontSize: 12,
            paddingTop: 24, borderTop: '1px solid var(--line-2)',
          }}>
            {canUpload
              ? `Archivos hasta ${MAX_UPLOAD_KB / 1024} MB se almacenan localmente. En producción se integrará con un backend seguro.`
              : 'Tu cuenta tiene acceso de solo lectura.'}
          </div>
        </div>
      </section>

      {/* Upload modal */}
      {showUpload && canUpload && (
        <UploadModal
          uploader={session.name}
          onAdd={addDoc}
          onClose={() => setShowUpload(false)} />
      )}
    </main>
  );
}

// ─────────────────────────────────────────────────────────
// UPLOAD MODAL
function UploadModal({ uploader, onAdd, onClose }) {
  const [title, setTitle] = useS5('');
  const [category, setCategory] = useS5(DOC_CATEGORIES[0]);
  const [file, setFile] = useS5(null);
  const [error, setError] = useS5(null);
  const [busy, setBusy] = useS5(false);
  const fileRef = useR5(null);

  const handleFile = (f) => {
    if (!f) return;
    setError(null);
    const sizeKB = Math.round(f.size / 1024);
    if (sizeKB > MAX_UPLOAD_KB) {
      setError(`El archivo excede ${MAX_UPLOAD_KB / 1024} MB (es ${formatSize(sizeKB)}). Reduce el tamaño o usa un PDF comprimido.`);
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Selecciona un archivo.'); return; }
    if (!title.trim()) { setError('Ingresa un título.'); return; }
    setBusy(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        onAdd({
          title: title.trim(),
          category,
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          sizeKB: Math.round(file.size / 1024),
          dataUrl: reader.result,
          uploader,
          uploadedAt: new Date().toISOString(),
        });
        onClose();
      };
      reader.onerror = () => { setError('Error al leer el archivo.'); setBusy(false); };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Error inesperado: ' + err.message);
      setBusy(false);
    }
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(20, 33, 61, .55)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg)',
        borderRadius: 16,
        maxWidth: 520, width: '100%',
        padding: 28,
        boxShadow: '0 20px 60px rgba(20,33,61,.3)',
        maxHeight: '90vh', overflow: 'auto',
      }}>
        <div className="kicker">Subir documento</div>
        <h2 className="serif" style={{
          fontSize: 28, fontWeight: 500, marginTop: 10, marginBottom: 24,
        }}>Añadir al repositorio</h2>

        <form onSubmit={submit}>
          <Field label="Título">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Ej. Acta de Junta · 20 de mayo"
              style={fieldInput} />
          </Field>

          <Field label="Categoría">
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ ...fieldInput, cursor: 'pointer' }}>
              {DOC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Archivo">
            <input ref={fileRef} type="file" hidden
              onChange={e => handleFile(e.target.files[0])} />
            <button type="button"
              onClick={() => fileRef.current?.click()}
              style={{
                width: '100%',
                padding: '20px 16px',
                background: 'var(--surface)',
                border: '1px dashed var(--line)',
                borderRadius: 10,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--sans)',
                color: 'var(--fg)',
                fontSize: 14,
              }}>
              {file
                ? (<>
                    <div style={{ fontWeight: 500 }}>{file.name}</div>
                    <div className="muted mono" style={{ fontSize: 11, marginTop: 4 }}>
                      {formatSize(Math.round(file.size / 1024))}
                    </div>
                  </>)
                : (<>
                    <div style={{ fontWeight: 500 }}>Seleccionar archivo…</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                      PDF, DOCX, XLSX, imágenes · hasta {MAX_UPLOAD_KB / 1024} MB
                    </div>
                  </>)}
            </button>
          </Field>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'color-mix(in oklab, #E25C5C 14%, transparent)',
              border: '1px solid color-mix(in oklab, #E25C5C 30%, transparent)',
              borderRadius: 8, fontSize: 13, color: '#9c2b2b',
              marginBottom: 16,
            }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost"
              onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary"
              disabled={busy}>
              {busy ? 'Subiendo…' : 'Subir documento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label className="eyebrow" style={{ display: 'block', marginBottom: 8 }}>{label}</label>
      {children}
    </div>
  );
}

const fieldInput = {
  width: '100%',
  padding: '11px 14px',
  background: 'var(--bg)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  fontSize: 14,
  fontFamily: 'var(--sans)',
  color: 'var(--fg)',
  outline: 'none',
};

Object.assign(window, { PageDocumentos });
