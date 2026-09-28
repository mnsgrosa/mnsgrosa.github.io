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
  // Sticky banner: a column between the rail and the article that holds its
  // place while the article scrolls, and a plain band below the desktop layout.
  // The cover never displaces the reading column: at every width the article
  // keeps the content box's left edge, whether the cover is a band above it or
  // a sticky layer in the gutter. The 1440 case below is the regression test
  // for the article having been pushed right.
  for (const width of [375, 1440, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${origin}/posts/stepback/`);
    const banner = page.locator('.post-banner');
    assert.equal(await banner.count(), 1, `banner missing at ${width}`);
    assert.equal(await page.locator('.post-banner img').getAttribute('src'), '/images/article-banner.jpg');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Banner overflow at ${width}`);
    const content = await page.locator('.content').boundingBox();
    const prose = await page.locator('.post-content').boundingBox();
    const column = await banner.boundingBox();
    if (width >= 1440) {
      // Three columns: menu | thin gap | portrait cover | thin gap | article.
      const rail = await page.locator('.site-rail').boundingBox();
      const cover = await page.locator('.post-banner img').boundingBox();
      const menuGap = cover.x - (rail.x + rail.width);
      const articleGap = prose.x - (cover.x + cover.width);
      assert.ok(menuGap > 0 && menuGap <= 48, `thin gap between menu and cover (${menuGap})`);
      assert.ok(articleGap > 0 && articleGap <= 48, `thin gap between cover and article (${articleGap})`);
      assert.ok(prose.x > content.x, 'article follows the cover');
      assert.ok(cover.height > cover.width * 1.5, 'cover column is portrait');
      assert.equal(await banner.evaluate(el => getComputedStyle(el).position), 'sticky', 'cover column is sticky');
      // No dead space trailing the wide layout: the constellation runs to the
      // right edge of the content box.
      const hood = await page.locator('.neighborhood').boundingBox();
      const slack = content.x + content.width - (hood.x + hood.width);
      assert.ok(slack <= 2, `wide layout reaches the right edge (slack=${slack})`);
      // The reading block grows on ultrawide without lengthening the line.
      if (width >= 1920) {
        const line = await page.evaluate(() => {
          const p = document.querySelector('.post-content p');
          const range = document.createRange();
          range.selectNodeContents(p);
          const rects = [...range.getClientRects()].filter(r => r.width > 50);
          return { charsPerLine: Math.round(p.textContent.length / rects.length), proseWidth: Math.round(document.querySelector('.post-content').getBoundingClientRect().width) };
        });
        assert.ok(line.proseWidth >= 780, `reading block widened (${line.proseWidth}px)`);
        assert.ok(line.charsPerLine <= 90, `line length still bounded (${line.charsPerLine} chars)`);
      }
      const viewport = await page.evaluate(() => innerHeight);
      assert.ok(Math.abs(cover.height - (viewport - 64)) < 2, `cover fills the viewport height (${cover.height} vs ${viewport - 64})`);
      assert.equal(await page.locator('.post-banner img').evaluate(el => getComputedStyle(el).objectFit), 'cover');
      await page.evaluate(() => scrollTo(0, 1600));
      await page.waitForTimeout(50);
      const stuck = await page.locator('.post-banner img').boundingBox();
      const header = await page.locator('.article-header h1').boundingBox();
      assert.ok(header.y < 0, 'article scrolled past the cover');
      assert.ok(stuck.y >= 0 && stuck.y < 200, `cover followed the scroll (y=${stuck.y})`);
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `${artifacts}/banner-${width}.png` });
    } else {
      const position = await banner.evaluate(el => getComputedStyle(el).position);
      assert.notEqual(position, 'sticky', 'cover is not sticky below the three-column width');
      assert.ok(Math.abs(prose.x - content.x) < 2, `article stays at the content edge (${prose.x} vs ${content.x})`);
      assert.ok(column.y < prose.y, 'cover card sits above the article');
      assert.ok(column.height <= 0.61 * (await page.evaluate(() => innerHeight)), 'cover card is capped in height');
      await page.screenshot({ path: `${artifacts}/banner-${width}.png`, fullPage: width === 375 });
    }
    await page.goto(`${origin}/posts/teste_1/`);
    assert.equal(await page.locator('.post-banner').count(), 0, 'no banner without the field');
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
