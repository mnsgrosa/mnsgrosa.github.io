import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { slug as githubSlug } from 'github-slugger';
import { buildGraph } from './knowledge.mjs';

// Astro relocates server chunks into dist during builds. Resolve authored files
// from the project working directory, not the bundled module's import.meta.url.
const root = path.resolve('src/content/posts');
const registry = path.resolve('src/data/subjects.json');
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? files(file) : /\.mdx?$/.test(entry.name) ? [file] : [];
  }).sort();
}

// Read fresh for each call so edits and new articles are visible in the dev server.
export function readArticles() {
  return files(root).map(file => {
    const { data, content } = matter(readFileSync(file, 'utf8'));
    const generated = path.relative(root, file).replace(/\.mdx?$/, '').split(path.sep).map(segment => githubSlug(segment)).join('/').replace(/\/index$/, '');
    const slug = data.slug ?? generated;
    if (typeof slug !== 'string' || !slug || /[?#\\]/.test(slug) || slug.startsWith('/') || slug.endsWith('/') || slug.split('/').some(p => p === '..' || p === '.')) {
      throw new Error(`${file}: invalid article slug`);
    }
    return { id: `posts/${slug}`, title: data.title, url: `/posts/${slug}/`, subject: data.subject, graph: data.graph, lang: data.lang, description: data.description, body: content, file };
  });
}

export function readGraph() {
  return buildGraph(readArticles(), JSON.parse(readFileSync(registry, 'utf8')));
}
