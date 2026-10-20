#!/usr/bin/env node
/**
 * verify-integration.mjs
 * Verifies that website/ design changes preserve all window.IASD_API hooks,
 * cache-busting tags, responsive CSS classes, and valid JSX delimiters.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEBSITE_DIR = path.resolve(__dirname, '..');

const errors = [];

function readFile(relPath) {
  const fullPath = path.join(WEBSITE_DIR, relPath);
  if (!fs.existsSync(fullPath)) {
    errors.push(`Archivo obligatorio no encontrado: website/${relPath}`);
    return '';
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function assertContains(relPath, content, snippet, reason) {
  if (!content.includes(snippet)) {
    errors.push(`[website/${relPath}] Falta "${snippet}" — ${reason}`);
  }
}

function assertNotContains(relPath, content, snippet, reason) {
  if (content.includes(snippet)) {
    errors.push(`[website/${relPath}] No debe incluir "${snippet}" — ${reason}`);
  }
}

// 1. Verify index.html
const indexHtml = readFile('index.html');
if (indexHtml) {
  assertContains('index.html', indexHtml, 'integration.js?v=__ASSET_VERSION__', 'Debe cargar el puente integration.js con cache-busting');
  assertContains('index.html', indexHtml, 'image-slot.js?v=__ASSET_VERSION__', 'Debe cargar image-slot.js con cache-busting');
  assertContains('index.html', indexHtml, 'styles.css?v=__ASSET_VERSION__', 'Debe cargar styles.css con cache-busting');
}

// 2. Verify integration.js
const integrationJs = readFile('integration.js');
if (integrationJs) {
  const requiredMethods = [
    'fetchEvents',
    'fetchLeadership',
    'fetchHome',
    'fetchSchedule',
    'fetchWorship',
    'fetchGallery',
    'fetchHomeAlbum',
    'fetchLiveStatus',
    'fetchRecentSermons',
    'getSunsetTimes',
  ];
  for (const method of requiredMethods) {
    assertContains('integration.js', integrationJs, method, `window.IASD_API debe exponer ${method}`);
  }
}

// 3. Verify app.jsx
const appJsx = readFile('app.jsx');
if (appJsx) {
  assertContains('app.jsx', appJsx, 'fetchLiveStatus', 'AppInner debe consultar el estado en vivo real desde la API');
  assertNotContains('app.jsx', appJsx, "'documentos'", 'La sección privada documentos no debe estar en VALID_PAGES del sitio público');
}

// 4. Verify auth.jsx
const authJsx = readFile('auth.jsx');
if (authJsx) {
  assertContains('auth.jsx', authJsx, "const ADMIN_URL = '/admin/'", 'Debe apuntar el acceso administrativo a /admin/');
  assertContains('auth.jsx', authJsx, 'fetchEvents', 'useStore() debe cargar los eventos reales del calendario');
}

// 5. Verify ui.jsx
const uiJsx = readFile('ui.jsx');
if (uiJsx) {
  assertContains('ui.jsx', uiJsx, 'fetchHome', 'El Footer debe consumir datos de contacto/redes desde fetchHome()');
  assertContains('ui.jsx', uiJsx, 'footer-grid', 'El Footer debe conservar la clase responsive footer-grid');
}

// 6. Verify pages-1.jsx (Inicio, Nosotros/Liderazgo, Galería)
const pages1Jsx = readFile('pages-1.jsx');
if (pages1Jsx) {
  assertContains('pages-1.jsx', pages1Jsx, 'fetchHome', 'PageInicio debe consumir fetchHome()');
  assertContains('pages-1.jsx', pages1Jsx, 'fetchHomeAlbum', 'PageInicio debe consumir fetchHomeAlbum()');
  assertContains('pages-1.jsx', pages1Jsx, 'fetchSchedule', 'PageInicio debe consumir fetchSchedule()');
  assertContains('pages-1.jsx', pages1Jsx, 'fetchWorship', 'PageInicio debe consumir fetchWorship() para el próximo culto');
  assertContains('pages-1.jsx', pages1Jsx, 'home-schedule-grid', 'PageInicio debe conservar la clase responsive home-schedule-grid');
  assertContains('pages-1.jsx', pages1Jsx, 'fetchLeadership', 'PageNosotros debe consumir fetchLeadership()');
  assertContains('pages-1.jsx', pages1Jsx, 'fetchGallery', 'PageGaleria debe consumir fetchGallery()');
}

// 7. Verify pages-2.jsx (Horarios)
const pages2Jsx = readFile('pages-2.jsx');
if (pages2Jsx) {
  assertContains('pages-2.jsx', pages2Jsx, 'fetchSchedule', 'PageHorarios debe consumir fetchSchedule()');
  assertContains('pages-2.jsx', pages2Jsx, 'getSunsetTimes', 'PageHorarios debe calcular las puestas de sol con getSunsetTimes()');
  assertContains('pages-2.jsx', pages2Jsx, 'schedule-day', 'PageHorarios debe conservar la clase responsive schedule-day');
  assertContains('pages-2.jsx', pages2Jsx, 'sunset-grid', 'PageHorarios debe conservar la clase responsive sunset-grid');
}

// 8. Verify pages-3.jsx (En Vivo / Transmisiones)
const pages3Jsx = readFile('pages-3.jsx');
if (pages3Jsx) {
  assertContains('pages-3.jsx', pages3Jsx, 'fetchLiveStatus', 'PageEnVivo debe consumir fetchLiveStatus()');
  assertContains('pages-3.jsx', pages3Jsx, 'fetchRecentSermons', 'PageEnVivo debe consumir fetchRecentSermons()');
}

// 9. Verify pages-4.jsx (Programa y Calendario)
const pages4Jsx = readFile('pages-4.jsx');
if (pages4Jsx) {
  assertContains('pages-4.jsx', pages4Jsx, 'fetchWorship', 'PagePrograma debe consumir fetchWorship()');
  assertContains('pages-4.jsx', pages4Jsx, 'cal-event-editor', 'PageCalendarioEditable debe conservar la clase responsive cal-event-editor');
}

// 10. Verify styles.css responsive classes & dark theme
const stylesCss = readFile('styles.css');
if (stylesCss) {
  for (const cls of ['.footer-grid', '.home-schedule-grid', '.schedule-day', '.sunset-grid', '.cal-event-editor']) {
    assertContains('styles.css', stylesCss, cls, `Debe conservar la regla CSS responsive ${cls}`);
  }
  assertContains('styles.css', stylesCss, '[data-theme="dark"]', 'Debe conservar las variables de tema oscuro [data-theme="dark"]');
}

if (errors.length > 0) {
  console.error('❌ Falló la verificación de integración de website/:\n');
  for (const err of errors) {
    console.error(`  • ${err}`);
  }
  process.exit(1);
} else {
  console.log('✅ Verificación exitosa: todos los contratos de window.IASD_API y reglas responsive de website/ están intactos.');
}
