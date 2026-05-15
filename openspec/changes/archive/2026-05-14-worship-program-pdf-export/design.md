## Context

La página de detalle del programa (`ProgramDetailPage`) ya renderiza toda la información del culto: grupos, secciones, responsables, himnos y notas. El objetivo es exportar esa misma información como un PDF imprimible con un diseño visual equivalente al que se usa manualmente hoy (tabla con tres columnas: RESPONSABLE, PARTE, DETALLE).

No existe ningún mecanismo de exportación actualmente. El backend no necesita cambios: los datos ya están disponibles a través de `useProgram(id)`.

## Goals / Non-Goals

**Goals:**
- Generar un PDF de alta calidad (vectorial, no rasterizado) desde el frontend.
- Replicar el diseño de la tabla de tres columnas con separadores de grupo en color morado.
- Incluir logo placeholder (SVG embebido) reemplazable a futuro.
- Sin nuevos endpoints ni cambios en el backend.

**Non-Goals:**
- Personalización del diseño desde la UI.
- Generación desde el backend o envío por email.
- Configuración del logo desde la interfaz.

## Decisions

### D1 — Librería: `@react-pdf/renderer` sobre alternativas

**Decisión:** usar `@react-pdf/renderer` para componer el PDF.

**Alternativas consideradas:**
- `html2canvas + jspdf`: simple, pero genera una imagen rasterizada del DOM. Resultados inconsistentes con fuentes y colores, calidad inferior al imprimir.
- `window.print()` con CSS: depende del browser, sin control sobre el layout del PDF resultante.
- Puppeteer en el backend: calidad perfecta, pero requiere Chromium como dependencia pesada, un nuevo endpoint y mayor complejidad operacional.

**Rationale:** `@react-pdf/renderer` produce PDFs vectoriales desde una estructura JSX declarativa, independiente del DOM del navegador. Encaja naturalmente con React y no requiere tocar el backend.

### D2 — Generación client-side, descarga directa

**Decisión:** el PDF se genera en el navegador y se descarga usando `pdf.download()` de `@react-pdf/renderer`.

No se sube a ningún servidor ni se genera en el backend. El usuario ve un botón que dispara la descarga directamente.

### D3 — Estructura del documento PDF

El documento PDF se compone de:
1. **Encabezado**: logo SVG centrado + nombre del culto + fecha formateada en español.
2. **Tabla de programa**: tres columnas fijas.
   - `RESPONSABLE` (20% del ancho) — campo `section.responsible`
   - `PARTE` (30%) — campo `section.name` o `templateSection.name`
   - `DETALLE` (50%) — campo `section.hymnText`, con `section.notes` debajo en gris si existe
3. **Filas de grupo**: fila con fondo morado y texto blanco en negrita que abarca las tres columnas, muestra el nombre del grupo y el rango horario si está definido.
4. **Filas de sección**: fondo blanco con texto normal. Filas alternas con un gris muy suave para legibilidad.

### D4 — Logo como SVG inline embebido

**Decisión:** el logo se define como un path SVG inline dentro del componente PDF, sin depender de ningún asset externo.

`@react-pdf/renderer` no soporta `<img src="...">` de forma directa para SVGs; en cambio, usa el componente `<Svg>` con paths. Se define un logo placeholder simple (nombre de la iglesia o ícono genérico) que puede reemplazarse cuando se tenga el asset definitivo.

### D5 — Archivo del componente PDF

El componente `ProgramPdfDocument` se crea en:
```
frontend/src/features/worship-services/components/program-pdf-document.tsx
```

La lógica de descarga se encapsula en un hook ligero `useProgramPdf` en el mismo directorio de hooks de la feature:
```
frontend/src/features/worship-services/hooks/use-program-pdf.ts
```

El botón de descarga se añade en `ProgramDetailPage` junto a los controles existentes (publicar, archivar, eliminar).

## Risks / Trade-offs

- **Tamaño del bundle**: `@react-pdf/renderer` es una dependencia de ~1MB minificada. Puede mitigarse con lazy loading del componente PDF usando `React.lazy` + `Suspense` — el PDF solo se carga cuando el usuario pulsa el botón.
- **Compatibilidad de fuentes**: `@react-pdf/renderer` usa métricas propias de tipografía, distintas a las del navegador. El resultado visual puede diferir ligeramente del diseño de la app. Mitigación: usar una fuente embebida explícita (ej. Helvetica, incluida por defecto en la librería) para consistencia.
- **Logo SVG inline**: algunos paths SVG complejos pueden no renderizarse perfectamente. Mitigación: usar un placeholder simple hasta que se disponga del logo final.

## Migration Plan

1. Instalar dependencia: `npm install @react-pdf/renderer` en `frontend/`.
2. Crear componente `ProgramPdfDocument` y hook `useProgramPdf`.
3. Agregar botón en `ProgramDetailPage`.
4. Probar con un programa real que tenga grupos, secciones con himnos y notas.
5. No hay rollback necesario: el cambio es aditivo y no modifica funcionalidad existente.

## Open Questions

- ¿El nombre del archivo PDF descargado debe incluir la fecha? (Ej: `programa-2025-05-18.pdf`) — decisión de UX menor, puede definirse en implementación.
- ¿Se quiere incluir el horario de cada sección en el PDF si está definido? (campo `section.startTime`)
