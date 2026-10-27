/**
 * Locale-aware paths, the single place that decides a URL for a language.
 *
 * The route is the source of truth: `/pt/...` is Portuguese, everything else is
 * English. Article URLs are the one exception — they never take a prefix
 * (`/posts/<slug>/` for both languages) because an article's language already
 * lives in its frontmatter `lang`, and moving those URLs would break links,
 * tests and the language switch that the articles already carry.
 */

export const defaultLocale = 'en';

// The prefixed locale, as a prefix that only matches a whole path segment.
const LOCALE_PREFIX = /^\/pt(?=\/|$)/;
// Article routes: `/posts/<slug>/`. `/posts/` (the catalogue) is not an article.
const ARTICLE_PATH = /^\/posts\/[^/]+\/$/;

function splitSuffix(pathname) {
  const index = pathname.search(/[?#]/);
  return index === -1 ? [pathname, ''] : [pathname.slice(0, index), pathname.slice(index)];
}

/** `/pt/posts/` → `/posts/`, `pt/posts/` → `/posts/`, `/` → `/`. */
function barePath(pathname) {
  const [beforeSuffix] = splitSuffix(pathname);
  const path = (beforeSuffix.startsWith('/') ? beforeSuffix : `/${beforeSuffix}`).replace(LOCALE_PREFIX, '');
  return path === '' ? '/' : path;
}

function withSuffix(path, suffix) {
  return `${path}${suffix}`;
}

/**
 * The URL of a site route in `lang`. Accepts the English path and is
 * idempotent, so passing an already-prefixed path can never yield `/pt/pt/`.
 */
export function localePath(lang, path = '/') {
  const [, suffix] = splitSuffix(String(path ?? '/').trim());
  const bare = barePath(String(path ?? '/').trim());
  if (lang === 'pt') return withSuffix(bare === '/' ? '/pt/' : `/pt${bare}`, suffix);
  return withSuffix(bare, suffix);
}

/** The article catalogue for a language. */
export function catalogPath(lang) {
  return localePath(lang, '/posts/');
}

/**
 * The home map for a language, optionally with one island already open. The
 * island rides in the query so the link stays a plain URL: the map script reads
 * it, and a reader without JavaScript still lands on the page and its topic
 * list. `#explore` is the anchor the rest of the site already links to.
 */
export function explorePath(lang, subjectId) {
  const query = subjectId ? `?island=${encodeURIComponent(String(subjectId))}` : '';
  return localePath(lang, `/${query}#explore`);
}

/** An article URL. Always prefix-free, whatever the language. */
export function articlePath(slug) {
  const clean = String(slug ?? '').replace(/^\/+|\/+$/g, '');
  return clean ? `/posts/${clean}/` : '/posts/';
}

/** The language a route belongs to. */
export function localeFromPathname(pathname) {
  return LOCALE_PREFIX.test(String(pathname ?? '')) ? 'pt' : 'en';
}

/** The same page in the other language, keeping the rest of the path. */
export function switchLocalePath(pathname) {
  const value = String(pathname ?? '/');
  const [, suffix] = splitSuffix(value);
  const bare = barePath(value);
  const target = localeFromPathname(value) === 'pt' ? 'en' : 'pt';
  return withSuffix(target === 'pt' ? (bare === '/' ? '/pt/' : `/pt${bare}`) : bare, suffix);
}

/** True for `/posts/<slug>/` — a route whose language comes from frontmatter. */
export function isArticlePath(pathname) {
  return ARTICLE_PATH.test(String(pathname ?? ''));
}
