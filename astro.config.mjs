import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import remarkWikilinks from './src/lib/remark-wikilinks.mjs';
import gruvbox from './src/lib/shiki-gruvbox-dark.mjs';

// https://astro.build/config
export default defineConfig({
  site: "https://mnsgrosa.github.io",
  base: "/",
  // Both languages are real routes: `/` is English, `/pt/` is Portuguese.
  i18n: {
    locales: ['en', 'pt'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [react(), mdx()],
  markdown: {
    remarkPlugins: [remarkWikilinks],
    shikiConfig: { theme: gruvbox },
  },
});
