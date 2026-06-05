// ui.jsx — shared UI primitives + navigation
const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────
// Brand mark — icon-only (uses uploaded congregation logo)
function BrandMark({ size = 48 }) {
  return (
    <div className="nav-brand">
      <img
        src="assets/logo.png"
        alt="Iglesia Adventista Central Osorno"
        style={{ width: size, height: size, objectFit: 'contain' }} />
    </div>);

}

// ─────────────────────────────────────────────────────────
// Social media — Instagram, Facebook, YouTube
const SOCIALS = [
  { name: 'Instagram', url: 'https://www.instagram.com/iasdcentralosorno',
    handle: '@iasdcentralosorno',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
      </svg>
    )
  },
  { name: 'Facebook', url: 'https://gl-es.facebook.com/IASDcentralosorno/',
    handle: 'IASDcentralosorno',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M14 8h2.5V4.5h-2.5C12 4.5 10.5 6 10.5 8v2h-2v3h2v8h3v-8h2.5l.5-3h-3V8.5C13.5 8.2 13.7 8 14 8z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    )
  },
  { name: 'YouTube', url: 'https://www.youtube.com/@IASDCentralOsorno',
    handle: '@IASDCentralOsorno',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="2.5" y="6" width="19" height="12" rx="3" stroke="currentColor" strokeWidth="1.7" />
        <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5z" fill="currentColor" />
      </svg>
    )
  },
];

function SocialLinks({ tone = 'navy', size = 'md', layout = 'row', socials = SOCIALS }) {
  const isLight = tone === 'light';
  const sz = size === 'lg' ? 44 : size === 'sm' ? 32 : 36;
  return (
    <div style={{
      display: 'flex', gap: 10,
      flexDirection: layout === 'col' ? 'column' : 'row',
      alignItems: layout === 'col' ? 'flex-start' : 'center',
    }}>
      {socials.map(s => (
        <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
          title={s.name + ' · ' + s.handle}
          style={{
            width: sz, height: sz, borderRadius: '50%',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid ' + (isLight ? 'rgba(245,239,224,.22)' : 'var(--line)'),
            color: isLight ? 'var(--cream)' : 'var(--fg)',
            background: 'transparent',
            transition: 'background .15s, color .15s, border-color .15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = isLight ? 'var(--cream)' : 'var(--navy)';
            e.currentTarget.style.color = isLight ? 'var(--navy)' : 'var(--cream)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = isLight ? 'var(--cream)' : 'var(--fg)';
            e.currentTarget.style.borderColor = isLight ? 'rgba(245,239,224,.22)' : 'var(--line)';
          }}>
          {s.icon}
        </a>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Navigation
const PUBLIC_PAGES = [
  { id: 'inicio',     label: 'Inicio' },
  { id: 'nosotros',   label: 'Liderazgo' },
  { id: 'horarios',   label: 'Horarios' },
  { id: 'calendario', label: 'Calendario' },
  { id: 'programa',   label: 'Programa' },
  { id: 'galeria',    label: 'Galería' },
];
const PAGES = PUBLIC_PAGES; // backwards compat

function Nav({ page, setPage, isLive }) {
  const { session } = useAuth();
  return (
    <nav className="nav" data-screen-label="Nav">
      <div className="container nav-inner">
        <a onClick={() => setPage('inicio')} style={{ cursor: 'pointer' }}>
          <BrandMark />
        </a>
        <div className="nav-links">
          {PUBLIC_PAGES.map((p) =>
            <button
              key={p.id}
              className={'nav-link ' + (page === p.id ? 'active' : '')}
              onClick={() => setPage(p.id)}>
              {p.label}
            </button>
          )}
          <button
            className={'nav-live ' + (page === 'envivo' ? 'active' : '')}
            onClick={() => setPage('envivo')}>
            {isLive && <span className="dot" />}
            {isLive ? 'En Vivo' : 'En Vivo · Sáb'}
          </button>
          <span style={{ width: 1, height: 22, background: 'var(--line)', margin: '0 4px' }} />
          <UserBadge setPage={setPage} />
        </div>
      </div>
    </nav>);

}

// ─────────────────────────────────────────────────────────
// Footer
function Footer({ setPage }) {
  // Fallback hardcoded values (used while loading or if API fails)
  const DEFAULT_CONTACT = {
    address: 'Andrés Bello 748',
    city: 'Osorno, Los Lagos',
    email: 'contacto@iasdcentralosorno.cl',
    phone: '+56 64 222 0000',
  };
  const DEFAULT_SOCIAL = {
    facebookUrl: SOCIALS.find(s => s.name === 'Facebook')?.url || '',
    instagramUrl: SOCIALS.find(s => s.name === 'Instagram')?.url || '',
    youtubeUrl: SOCIALS.find(s => s.name === 'YouTube')?.url || '',
  };

  const [contact, setContact] = React.useState(DEFAULT_CONTACT);
  const [socialUrls, setSocialUrls] = React.useState(DEFAULT_SOCIAL);

  React.useEffect(() => {
    if (window.IASD_API && window.IASD_API.fetchHome) {
      window.IASD_API.fetchHome()
        .then(data => {
          if (data.contact) {
            setContact({
              address: data.contact.address || DEFAULT_CONTACT.address,
              city: data.contact.city || DEFAULT_CONTACT.city,
              email: data.contact.email || DEFAULT_CONTACT.email,
              phone: data.contact.phone || DEFAULT_CONTACT.phone,
            });
          }
          if (data.social) {
            setSocialUrls({
              facebookUrl: data.social.facebookUrl || DEFAULT_SOCIAL.facebookUrl,
              instagramUrl: data.social.instagramUrl || DEFAULT_SOCIAL.instagramUrl,
              youtubeUrl: data.social.youtubeUrl || DEFAULT_SOCIAL.youtubeUrl,
            });
          }
        })
        .catch(err => {
          console.warn('Footer: error cargando datos desde API:', err);
        });
    }
  }, []);

  // Build dynamic SOCIALS array with live URLs but keeping original icons/handles
  const dynamicSocials = SOCIALS.map(s => {
    if (s.name === 'Instagram') return { ...s, url: socialUrls.instagramUrl };
    if (s.name === 'Facebook') return { ...s, url: socialUrls.facebookUrl };
    if (s.name === 'YouTube') return { ...s, url: socialUrls.youtubeUrl };
    return s;
  });

  return (
    <footer className="footer">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 48, alignItems: 'start' }}>
          <div>
            <div style={{ width: 64, height: 64, background: 'var(--cream)', borderRadius: 12, padding: 6 }}>
              <img src="assets/logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div className="serif" style={{ fontSize: 26, fontWeight: 500, marginTop: 20 }}>
              Iglesia Adventista Central de Osorno
            </div>
            <p style={{ marginTop: 12, fontSize: 14, opacity: .75, maxWidth: 360 }}>
              Una comunidad que espera el pronto regreso de Cristo.
            </p>
            <div style={{ marginTop: 22 }}>
              <SocialLinks tone="light" size="md" socials={dynamicSocials} />
            </div>
          </div>
          <div style={{ fontSize: 14 }}>
            <div className="eyebrow" style={{ color: 'var(--gold-2)', marginBottom: 14 }}>Visítanos</div>
            <div style={{ opacity: .82, lineHeight: 1.7 }}>
              {contact.address}<br />
              {contact.city}<br />
              Sábados · 09:45
            </div>
          </div>
          <div style={{ fontSize: 14 }}>
            <div className="eyebrow" style={{ color: 'var(--gold-2)', marginBottom: 14 }}>Contacto</div>
            <div style={{ opacity: .82, lineHeight: 1.7 }}>
              {contact.email}<br />
              {contact.phone}
            </div>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {dynamicSocials.map(s => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ opacity: .82, fontSize: 13, display: 'inline-flex',
                    alignItems: 'center', gap: 8, width: 'fit-content' }}>
                  <span style={{ color: 'var(--gold-2)' }}>{s.icon}</span>
                  {s.handle}
                </a>
              ))}
            </div>
          </div>
        </div>
        <hr style={{ border: 0, height: 1, background: 'rgba(245,239,224,.14)', margin: '48px 0 20px' }} />
        <div className="between" style={{ fontSize: 12, opacity: .6 }}>
          <span>© 2026 IASD Central Osorno</span>
          <span className="mono" style={{ letterSpacing: '.1em' }}>MARANATHA</span>
        </div>
      </div>
    </footer>);

}

