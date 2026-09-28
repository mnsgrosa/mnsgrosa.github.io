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
    // Cover shown beside the article; root-relative or absolute URL. Omit it to
    // take the default from src/data/defaults.json, or set false for no cover.
    banner: z
      .union([
        z.string().regex(/^(\/|https?:\/\/)/, 'banner must start with / or http(s)://'),
        z.literal(false),
      ])
      .optional(),
    bannerAlt: z.string().optional(),
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
  }),
});

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
  }),
});

// Export a `collections` object to register our collection(s)
export const collections = {
  'posts': postsCollection,
  'experiences': experiencesCollection,
  'projects': projectsCollection,
  'pages': pagesCollection,
};
