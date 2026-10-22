#!/usr/bin/env node
/**
 * Render tests for the public website pages (website/*.jsx) with a mocked
 * window.IASD_API. They load the real ui.jsx + pages-1.jsx into jsdom, the same
 * way index.html loads them in the browser (global scope, React UMD style).
 *
 * Dependencies (not part of the site build, install with --no-save):
 *   npm install --no-save @babel/core @babel/preset-react react@18.3.1 react-dom@18.3.1 jsdom
 * Resolved from WEBSITE_TEST_DEPS (a folder with node_modules) or the current directory.
 *
 * Run: node --test website/scripts/test-pages.mjs
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(join(process.env.WEBSITE_TEST_DEPS || process.cwd(), 'noop.js'));
const babel = require('@babel/core');
const { JSDOM } = require('jsdom');

const WEBSITE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES = ['ui.jsx', 'pages-1.jsx'].map((file) => {
  const code = readFileSync(join(WEBSITE_DIR, file), 'utf8');
  return babel.transformSync(code, { filename: file, presets: [[require('@babel/preset-react'), { runtime: 'classic' }]], babelrc: false, configFile: false }).code;
});

const BASE_HOME = {
  hero: { title: 'Central', titleAccent: 'Osorno', subtitle: 'Una comunidad', mainImageUrl: null, smallImageUrl: null },
  verse: { text: 'Versículo', reference: 'Juan 3:16' },
  schedule: { title: 'Horarios', subtitle: 'Te esperamos' },
  social: { facebookUrl: null, instagramUrl: null, youtubeUrl: null },
  footerCta: { title: 'Te esperamos', subtitle: 'Andrés Bello 748', buttonText: 'Ver ubicación' },
  contact: { address: 'Andrés Bello 748', city: 'Osorno', email: null, phone: null },
  nextService: null,
};

const PHOTOS = ['templo', 'grupo', 'entrega', 'ninos', 'oracion', 'calle'].map((name) => ({
  url: `/uploads/gallery/${name}.jpg`,
  caption: `Foto ${name}`,
}));

function campaign(overrides = {}) {
  return {
    layout: 'hero',
    kicker: 'Semana de evangelismo',
    title: 'Cuenta Regresiva',
    titleAccent: 'El amanecer de un nuevo tiempo',
    text: 'Seminario profético.',
    ctaText: 'Ir al sitio de la campaña',
    ctaUrl: 'https://regresiva.adventistascentralosorno.cl',
    secondaryCtaText: 'Descargar el libro gratis',
    secondaryCtaUrl: '#libro',
    videoUrl: null,
    videoEmbedUrl: null,
    videoFileUrl: null,
    videoPosterUrl: null,
    countdownTarget: null,
    countdownLabel: null,
    photos: PHOTOS,
    ...overrides,
  };
}

/** Boots jsdom with React, the site scripts and a mocked IASD_API; renders a page component. */
async function renderPage(componentName, api) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'https://adventistascentralosorno.cl/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  window.React = require('react');
  window.ReactDOM = require('react-dom');
  window.IS_REACT_ACT_ENVIRONMENT = true;
  window.IASD_API = {
    fetchHome: async () => BASE_HOME,
    fetchHomeAlbum: async () => null,
    fetchSchedule: async () => ({ days: [] }),
    fetchWorship: async () => null,
    fetchGallery: async () => [],
    ...api,
  };
  for (const code of SOURCES) window.eval(code);
  // Function declarations in the classic scripts become window globals, as in the browser.
  const Component = window[componentName];
  assert.equal(typeof Component, 'function', `${componentName} should be a global function`);

  const { createRoot } = require('react-dom/client');
  const { act } = require('react');
  const previous = { window: globalThis.window, document: globalThis.document };
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const root = createRoot(window.document.getElementById('root'));
  await act(async () => {
    root.render(window.React.createElement(Component, { setPage: () => {} }));
  });
  // Let the mocked fetch* promises resolve and re-render.
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
  return {
    document: window.document,
    window,
    /** Runs a user interaction (click, key press) inside act() so React re-renders. */
    async interact(fn) {
      await act(async () => { fn(); });
    },
    cleanup() {
      act(() => root.unmount());
      globalThis.window = previous.window;
      globalThis.document = previous.document;
      window.close();
    },
  };
}

