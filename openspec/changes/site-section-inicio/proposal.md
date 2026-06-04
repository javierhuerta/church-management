## Why

La sección INICIO del sitio público (`PageInicio` en `website/pages-1.jsx`) tiene
todo su contenido hardcodeado en el diseño: el hero con título "Central / Osorno",
el subtítulo sobre la comunidad al pie de la cordillera, los botones CTA, la
dirección (Andrés Bello 748), los tres horarios del sábado (09:45, 11:00, 17:00),
el versículo de Mateo 11:28, el bloque de "próximo culto" (cuyo contenido viene
de `app.jsx` con datos fijos), el título "Vida de la congregación", la sección
"Síguenos en redes · Conectados todos los días", y el CTA final "Te esperamos este
sábado". Nada de esto se puede actualizar sin tocar código.

Para que la iglesia pueda mantener vigente el contenido de su página de inicio
— cambiar el versículo destacado, actualizar la dirección si se mudan, ajustar los
horarios o el mensaje de bienvenida, y que el "próximo culto" refleje el evento
real del calendario — este change hace esa sección **administrable** desde la
pestaña "Inicio" de Configuraciones, montándose sobre la base `site-config-foundation`.

## What Changes

- **Backend** — endpoint público `GET /api/public/home`:
  - Agrega todo lo que `PageInicio` necesita: textos editables del hero, versículo,
    horarios, datos de CTA, y el próximo servicio derivado del calendario (evento
    de tipo culto más próximo con `status = 'published'`, fecha ≥ hoy).
  - DTO `PublicHomeDto` con la forma que espera la página.
  - Lectura de `SiteSetting` (claves `inicio.*`) para los textos editables.
  - Si el calendario no tiene próximo culto, el campo `nextService` es `null` y la
    página muestra contenido por defecto.

- **Backend** — administración de la sección Inicio:
  - Endpoints en `SiteConfigController` para guardar/leer la configuración de la
    sección Inicio (usando las mismas claves `inicio.*` de `SiteSetting`).

- **Backend/Frontend** — gestión de las 3 imágenes del hero:
  - Las tres imágenes del hero del diseño (`home-hero-main` = foto principal,
    `home-hero-small` = detalle congregación, `home-next-service` = imagen del
    bloque "próximo culto") se vuelven administrables: subida vía el patrón de
    imágenes del sitio (`uploads/site`), guardando su URL en `SiteSetting`
    (`inicio.hero_main_image`, `inicio.hero_small_image`, `inicio.next_service_image`).
  - El endpoint público `GET /api/public/home` devuelve las URLs de estas imágenes
    (o `null` para usar el placeholder del diseño).

- **Frontend (admin)** — pestaña "Inicio" en Configuraciones (tipo editor):
  - Formulario con campos para: kicker del hero, título principal, subtítulo,
    texto de botón CTA primario, texto de botón CTA secundario, dirección,
    ciudad/región, los tres horarios del sábado (etiqueta, hora, descripción),
    texto del versículo, referencia del versículo, indicador de "próximo servicio"
    (se muestra que deriva del calendario), título de la sección "Momentos",
    subtítulo de la sección social, texto del CTA final.
  - **Subida/preview de las 3 imágenes del hero** (principal, detalle, próximo culto).
  - Registra la tab "Inicio" en el arreglo de `ConfiguracionesLayout`.

- **Sitio público** — cableado de `PageInicio`:
  - `integration.js`: nuevo helper `window.IASD_API.fetchHome()`.
  - `pages-1.jsx`: parche mínimo en `PageInicio` para consumir `fetchHome()` en
    vez de datos hardcodeados (incluyendo el `nextService` que hoy viene de
    `app.jsx`).

- **Documentación**: actualizar `INTEGRATION.md` con el parche de la sección Inicio.

## Capabilities

### New Capabilities
- `site-section-inicio`: Administración del contenido de la sección Inicio del sitio
  público. Permite editar textos del hero, versículo, horarios destacados, CTA y
  mostrar automáticamente el próximo culto desde el calendario.

## Impact

- **Backend Module**: módulo `site-config` (existente, se amplía).
- **New DTOs**: `PublicHomeDto`, `UpdateHomeConfigDto`.
- **No nuevas entidades**: usa `SiteSetting` con claves `inicio.*` para textos.
- **API Endpoints**:
  - `GET /api/public/home` (público, agrega todo para PageInicio, incluye URLs de las 3 imágenes del hero).
  - `PUT /api/site-config/home` (admin, guarda la configuración de Inicio).
  - `GET /api/site-config/home` (admin, lee la configuración actual).
  - `POST /api/site-config/home/images/:slot` (admin, sube una de las 3 imágenes del hero — `slot` ∈ `main|small|next-service`).
- **Frontend**: nueva pestaña "Inicio" en `ConfiguracionesLayout` con formulario
  de configuración.
- **Sitio**: modificar `website/integration.js` y `website/pages-1.jsx`
  (`PageInicio`), documentar parche en `website/INTEGRATION.md`.
- **Depende de**: `site-config-foundation` (usa `SiteSetting`, `PublicSiteController`
  base, `ConfiguracionesLayout` con tabs, `integration.js`, `INTEGRATION.md`).

## Fuera del alcance

- Administrar las imágenes de la sección "Momentos" (`PhotoSlot` `home-mom-*`): esa
  mini-galería del inicio se alimentará desde el módulo de Galería
  (`site-section-galeria`) en un change futuro. (Las 3 imágenes del **hero** SÍ se
  gestionan en este change.)
- Editar la lista de redes sociales (`SOCIALS`): sigue siendo código del diseño.
- Administrar los horarios como entidad estructurada (los tres bloques del sábado
  se editan como textos simples; la estructura completa de horarios vendrá con
  `site-section-horarios`).
- Modificar el layout visual de la sección Inicio (grid, colores, tipografía): el
  diseño se preserva tal cual.
- Crear una entidad dedicada a "próximo servicio": en esta versión se deriva del
  calendario; si en el futuro se necesita destacar manualmente un evento distinto
  al más próximo, se agregará como mejora.
