import test from 'node:test';
import assert from 'node:assert/strict';
import { darkBannerPath, resolveDarkBanner } from '../src/lib/banner.mjs';

/**
 * The cover's dark twin is chosen by a filename convention, so the two ways it
 * can go wrong are: producing a path that does not exist (broken cover in dark
 * mode), and producing the wrong path for an input that already looks dark.
 * Both are cheap to pin down here, where there is no browser.
 */

test('the convention inserts -dark before the extension', () => {
  assert.equal(darkBannerPath('/images/cover.jpg'), '/images/cover-dark.jpg');
  assert.equal(darkBannerPath('/images/cover.jpeg'), '/images/cover-dark.jpeg');
  assert.equal(darkBannerPath('/images/cover.png'), '/images/cover-dark.png');
  assert.equal(darkBannerPath('/images/cover.avif'), '/images/cover-dark.avif');
  assert.equal(darkBannerPath('https://example.com/a/b.webp'), 'https://example.com/a/b-dark.webp');
});

test('applying the convention twice cannot produce cover-dark-dark', () => {
  const once = darkBannerPath('/images/cover.jpg');
  assert.equal(darkBannerPath(once), once);
  assert.equal(darkBannerPath('/images/cover-dark.jpg'), '/images/cover-dark.jpg');
});

test('a path with no extension has no twin to name', () => {
  assert.equal(darkBannerPath('/images/cover'), null);
  assert.equal(darkBannerPath('/images/'), null);
  assert.equal(darkBannerPath(''), null);
  assert.equal(darkBannerPath(null), null);
  assert.equal(darkBannerPath(undefined), null);
});

test('a query string or fragment survives the rename', () => {
  assert.equal(darkBannerPath('/images/cover.jpg?v=2'), '/images/cover-dark.jpg?v=2');
  assert.equal(darkBannerPath('/images/cover.jpg#top'), '/images/cover-dark.jpg#top');
});

test('the twin is used only when the file is really there', () => {
  const seen = [];
  const exists = path => { seen.push(path); return true; };
  assert.equal(resolveDarkBanner('/images/cover.jpg', { exists }), '/images/cover-dark.jpg');
  assert.deepEqual(seen, ['/images/cover-dark.jpg'], 'the existence check runs on the candidate, not the original');

  const missing = resolveDarkBanner('/images/cover.jpg', { exists: () => false });
  assert.equal(missing, null, 'a twin that is not on disk leaves the page on the light cover');
});

test('an explicit frontmatter path wins and is trusted without a disk check', () => {
  assert.equal(
    resolveDarkBanner('/images/cover.jpg', { bannerDark: 'https://cdn.example.com/night.png', exists: () => false }),
    'https://cdn.example.com/night.png',
  );
});

test('bannerDark: false keeps one cover in both schemes', () => {
  assert.equal(resolveDarkBanner('/images/cover.jpg', { bannerDark: false, exists: () => true }), null);
});

test('a remote light banner does not get a guessed twin', () => {
  // Nothing can prove the remote twin exists; guessing would emit a <source>
  // that 404s, and a cover that breaks in dark mode is worse than one that does
  // not switch.
  assert.equal(resolveDarkBanner('https://example.com/cover.jpg', { exists: () => true }), null);
});

test('no banner means no twin', () => {
  assert.equal(resolveDarkBanner(undefined, { bannerDark: '/images/x-dark.jpg' }), null);
  assert.equal(resolveDarkBanner(null, {}), null);
});
