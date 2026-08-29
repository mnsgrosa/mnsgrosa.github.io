import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { safeGetCollection } from '../lib/content';

export async function GET(context: APIContext) {
  const [posts, portfolio, estudos, diversos] = await Promise.all([
    safeGetCollection('posts'),
    safeGetCollection('portfolio'),
    safeGetCollection('estudos'),
    safeGetCollection('diversos'),
  ]);

  const items = [...posts, ...portfolio, ...estudos, ...diversos]
    .map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.date ?? new Date(),
      link: `/${entry.collection}/${entry.slug}/`,
      description: entry.data.description ?? entry.data.title,
    }))
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: 'Matheus Rosa',
    description: 'Portfolio, posts técnicos, estudos e diversos',
    site: context.site ?? 'https://mnsgrosa.github.io',
    items,
  });
}
