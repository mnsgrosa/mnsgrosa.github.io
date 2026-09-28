import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdir, writeFile } from 'node:fs/promises';

const probe = createServer();
await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
const port = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const origin = `http://127.0.0.1:${port}`;
const artifacts = '/tmp/constellation-browser';
await mkdir(artifacts, { recursive: true });
const server = spawn(process.execPath, ['node_modules/astro/astro.js', 'preview', '--host', '127.0.0.1', '--port', String(port)], { stdio: ['ignore', 'pipe', 'pipe'] });
let log = '';
server.stdout.on('data', chunk => log += chunk);
server.stderr.on('data', chunk => log += chunk);
let browser;
const errors = [];
try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    if (server.exitCode !== null) throw new Error(`Preview exited: ${log}`);
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, `Preview not ready: ${log}`);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(origin)) errors.push(`${response.status()} ${response.url()}`); });
  for (const width of [320, 375, 414, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(origin);
    await page.locator('knowledge-map[data-ready="true"]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const topic = page.locator('.topic-toggle');
    assert.equal(await topic.count(), 1);
    await topic.click();
    assert.equal(await page.locator('.article-node').count(), 3);
    assert.equal(await page.locator('.topic-articles a:visible').count(), 3);
    assert.equal(await topic.getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('.graph-edge').count(), 2);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Home overflow at ${width}`);
    const wrapped = await page.locator('.site-rail nav a, .map-toolbar button, .site-footer a').evaluateAll(elements => elements.filter(el => {
      const range = document.createRange(); range.selectNodeContents(el);
      return range.getClientRects().length > 1;
    }).map(el => el.textContent));
    assert.deepEqual(wrapped, [], `Wrapped controls at ${width}`);
    await page.screenshot({ path: `${artifacts}/home-${width}.png`, fullPage: true });
    await page.goto(`${origin}/posts/stepback/`);
    await page.locator('knowledge-map[data-ready="true"]').waitFor();
    assert.equal(await page.locator('.neighbor-links ul a').count(), 2);
    assert.equal(await page.locator('.article-node').count(), 3);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Reader overflow at ${width}`);
    await page.screenshot({ path: `${artifacts}/article-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin);
  await page.locator('knowledge-map[data-ready="true"]').waitFor();
  await page.locator('[data-node-subject]').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.article-node').count(), 3);
  await page.keyboard.press('Space');
  assert.equal(await page.locator('.article-node').count(), 0);
  await page.locator('.topic-toggle').click();
  const before = await page.locator('[data-camera]').getAttribute('transform');
  await page.getByRole('button', { name: 'Pan right', exact: true }).click();
  const panned = await page.locator('[data-camera]').getAttribute('transform');
  assert.notEqual(before, panned);
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  const zoomed = await page.locator('[data-camera]').getAttribute('transform');
  assert.notEqual(panned, zoomed);
  const area = await page.locator('.world-svg').boundingBox();
  await page.mouse.move(area.x + 20, area.y + 20);
  await page.mouse.down(); await page.mouse.move(area.x + 80, area.y + 60); await page.mouse.up();
  const dragged = await page.locator('[data-camera]').getAttribute('transform');
  assert.notEqual(zoomed, dragged);
  await page.locator('.topic-articles a').filter({ hasText: 'What if' }).click();
  await page.locator('knowledge-map[data-ready="true"]').waitFor();
  assert.equal(await page.locator('.post-content a[href="/posts/stepback/"]').count(), 1);
  await page.goBack();
  await page.locator('knowledge-map[data-ready="true"]').waitFor();
  assert.equal(await page.locator('[data-camera]').getAttribute('transform'), dragged, 'Back restores map viewport');
  assert.equal(await page.locator('.article-node').count(), 3);
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  assert.notEqual(await page.locator('[data-camera]').getAttribute('transform'), dragged);
  for (let i = 0; i < 20; i++) {
    const button = page.getByRole('button', { name: 'Zoom out', exact: true });
    if (await button.isDisabled()) break;
    await button.click();
  }
  assert.equal(await page.locator('[data-zoom]').textContent(), '45%');
  assert.equal(await page.getByRole('button', { name: 'Zoom out', exact: true }).isDisabled(), true);
  for (let i = 0; i < 20; i++) {
    const button = page.getByRole('button', { name: 'Zoom in', exact: true });
    if (await button.isDisabled()) break;
    await button.click();
  }
  assert.equal(await page.locator('[data-zoom]').textContent(), '200%');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  assert.equal(await page.locator('.article-node').first().evaluate(el => getComputedStyle(el).animationName), 'none');
  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
  const fallback = await noJS.newPage();
  await fallback.goto(origin);
  assert.equal(await fallback.locator('.topic-articles a:visible').count(), 3);
  await fallback.locator('.topic-articles a').first().click();
  assert.ok(await fallback.locator('.post-content').isVisible());
  assert.ok(await fallback.locator('.neighbor-links a').count() >= 1);
  await noJS.close();
  for (const route of ['/posts/', '/experience/', '/projects/', '/posts/teste_1/']) {
    assert.equal((await page.goto(`${origin}${route}`)).status(), 200, route);
  }
  assert.deepEqual(errors, [], 'No browser errors or failed local responses');
  console.log('PASS: 5 widths, home/reader, map/list sync, keyboard, pan/zoom/reset, backlinks, Back restoration, reduced motion, no-JS, preserved routes.');
  console.log(`Screenshots: ${artifacts}`);
} finally {
  await browser?.close();
  server.kill('SIGTERM');
  await writeFile(`${artifacts}/preview.log`, log);
}
