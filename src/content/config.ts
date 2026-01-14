// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// Define a collection for our posts
const postsCollection = defineCollection({
  type: 'content', // 'content' for Markdown/MDX files
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
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
