/**
 * Outbound share links, built at build time.
 *
 * The article URL is already absolute (`Astro.site` + `articlePath(slug)`), so a
 * plain anchor is enough: no client script, and the button still works with
 * JavaScript disabled. Pure functions, no file or Astro APIs.
 */

const LINKED_IN_ENDPOINT = 'https://www.linkedin.com/sharing/share-offsite/';

/**
 * The LinkedIn "share a link" URL for an absolute page URL.
 *
 * LinkedIn reads only `url` here and takes the title and description from the
 * page's own metadata; `title`/`summary` are ignored, so none are emitted.
 */
export function linkedInShareUrl(absoluteUrl) {
  const value = String(absoluteUrl ?? '').trim();
  if (!/^https?:\/\//i.test(value)) {
    throw new Error(`linkedInShareUrl needs an absolute http(s) URL, got "${value}".`);
  }
  return `${LINKED_IN_ENDPOINT}?url=${encodeURIComponent(value)}`;
}
