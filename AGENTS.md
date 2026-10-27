# AGENTS.md — mnsgrosa.github.io

Astro 4 static site deployed to GitHub Pages by `.github/workflows/astro.yml` on
push to `main`. The home page is About plus an interactive constellation of
subject islands and article nodes; each article also shows its own neighborhood.

The site ships two complete language routes: `/` is English and `/pt/` is
Portuguese. Both are static pages, not a client-side toggle.

Read [`docs/authoring.md`](docs/authoring.md) before adding an article, an
island, or a link between articles — it carries the frontmatter contract, the
wikilink rules, and the failure messages. Before touching styling, read the
visual-language section of [`docs/constellation-blog.md`](docs/constellation-blog.md)
and the token roles in `tokens.css`.

## Layout

- `src/content/posts/` — published articles (`.md`/`.mdx`). Other collections
  (`pages`, `projects`, `experiences`) are not part of the map.
- `src/data/subjects.json` — the island registry, with `title` and `description`
  per language. An article references one by `id`; see `docs/authoring.md`.
- `src/i18n/ui.mjs` — the chrome and prose dictionary, one block per language.
  Every visible string comes from here.
- `src/i18n/paths.mjs` — the only place that turns a language into a URL
  (`localePath`, `catalogPath`, `explorePath`, `articlePath`, `switchLocalePath`).
- `src/pages/pt/` — the Portuguese twins of the site routes. Articles have no
  locale twin: they live at `/posts/<slug>/` in both languages.
- `src/lib/knowledge.mjs` — link resolution, graph assembly, layout. Pure
  functions with no file or Astro APIs, and the only unit-tested module.
- `src/lib/content-index.mjs` — reads frontmatter and the registry from disk.
- `src/lib/remark-wikilinks.mjs` — the Astro markdown/MDX plugin.
- `src/pages/index.astro` and `src/pages/posts/[slug].astro` are the two pages
  that render the graph: the home one through `HomeScene.astro` (the whole
  world), the article one through `ArticleNeighbors.astro` (a compact map of
  that article's neighborhood plus its incoming and outgoing lists).
- `tokens.css` + `src/styles/constellation.css` — all styling. Colours and fonts
  come from named tokens; the light Slate Blue palette is the default and the
  Slate Blue Dark palette — the same scales mirrored — applies automatically
  under `prefers-color-scheme: dark`.

## Invariants

- One resolver feeds both rendered anchors and graph edges, so links and arrows
  cannot disagree. Never special-case one path.
- An article belongs to at most one island. `graph: false` keeps it published
  and out of the graph. Never invent a fallback island for an unassigned post.
- An unresolved or unsupported wikilink fails the build on purpose. Do not
  soften that into a warning.
- The topic list is the accessible and no-JavaScript path to every article; the
  SVG map is an enhancement. Keep both working.
- The article map is a subgraph: it draws article nodes only, never subject
  nodes, and reaches the whole world through one plain link built by
  `explorePath` (`/?island=<id>#explore`). The home map reads that `island`
  parameter to open the subject, ahead of any remembered view state. Keep the
  door an anchor, never a click handler on a node.
- Every article is published as a language pair: both files land in the same
  merge, share `translationKey`, and carry the same `pubDate`. An article with
  no twin is a deliberate exception, not the default.
- The language of a page comes from its route (`/pt/...`) or, for an article,
  from frontmatter `lang`. Never from client state, and never by prefixing an
  article URL.
- The graph and the catalogue are per language: `/` shows English articles and
  islands' English text, `/pt/` the Portuguese ones. A node or edge from one
  language must never appear in the other, and translations of the same article
  stay one island each, paired by `translationKey`.
- Link metadata is emitted once, in `MainLayout.astro`, from the route and the
  same `alternates` list the `hreflang` links use — `og:locale` cannot disagree
  with `hreflang`. A page may override a description, an image, its alt and
  `og:type`; it never writes these tags itself.

## Verify

```
npm test             # resolver, graph, validation (node --test)
npm run build        # real content through the real pipeline
npm run test:browser # Playwright: 320/375/414/768/1440, keyboard, no-JS
```

Screenshots land in `/tmp/constellation-browser/`. A change to styling or to the
graph is not verified until `npm run test:browser` has run against a fresh
`npm run build`.
