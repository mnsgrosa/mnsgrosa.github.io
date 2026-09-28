# AGENTS.md — mnsgrosa.github.io

Astro 4 static site deployed to GitHub Pages by `.github/workflows/astro.yml` on
push to `main`. The home page is About plus an interactive constellation of
subject islands and article nodes; each article also shows its own neighborhood.

Read [`docs/authoring.md`](docs/authoring.md) before adding an article, an
island, or a link between articles — it carries the frontmatter contract, the
wikilink rules, and the failure messages. Before touching styling, read the
visual-language section of [`docs/constellation-blog.md`](docs/constellation-blog.md)
and the token roles in `tokens.css`.

## Layout

- `src/content/posts/` — published articles (`.md`/`.mdx`). Other collections
  (`pages`, `projects`, `experiences`) are not part of the map.
- `src/data/subjects.json` — the island registry. An article references one by
  `id`; see `docs/authoring.md`.
- `src/lib/knowledge.mjs` — link resolution, graph assembly, layout. Pure
  functions with no file or Astro APIs, and the only unit-tested module.
- `src/lib/content-index.mjs` — reads frontmatter and the registry from disk.
- `src/lib/remark-wikilinks.mjs` — the Astro markdown/MDX plugin.
- `src/pages/index.astro`, `src/pages/posts/[slug].astro` — the two pages that
  render the graph, via `src/components/Constellation.astro`.
- `tokens.css` + `src/styles/constellation.css` — all styling. Colours and fonts
  come from named tokens; there is no light mode.

## Invariants

- One resolver feeds both rendered anchors and graph edges, so links and arrows
  cannot disagree. Never special-case one path.
- An article belongs to at most one island. `graph: false` keeps it published
  and out of the graph. Never invent a fallback island for an unassigned post.
- An unresolved or unsupported wikilink fails the build on purpose. Do not
  soften that into a warning.
- The topic list is the accessible and no-JavaScript path to every article; the
  SVG map is an enhancement. Keep both working.

## Verify

```
npm test             # resolver, graph, validation (node --test)
npm run build        # real content through the real pipeline
npm run test:browser # Playwright: 320/375/414/768/1440, keyboard, no-JS
```

Screenshots land in `/tmp/constellation-browser/`. A change to styling or to the
graph is not verified until `npm run test:browser` has run against a fresh
`npm run build`.
