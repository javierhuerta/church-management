#!/usr/bin/env node
/**
 * Tests for the church-communications-cms skill CLI (cms-cli.mjs) against a
 * local HTTP server that records requests. Never touches production:
 * CHURCH_API_URL points to 127.0.0.1 and explicit env vars win over any .env.
 *
 * Run: node --test scripts/test-cms-cli.mjs
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const CLI = join(REPO, '.opencode/skills/church-communications-cms/assets/cms-cli.mjs');
const API_KEY = 'ch_cms_test_key';

let server;
let baseUrl;
let requests = [];
let cwd;

before(async () => {
  cwd = mkdtempSync(join(tmpdir(), 'cms-cli-test-'));
  server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      requests.push({ method: req.method, url: req.url, apiKey: req.headers['x-api-key'], body: body ? JSON.parse(body) : null });
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
  rmSync(cwd, { recursive: true, force: true });
});

function runCli(args) {
  requests = [];
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [CLI, ...args], {
      cwd,
      env: { PATH: process.env.PATH, CHURCH_API_KEY: API_KEY, CHURCH_API_URL: baseUrl },
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

describe('cms-cli home campaign commands', () => {
  test('campaign-set sends only the campaign fields as a PUT to the home config', async () => {
    const payload = { campaignLayout: 'hero', campaignTitle: 'Cuenta Regresiva', campaignVideoUrl: 'https://example.com/invitacion.mp4' };
    const { code, stdout } = await runCli(['home', 'campaign-set', JSON.stringify(payload)]);

    assert.equal(code, 0);
    assert.deepEqual(JSON.parse(stdout), { success: true });
    assert.deepEqual(requests, [{ method: 'PUT', url: '/api/site-config/home', apiKey: API_KEY, body: payload }]);
  });

  test('campaign-set rejects non-campaign fields before sending anything', async () => {
    const { code, stderr } = await runCli(['home', 'campaign-set', JSON.stringify({ heroTitle: 'x', campaignTitle: 'y' })]);

    assert.equal(code, 1);
    assert.match(stderr, /home campaign-set only accepts campaign\* fields \(got: heroTitle\)/);
    assert.deepEqual(requests, []);
  });

  test('campaign-set rejects invalid JSON before sending anything', async () => {
    const { code, stderr } = await runCli(['home', 'campaign-set', '{not json']);

    assert.equal(code, 1);
    assert.match(stderr, /Invalid JSON payload/);
    assert.deepEqual(requests, []);
  });

  test('campaign-on and campaign-off toggle campaignEnabled', async () => {
    let result = await runCli(['home', 'campaign-on']);
    assert.equal(result.code, 0);
    assert.deepEqual(requests.map((r) => [r.method, r.url, r.body]), [['PUT', '/api/site-config/home', { campaignEnabled: true }]]);

    result = await runCli(['home', 'campaign-off']);
    assert.equal(result.code, 0);
    assert.deepEqual(requests.map((r) => [r.method, r.url, r.body]), [['PUT', '/api/site-config/home', { campaignEnabled: false }]]);
  });

  test('existing home get and update commands keep their behavior', async () => {
    let result = await runCli(['home', 'get']);
    assert.equal(result.code, 0);
    assert.deepEqual(requests.map((r) => [r.method, r.url, r.body]), [['GET', '/api/site-config/home', null]]);

    result = await runCli(['home', 'update', JSON.stringify({ heroTitle: 'Central' })]);
    assert.equal(result.code, 0);
    assert.deepEqual(requests.map((r) => [r.method, r.url, r.body]), [['PUT', '/api/site-config/home', { heroTitle: 'Central' }]]);
  });
});
