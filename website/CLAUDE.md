# CLAUDE.md — Guía para Agentes (Claude Code) en `website/`

Este directorio contiene el **sitio web público** de la **Iglesia Adventista Central de Osorno** (`adventistascentralosorno.cl`).
Cuando trabajes con el encargado de Comunicaciones en ajustes de diseño, maquetación, estilos o componentes visuales del sitio público, **debes seguir estas reglas estrictamente**.

---

## 1. Alcance permitido (Scope Boundary)

- **PUEDES modificar**:
  - `website/styles.css` (estilos globales, variables de color, tipografía, media queries mobile)
  - `website/ui.jsx` (barra de navegación `Nav`, `Footer`, componentes visuales compartidos)
  - `website/pages-1.jsx` (`PageInicio`, `PageNosotros`/Liderazgo, `PageGaleria`)
  - `website/pages-2.jsx` (`PageHorarios`)
  - `website/pages-3.jsx` (`PageEnVivo` / Transmisiones)
  - `website/pages-4.jsx` (`PagePrograma`, `PageCalendarioEditable`)
  - `website/app.jsx` (shell principal y rutas públicas)
  - `website/assets/` (recursos gráficos estáticos propios del diseño)

- **NO DEBES modificar sin autorización expresa del administrador técnico (`@javierhuerta`)**:
  - Ningún archivo fuera de `website/` (`backend/`, `frontend/`, `.github/`, `docker-compose*.yml`)
  - `website/integration.js` (puente de conexión con la API `/api/*`)
  - `website/Dockerfile` ni `website/nginx.conf`
  - `website/index.html` (salvo agregar fuentes de Google Fonts si fuese necesario; **nunca** quitar `integration.js`, los sufijos `?v=__ASSET_VERSION__` ni las etiquetas de vista previa `og:*` / `twitter:*` con `assets/og-iglesia.jpg`)

---

## 2. Arquitectura técnica del sitio público

- El sitio usa **React 18 UMD + `@babel/standalone`** compilado en el navegador (sin bundler ni `npm build` en `website/`).
- Los archivos `.jsx` se cargan en orden global desde `index.html`.
- Cada archivo define alias locales para hooks de React al inicio (por ejemplo `const { useState: useS1, useEffect: useE1 } = React;`) para evitar colisiones en el scope global del navegador. **Respeta siempre esos alias** al editar un archivo `pages-*.jsx`.
- Los datos reales provienen del backend NestJS a través de `window.IASD_API` (definido en `website/integration.js`).

---

## 3. Contratos de datos vivos que NUNCA debes romper (`window.IASD_API`)

Si rediseñas una sección o reemplazas bloques de JSX (incluso al traer código desde Claude Artifacts), **es obligatorio conservar la conexión con `window.IASD_API`** para que el contenido administrable siga funcionando:

| Archivo | Componente | Llamadas obligatorias a `window.IASD_API` |
|---------|------------|------------------------------------------|
| `app.jsx` | `AppInner` | `window.IASD_API.fetchLiveStatus()` (polling cada 60s para el badge "EN VIVO") |
| `auth.jsx` | `useStore`, `UserBadge` | `const ADMIN_URL = '/admin/';`, `<a href={ADMIN_URL}>` y `window.IASD_API.fetchEvents()` |
| `ui.jsx` | `Footer` | `window.IASD_API.fetchHome()` (dirección, redes sociales, contacto) y clase `className="footer-grid"` |
| `pages-1.jsx` | `PageInicio` | `fetchHome()`, `fetchHomeAlbum()`, `fetchSchedule()`, `fetchWorship()` y clase `className="home-schedule-grid"` |
| `pages-1.jsx` | `PageNosotros` | `fetchLeadership()` (`boardPhotoUrl`, `board`, `ministries`) |
| `pages-1.jsx` | `PageGaleria` | `fetchGallery()` y `apiGet('/site-config/settings/galeria.header_title')` / `galeria.intro_text` |
| `pages-2.jsx` | `PageHorarios` | `fetchSchedule()`, `getSunsetTimes()`, clases `className="schedule-day"` y `className="sunset-grid"` |
| `pages-3.jsx` | `PageEnVivo` | `fetchLiveStatus()` (`isLive`, `embedUrl`) y `fetchRecentSermons()` (destacada `sermons[0]` + grilla `sermons.slice(1)`) |
| `pages-4.jsx` | `PagePrograma` | `fetchWorship()` (`upcoming`, `date`, `title`, `preacher`, `theme`, `scripture`, `items`) |
| `pages-4.jsx` | `PageCalendarioEditable` | Recibe `store.events` (alimentado por `fetchEvents()`) y conserva `className="cal-event-editor"` |

> Consulta `website/INTEGRATION.md` si necesitas ver el detalle exacto de los campos que retorna cada método de `window.IASD_API`.

---

## 4. Reglas de Diseño, Tema Oscuro y Responsive

1. **Variables CSS y Modo Oscuro (`[data-theme="dark"]`)**:
   - Usa siempre las variables definidas en `styles.css` (`var(--bg)`, `var(--bg-2)`, `var(--ink)`, `var(--ink-2)`, `var(--ink-3)`, `var(--line)`, `var(--gold)`, `var(--navy)`).
   - No hardcodees fondos blancos (`#fff`) o textos negros (`#000`) que rompan el modo oscuro cuando `data-theme="dark"` esté activo.
2. **Mobile Responsive (sin scroll horizontal en 390px)**:
   - Conserva las clases `.footer-grid`, `.home-schedule-grid`, `.schedule-day`, `.sunset-grid` y `.cal-event-editor` en `styles.css` y en los `.jsx`.
   - Prefiere `gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'` sobre columnas fijas (`repeat(3, 1fr)`) en grillas de tarjetas.
3. **Sección Documentos**:
   - `'documentos'` NO debe aparecer en la navegación pública (`ui.jsx` ni `VALID_PAGES` en `app.jsx`), ya que es un módulo interno privado de `/admin`.

---

## 5. Verificación obligatoria antes de hacer Commit / Pull Request

Antes de crear un commit o abrir un Pull Request, ejecuta siempre el verificador automático desde la raíz del repositorio:

```bash
node website/scripts/verify-integration.mjs
```

- Si el script reporta `✅ Verificación exitosa`, todos los contratos con el backend y reglas responsive siguen intactos.
- Si reporta algún `❌`, corrige el punto indicado antes de subir los cambios.

Si tocaste `pages-1.jsx` o `ui.jsx`, corre también los tests de render (Inicio con campaña destacada en sus 2 diseños, Galería sin recorte). Necesitan dependencias de prueba que no se commitean:

```bash
T=$(mktemp -d) && (cd "$T" && npm init -y >/dev/null && npm install --no-save @babel/core @babel/preset-react react@18.3.1 react-dom@18.3.1 jsdom)
WEBSITE_TEST_DEPS="$T" node --test website/scripts/test-pages.mjs
```

El PR check de GitHub corre ambos automáticamente.

---

## 6. Flujo de ramas y Pull Requests

1. Nunca trabajes directamente sobre `main` ni `development`.
2. Crea siempre una rama descriptiva desde `development`:
   ```bash
   git checkout development
   git pull origin development
   git checkout -b design/descripcion-corta
   ```
3. Haz commits claros con prefijo `feat(website):` o `style(website):` (sin agregar `Co-Authored-By`).
4. Abre el Pull Request apuntando a la rama **`development`** (nunca directo a `main`). Al aprobarse y fusionarse en `development`, se desplegará automáticamente en el entorno de **Staging** para revisión final antes de pasar a producción (`main`).
