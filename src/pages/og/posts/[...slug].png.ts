// src/pages/og/posts/[...slug].png.ts
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderCard } from '../../../lib/og-card.mjs';
import { readGraph } from '../../../lib/content-index.mjs';
import { useTranslations } from '../../../i18n/ui.mjs';

// One card per published article, keyed by slug — never by `translationKey`, so
// the Portuguese and the English version of an article each get their own card
// behind their own URL. `teste_1` has `banner: false` and still gets one: a
// social card is not a cover.
export const getStaticPaths = (async () => {
  const posts = await getCollection('posts');
  return posts.map(post => ({ params: { slug: post.slug }, props: { post } }));
}) satisfies GetStaticPaths;

const graphs = new Map();
function graphFor(lang: string) {
  if (!graphs.has(lang)) graphs.set(lang, readGraph(lang));
  return graphs.get(lang);
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: { slug: string; data: { title: string; lang: 'en' | 'pt'; pubDate: Date } } };
  const lang = post.data.lang;
  const t = useTranslations(lang);
  // Same lookup the article page renders: an article outside the graph, such as
  // `graph: false`, names itself "outside the map" rather than borrowing its
  // frontmatter subject. The card and the page cannot disagree.
  const graph = graphFor(lang);
  const article = graph.articles.find((entry: { id: string }) => entry.id === `posts/${post.slug}`);
  const subject = graph.subjects.find((entry: { id: string }) => entry.id === article?.subject);
  // Both halves of the kicker are derived, never typed: the date from the
  // article's own `pubDate`, the island from subjects.json through the same
  // graph the page reads. A new island or a corrected date reaches the card on
  // the next build, and an article outside the map names itself as such.
  const date = post.data.pubDate.toLocaleDateString(lang, { timeZone: 'UTC' });
  const png = await renderCard({
    kicker: `${subject?.title ?? t('map.outsideMap')} · ${date}`,
    title: post.data.title,
  });
  return new Response(png, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
  });
};
