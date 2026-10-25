/* Hallmark · component: social card helpers · genre: technical modern-minimal
 * theme: Slate Blue (light raster — the OG card follows the default palette) · pure functions, no Astro APIs, unit-tested.
 *
 * Everything a page or an endpoint needs to *name* a card lives here: the URL,
 * the locale strings, and how a title becomes at most four lines. The sizes it
 * picks come from `og-theme.mjs` (the token mirror), never from a literal here.
 */

import { card, text } from './og-theme.mjs';

/** `en` → `en_US`, `pt` → `pt_BR`. The two locales this site ships. */
const LOCALES = { en: 'en_US', pt: 'pt_BR' };

export const ogLocales = LOCALES;

/** An Open Graph locale for a site language. */
export function ogLocale(lang) {
  const locale = LOCALES[lang];
  if (!locale) throw new Error(`ogLocale: unsupported language "${lang}"`);
  return locale;
}

/**
 * The `og:locale:alternate` values for a page, from the same `{ lang, href }`
 * list MainLayout already hands to `hreflang`. One source, so the two cannot
 * disagree; a page without a sibling yields none. A site route's `hreflang` set
 * contains both languages including itself, so `excludeLang` drops the page's
 * own locale — a page is never its own alternate.
 */
export function ogAlternateLocales(alternates, excludeLang) {
  if (!Array.isArray(alternates)) return [];
  const locales = alternates
    .filter(link => link && LOCALES[link.lang] && link.lang !== excludeLang)
    .map(link => LOCALES[link.lang]);
  return [...new Set(locales)];
}

/** The generated card for an article, by slug. Nested slugs keep their folders. */
export function ogImagePath(slug) {
  const clean = String(slug ?? '').replace(/^\/+|\/+$/g, '');
  return `/og/posts/${clean}.png`;
}

/** The generated card for a language's site routes. */
export function siteCardPath(lang) {
  ogLocale(lang);
  return `/og/${lang}.png`;
}

function normalize(title) {
  return String(title ?? '').replace(/\s+/g, ' ').trim();
}

/**
 * Average advance per character as a fraction of the font size, for Inter at the
 * weight the card uses. Deliberately generous: a line that measures short loses
 * nothing, a line that measures long clips. Satori cannot measure text back to
 * us, so the wrap is computed here and each line renders unwrapped.
 */
const ADVANCE = 0.56;

function maxChars(size, innerWidth) {
  return Math.max(1, Math.floor(innerWidth / (size * ADVANCE)));
}

/** Greedy word wrap; a single word wider than the line is hard-broken. */
function wrap(title, limit) {
  const lines = [];
  for (const word of title.split(' ')) {
    if (word.length > limit) {
      if (lines.length) lines.push('');
      for (let i = 0; i < word.length; i += limit) lines.push(word.slice(i, i + limit));
      continue;
    }
    const current = lines[lines.length - 1];
    if (current !== undefined && current.length + 1 + word.length <= limit) {
      lines[lines.length - 1] = `${current} ${word}`;
    } else {
      lines.push(word);
    }
  }
  return lines.filter(line => line !== '');
}

function truncate(lines, limit, maxLines) {
  const kept = lines.slice(0, maxLines);
  const overflow = lines.length > maxLines;
  if (!overflow) return kept;
  const last = kept[maxLines - 1] ?? '';
  const room = Math.max(1, limit - 1);
  kept[maxLines - 1] = `${last.length > room ? last.slice(0, room).trimEnd() : last}…`;
  return kept;
}

/**
 * The card title: at most four lines, at the largest size that fits both the
 * width and the height the card reserves for it.
 *
 * Size is derived from the fit, not from a character count, so a title is never
 * clipped: each candidate size is wrapped and the first one whose line count
 * stays inside its height budget wins. Below the smallest size the title is
 * truncated with an ellipsis rather than shrunk past legibility.
 */
export function cardTitleLines(title, options = {}) {
  const innerWidth = options.innerWidth ?? card.titleWidth;
  const titleHeight = options.titleHeight ?? card.titleHeight;
  const normalized = normalize(title);
  if (!normalized) return { lines: [], size: text.titleXl };

  for (const size of [text.titleXl, text.titleL, text.titleM, text.titleS, text.titleXs]) {
    const limit = maxChars(size, innerWidth);
    const rows = wrap(normalized, limit);
    const fits = Math.min(4, Math.floor(titleHeight / (size * card.titleLineHeight)));
    if (rows.length <= fits) return { lines: rows, size };
  }

  const size = text.titleXs;
  const limit = maxChars(size, innerWidth);
  const fits = Math.min(4, Math.floor(titleHeight / (size * card.titleLineHeight)));
  return { lines: truncate(wrap(normalized, limit), limit, fits), size };
}

/** The last line's character budget for a title, used by tests and by the card. */
export function titleLineLimit(size, innerWidth = card.titleWidth) {
  return maxChars(size, innerWidth);
}
