## Contexto

`PageInicio` (líneas 7–377 de `website/pages-1.jsx`) es la página de aterrizaje
del sitio público. Está compuesta por bloques bien definidos:

1. **Hero editorial**: logo, kicker ("Iglesia Adventista del Séptimo Día · Osorno"),
   título grande ("Central / Osorno"), subtítulo ("Una comunidad que adora cada
   sábado al pie de la cordillera…"), dos botones CTA ("Programa de hoy" /
   "Horarios"), y una mini-info bar con dirección y tres horarios del sábado.
2. **Banda del versículo**: Mateo 11:28 con texto y referencia, sobre fondo navy.
3. **Próximo culto**: tarjeta editorial con `nextService.title`, `nextService.when`,
   `nextService.where` (datos que actualmente vienen hardcodeados de `app.jsx`).
4. **Horarios resumidos**: tres columnas repetidas con los mismos datos de la
   mini-info bar (Sábado 09:45 Escuela Sabática, 11:00 Culto Divino, 17:00 Culto Joven).
5. **Momentos**: galería con 5 `PhotoSlot` y texto "Vida de la congregación".
6. **Redes sociales**: sección con `SOCIALS` y texto "Síguenos en redes ·
   Conectados todos los días".
7. **CTA final**: "Te esperamos este sábado. Andrés Bello 748, Osorno."

`nextService` se construye en `app.jsx` como un `useMemo` hardcodeado:
```js
const nextService = useMA(() => ({
  title: 'Culto Divino · No se preocupen por la vida',
  when: 'Sábado 23 · 11:00 h',
  where: 'Andrés Bello 748',
}), []);
```

`SOCIALS` es una constante definida en `website/ui.jsx` (líneas 19–48) y expuesta
como variable global (`window.SOCIALS`).

Las imágenes del hero y momentos usan el componente `PhotoSlot` (definido en
`website/image-slot.js`), que muestra placeholders con label hasta que se le asigne
una URL de imagen real vía `window.IASD_API`. Las imágenes **no** se administran
en este change.

## Decisiones

### 1. Próximo servicio: derivar del calendario (recomendado)

**Decisión:** el endpoint `GET /api/public/home` consulta el módulo `Calendar` para
obtener el evento más próximo de tipo culto que cumpla:
- `status = 'published'`
- `startDate >= today`
- ordenado por `startDate ASC`, límite 1

Lo devuelve mapeado al shape que espera `PageInicio`:
```ts
{ title: string, when: string, where: string }
```

Si no hay eventos publicados próximos, `nextService` es `null`. La página muestra
contenido por defecto ("Próximamente") o el bloque se colapsa.

Esto evita duplicar datos (el calendario ya tiene los cultos) y asegura que la
página siempre muestre información real y actualizada.

**Alternativa considerada (no implementada en v1):** permitir al admin elegir entre
"derivar del calendario" y "texto manual". Se descarta para mantener simplicidad;
si en el futuro se necesita destacar manualmente un evento, se agrega un flag
`featured` al evento de calendario.

### 2. Textos editables vía SiteSetting

**Decisión:** todos los textos editables de la sección Inicio se almacenan en la
tabla `site_settings` con el prefijo `inicio.`. El formulario admin lee y escribe
estas claves.

| Clave | Contenido | Default (si no existe) |
|---|---|---|
| `inicio.hero_kicker_1` | Línea 1 del kicker ("Iglesia Adventista") | `"Iglesia Adventista"` |
| `inicio.hero_kicker_2` | Línea 2 del kicker ("del Séptimo Día · Osorno") | `"del Séptimo Día · Osorno"` |
| `inicio.hero_title_line1` | Título línea 1 ("Central") | `"Central"` |
| `inicio.hero_title_line2` | Título línea 2 cursiva ("Osorno") | `"Osorno"` |
| `inicio.hero_subtitle` | Párrafo del hero | `"Una comunidad que adora cada sábado al pie de la cordillera. Las puertas están abiertas para ti."` |
| `inicio.hero_cta_primary` | Texto botón CTA primario | `"Programa de hoy"` |
| `inicio.hero_cta_secondary` | Texto botón CTA secundario | `"Horarios"` |
| `inicio.direccion` | Dirección en mini-info y CTA final | `"Andrés Bello 748"` |
| `inicio.ciudad_region` | Ciudad/región en mini-info | `"Osorno · Los Lagos"` |
| `inicio.horario_1_etiqueta` | Etiqueta día 1 ("Sábado") | `"Sábado"` |
| `inicio.horario_1_hora` | Hora 1 ("09:45") | `"09:45"` |
| `inicio.horario_1_desc` | Descripción 1 ("Escuela Sabática") | `"Escuela Sabática"` |
| `inicio.horario_2_etiqueta` | Etiqueta día 2 | `"Sábado"` |
| `inicio.horario_2_hora` | Hora 2 | `"11:00"` |
| `inicio.horario_2_desc` | Descripción 2 | `"Culto Divino"` |
| `inicio.horario_3_etiqueta` | Etiqueta día 3 | `"Sábado"` |
| `inicio.horario_3_hora` | Hora 3 | `"17:00"` |
| `inicio.horario_3_desc` | Descripción 3 | `"Culto Joven"` |
| `inicio.versiculo_texto` | Texto del versículo | `"«Vengan a mí todos los que están cansados… y yo los haré descansar.»"` |
| `inicio.versiculo_ref` | Referencia del versículo | `"MATEO 11:28"` |
| `inicio.social_titulo` | Título sección social | `"Conectados todos los días"` |
| `inicio.social_kicker` | Kicker sección social | `"Síguenos en redes"` |
| `inicio.cta_final_texto` | Texto del CTA final | `"Te esperamos este sábado."` |
| `inicio.cta_final_direccion` | Dirección en CTA final | `"Andrés Bello 748, Osorno."` |

