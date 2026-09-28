import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import remarkWikilinks from './src/lib/remark-wikilinks.mjs';
import gruvbox from './src/lib/shiki-gruvbox-dark.mjs';

// https://astro.build/config
export default defineConfig({
  site: "https://mnsgrosa.github.io",
  base: "/",
  integrations: [react(), mdx()],
  markdown: {
    remarkPlugins: [remarkWikilinks],
    shikiConfig: { theme: gruvbox },
  },
});
