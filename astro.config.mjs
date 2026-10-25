import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import remarkWikilinks from './src/lib/remark-wikilinks.mjs';

// https://astro.build/config
export default defineConfig({
  site: "https://www.mnsgrosa.com.br",
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
    shikiConfig: { theme: 'catppuccin-mocha' },
  },
});
