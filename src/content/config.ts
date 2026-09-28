// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const portfolioCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    url: z.string().optional(),
    repo: z.string().optional(),
    tags: z.array(z.string()).optional(),
    toc: z.boolean().optional(),
  }),
});

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    lang: z.enum(['pt', 'en']).optional(),
    bold: z.boolean().optional(),
    toc: z.boolean().optional(),
    tags: z.string().optional(),
    image: z.string().optional(),
  }),
});

const estudosCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    toc: z.boolean().optional(),
    tags: z.string().optional(),
    image: z.string().optional(),
  }),
});

const diversosCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    toc: z.boolean().optional(),
    tags: z.string().optional(),
    image: z.string().optional(),
  }),
});

const experienceCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
  }),
});

// NOTE: the standalone 'experience' section was merged into 'portfolio'.
// Experience is rendered from src/data/experience.ts on the portfolio page.

export const collections = {
  portfolio: portfolioCollection,
  posts: postsCollection,
  estudos: estudosCollection,
  diversos: diversosCollection,
  experience: experienceCollection,
};
