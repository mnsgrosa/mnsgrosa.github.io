import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdir, writeFile } from 'node:fs/promises';
import { verifyScenes } from './scene-browser.mjs';

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
  // The original document/reader checks exercise the accessible linear view.
  // verifyScenes separately checks normal-motion desktop rotation.
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(origin)) errors.push(`${response.status()} ${response.url()}`); });
  for (const width of [320, 375, 414, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(origin);
    await page.locator('knowledge-map[data-ready="true"]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('h1').textContent(), 'Matheus Rosa');
    assert.equal(await page.locator('.contact-cta').getAttribute('href'), 'mailto:matheusnsampaio@gmail.com');
    assert.deepEqual(await page.locator('.knowledge-label').allTextContents(), ['MLOps', 'AWS', 'GCP', 'Databricks', 'Langchain', 'FastAPI', 'NLP', 'Computer Vision']);
    assert.equal(await page.locator('.knowledge-node:visible').count(), 8);
    assert.ok(await page.locator('.home-experience').textContent().then(text => text.includes('Maggu') && text.includes('Valorian')));
    assert.equal(await page.locator('#projects a[href="https://github.com/mnsgrosa"]').count(), 1);
    assert.equal(await page.locator('#projects a[href*="example.com"], #projects a[href*="yourname"]').count(), 0);
    const sections = await page.locator('#about-title, #knowledge, #explore, #profile, #experience, #projects').evaluateAll(elements => elements.map(el => el.getBoundingClientRect().top));
    assert.ok(sections.every((top, index) => index === 0 || top > sections[index - 1]), 'home sections follow the approved order');
    const nodes = await page.locator('.knowledge-copy').evaluateAll(elements => elements.map(el => {
      const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
    }));
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      assert.ok(a.x >= 0 && a.right <= width, `knowledge label inside viewport at ${width}`);
      for (const b of nodes.slice(i + 1)) assert.ok(a.right <= b.x || b.right <= a.x || a.bottom <= b.y || b.bottom <= a.y, `knowledge labels do not overlap at ${width}`);
    }
    assert.equal(await page.locator('.topic-articles a[href="/posts/stepback/"]').count(), 0, 'graph:false stays out of the map');
    assert.equal(await page.locator('[id]').evaluateAll(elements => {
      const ids = elements.map(el => el.id); return ids.length - new Set(ids).size;
    }), 0, 'home has no duplicate IDs');
    await page.screenshot({ path: `${artifacts}/home-overview-${width}.png` });
    const topic = page.locator('.topic-toggle');
    assert.equal(await topic.count(), 1);
    await topic.click();
    assert.equal(await page.locator('.article-node').count(), 2);
    assert.equal(await page.locator('.topic-articles a:visible').count(), 2);
    assert.equal(await topic.getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('.graph-edge').count(), 1);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Home overflow at ${width}`);
    const wrapped = await page.locator('.site-rail nav a, .home-header a, .home-shortcuts a, .contact-cta, .map-toolbar button, .site-footer a').evaluateAll(elements => elements.filter(el => {
      const range = document.createRange(); range.selectNodeContents(el);
      const rects = [...range.getClientRects()].filter(rect => rect.width > 0 && rect.height > 0);
      // Inline icons/spans have their own rectangles even on a single line.
      return rects.length > 1 && Math.max(...rects.map(r => r.top)) >= Math.min(...rects.map(r => r.bottom));
    }).map(el => el.textContent));
    assert.deepEqual(wrapped, [], `Wrapped controls at ${width}`);
    await page.screenshot({ path: `${artifacts}/home-${width}.png`, fullPage: true });
    await page.goto(`${origin}/posts/make_the_llm_choose_pt/`);
    await page.locator('knowledge-map[data-ready="true"]').waitFor();
    assert.equal(await page.locator('.neighbor-links ul a').count(), 1);
    assert.equal(await page.locator('.article-node').count(), 2);
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
    await page.goto(`${origin}/posts/make_the_llm_choose_pt/`);
    const banner = page.locator('.post-banner');
    assert.equal(await banner.count(), 1, `banner missing at ${width}`);
    assert.equal(await page.locator('.post-banner img').getAttribute('src'), '/images/article-banner.jpg', 'cover comes from the shared default');
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
        assert.ok(line.proseWidth >= 1100, `reading block widened (${line.proseWidth}px)`);
        // The owner chose a longer line over a mid-page gap at ultrawide. 100
        // characters is the stated ceiling for that trade, not a guideline.
        assert.ok(line.charsPerLine <= 100, `line within the agreed ceiling (${line.charsPerLine} chars)`);
        const midGap = hood.x - (prose.x + prose.width);
        assert.ok(midGap <= 200, `gap between text and constellation stays bounded (${midGap}px)`);
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
    assert.equal(await page.locator('.post-banner').count(), 0, 'banner: false opts out of the default');
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(origin);
  await page.evaluate(() => document.fonts.ready);
  assert.ok(await page.locator('.contact-cta').evaluate(el => el.getBoundingClientRect().bottom <= innerHeight), 'contact fits laptop fold');
  assert.ok(await page.locator('.knowledge-node').evaluateAll(elements => elements.every(el => el.getBoundingClientRect().bottom <= innerHeight)), 'knowledge diagram fits laptop fold');
  await page.screenshot({ path: `${artifacts}/home-laptop-1280.png` });
  const contrastFailures = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');
    const rgba = color => {
      ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1);
      return [...ctx.getImageData(0, 0, 1, 1).data];
    };
    const luminance = values => values.slice(0, 3).map(v => {
      v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
    }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    return [...document.querySelectorAll('body *')].filter(el =>
      !el.closest('svg, script, style, [hidden]') && el.getClientRects().length &&
      [...el.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim())
    ).flatMap(el => {
      const style = getComputedStyle(el);
      let parent = el, background;
      while (parent) {
        const candidate = rgba(getComputedStyle(parent).backgroundColor);
        if (candidate[3] === 255) { background = candidate; break; }
        parent = parent.parentElement;
      }
      if (!background) return [];
      const a = luminance(rgba(style.color)), b = luminance(background);
      const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
      return ratio >= (large ? 3 : 4.5) ? [] : [{ text: el.textContent.trim().slice(0, 60), ratio }];
    });
  });
  assert.deepEqual(contrastFailures, [], 'home text meets WCAG contrast thresholds');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin);
  await page.locator('knowledge-map[data-ready="true"]').waitFor();
  await page.locator('.contact-cta').focus();
  assert.equal(await page.locator('.contact-cta').evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
  await page.locator('.home-header a[href="#experience"]').click();
  assert.equal(new URL(page.url()).hash, '#experience');
  assert.ok(await page.locator('#experience').evaluate(el => Math.abs(el.getBoundingClientRect().top) < 100));
  await page.locator('[data-node-subject]').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.article-node').count(), 2);
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
  await page.locator('.topic-articles a').filter({ hasText: 'E se as LLMs' }).click();
  await page.locator('knowledge-map[data-ready="true"]').waitFor();
  assert.equal(await page.locator('.post-content a[href="/posts/stepback/"]').count(), 1);
  await page.goBack();
  await page.locator('knowledge-map[data-ready="true"]').waitFor();
  assert.equal(await page.locator('[data-camera]').getAttribute('transform'), dragged, 'Back restores map viewport');
  assert.equal(await page.locator('.article-node').count(), 2);
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
  assert.equal(await fallback.locator('.knowledge-node:visible').count(), 8);
  assert.equal(await fallback.locator('.contact-cta').getAttribute('href'), 'mailto:matheusnsampaio@gmail.com');
  assert.ok(await fallback.locator('#experience').isVisible());
  await fallback.locator('.home-header a[href="#experience"]').click();
  assert.equal(new URL(fallback.url()).hash, '#experience');
  assert.equal(await fallback.locator('.topic-articles a:visible').count(), 2);
  await fallback.locator('.topic-articles a').first().click();
  assert.ok(await fallback.locator('.post-content').isVisible());
  assert.ok(await fallback.locator('.neighbor-links a').count() >= 1);
  await noJS.close();
  await page.goto(`${origin}/posts/stepback/`);
  assert.equal(await page.locator('knowledge-map').count(), 0, 'excluded article remains published without a neighborhood');
  assert.ok(await page.locator('.post-content').isVisible());
  for (const route of ['/posts/', '/experience/', '/projects/', '/posts/teste_1/', '/dashboard/']) {
    assert.equal((await page.goto(`${origin}${route}`)).status(), 200, route);
  }
  await verifyScenes(browser, origin, artifacts, errors);
  assert.deepEqual(errors, [], 'No browser errors or failed local responses');
  console.log('PASS: 5 widths, home/reader, map/list sync, keyboard, pan/zoom/reset, backlinks, Back restoration, scene glide, inner scroll, resize, reduced motion, no-JS, preserved routes.');
  console.log(`Screenshots: ${artifacts}`);
} finally {
  await browser?.close();
  server.kill('SIGTERM');
  await writeFile(`${artifacts}/preview.log`, log);
}
