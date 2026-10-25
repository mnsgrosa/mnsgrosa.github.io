// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// Define a collection for our posts
const postsCollection = defineCollection({
  type: 'content', // 'content' for Markdown/MDX files
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    lang: z.enum(['pt', 'en']),
    subject: z.string().optional(),
    graph: z.boolean().default(true),
    // Names the other-language version of this article. Paired articles share a
    // key and differ in `lang`; the article switch and its `hreflang` both read
    // the pair, so the link and the metadata cannot disagree.
    translationKey: z.string().optional(),
    // Cover shown beside the article; root-relative or absolute URL. Omit it to
    // take the default from src/data/defaults.json, or set false for no cover.
    banner: z
      .union([
        z.string().regex(/^(\/|https?:\/\/)/, 'banner must start with / or http(s)://'),
        z.literal(false),
      ])
      .optional(),
    bannerAlt: z.string().optional(),
    // The dark-mode twin of `banner`. Omit it and the page looks for the same
    // file with `-dark` before its extension (`cover.jpg` -> `cover-dark.jpg`)
    // and uses it only if it is really there; set false to keep one cover in
    // both schemes; set a path to name a twin that does not follow the
    // convention (a remote URL, a different crop).
    bannerDark: z
      .union([
        z.string().regex(/^(\/|https?:\/\/)/, 'bannerDark must start with / or http(s)://'),
        z.literal(false),
      ])
      .optional(),
    // The social card is generated per slug, so this is an override, not a
    // requirement: point it at a 1200×630 image (under /public or absolute) when
    // a post deserves a hand-made one. `banner` is the portrait cover and is not
    // the card.
    ogImage: z
      .string()
      .regex(/^(\/|https?:\/\/)/, 'ogImage must start with / or http(s)://')
      .optional(),
  }),
});

const experiencesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    company: z.string(),
    role: z.string(),
    startDate: z.date(),
    endDate: z.date().optional(),
    location: z.string().optional(),
    summary: z.string().optional(),
  }),
});

const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    url: z.string().optional(),
    repo: z.string().optional(),
    tags: z.array(z.string()).optional(),
    // Omitted means English, so the existing files keep their meaning. A pt
    // sibling lives beside the English file as `<id>.pt.md`.
    lang: z.enum(['pt', 'en']).optional(),
  }),
});

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // Same convention as `projects`: omitted is English, `<id>.pt.md` is
    // Portuguese.
    lang: z.enum(['pt', 'en']).optional(),
  }),
});

// Export a `collections` object to register our collection(s)
export const collections = {
  'posts': postsCollection,
  'experiences': experiencesCollection,
  'projects': projectsCollection,
  'pages': pagesCollection,
};
