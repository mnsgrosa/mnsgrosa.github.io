import test from 'node:test';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { compileLinks, buildGraph, neighborhood, layoutGraph } from '../src/lib/knowledge.mjs';

const subjects = [{ id: 'ai', title: 'AI' }, { id: 'data', title: 'Data' }];
const articles = [
  { id: 'posts/a', title: 'Article A', url: '/posts/a/', subject: 'ai', body: '[[posts/b|Read B]] [[posts/b]] [[posts/a]]', file: 'a.md' },
  { id: 'posts/b', title: 'Article B', url: '/posts/b/', subject: 'data', body: '[A](/posts/a/#intro)', file: 'b.mdx' },
  { id: 'posts/c', title: 'Article C', url: '/posts/c/', subject: 'ai', body: '', file: 'c.md' },
];
const parse = (body, mdx = false) => {
  const parser = unified().use(remarkParse);
  if (mdx) parser.use(remarkMdx);
  return parser.parse(body);
};

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

test('explicitly excluded articles keep routes but do not become graph nodes', () => {
  const graph = buildGraph([...articles, { id: 'posts/test', title: 'Test', url: '/posts/test/', graph: false, body: '[[posts/a]]' }], subjects);
  assert.equal(graph.articles.length, 3);
  assert.equal(graph.edges.length, 2);
});

test('layout is deterministic and all endpoints exist across islands', () => {
  const graph = buildGraph(articles, subjects);
  const layout = layoutGraph(graph);
  assert.deepEqual(layout, layoutGraph(graph));
  assert.equal(layout.subjects.length, 2);
  for (const node of layout.articles) assert.ok(Number.isFinite(node.x) && Number.isFinite(node.y));
});

test('empty graph and empty subject are valid', () => {
  assert.deepEqual(buildGraph([], subjects).articles, []);
  assert.deepEqual(neighborhood(buildGraph([], subjects), 'missing').outgoing, []);
});
