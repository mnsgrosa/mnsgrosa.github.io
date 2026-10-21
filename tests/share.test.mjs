import test from 'node:test';
import assert from 'node:assert/strict';
import { linkedInShareUrl } from '../src/lib/share.mjs';

// The article URL is absolute and prefix-free; the share link must carry it
// verbatim, encoded, so LinkedIn opens the page the author wrote.
const endpoint = 'https://www.linkedin.com/sharing/share-offsite/';

test('linkedInShareUrl encodes the article URL as its only parameter', () => {
  const href = linkedInShareUrl('https://mnsgrosa.github.io/posts/como_comecaria/');
  assert.equal(href, `${endpoint}?url=${encodeURIComponent('https://mnsgrosa.github.io/posts/como_comecaria/')}`);
  const parsed = new URL(href);
  assert.equal(parsed.origin + parsed.pathname, 'https://www.linkedin.com/sharing/share-offsite/');
  assert.deepEqual([...parsed.searchParams.keys()], ['url'], 'only `url`, which is all LinkedIn reads');
  assert.equal(parsed.searchParams.get('url'), 'https://mnsgrosa.github.io/posts/como_comecaria/');
});

test('linkedInShareUrl round-trips URLs that carry their own query and fragment', () => {
  const target = 'https://mnsgrosa.github.io/pt/posts/?tag=ml&page=2#explore';
  const href = linkedInShareUrl(target);
  assert.ok(!href.slice(endpoint.length).includes('&page='), 'the ampersand is encoded, not a second parameter');
  assert.equal(new URL(href).searchParams.get('url'), target);
  assert.equal(new URL(href).searchParams.getAll('url').length, 1);
});

test('linkedInShareUrl rejects relative URLs instead of emitting a broken share link', () => {
  assert.throws(() => linkedInShareUrl('/posts/a/'), /absolute http\(s\) URL/);
  assert.throws(() => linkedInShareUrl(''), /absolute http\(s\) URL/);
  assert.throws(() => linkedInShareUrl(undefined), /absolute http\(s\) URL/);
});
