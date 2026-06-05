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

  // Inicio: textos, imágenes y próximo culto.
  async function fetchHome() {
    return apiGet('/public/home');
  }

  // Horarios: textos de la página + ítems activos agrupados por día.
  // Devuelve { kicker, title, paragraph, days: [{ label, accent, items: [{ time, title, description }] }] }
  async function fetchSchedule() {
    return apiGet('/public/schedule');
  }

  // Calcula la puesta de sol para los próximos 4 viernes en Osorno, Chile.
  // Basado en una aproximación simplificada para la latitud -40.57.
  function getSunsetTimes() {
    var osornoLat = -40.57;
    var osornoLon = -73.13;
    var times = [];
    var now = new Date();
    
    // Encontrar el próximo viernes
    var day = now.getDay();
    var diff = (5 - day + 7) % 7;
    if (diff === 0 && now.getHours() >= 20) diff = 7; // Si ya es viernes noche, pasar al siguiente
    
    var nextFriday = new Date(now);
    nextFriday.setDate(now.getDate() + diff);
    nextFriday.setHours(12, 0, 0, 0);

    for (var i = 0; i < 4; i++) {
      var date = new Date(nextFriday);
      date.setDate(nextFriday.getDate() + (i * 7));
      
      // Fórmula simplificada de declinación solar
      var startOfYear = new Date(date.getFullYear(), 0, 1);
      var dayOfYear = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
      var declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * (Math.PI / 180));
      
      // Ángulo horario al atardecer (en grados)
      var cosH = -Math.tan(osornoLat * (Math.PI / 180)) * Math.tan(declination * (Math.PI / 180));
      var H = Math.acos(Math.max(-1, Math.min(1, cosH))) * (180 / Math.PI);
      
      // Tiempo solar verdadero del atardecer (en horas desde el mediodía solar)
      var sunsetSolar = H / 15;
      
      // Ajuste por longitud y ecuación del tiempo (simplificado)
      // Osorno está en UTC-4 (invierno) o UTC-3 (verano)
      // El mediodía solar en Osorno (-73.13 lon) es aprox a las 12:52 (UTC-4) o 13:52 (UTC-3)
      var isDST = date.getMonth() > 8 || date.getMonth() < 3; // Aproximación DST Chile
      var solarNoon = isDST ? 13.87 : 12.87; 
      
      var sunsetTime = solarNoon + sunsetSolar;
      var hours = Math.floor(sunsetTime);
      var minutes = Math.round((sunsetTime - hours) * 60);
      if (minutes === 60) { hours++; minutes = 0; }

      var dayStr = date.getDate() + ' ' + ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][date.getMonth()];
      times.push([dayStr, pad(hours) + ':' + pad(minutes)]);
    }
    return times;
  }

  window.IASD_API = {
    apiGet: apiGet,
    fetchEvents: fetchEvents,
    mapEvent: mapEvent,
    fetchLeadership: fetchLeadership,
    fetchHome: fetchHome,
    fetchSchedule: fetchSchedule,
    getSunsetTimes: getSunsetTimes,
    mapLeader: mapLeader,
    mapMinistry: mapMinistry,
  };
})();
