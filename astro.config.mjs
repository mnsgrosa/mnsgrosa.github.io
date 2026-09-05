import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://mnsgrosa.com.br",
  base: "/",
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: "light",
      wrap: true,
    },
  },
});
