#!/usr/bin/env node
/**
 * church-communications-cms CLI helper
 * Zero-dependency Node.js 18+ script for managing the 7 website sections
 * of Iglesia Adventista Central Osorno via X-API-Key.
 *
 * Environment variables:
 *   CHURCH_API_KEY (required) — e.g. ch_cms_...
 *   CHURCH_API_URL (optional) — defaults to https://adventistascentralosorno.cl
 */

import { readFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';

const BASE_URL = (
  process.env.CHURCH_API_URL || 'https://adventistascentralosorno.cl'
)
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');
const API_KEY = process.env.CHURCH_API_KEY || '';

if (!API_KEY) {
  console.error(
    'Error: CHURCH_API_KEY environment variable is required (e.g. ch_cms_...).',
  );
  process.exit(1);
}

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
};

async function request(method, path, body = undefined, isFormData = false) {
  const url = `${BASE_URL}/api${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    'X-API-Key': API_KEY,
    Accept: 'application/json',
  };

  let payload = body;
  if (body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json';
    payload = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const res = await fetch(url, {
    method,
    headers,
    body: payload,
  });

  const text = await res.text();
  let parsed = text;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    // keep raw text
  }

  if (!res.ok) {
    console.error(`HTTP ${res.status} ${res.statusText} on ${method} ${url}`);
    console.error(typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify(parsed, null, 2));
}

async function uploadFile(path, filePath, extraFields = {}) {
  const buffer = await readFile(filePath);
  const ext = extname(filePath).toLowerCase();
  const mime = MIME_BY_EXT[ext] || 'application/octet-stream';
  const form = new FormData();
  form.append('file', new Blob([buffer], { type: mime }), basename(filePath));
  for (const [k, v] of Object.entries(extraFields)) {
    if (v !== undefined) form.append(k, String(v));
  }
  await request('POST', path, form, true);
}

function parseJsonArg(arg, label = 'JSON payload') {
  if (!arg) {
    console.error(`Error: Missing ${label}`);
    process.exit(1);
  }
  try {
    return JSON.parse(arg);
  } catch (err) {
    console.error(`Error: Invalid ${label}: ${err.message}`);
    process.exit(1);
  }
}

const [, , section, action, ...rest] = process.argv;

async function main() {
  switch (section) {
    case 'whoami':
    case 'test': {
      await request('GET', '/site-config/home');
      console.error(`✅ Conexión verificada con éxito hacia ${BASE_URL}/api`);
      return;
    }

    case 'home': {
      if (action === 'get') return request('GET', '/site-config/home');
      if (action === 'update') return request('PUT', '/site-config/home', parseJsonArg(rest[0]));
      if (action === 'upload-image') {
        const [slot, filePath] = rest;
        if (!slot || !filePath) throw new Error('Usage: home upload-image <main|small|next-service> <file>');
        return uploadFile(`/site-config/home/images/${slot}`, filePath);
      }
      break;
    }

    case 'leaders': {
      if (action === 'list') return request('GET', '/site-config/leaders');
      if (action === 'create') return request('POST', '/site-config/leaders', parseJsonArg(rest[0]));
      if (action === 'update') return request('PATCH', `/site-config/leaders/${rest[0]}`, parseJsonArg(rest[1]));
      if (action === 'delete') return request('DELETE', `/site-config/leaders/${rest[0]}`);
      if (action === 'upload-photo') return uploadFile(`/site-config/leaders/${rest[0]}/photo`, rest[1]);
      if (action === 'board-photo') return request('GET', '/site-config/leadership/board-photo');
      if (action === 'upload-board-photo') return uploadFile('/site-config/leadership/board-photo', rest[0]);
      if (action === 'ministries') return request('GET', '/site-config/ministries');
      break;
    }

    case 'schedule': {
      if (action === 'get-texts') return request('GET', '/site-config/schedule/texts');
      if (action === 'update-texts') return request('PATCH', '/site-config/schedule/texts', parseJsonArg(rest[0]));
      if (action === 'list') return request('GET', '/site-config/schedule');
      if (action === 'create') return request('POST', '/site-config/schedule', parseJsonArg(rest[0]));
      if (action === 'update') return request('PATCH', `/site-config/schedule/${rest[0]}`, parseJsonArg(rest[1]));
      if (action === 'delete') return request('DELETE', `/site-config/schedule/${rest[0]}`);
      break;
    }

    case 'calendar': {
      if (action === 'list') {
        const qs = rest[0] ? `?${rest[0].replace(/^\?/, '')}` : '';
        return request('GET', `/calendar${qs}`);
      }
      if (action === 'get') return request('GET', `/calendar/${rest[0]}`);
      if (action === 'create') return request('POST', '/calendar', parseJsonArg(rest[0]));
      if (action === 'update') return request('PATCH', `/calendar/${rest[0]}`, parseJsonArg(rest[1]));
      if (action === 'publish') return request('POST', `/calendar/${rest[0]}/publish`);
      if (action === 'archive') return request('POST', `/calendar/${rest[0]}/archive`);
      if (action === 'delete') return request('DELETE', `/calendar/${rest[0]}`);
      if (action === 'upload-cover') return uploadFile(`/calendar/${rest[0]}/cover`, rest[1]);
      break;
    }

    case 'worship': {
      if (action === 'templates') return request('GET', '/worship-services/templates');
      if (action === 'hymns') return request('GET', `/hymns?q=${encodeURIComponent(rest[0] || '')}`);
      if (action === 'list') {
        const qs = rest[0] ? `?${rest[0].replace(/^\?/, '')}` : '';
        return request('GET', `/worship-services/programs${qs}`);
      }
      if (action === 'get') return request('GET', `/worship-services/programs/${rest[0]}`);
      if (action === 'create') return request('POST', '/worship-services/programs', parseJsonArg(rest[0]));
      if (action === 'update') return request('PATCH', `/worship-services/programs/${rest[0]}`, parseJsonArg(rest[1]));
      if (action === 'update-section') return request('PATCH', `/worship-services/programs/sections/${rest[0]}`, parseJsonArg(rest[1]));
      if (action === 'publish') return request('POST', `/worship-services/programs/${rest[0]}/publish`);
      if (action === 'publish-with-event') {
        return request('POST', `/worship-services/programs/${rest[0]}/publish-with-event`, parseJsonArg(rest[1] || '{"createCalendarEvent":true}'));
      }
      break;
    }

    case 'gallery': {
      if (action === 'get-config') return request('GET', '/gallery/config');
      if (action === 'update-config') return request('PATCH', '/gallery/config', parseJsonArg(rest[0]));
      if (action === 'albums') return request('GET', '/gallery/albums');
      if (action === 'album') return request('GET', `/gallery/albums/${rest[0]}`);
      if (action === 'create-album') return request('POST', '/gallery/albums', parseJsonArg(rest[0]));
      if (action === 'update-album') return request('PATCH', `/gallery/albums/${rest[0]}`, parseJsonArg(rest[1]));
      if (action === 'publish-album') return request('PATCH', `/gallery/albums/${rest[0]}/publish`);
      if (action === 'delete-album') return request('DELETE', `/gallery/albums/${rest[0]}`);
      if (action === 'upload-image') return uploadFile(`/gallery/albums/${rest[0]}/images`, rest[1]);
      if (action === 'update-image') return request('PATCH', `/gallery/images/${rest[0]}`, parseJsonArg(rest[1]));
      if (action === 'publish-image') return request('PATCH', `/gallery/images/${rest[0]}/publish`);
      if (action === 'delete-image') return request('DELETE', `/gallery/images/${rest[0]}`);
      break;
    }

    case 'live': {
      if (action === 'get-config') return request('GET', '/transmisiones/config');
      if (action === 'update-config') return request('PATCH', '/transmisiones/config', parseJsonArg(rest[0]));
      if (action === 'force-check') return request('POST', '/transmisiones/force-check');
      if (action === 'sermons') return request('GET', '/transmisiones/sermons');
      if (action === 'sync-sermons') return request('POST', '/transmisiones/sermons/sync');
      if (action === 'create-sermon') return request('POST', '/transmisiones/sermons', parseJsonArg(rest[0]));
      if (action === 'update-sermon') return request('PATCH', `/transmisiones/sermons/${rest[0]}`, parseJsonArg(rest[1]));
      if (action === 'publish-sermon') return request('PATCH', `/transmisiones/sermons/${rest[0]}/publish`);
      if (action === 'delete-sermon') return request('DELETE', `/transmisiones/sermons/${rest[0]}`);
      break;
    }
  }

  console.error(
    'Usage: node cms-cli.mjs <home|leaders|schedule|calendar|worship|gallery|live> <action> [args...]',
  );
  process.exit(1);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