function campaignSection(document) {
  return document.querySelector('section[aria-label="Cuenta Regresiva"]');
}

function sectionIndex(document, section) {
  return [...document.querySelectorAll('main > section')].indexOf(section);
}

function heroSection(document) {
  return [...document.querySelectorAll('main > section')].find((s) => s.textContent.includes('Central') && s.querySelector('.hero-grid'));
}

describe('PageInicio — campaña destacada', () => {
  test('without a campaign renders the regular hero only, with a single h1', async () => {
    const page = await renderPage('PageInicio', {});
    try {
      assert.equal(campaignSection(page.document), null);
      const h1s = [...page.document.querySelectorAll('main h1')];
      assert.equal(h1s.length, 1);
      assert.match(h1s[0].textContent, /Central/);
    } finally {
      page.cleanup();
    }
  });

  test('older API without the campaign key still renders the regular home', async () => {
    const { campaign: _omit, ...legacy } = { ...BASE_HOME, campaign: undefined };
    const page = await renderPage('PageInicio', { fetchHome: async () => legacy });
    try {
      assert.equal(campaignSection(page.document), null);
      assert.ok(heroSection(page.document));
    } finally {
      page.cleanup();
    }
  });

  test('layout "hero" puts the campaign first, as the only h1, with a 1+4 photo mosaic', async () => {
    const page = await renderPage('PageInicio', {
      fetchHome: async () => ({ ...BASE_HOME, campaign: campaign({ videoFileUrl: 'https://example.com/invitacion.mp4' }) }),
    });
    try {
      const section = campaignSection(page.document);
      assert.ok(section, 'campaign section is rendered');
      assert.equal(sectionIndex(page.document, section), 0);
      assert.ok(sectionIndex(page.document, heroSection(page.document)) > 0, 'regular hero moves below');

      const h1s = [...page.document.querySelectorAll('main h1')].map((h) => h.textContent);
      assert.deepEqual(h1s, ['Cuenta Regresiva']);
      assert.match(heroSection(page.document).querySelector('h2').textContent, /Central/);

      const mosaic = section.querySelector('.campaign-mosaic');
      assert.ok(mosaic, 'five photos use the mosaic');
      assert.deepEqual([...mosaic.querySelectorAll('img')].map((i) => i.getAttribute('src')), PHOTOS.slice(0, 5).map((p) => p.url));
    } finally {
      page.cleanup();
    }
  });

  test('layout "band" renders the campaign right below the regular hero, as an h2', async () => {
    const page = await renderPage('PageInicio', { fetchHome: async () => ({ ...BASE_HOME, campaign: campaign({ layout: 'band' }) }) });
    try {
      const section = campaignSection(page.document);
      assert.equal(sectionIndex(page.document, section), sectionIndex(page.document, heroSection(page.document)) + 1);
      assert.equal(section.querySelector('h1'), null);
      assert.equal(section.querySelector('h2').textContent, 'Cuenta Regresiva');
      assert.equal(section.querySelector('.campaign-mosaic'), null);
      // Without video the first photo is the media; the strip shows the next two.
      assert.equal(section.querySelectorAll('figure img').length, 2);
    } finally {
      page.cleanup();
    }
  });

  test('a direct video file renders a native player with its poster; YouTube renders an iframe', async () => {
    const file = await renderPage('PageInicio', {
      fetchHome: async () => ({
        ...BASE_HOME,
        campaign: campaign({ videoFileUrl: 'https://example.com/invitacion.mp4', videoPosterUrl: 'https://example.com/invitacion.webp' }),
      }),
    });
    try {
      const video = campaignSection(file.document).querySelector('video');
      assert.equal(video.getAttribute('src'), 'https://example.com/invitacion.mp4');
      assert.equal(video.getAttribute('poster'), 'https://example.com/invitacion.webp');
      assert.equal(campaignSection(file.document).querySelector('iframe'), null);
    } finally {
      file.cleanup();
    }

    const yt = await renderPage('PageInicio', {
      fetchHome: async () => ({ ...BASE_HOME, campaign: campaign({ videoEmbedUrl: 'https://www.youtube.com/embed/abcDEF12345' }) }),
    });
    try {
      assert.equal(campaignSection(yt.document).querySelector('iframe').getAttribute('src'), 'https://www.youtube.com/embed/abcDEF12345');
      assert.equal(campaignSection(yt.document).querySelector('video'), null);
    } finally {
      yt.cleanup();
    }
  });

  test('hero without video uses the first photo as media and an even strip of four (no mosaic)', async () => {
    const page = await renderPage('PageInicio', { fetchHome: async () => ({ ...BASE_HOME, campaign: campaign() }) });
    try {
      const section = campaignSection(page.document);
      assert.equal(section.querySelector('.campaign-mosaic'), null);
      assert.deepEqual([...section.querySelectorAll('figure img')].map((i) => i.getAttribute('src')), PHOTOS.slice(1, 5).map((p) => p.url));
    } finally {
      page.cleanup();
    }
  });

  test('without video the first photo takes the media slot and the strip skips it', async () => {
    const page = await renderPage('PageInicio', { fetchHome: async () => ({ ...BASE_HOME, campaign: campaign({ layout: 'band' }) }) });
    try {
      const section = campaignSection(page.document);
      const imgs = [...section.querySelectorAll('img')].map((i) => i.getAttribute('src'));
      assert.deepEqual(imgs, PHOTOS.slice(0, 3).map((p) => p.url));
    } finally {
      page.cleanup();
    }
  });

  test('external CTAs open in a new tab, in-page links do not', async () => {
    const page = await renderPage('PageInicio', { fetchHome: async () => ({ ...BASE_HOME, campaign: campaign() }) });
    try {
      const links = [...campaignSection(page.document).querySelectorAll('a')];
      const main = links.find((a) => a.textContent.includes('Ir al sitio de la campaña'));
      const secondary = links.find((a) => a.textContent.includes('Descargar el libro gratis'));
      assert.equal(main.getAttribute('href'), 'https://regresiva.adventistascentralosorno.cl');
      assert.equal(main.getAttribute('target'), '_blank');
      assert.equal(main.getAttribute('rel'), 'noopener');
      assert.equal(secondary.getAttribute('target'), null);
    } finally {
      page.cleanup();
    }
  });

  test('shows the countdown only while the target date is in the future', async () => {
    const future = new Date(Date.now() + 3 * 86400000).toISOString();
    const past = new Date(Date.now() - 86400000).toISOString();

    const upcoming = await renderPage('PageInicio', { fetchHome: async () => ({ ...BASE_HOME, campaign: campaign({ countdownTarget: future }) }) });
    try {
      assert.ok(campaignSection(upcoming.document).querySelector('[role="timer"]'));
    } finally {
      upcoming.cleanup();
    }

    const finished = await renderPage('PageInicio', { fetchHome: async () => ({ ...BASE_HOME, campaign: campaign({ countdownTarget: past }) }) });
    try {
      assert.equal(campaignSection(finished.document).querySelector('[role="timer"]'), null);
    } finally {
      finished.cleanup();
    }
  });
});

