/**
 * Banner path conventions.
 *
 * A post's cover has an optional dark-mode twin. The rule is a filename
 * convention rather than a second frontmatter field for the common case, so a
 * translator adding artwork does not have to remember to edit two keys:
 *
 *   /images/cover.jpg  ->  /images/cover-dark.jpg
 *
 * `bannerDark` in frontmatter still wins when the pair does not fit the
 * convention (a different crop, a different file entirely).
 *
 * Pure: no filesystem access, so it is unit-tested directly. Whether the twin
 * actually exists is the caller's problem — a page that emits a `<source>` for a
 * file that is not there gets a broken image in dark mode, which is worse than
 * not switching at all.
 */

/**
 * The dark twin of a banner path, or `null` when the path has no extension to
 * insert before. Idempotent: a path already ending in `-dark` maps to itself,
 * so applying the convention twice cannot produce `cover-dark-dark.jpg`.
 * Query strings and fragments are left alone.
 */
export function darkBannerPath(banner) {
  if (!banner || typeof banner !== 'string') return null;
  const [, path = '', suffix = ''] = /^([^?#]*)([?#].*)?$/.exec(banner) ?? [];
  const match = /^(.*?)(\.[a-z0-9]+)$/i.exec(path);
  if (!match) return null;
  const [, stem, extension] = match;
  if (stem.endsWith('-dark')) return banner;
  return `${stem}-dark${extension}${suffix}`;
}

/**
 * The path a page should use for the dark banner, given the light one, an
 * optional explicit override, and a predicate that answers "is this local file
 * on disk?".
 *
 * - `bannerDark: false` disables the twin.
 * - An explicit `bannerDark` string wins, and is trusted without a disk check
 *   (it may be an absolute URL).
 * - Otherwise the convention applies, but only for root-relative paths whose
 *   twin exists in `public/`. A remote URL has no way to prove its twin is
 *   there, so it stays on the light image until frontmatter says otherwise.
 */
export function resolveDarkBanner(banner, { bannerDark, exists = () => false } = {}) {
  if (!banner || bannerDark === false) return null;
  if (typeof bannerDark === 'string') return bannerDark;
  if (!banner.startsWith('/')) return null;
  const candidate = darkBannerPath(banner);
  if (!candidate || candidate === banner) return null;
  return exists(candidate) ? candidate : null;
}