**¿Por qué no una entidad dedicada?** Son textos simples, uno por campo. Una tabla
genérica clave/valor evita crear una migración por cada nuevo campo. Si en el futuro
un bloque crece a una colección (ej. múltiples horarios con entidad propia), se
migra ese subconjunto a una tabla dedicada.

### 3. El endpoint público `GET /api/public/home`

**Decisión:** un solo endpoint que entrega toda la respuesta que `PageInicio`
necesita en una llamada. El DTO `PublicHomeDto` tiene:

```ts
{
  hero: {
    kickerLine1: string | null;
    kickerLine2: string | null;
    titleLine1: string | null;
    titleLine2: string | null;
    subtitle: string | null;
    ctaPrimary: string | null;
    ctaSecondary: string | null;
    address: string | null;
    cityRegion: string | null;
    schedule: Array<{ label: string; time: string; description: string }>;
  };
  verse: {
    text: string | null;
    reference: string | null;
  };
  nextService: {
    title: string;
    when: string;
    where: string;
  } | null;
  momentsTitle: string | null;
  social: {
    kicker: string | null;
    title: string | null;
  };
  footerCta: {
    text: string | null;
    address: string | null;
  };
}
```

El servicio `SiteConfigService.getPublicHome()`:
1. Lee todas las claves `inicio.*` de `SiteSetting` (batch).
2. Consulta el próximo culto al repositorio de eventos del módulo `Calendar`
   (importándolo; `SiteConfigModule` importa `CalendarModule`).
3. Arma y devuelve el DTO, aplicando los defaults cuando una clave no existe.

### 4. Cableado en el sitio público

**Decisión:** `integration.js` agrega:
```js
window.IASD_API.fetchHome = async function () {
  return window.IASD_API.apiGet('/public/home');
};
```

`PageInicio` se modifica con un parche mínimo:
- Agregar un `useState` + `useEffect` que llame `window.IASD_API.fetchHome()` al
  montar y guarde la respuesta en estado local.
- Reemplazar `nextService` (prop) por `homeData.nextService`.
- Reemplazar cada texto hardcodeado por `homeData.hero.subtitle`,
  `homeData.verse.text`, etc.
- Si `fetchHome` falla o devuelve `null` en algún campo, usar los defaults
  hardcodeados actuales como fallback (la página no se rompe).

El parche se documenta en `INTEGRATION.md` bajo una nueva sección "## Sección Inicio".

### 5. Pestaña "Inicio" en Configuraciones

**Decisión:** registrar una entrada `{ id: 'inicio', label: 'Inicio', path: 'inicio' }`
en el arreglo de tabs de `ConfiguracionesLayout`. El componente de la pestaña es
un formulario con un campo por cada clave editable, más un indicador de solo lectura
que muestra el estado actual del "próximo servicio" detectado (título, fecha y lugar
del evento más próximo del calendario).

El formulario usa React Hook Form + shadcn/ui (campos `Input` y `Textarea`).
Al guardar, llama a `PUT /api/site-config/home` con todos los valores.

## Permisos

- Escritura de configuración (`PUT /api/site-config/home`): `Admin`.
- Lectura de configuración admin (`GET /api/site-config/home`): `Admin`.
- Lectura pública (`GET /api/public/home`): anónima.

## Riesgos / Notas

- **Dependencia circular**: `SiteConfigModule` importa `CalendarModule` para
  consultar el próximo culto. NestJS permite imports circulares con
  `forwardRef(() => CalendarModule)`. Si Calendar aún no existe como módulo
  independiente, se consulta directamente al repositorio de eventos con una
  importación lazy o se usa el patrón `@InjectRepository(Event)` en un provider
  aparte.
- Las claves `inicio.*` en `SiteSetting` deben documentarse para que otros cambios
  no las pisen accidentalmente.
- Los horarios son tres tuplas fijas (no una lista dinámica): si se necesitan más
  o menos, se requerirá un cambio de estructura.

## Diseño visual

Cargar la skill `church-ui-design` antes de implementar componentes.