describe('PageGaleria', () => {
  test('shows each album as a horizontal carousel of uncropped photos', async () => {
    const page = await renderPage('PageGaleria', {
      fetchGallery: async () => [
        {
          title: 'Cuenta Regresiva · Semana de evangelismo',
          kicker: 'Octubre 2026',
          images: PHOTOS.slice(0, 3).map((p, i) => ({ id: `img-${i}`, url: p.url, caption: p.caption })),
        },
      ],
    });
    try {
      const heading = [...page.document.querySelectorAll('main h2')].find((h) => h.textContent.startsWith('Cuenta Regresiva'));
      assert.ok(heading, 'album is rendered');
      const album = heading.closest('[data-album]');
      assert.ok(album, 'album wrapper is marked');
      const track = album.querySelector('.gallery-carousel');
      assert.ok(track, 'photos sit in a horizontal carousel track');
      const imgs = [...track.querySelectorAll('img')];
      assert.deepEqual(imgs.map((i) => i.getAttribute('src')), PHOTOS.slice(0, 3).map((p) => p.url));
      for (const img of imgs) {
        assert.equal(img.style.width, 'auto', 'width follows the photo, so it is not cropped');
        assert.equal(img.style.objectFit, 'contain');
      }
      const buttons = [...album.querySelectorAll('.gallery-nav button')].map((b) => b.getAttribute('aria-label'));
      assert.deepEqual(buttons, ['Fotos anteriores', 'Fotos siguientes']);
      assert.match(album.textContent, /3 fotos/);
    } finally {
      page.cleanup();
    }
  });

  test('opens a photo in a full-screen viewer and moves through the album', async () => {
    const page = await renderPage('PageGaleria', {
      fetchGallery: async () => [
        {
          title: 'Cuenta Regresiva · Semana de evangelismo',
          kicker: 'Octubre 2026',
          images: PHOTOS.slice(0, 3).map((p, i) => ({ id: `img-${i}`, url: p.url, caption: p.caption })),
        },
      ],
    });
    try {
      const { document, window } = page;
      const viewerImage = () => document.querySelector('[role="dialog"] img');
      const button = (label) => document.querySelector(`[role="dialog"] button[aria-label="${label}"]`);
      assert.equal(document.querySelector('[role="dialog"]'), null, 'viewer starts closed');

      const thumbs = [...document.querySelectorAll('.gallery-carousel img')];
      await page.interact(() => thumbs[1].click());
      assert.ok(document.querySelector('[role="dialog"][aria-modal="true"]'), 'clicking a photo opens the viewer');
      assert.equal(viewerImage().getAttribute('src'), PHOTOS[1].url);
      assert.match(document.querySelector('[role="dialog"]').textContent, /2 \/ 3/);
      assert.match(document.querySelector('[role="dialog"]').textContent, /Foto grupo/);

      await page.interact(() => button('Foto siguiente').click());
      assert.equal(viewerImage().getAttribute('src'), PHOTOS[2].url);
      await page.interact(() => button('Foto siguiente').click());
      assert.equal(viewerImage().getAttribute('src'), PHOTOS[0].url, 'wraps around after the last photo');

      await page.interact(() => window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowLeft' })));
      assert.equal(viewerImage().getAttribute('src'), PHOTOS[2].url, 'left arrow key goes back');

      await page.interact(() => window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' })));
      assert.equal(document.querySelector('[role="dialog"]'), null, 'Escape closes the viewer');

      await page.interact(() => thumbs[0].click());
      await page.interact(() => button('Cerrar').click());
      assert.equal(document.querySelector('[role="dialog"]'), null, 'the close button closes the viewer');
    } finally {
      page.cleanup();
    }
  });

  test('moves the carousel by itself while the mouse is over it', async () => {
    const page = await renderPage('PageGaleria', {
      fetchGallery: async () => [
        { title: 'Cuenta Regresiva', kicker: 'Octubre 2026', images: PHOTOS.map((p, i) => ({ id: `img-${i}`, url: p.url, caption: p.caption })) },
      ],
    });
    try {
      const { document, window } = page;
      const track = document.querySelector('.gallery-carousel');
      assert.equal(track.dataset.autoplay, 'off', 'still until the mouse enters');
      await page.interact(() => track.querySelector('img').dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true })));
      assert.equal(track.dataset.autoplay, 'on', 'hovering a photo starts the motion');
      await page.interact(() => track.querySelector('img').dispatchEvent(new window.MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body })));
      assert.equal(track.dataset.autoplay, 'off', 'leaving the carousel stops it');
    } finally {
      page.cleanup();
    }
  });
});

