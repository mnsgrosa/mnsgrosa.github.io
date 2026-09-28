import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import gruvboxDark from "./src/lib/shiki-gruvbox-dark.mjs";

// The site is dark-only, so markdown gets a single dark theme. Shiki 1.29.2 ships 55
// themes and gruvbox is not one of them, hence the vendored theme module.
//
// `colorReplacements` lives on the *theme object*, not on `shikiConfig`, on purpose:
// Astro's config schema types `shikiConfig` as a closed `z.object`
// (node_modules/astro/dist/core/config/schema.js:169) which strips unknown keys, while
// `theme` is validated with `z.custom()` and forwarded verbatim. Shiki reads the map
// from the theme itself (@shikijs/core/dist/index.mjs:107 `resolveColorReplacements`),
// so this is the supported path and no CSS `!important` override is needed.
// It lifts the theme's bg0 paper (#282828) to bg1 (#3c3836) for the code surface, so a
// code block reads as a raised panel instead of melting into the page background.
const codeTheme = {
  ...gruvboxDark,
  colorReplacements: { "#282828": "#3c3836" },
};

// https://astro.build/config
export default defineConfig({
  site: "https://mnsgrosa.com.br",
  base: "/",
  integrations: [mdx()],
  // `/experience/` was a real URL before the redesign and is linked nowhere today.
  // Astro emits a static HTML meta-refresh page for a static build, so this restores
  // the URL without a second experience page: `src/data/experience.ts` stays the single
  // source and the cards keep rendering as `.experience-grid` inside `/portfolio/`.
  redirects: {
    "/experience/": "/portfolio/",
  },
  markdown: {
    shikiConfig: {
      theme: codeTheme,
      wrap: true,
    },
  },
});