// ─────────────────────────────────────────────────────────
// Placeholder image (subtly striped, with label)
function Ph({ label, height = 320, dark = false, style = {}, radius = 14 }) {
  return (
    <div
      className={'placeholder ' + (dark ? 'dark' : '')}
      data-label={label}
      style={{ height, borderRadius: radius, ...style }} />);


}

// ─────────────────────────────────────────────────────────
// Section header
function SectionHead({ kicker, title, lead, align = 'left' }) {
  return (
    <div style={{ textAlign: align, maxWidth: align === 'center' ? 760 : 720, margin: align === 'center' ? '0 auto' : 0 }}>
      {kicker && <div className="kicker">{kicker}</div>}
      <h2 className="serif" style={{ fontSize: 'clamp(32px, 4.4vw, 54px)', marginTop: 12 }}>{title}</h2>
      {lead && <p className="muted" style={{ marginTop: 18, fontSize: 17, maxWidth: 600,
        marginLeft: align === 'center' ? 'auto' : 0, marginRight: align === 'center' ? 'auto' : 0 }}>{lead}</p>}
    </div>);

}

// ─────────────────────────────────────────────────────────
// Photo slot — wraps <image-slot> web component (drag-and-drop image)
function PhotoSlot({ id, label, height = 320, shape = 'rect', radius = 14, src = null, style = {} }) {
  // Si el backend entrega una URL de imagen, se muestra directamente (fuente de
  // verdad). El web component <image-slot> queda solo como placeholder editable
  // cuando no hay imagen configurada en el backend.
  if (src) {
    return (
      <img
        src={src}
        alt={label}
        style={{
          display: 'block',
          width: '100%',
          height: typeof height === 'number' ? height + 'px' : height,
          objectFit: 'cover',
          borderRadius: shape === 'circle' ? '50%' : radius,
          ...style,
        }} />
    );
  }
  return (
    <image-slot
      id={id}
      shape={shape}
      radius={String(radius)}
      placeholder={label}
      style={{
        display: 'block',
        width: '100%',
        height: typeof height === 'number' ? height + 'px' : height,
        ...style,
      }} />
  );
}

// Format helpers
function pad(n) {return String(n).padStart(2, '0');}
function isSaturday(d) {return d.getDay() === 6;}

Object.assign(window, { BrandMark, Nav, Footer, Ph, PhotoSlot, SectionHead, SocialLinks, SOCIALS, PAGES, pad, isSaturday });
