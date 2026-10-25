import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import sharp from 'sharp';
import { card, colors, fonts, text } from '../src/lib/og-theme.mjs';
import { cardTitleLines, ogAlternateLocales, ogImagePath, ogLocale, siteCardPath, titleLineLimit } from '../src/lib/og.mjs';
import { renderCard } from '../src/lib/og-card.mjs';

const root = path.resolve('.');
const postsDir = path.join(root, 'src/content/posts');
const postFiles = ['como_comecaria.mdx', 'Make_the_LLM_choose_PT.md', 'rag-to-production.mdx', 'stepback.md', 'teste_1.md'];

function readPosts() {
  return postFiles.map(file => {
    const { data } = matter(readFileSync(path.join(postsDir, file), 'utf8'));
    return { file, ...data };
  });
}

// --- the token mirror ---------------------------------------------------------

test('og-theme mirrors the Slate Blue (light) roles tokens.css declares', () => {
  const css = readFileSync(path.join(root, 'tokens.css'), 'utf8');
  const declared = new Map();
  // Only the light block is mirrored: a build-time raster has no media query, so
  // the card follows the default palette. Parsing only the `Slate Blue` label
  // (not `Slate Blue Dark`) means a second, dark-only block can never silently
  // satisfy this assertion.
  for (const match of css.matchAll(/--color-([a-z-]+):\s*oklch\([^)]*\);\s*\/\* Slate Blue (#[0-9a-f]{6}) \*\//g)) {
    declared.set(match[1], match[2].toLowerCase());
  }
  // Exactly nine: a stale annotation label would match zero lines and leave the
  // drift assertion below comparing an empty map against a non-empty mirror, so
  // the count is asserted before the comparison rather than after it.
  assert.equal(declared.size, 9, `tokens.css declares ${declared.size} Slate Blue colour roles (the light raster mirror), expected 9`);
  for (const [role, hex] of declared) {
    assert.equal(colors[role], hex, `og-theme.colors.${role} drifted from tokens.css (${hex})`);
  }
  assert.deepEqual(Object.keys(colors).sort(), [...declared.keys()].sort(), 'the mirror carries exactly the tokens.css roles');
});

test('og-theme font roles are the families tokens.css names', () => {
  const css = readFileSync(path.join(root, 'tokens.css'), 'utf8');
  const family = role => new RegExp(`--font-${role}:\\s*'([^']+)'`).exec(css)[1].replace(/ Variable$/, '');
  assert.equal(fonts.body, family('body'));
  assert.equal(fonts.display, family('display'));
});

// --- pure helpers -------------------------------------------------------------

test('ogImagePath is per slug and keeps nested folders', () => {
  assert.equal(ogImagePath('rag-to-production'), '/og/posts/rag-to-production.png');
  assert.equal(ogImagePath('/rag-to-production/'), '/og/posts/rag-to-production.png');
  assert.equal(ogImagePath('notes/inner-post'), '/og/posts/notes/inner-post.png');
  assert.equal(ogImagePath(null), '/og/posts/.png');
});

test('siteCardPath and ogLocale follow the route language', () => {
  assert.equal(siteCardPath('en'), '/og/en.png');
  assert.equal(siteCardPath('pt'), '/og/pt.png');
  assert.equal(ogLocale('en'), 'en_US');
  assert.equal(ogLocale('pt'), 'pt_BR');
  assert.throws(() => ogLocale('es'), /unsupported language/);
  assert.throws(() => siteCardPath('es'), /unsupported language/);
});

test('ogAlternateLocales reads the hreflang shape, and never lists the page itself', () => {
  // A paired article: one sibling.
  assert.deepEqual(ogAlternateLocales([{ lang: 'en', href: '/posts/rag-to-production/' }], 'pt'), ['en_US']);
  // A site route: hreflang carries both languages including the page's own.
  assert.deepEqual(ogAlternateLocales([{ lang: 'en', href: '/' }, { lang: 'pt', href: '/pt/' }], 'pt'), ['en_US']);
  assert.deepEqual(ogAlternateLocales([{ lang: 'en', href: '/' }, { lang: 'pt', href: '/pt/' }], 'en'), ['pt_BR']);
  // Nothing to say: no sibling, no list, null.
  assert.deepEqual(ogAlternateLocales([]), []);
  assert.deepEqual(ogAlternateLocales(null, 'pt'), []);
  assert.deepEqual(ogAlternateLocales(undefined, 'pt'), []);
  assert.deepEqual(ogAlternateLocales([{ lang: 'pt', href: '/pt/posts/x/' }], 'pt'), [], 'a page is not its own alternate');
});

// --- the title ----------------------------------------------------------------

const SIZES = new Set([text.titleXl, text.titleL, text.titleM, text.titleS, text.titleXs]);

function assertFits(title) {
  const { lines, size } = cardTitleLines(title);
  assert.ok(SIZES.has(size), `size ${size} comes from the token mirror`);
  assert.ok(lines.length <= 4, `${lines.length} lines for ${title.length} chars: ${JSON.stringify(lines)}`);
  // Measured against the column the card actually wraps at, so a line that is
  // too wide for 640 px cannot pass because the helper defaulted to the canvas.
  const limit = titleLineLimit(size, card.titleWidth);
  assert.equal(limit, titleLineLimit(size), 'titleLineLimit defaults to the title column');
  for (const line of lines) assert.ok(line.length <= limit, `line "${line}" exceeds ${limit} chars at ${size}px`);
  return { lines, size };
}

test('a 90-character title stays inside four lines', () => {
  const title = 'A deliberately long article title that keeps going until it reaches ninety-nine characters';
  assert.equal(title.length, 90);
  const { lines, size } = assertFits(title);
  assert.ok(lines.length <= 4, `wrapped to ${lines.length} lines at ${size}px`);
  assert.ok(size < text.titleXl, 'a long title steps down from the largest bucket');
});

test('a title past the four-line cap is truncated with an ellipsis, never clipped', () => {
  const title = Array.from({ length: 40 }, (_, i) => `palavra${i}`).join(' ');
  const { lines, size } = assertFits(title);
  assert.equal(lines.length, 4);
  assert.equal(size, text.titleXs, 'the cap is reached at the smallest bucket');
  assert.ok(lines[3].endsWith('…'), `last line reads "${lines[3]}"`);
});

test('a Portuguese title keeps its diacritics and wraps to fit the column', () => {
  const title = 'E se as LLMs escolhessem o que fazer?';
  const { lines, size } = assertFits(title);
  assert.equal(lines.join(' '), title, 'the title is not transliterated and loses no word');
  assert.equal(size, text.titleXl, 'three lines fit the column at the largest bucket');
});

test('every real article title renders in full, with no ellipsis', () => {
  for (const post of readPosts()) {
    const { lines, size } = assertFits(post.title);
    assert.equal(lines.join(' '), post.title, `${post.file} is truncated: ${JSON.stringify(lines)}`);
    assert.ok(!lines.some(line => line.endsWith('…')), `${post.file} ends in an ellipsis`);
    assert.ok(size >= text.titleXs, `${post.title} fell below the legibility floor`);
  }
});

test('cardTitleLines survives empty and missing titles', () => {
  assert.deepEqual(cardTitleLines(''), { lines: [], size: text.titleXl });
  assert.deepEqual(cardTitleLines(undefined), { lines: [], size: text.titleXl });
  assert.deepEqual(cardTitleLines('  spaced   out  ').lines, ['spaced out']);
});

// --- the raster ---------------------------------------------------------------

test('a rendered card is a 1200×630 PNG', async () => {
  const png = await renderCard({ kicker: 'Engenharia de IA · 28 de setembro de 2026', title: 'De RAG à produção: meu roteiro de estudos em LLMOps' });
  const meta = await sharp(png).metadata();
  assert.equal(meta.format, 'png');
  assert.equal(meta.width, card.width);
  assert.equal(meta.height, card.height);
  assert.ok(png.length > 10000, `a card is more than a blank canvas (${png.length} bytes)`);
});

test('a short title renders without padding the page with an empty card', async () => {
  const png = await renderCard({ kicker: 'Fora do mapa · 2 de fevereiro de 2026', title: 'teste' });
  const meta = await sharp(png).metadata();
  assert.equal(meta.width, card.width);
  assert.ok(png.length > 10000);
});

// --- the safe area ------------------------------------------------------------

/**
 * The ink bounds of a rendered card. Anything that is not the paper ground is
 * ink, so this catches a title that grew past the bottom margin and artwork that
 * ran off the right edge — the two regressions a rendered PNG can have while
 * every pure-function test stays green.
 */
async function inkBounds(png) {
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  // Read from the token mirror, not a literal: a stale ground colour would treat
  // every background pixel as ink and fail the margin assertion for the wrong reason.
  const paper = [1, 3, 5].map(i => parseInt(colors.paper.slice(i, i + 2), 16));
  let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      const distance = Math.abs(data[i] - paper[0]) + Math.abs(data[i + 1] - paper[1]) + Math.abs(data[i + 2] - paper[2]);
      if (distance > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

test('every card keeps its ink inside the safe area', async () => {
  const { ui } = await import('../src/i18n/ui.mjs');
  const cards = [
    ...readPosts().map(post => ({ name: post.file, kicker: 'Engenharia de IA · 28/09/2026', title: post.title })),
    ...['en', 'pt'].map(lang => ({ name: `site ${lang}`, kicker: 'Matheus Rosa', title: ui[lang]['site.title'] })),
  ];
  // Two pixels of tolerance for the antialiased edge of a glyph or a stroke.
  const slack = 2;
  for (const { name, kicker, title } of cards) {
    const { minX, minY, maxX, maxY } = await inkBounds(await renderCard({ kicker, title }));
    assert.ok(minX >= card.padding - slack, `${name}: ink starts at x=${minX}, inside the ${card.padding}px margin`);
    assert.ok(minY >= card.padding - slack, `${name}: ink starts at y=${minY}, inside the ${card.padding}px margin`);
    assert.ok(maxX <= card.width - card.padding + slack, `${name}: ink reaches x=${maxX}, past the right margin (max ${card.width - card.padding})`);
    assert.ok(maxY <= card.height - card.padding + slack, `${name}: ink reaches y=${maxY}, past the bottom margin (max ${card.height - card.padding})`);
  }
});

// --- no tofu ------------------------------------------------------------------

/**
 * The two woff2 files `og-card.mjs` feeds to satori are the *latin* subsets.
 * @fontsource declares each subset's `unicode-range`, so the coverage of the
 * exact file the card renders with can be checked against the exact strings the
 * cards carry — including the ellipsis the truncation appends. A title that
 * needs `latin-ext` fails here instead of shipping a box glyph.
 */
function coverage(cssFile, woff2) {
  const css = readFileSync(path.join(root, cssFile), 'utf8');
  const block = css.split('@font-face').slice(1).find(part => part.includes(woff2));
  assert.ok(block, `${woff2} is declared in ${cssFile}`);
  const range = /unicode-range:\s*([^;]+);/.exec(block)[1];
  const covered = new Set();
  for (const part of range.split(',')) {
    const [, start, end] = /^U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?$/.exec(part.trim());
    for (let cp = parseInt(start, 16); cp <= parseInt(end ?? start, 16); cp++) covered.add(cp);
  }
  return covered;
}

function assertCovered(covered, value, where) {
  for (const char of String(value)) {
    assert.ok(covered.has(char.codePointAt(0)), `${where} carries U+${char.codePointAt(0).toString(16).toUpperCase()} ("${char}"), missing from the latin subset`);
  }
}

test('every string the cards render is covered by the bundled latin subsets', async () => {
  const { ui } = await import('../src/i18n/ui.mjs');
  const inter = coverage('node_modules/@fontsource-variable/inter/wght.css', 'inter-latin-wght-normal.woff2');
  const mono = coverage('node_modules/@fontsource-variable/jetbrains-mono/wght.css', 'jetbrains-mono-latin-wght-normal.woff2');
  const subjects = JSON.parse(readFileSync(path.join(root, 'src/data/subjects.json'), 'utf8'));

  for (const post of readPosts()) {
    assertCovered(inter, post.title, `${post.file} title`);
    // The same localized date the endpoint prints, in the mono kicker.
    for (const lang of ['en', 'pt']) {
      const date = post.pubDate.toLocaleDateString(lang, { timeZone: 'UTC' });
      const subjectTitle = subjects.find(subject => subject.id === post.subject)?.title[lang] ?? ui[lang]['map.outsideMap'];
      assertCovered(mono, `${subjectTitle} · ${date}`, `${post.file} (${lang}) kicker`);
      assertCovered(mono, ui[lang]['map.outsideMap'], `${lang} outside-the-map label`);
      for (const subject of subjects) assertCovered(mono, subject.title[lang], `${lang} subject title`);
    }
  }
  for (const lang of ['en', 'pt']) {
    assertCovered(inter, ui[lang]['site.title'], `${lang} site card title`);
    assertCovered(mono, ui[lang]['site.cardAlt'], `${lang} card alt text`);
  }
  assertCovered(inter, '…', 'the truncation ellipsis');
});