- **Pestaña "Inicio" en Configuraciones**: formulario vertical con secciones
  colapsables o agrupadas por bloque del sitio (Hero, Versículo, Horarios, Social,
  CTA final). Cada sección con título y sus campos correspondientes.
- **Indicador de próximo servicio**: card informativa de solo lectura mostrando
  el evento que el sistema detecta como próximo culto (título, fecha, lugar).
- **Tipografía y colores**: seguir la jerarquía tipográfica de la skill. Modo
  oscuro soportado.
- **Patrón mobile/desktop**: en mobile, el formulario es single-column con tabs
  de sección convertidas en acordeón o scroll horizontal. En desktop, layout de
  dos columnas (campos a la izquierda, preview o indicador a la derecha).

## UI Scenarios

### Scenario: Admin edita los textos del hero de Inicio

- **URL**: `/admin/configuraciones/inicio`
- **Description**: Un administrador modifica el subtítulo del hero y los botones CTA.
- **Steps**:
  1. `login` as `Admin`
  2. `navigate` to `/admin/configuraciones/inicio`
  3. `expect` page heading text `Inicio`
  4. `expect` element `data-testid="home-config-form"` visible
  5. `type` into `data-testid="hero-subtitle-input"` text `Bienvenidos a la iglesia de Osorno`
  6. `type` into `data-testid="hero-cta-primary-input"` text `Culto de hoy`
  7. `click` button `data-testid="home-config-save-button"`
  8. `expect` toast or success message visible

```
+------------------------------------------------------+
| Configuraciones > Inicio                             |
+------------------------------------------------------+
| [ Hero ]                                             |
| Kicker línea 1  [Iglesia Adventista            ]     |
| Kicker línea 2  [del Séptimo Día · Osorno      ]     |
| Título línea 1  [Central                       ]     |
| Título línea 2  [Osorno                        ]     |
| Subtítulo       [Bienvenidos a la iglesia de O.]     |
| CTA primario    [Culto de hoy                  ]     |
| CTA secundario  [Horarios                      ]     |
+------------------------------------------------------+
| [ Versículo ]                                        |
| Texto           [«Vengan a mí todos los cansado.]     |
| Referencia      [MATEO 11:28                   ]     |
+------------------------------------------------------+
| [ Horarios destacados ]                              |
| Hora 1: [Sábado] [09:45] [Escuela Sabática]          |
| Hora 2: [Sábado] [11:00] [Culto Divino]              |
| Hora 3: [Sábado] [17:00] [Culto Joven]               |
+------------------------------------------------------+
| [ Próximo servicio — derivado del calendario ]        |
| "Culto Divino · No se preocupen por la vida"         |
| Sábado 23 · 11:00 h — Andrés Bello 748               |
+------------------------------------------------------+
| [ CTA final ]                                        |
| Texto           [Te esperamos este sábado.     ]     |
| Dirección       [Andrés Bello 748, Osorno.     ]     |
+------------------------------------------------------+
|                              [ Guardar cambios ]      |
+------------------------------------------------------+
```

### Scenario: Visitante ve la página de inicio con contenido administrado

- **URL**: `/` (hash `#inicio`)
- **Description**: Un visitante anónimo carga el sitio público y ve la sección Inicio
  con los textos configurados por el admin y el próximo culto real del calendario.
- **Steps**:
  1. `navigate` to `/`
  2. `wait` for hash `#inicio`
  3. `expect` element with hero title text `Central` and cursive `Osorno`
  4. `expect` element with the configured subtitle visible
  5. `expect` the "Próximo culto" card shows a real event title (not hardcoded)
  6. `expect` the verse section shows the configured verse text
  7. `expect` the schedule section shows the three configured times
  8. `expect` the footer CTA shows the configured text

```
+------------------------------------------------------+
| [logo] Iglesia Adventista                             |
|        del Séptimo Día · Osorno                       |
|                                                       |
| Central                                               |
|   Osorno                           [Foto principal]   |
|                                                       |
| Bienvenidos a la iglesia de Osorno.                   |
| Las puertas están abiertas para ti.     [Foto pequeña]|
|                                                       |
| [Culto de hoy →]  [Horarios]                          |
|                                                       |
| Visítanos    Sábado    Sábado    Sábado               |
| Andrés Bello 09:45    11:00    17:00                  |
| 748          Escuela  Culto    Culto                   |
| Osorno·Los   Sabática Divino   Joven                  |
| Lagos                                                 |
+------------------------------------------------------+
|          «Vengan a mí todos los que están             |
|          cansados… y yo los haré descansar.»          |
|                    MATEO 11:28                        |
+------------------------------------------------------+
| Próximo culto                                        |
| Culto Divino · Tiempo de gracia    [Foto ambiente]    |
| Sábado 30 · 11:00 h                                  |
| Andrés Bello 748                                     |
| [Ver programa →]  [Transmisión en vivo]               |
+------------------------------------------------------+
| ... (horarios, momentos, social, CTA final) ...       |
+------------------------------------------------------+
```
