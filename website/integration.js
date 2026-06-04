// integration.js — Puente entre el sitio público (export de Claude Artifacts)
// y la API del backend NestJS. NO forma parte del export original: si llega una
// actualización del diseño, este archivo se mantiene y solo se re-aplican los
// pequeños hooks descritos en INTEGRATION.md.
(function () {
  'use strict';

  // Mismo origen: en dev lo proxea Vite, en prod el nginx del contenedor website.
  var API_BASE = '/api';

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  // Convierte un EventResponseDto del backend al shape que esperan las páginas
  // del diseño: { id, date 'YYYY-MM-DD', start 'HH:MM', title, loc, featured }.
  function mapEvent(ev) {
    var d = new Date(ev.startDate);
    var date = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    var start = pad(d.getHours()) + ':' + pad(d.getMinutes());
    var loc = [ev.location, ev.department && ev.department.name]
      .filter(Boolean)
      .join(' · ') || 'Templo';
    return {
      id: ev.id,
      date: date,
      start: start,
      title: ev.title,
      loc: loc,
      slug: ev.shareSlug,
      featured: false,
    };
  }

  // Eventos publicados desde hoy en adelante. La API ya filtra a "published"
  // para usuarios anónimos (sin token).
  async function fetchEvents() {
    var now = new Date();
    var from =
      now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
    var res = await fetch(
      API_BASE + '/calendar?startDate=' + from + '&limit=100',
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) throw new Error('calendar fetch failed: ' + res.status);
    var json = await res.json();
    var list = Array.isArray(json) ? json : json.data || [];
    return list.map(mapEvent);
  }

  window.IASD_API = { fetchEvents: fetchEvents, mapEvent: mapEvent };
})();
