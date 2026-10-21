import test from 'node:test';
import assert from 'node:assert/strict';
import { githubRepo, starLabel, resetGithubRepoCache } from '../src/lib/github-repo.mjs';

// The card is the only network call in the build. Everything here is about the
// failure paths: a rate-limited or unreachable API must still produce a card,
// because a lookup failure is not allowed to fail `npm run build`.
const key = 'inverted-classroom';
const fallback = 1;

const originalFetch = globalThis.fetch;

function stubFetch(impl) {
  globalThis.fetch = impl;
}

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  resetGithubRepoCache();
});

test('the star count comes from the GitHub payload', async () => {
  stubFetch(async () => ({ ok: true, json: async () => ({ stargazers_count: 128 }) }));
  const repo = await githubRepo(key);
  assert.equal(repo.stars, 128);
  assert.equal(repo.handle, '@mnsgrosa');
  assert.equal(repo.name, 'inverted-classroom');
  assert.equal(repo.url, 'https://github.com/mnsgrosa/inverted-classroom');
});

test('a rate-limited API falls back instead of throwing', async () => {
  stubFetch(async () => ({ ok: false, status: 403 }));
  assert.equal((await githubRepo(key)).stars, fallback);
});

test('an unreachable API falls back instead of throwing', async () => {
  stubFetch(() => {
    throw new Error('getaddrinfo ENOTFOUND api.github.com');
  });
  assert.equal((await githubRepo(key)).stars, fallback);
});

test('a payload without a usable count falls back', async () => {
  for (const stargazers_count of [undefined, null, '12', -1, 4.5]) {
    resetGithubRepoCache();
    stubFetch(async () => ({ ok: true, json: async () => ({ stargazers_count }) }));
    assert.equal((await githubRepo(key)).stars, fallback, `${String(stargazers_count)} must fall back`);
  }
});

test('a build asks GitHub once per repository, not once per page', async () => {
  let calls = 0;
  stubFetch(async () => {
    calls += 1;
    return { ok: true, json: async () => ({ stargazers_count: 7 }) };
  });
  const [first, second, third] = await Promise.all([githubRepo(key), githubRepo(key), githubRepo(key)]);
  assert.deepEqual([first.stars, second.stars, third.stars], [7, 7, 7]);
  assert.equal(calls, 1, 'concurrent pages must share one in-flight request');
});

test('an unknown repository key fails loudly at build time', async () => {
  stubFetch(async () => ({ ok: true, json: async () => ({ stargazers_count: 1 }) }));
  assert.throws(() => githubRepo('does-not-exist'), /Unknown repository/);
});

test('the count is pluralised in the article language', () => {
  assert.equal(starLabel(1, 'pt'), '1 estrela');
  assert.equal(starLabel(0, 'pt'), '0 estrelas');
  assert.equal(starLabel(128, 'pt'), '128 estrelas');
  assert.equal(starLabel(1, 'en'), '1 star');
  assert.equal(starLabel(0, 'en'), '0 stars');
  assert.equal(starLabel(128, 'en'), '128 stars');
});
