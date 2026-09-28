import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';

/** One resolver feeds both rendered anchors and graph edges. */
export function compileLinks(tree, articles, source = 'content') {
  const targets = new Map(articles.map(article => [article.id, article]));
  const urls = new Map(articles.map(article => [article.url, article.id]));
  const found = new Set();
  const definitions = new Map();
  const walkDefinitions = node => {
    if (node.type === 'definition') definitions.set(node.identifier, node.url);
    node.children?.forEach(walkDefinitions);
  };
  walkDefinitions(tree);
  const recordUrl = url => {
    if (!url?.startsWith('/') || url.startsWith('//')) return;
    const path = url.split(/[?#]/)[0].replace(/\/?$/, '/');
    if (urls.has(path)) found.add(urls.get(path));
  };
  function walk(parent) {
    if (!parent.children || ['code', 'inlineCode', 'html', 'mdxFlowExpression', 'mdxTextExpression', 'mdxjsEsm'].includes(parent.type)) return;
    parent.children = parent.children.flatMap(node => {
      if (node.type === 'link') { recordUrl(node.url); return [node]; }
      if (node.type === 'linkReference') { recordUrl(definitions.get(node.identifier)); return [node]; }
      if (node.type !== 'text') { walk(node); return [node]; }
      const result = [];
      const pattern = /(!?)\[\[([^\]]*)\]\]/g;
      let end = 0;
      for (const match of node.value.matchAll(pattern)) {
        const [raw, embed, inner] = match;
        const parts = inner.split('|');
        const target = parts[0].trim();
        const article = targets.get(target);
        const fail = reason => { throw new Error(`${source}: ${reason} wikilink ${raw}. Use [[posts/slug]] or [[posts/slug|label]].`); };
        if (embed) fail('Unsupported embed');
        if (parts.length > 2 || (parts.length === 2 && !parts[1].trim()) || /[#^]/.test(target) || !target.includes('/')) fail('Unsupported');
        if (!article) fail('Unresolved');
        if (match.index > end) result.push({ type: 'text', value: node.value.slice(end, match.index) });
        result.push({ type: 'link', url: article.url, children: [{ type: 'text', value: parts[1]?.trim() || article.title }] });
        found.add(target);
        end = match.index + raw.length;
      }
      if (!end) return [node];
      if (end < node.value.length) result.push({ type: 'text', value: node.value.slice(end) });
      return result;
    });
  }
  walk(tree);
  return [...found];
}

export function articleTree(article) {
  const processor = unified().use(remarkParse).use(remarkGfm);
  if (article.file?.endsWith('.mdx')) processor.use(remarkMdx);
  return processor.parse(article.body || '');
}

export function buildGraph(articles, subjects) {
  const subjectIds = new Set();
  for (const subject of subjects) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subject.id) || !subject.title) throw new Error('Invalid subject registry entry');
    if (subjectIds.has(subject.id)) throw new Error(`Duplicate subject: ${subject.id}`);
    subjectIds.add(subject.id);
  }
  const ids = new Set();
  const urls = new Set();
  for (const article of articles) {
    if (ids.has(article.id) || urls.has(article.url)) throw new Error(`Duplicate article: ${article.id}`);
    ids.add(article.id); urls.add(article.url);
    if (article.graph !== false && (typeof article.subject !== 'string' || !subjectIds.has(article.subject))) {
      throw new Error(`${article.file || article.id}: assign exactly one registered subject, or explicitly set graph: false.`);
    }
  }
  const included = articles.filter(article => article.graph !== false);
  const includedIds = new Set(included.map(article => article.id));
  const edges = [];
  for (const article of articles) {
    const links = compileLinks(articleTree(article), articles, article.file || article.id);
    for (const target of links) {
      if (includedIds.has(article.id) && includedIds.has(target) && target !== article.id) edges.push({ source: article.id, target });
    }
  }
  return {
    subjects: subjects.map(subject => ({ ...subject, count: included.filter(a => a.subject === subject.id).length })),
    articles: included.map(({ body, file, ...article }) => article),
    edges,
  };
}

export function neighborhood(graph, id) {
  const outgoing = new Set(graph.edges.filter(edge => edge.source === id).map(edge => edge.target));
  const incoming = new Set(graph.edges.filter(edge => edge.target === id).map(edge => edge.source));
  return {
    outgoing: graph.articles.filter(article => outgoing.has(article.id)),
    incoming: graph.articles.filter(article => incoming.has(article.id)),
  };
}

/** Stable grid of islands; article positions don't depend on a running simulation. */
export function layoutGraph(graph) {
  const subjects = graph.subjects.map((subject, index) => ({ ...subject, x: (index % 3) * 900, y: Math.floor(index / 3) * 800 }));
  const articles = subjects.flatMap(subject => {
    const members = graph.articles.filter(article => article.subject === subject.id).sort((a, b) => a.id.localeCompare(b.id));
    return members.map((article, index) => {
      const angle = -Math.PI / 2 + index * Math.PI * 2 / members.length;
      const radius = Math.max(180, members.length * 42);
      return { ...article, x: subject.x + Math.cos(angle) * radius, y: subject.y + Math.sin(angle) * radius };
    });
  });
  return { subjects, articles, edges: graph.edges };
}
