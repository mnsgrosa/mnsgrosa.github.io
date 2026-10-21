import { readFileSync } from 'node:fs';
import path from 'node:path';

// Same rule as `content-index.mjs`, and for the same reason: Astro relocates
// server chunks into dist during builds, so authored files are resolved from the
// project working directory and not from the bundled module's `import.meta.url`.
// Reading the file also keeps this module loadable by `node --test`, where a
// bare `import … from '*.json'` would need an import attribute.
const registry = path.resolve('src/data/github-repos.json');
const repos = JSON.parse(readFileSync(registry, 'utf8'));

// `starsFallback` in the data file is the whole offline story: the card is the
// only thing in the build that touches the network, and the GitHub API answers
// 403 once 60 unauthenticated requests per hour run out. A failed lookup keeps
// the article building; it never fails it.
const TIMEOUT_MS = 5000;

// Module scope, so a build makes at most one request per repository no matter
// how many pages render the card. A rejection is not retried: it is already
// resolved to the fallback count.
const requests = new Map();

// Test seam only. The build renders every page against one cache, which is the
// behaviour the "one request per build" test depends on.
export function resetGithubRepoCache() {
  requests.clear();
}

async function fetchStars(repo) {
  try {
    const response = await fetch(repo.apiUrl, {
      headers: { accept: 'application/vnd.github+json', 'user-agent': 'mnsgrosa.github.io-build' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return repo.starsFallback;
    const payload = await response.json();
    const count = payload?.stargazers_count;
    return Number.isInteger(count) && count >= 0 ? count : repo.starsFallback;
  } catch {
    return repo.starsFallback;
  }
}

export function githubRepo(key) {
  const repo = repos[key];
  if (!repo) throw new Error(`Unknown repository "${key}" in src/data/github-repos.json`);
  if (!requests.has(key)) requests.set(key, fetchStars(repo));
  return requests.get(key).then(stars => ({
    name: repo.name,
    handle: `@${repo.owner}`,
    url: repo.url,
    avatarUrl: repo.avatarUrl,
    stars,
  }));
}

// The card is the only place the count becomes text, and both language routes
// must agree on it: `1 estrela` / `N estrelas`, `1 star` / `N stars`.
export function starLabel(stars, lang) {
  const [singular, plural] = lang === 'pt' ? ['estrela', 'estrelas'] : ['star', 'stars'];
  return `${stars} ${stars === 1 ? singular : plural}`;
}
