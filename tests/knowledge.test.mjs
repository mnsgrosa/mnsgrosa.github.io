import test from 'node:test';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { compileLinks, buildGraph, neighborhood, layoutGraph, pairArticles } from '../src/lib/knowledge.mjs';

// Islands carry one string per language; the graph resolves them per build.
const subjects = [
  { id: 'ai', title: { en: 'AI', pt: 'IA' }, description: { en: 'Models', pt: 'Modelos' } },
  { id: 'data', title: { en: 'Data', pt: 'Dados' } },
];
const articles = [
  { id: 'posts/a', title: 'Article A', url: '/posts/a/', subject: 'ai', lang: 'en', body: '[[posts/b|Read B]] [[posts/b]] [[posts/a]]', file: 'a.md' },
  { id: 'posts/b', title: 'Article B', url: '/posts/b/', subject: 'data', lang: 'en', body: '[A](/posts/a/#intro)', file: 'b.mdx' },
  { id: 'posts/c', title: 'Article C', url: '/posts/c/', subject: 'ai', lang: 'en', body: '', file: 'c.md' },
];
const portuguese = [
  { id: 'posts/d', title: 'Artigo D', url: '/posts/d/', subject: 'ai', lang: 'pt', body: '[[posts/e]]', file: 'd.md' },
  { id: 'posts/e', title: 'Artigo E', url: '/posts/e/', subject: 'data', lang: 'pt', body: '[[posts/d]]', file: 'e.md' },
];
const parse = (body, mdx = false) => {
  const parser = unified().use(remarkParse);
  if (mdx) parser.use(remarkMdx);
  return parser.parse(body);
};
/** A minimal article, for the pairing rules. */
const article = (slug, lang, translationKey) => ({
  id: `posts/${slug}`, title: slug, url: `/posts/${slug}/`, subject: 'ai', lang, translationKey, body: '', file: `${slug}.md`,
});

test('wiki links compile into anchors with title or custom label', () => {
  const tree = parse('[[posts/b]] and [[posts/b|Read B]]');
  const links = compileLinks(tree, articles, 'a.md');
  assert.deepEqual(links, ['posts/b']);
  assert.deepEqual(tree.children[0].children.filter(n => n.type === 'link').map(n => [n.url, n.children[0].value]), [
    ['/posts/b/', 'Article B'], ['/posts/b/', 'Read B'],
  ]);
});

test('code, MDX expressions, and JSX attributes never create links', () => {
  const body = '`[[posts/missing]]`\n\n```md\n[[posts/missing]]\n```\n\n<Widget title="[[posts/missing]]" />\n\n{"[[posts/missing]]"}\n\n[[posts/b]]';
  assert.deepEqual(compileLinks(parse(body, true), articles, 'a.mdx'), ['posts/b']);
});

test('unknown and unsupported wiki forms fail with source and target', () => {
  for (const value of ['[[posts/missing]]', '[[Article B]]', '[[posts/b#part]]', '![[posts/b]]', '[[posts/b|]]', '[[posts/b|a|b]]']) {
    assert.throws(() => compileLinks(parse(value), articles, 'source.mdx'), /source\.mdx.*(wikilink|embed)/);
  }
});

test('normal article links including reference links are indexed, external links are not', () => {
  const tree = parse('[B](/posts/b/?from=a#section) [outside](https://example.com)\n\n[B ref][b]\n\n[b]: /posts/b/');
  assert.deepEqual(compileLinks(tree, articles, 'a.md'), ['posts/b']);
});

test('graph deduplicates directed edges, omits self loops, keeps isolated articles', () => {
  const graph = buildGraph(articles, subjects);
  assert.equal(graph.articles.length, 3);
  assert.deepEqual(graph.edges, [{ source: 'posts/a', target: 'posts/b' }, { source: 'posts/b', target: 'posts/a' }]);
  assert.deepEqual(neighborhood(graph, 'posts/a').outgoing.map(n => n.id), ['posts/b']);
  assert.deepEqual(neighborhood(graph, 'posts/a').incoming.map(n => n.id), ['posts/b']);
  assert.deepEqual(neighborhood(graph, 'posts/c').incoming, []);
});

test('invalid subjects, multiple subjects, and duplicate article identities fail', () => {
  for (const subject of [undefined, 'unknown', ['ai', 'data']]) {
    assert.throws(() => buildGraph([{ ...articles[0], subject }], subjects), /subject/);
  }
  assert.throws(() => buildGraph([articles[0], articles[0]], subjects), /Duplicate/);
  assert.throws(() => buildGraph(articles, [...subjects, subjects[0]]), /Duplicate/);
});

test('explicitly excluded articles keep routes but appear in no map', () => {
  // A pt note that stays out of the graph must stay out of the pt map too, and
  // its link to an en article must not become an edge anywhere.
  const excluded = { id: 'posts/test', title: 'Test', url: '/posts/test/', graph: false, lang: 'pt', body: '[[posts/a]]', file: 'test.md' };
  const all = [...articles, ...portuguese, excluded];
  for (const lang of ['en', 'pt']) {
    const graph = buildGraph(all, subjects, lang);
    assert.equal(graph.articles.some(a => a.id === 'posts/test'), false);
    assert.equal(graph.edges.length, 2);
    assert.equal(neighborhood(graph, 'posts/test').outgoing.length, 0);
  }
});

