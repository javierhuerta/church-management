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

  // Helper genérico para GET requests a la API pública.
  // Devuelve el JSON parseado (objeto o array). Lanza error si la respuesta no es ok.
  async function apiGet(path) {
    var res = await fetch(API_BASE + path, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('apiGet failed: ' + res.status + ' ' + path);
    return res.json();
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
    var json = await apiGet('/calendar?startDate=' + from + '&limit=100');
    var list = Array.isArray(json) ? json : json.data || [];
    return list.map(mapEvent);
  }

  // Mapea un líder del backend al shape que espera PageNosotros.
  function mapLeader(leader) {
    return {
      role: leader.role,
      name: leader.name,
      photoUrl: leader.photoUrl || null,
      slot: 'leader-' + leader.id,
    };
  }

  // Limpia el nombre de un ministerio para evitar redundancias con el prefijo "MIN."
  // que agrega el diseño. Ejemplos:
  //   "Ministerio Infantil"           → "Infantil"
  //   "Ministerio de la Mujer"        → "Mujer"
  //   "GTeen (Ministerio del Adolescente)" → "GTeen"
  //   "MIPES (Ministerio Personal)"   → "MIPES"
  //   "ASA"                           → "ASA" (sin cambios)
  function cleanMinistryName(name) {
    if (!name) return name;
    var cleaned = name;
    // Quitar "(Ministerio ...)" del final
    cleaned = cleaned.replace(/\s*\(Ministerio[^)]*\)/i, '').trim();
    // Quitar "Ministerio " al inicio
    cleaned = cleaned.replace(/^Ministerio\s+(de\s+la\s+)?/i, '').trim();
    // Quitar "Min. " al inicio
    cleaned = cleaned.replace(/^Min\.\s*/i, '').trim();
    return cleaned || name;
  }

  // Mapea un ministerio del backend al shape que espera PageNosotros.
  function mapMinistry(ministry) {
    return {
      role: cleanMinistryName(ministry.name),
      name: ministry.leaders || 'Sin responsable',
    };
  }

  // Liderazgo: junta directiva, foto grupal y ministerios.
  // Devuelve { boardPhotoUrl, board, ministries } mapeados al formato del diseño.
  async function fetchLeadership() {
    var data = await apiGet('/public/leadership');
    return {
      boardPhotoUrl: data.boardPhotoUrl || null,
      board: (data.board || []).map(mapLeader),
      ministries: (data.ministries || []).map(mapMinistry),
    };
  }

  window.IASD_API = {
    apiGet: apiGet,
    fetchEvents: fetchEvents,
    mapEvent: mapEvent,
    fetchLeadership: fetchLeadership,
    mapLeader: mapLeader,
    mapMinistry: mapMinistry,
  };
})();