test('each language gets its own articles, islands, counts and text', () => {
  const all = [...articles, ...portuguese];
  const en = buildGraph(all, subjects, 'en');
  const pt = buildGraph(all, subjects, 'pt');
  assert.deepEqual(en.articles.map(a => a.id), ['posts/a', 'posts/b', 'posts/c']);
  assert.deepEqual(pt.articles.map(a => a.id), ['posts/d', 'posts/e']);
  assert.deepEqual(en.subjects.map(s => [s.title, s.count]), [['AI', 2], ['Data', 1]]);
  assert.deepEqual(pt.subjects.map(s => [s.title, s.count]), [['IA', 1], ['Dados', 1]]);
  assert.equal(pt.subjects[0].description, 'Modelos');
  assert.equal(pt.subjects[1].description, undefined, 'a subject without a description keeps none');
  assert.deepEqual(en.edges, [{ source: 'posts/a', target: 'posts/b' }, { source: 'posts/b', target: 'posts/a' }]);
  assert.deepEqual(pt.edges, [{ source: 'posts/d', target: 'posts/e' }, { source: 'posts/e', target: 'posts/d' }]);
  // The default language is English, so a route that forgets to pass one is
  // still readable rather than empty.
  assert.deepEqual(buildGraph(all, subjects).articles, en.articles);
});

test('an edge never crosses languages', () => {
  // The two articles link to each other, but they are translations: each map
  // must show one node and no arrow.
  const bridge = [
    { id: 'posts/one', title: 'One', url: '/posts/one/', subject: 'ai', lang: 'en', body: '[[posts/um]]', file: 'one.md' },
    { id: 'posts/um', title: 'Um', url: '/posts/um/', subject: 'ai', lang: 'pt', body: '[[posts/one]]', file: 'um.md' },
  ];
  for (const lang of ['en', 'pt']) {
    const graph = buildGraph(bridge, subjects, lang);
    assert.equal(graph.articles.length, 1);
    assert.deepEqual(graph.edges, []);
    for (const edge of graph.edges) {
      assert.equal(bridge.find(a => a.id === edge.source).lang, bridge.find(a => a.id === edge.target).lang);
    }
    assert.deepEqual(neighborhood(graph, graph.articles[0].id), { outgoing: [], incoming: [] });
  }
});

test('the registry must carry both languages for every island', () => {
  const cases = [
    [{ id: 'ai', title: { en: 'AI' } }, /"ai".*title\.pt/],
    [{ id: 'ai', title: 'AI' }, /"ai".*title must be an object/],
    [{ id: 'ai', title: { en: 'AI', pt: '   ' } }, /"ai".*title\.pt/],
    [{ id: 'ai', title: { en: 'AI', pt: 'IA' }, description: { en: 'Models' } }, /"ai".*description\.pt/],
  ];
  for (const [subject, pattern] of cases) assert.throws(() => buildGraph(articles, [subject], 'en'), pattern);
});

test('an unsupported or missing article language fails instead of emptying the map', () => {
  assert.throws(() => buildGraph(articles, subjects, 'fr'), /Unsupported graph language: fr/);
  assert.throws(() => buildGraph([{ ...articles[0], lang: undefined }], subjects), /lang must be "en" or "pt"/);
});

test('translation keys pair one article per language', () => {
  const en = article('rag', 'en', 'rag');
  const pt = article('rag-pt', 'pt', 'rag');
  const pairs = pairArticles([en, pt, article('solo', 'pt')]);
  assert.equal(pairs.size, 2, 'only complete pairs are listed');
  assert.deepEqual(pairs.get('posts/rag'), { en, pt });
  assert.equal(pairs.get('posts/rag-pt'), pairs.get('posts/rag'), 'both ids resolve to the same pair');
  assert.equal(pairs.has('posts/solo'), false, 'an article without a key is not paired');
});

test('articles without a translationKey are not paired and do not fail', () => {
  assert.equal(pairArticles([article('solo', 'en'), article('other', 'pt')]).size, 0);
  assert.equal(pairArticles([]).size, 0);
});

test('a key reused inside one language fails and names the key and both articles', () => {
  assert.throws(
    () => pairArticles([article('rag', 'en', 'rag'), article('rag-two', 'en', 'rag'), article('rag-pt', 'pt', 'rag')]),
    /translationKey "rag" is used by 2 en articles: posts\/rag, posts\/rag-two/,
  );
  assert.throws(
    () => pairArticles([article('rag-pt', 'pt', 'rag'), article('rag-pt-two', 'pt', 'rag'), article('rag', 'en', 'rag')]),
    /translationKey "rag" is used by 2 pt articles: posts\/rag-pt, posts\/rag-pt-two/,
  );
});

test('a key without exactly one article per language fails and says which is missing', () => {
  assert.throws(() => pairArticles([article('rag', 'en', 'rag')]), /translationKey "rag".*missing pt/);
  assert.throws(() => pairArticles([article('rag', 'pt', 'rag')]), /translationKey "rag".*missing en/);
});

test('layout is deterministic and all endpoints exist across islands', () => {
  const graph = buildGraph(articles, subjects);
  const layout = layoutGraph(graph);
  assert.deepEqual(layout, layoutGraph(graph));
  assert.equal(layout.subjects.length, 2);
  for (const node of layout.articles) assert.ok(Number.isFinite(node.x) && Number.isFinite(node.y));
});

test('empty graph and empty subject are valid', () => {
  assert.deepEqual(buildGraph([], subjects, 'en').articles, []);
  assert.deepEqual(buildGraph(portuguese, subjects, 'en').articles, []);
  assert.deepEqual(neighborhood(buildGraph([], subjects), 'missing').outgoing, []);
});
