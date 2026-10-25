# Authoring an island

How to publish an article, place it on the map, and link it to others. Only the `posts` collection is indexed by the map today; articles outside it stay routable but invisible to the graph.

## Two languages

The site is published twice as real routes, so language switching needs no JavaScript:

| URL | Language | What lives there |
| --- | --- | --- |
| `/`, `/experience/`, `/projects/`, `/posts/` | English | English chrome, prose and graph |
| `/pt/`, `/pt/experience/`, `/pt/projects/`, `/pt/posts/` | Portuguese | Portuguese chrome, prose and graph |
| `/posts/<slug>/` | the post's `lang` | Article body, chrome and neighborhood in that language |

Rules that follow from that:

- The language of a page is the route. An article is the exception: it keeps one prefix-free URL per language and takes its language from frontmatter `lang`, which also picks the chrome, the date locale and the graph language.
- Never prefix an article URL. `/pt/posts/<slug>/` does not exist, by design.
- Every visible string lives in `src/i18n/ui.mjs`, and every language-aware URL comes from `src/i18n/paths.mjs`. Hardcoding either one in a component is what breaks the other language.
- The map and the catalogue show one language at a time. `/pt/` never renders an English island title, node or catalogue card.

## Add or change an island

Edit `src/data/subjects.json`. An entry carries both languages:

```json
[
  {
    "id": "ai-engineering",
    "title": { "en": "AI Engineering", "pt": "Engenharia de IA" },
    "description": {
      "en": "LLMs, agents, tools, and routing.",
      "pt": "LLMs, agentes, ferramentas e roteamento."
    }
  }
]
```

The `id` is lowercase kebab-case and is what frontmatter references. Both languages are required — a missing one fails the build rather than letting English show up on a Portuguese page. Adding an entry with no articles is valid and renders as an empty island. Renaming an `id` breaks every article that still points at the old one, so update the frontmatter in the same commit.

## Publish an article

Create `src/content/posts/<slug>.md` or `.mdx`. The filename becomes the URL. The post schema requires `title`, `pubDate`, `description`, and `lang`; two fields control the map:

```yaml
---
title: "Understanding routing"
pubDate: 2026-02-03
description: "Which model answers, and why."
lang: "en"
subject: ai-engineering
graph: true
translationKey: understanding-routing
---
```

**`lang`** is `pt` or `en`. It decides the article's chrome, its date locale, and which map the article appears in: an `en` article is on `/`, a `pt` one on `/pt/`. An article is never shown in the other language's map, catalogue or neighborhood.

**`translationKey`** pairs the two language versions of the same article. Both files take the same key; the key drives the article's language-switch link and its `rel="alternate"` `hreflang`, so the link and the metadata cannot disagree. Leave it off when the article has no translation — the switch then does not render. Never write the switch into the body: it is generated from frontmatter.

**`subject`** names exactly one island from the registry. Leave it off and the article is still published at its URL but omitted from the map, the counts, and the neighborhood lists. Membership is single by design: an article belongs to one island, and its links are what cross between islands.

**`graph: false`** publishes and indexes nothing, for drafts and off-topic posts. `teste_1` uses this. Setting both a valid `subject` and `graph: false` is pointless; the exclusion wins.

## Cover image

**Every article gets a cover without asking for one.** The default is set once in `src/data/defaults.json`:

```json
{ "banner": "/images/article-banner.jpg", "bannerAlt": "" }
```

Change that file to change the cover for every article that has not chosen its own. Override it per post with two optional frontmatter fields, or turn it off with `banner: false`:

```yaml
banner: "/images/my-cover.jpg"
bannerAlt: "Diagram of the routing loop"
```

The file must live under `public/` because nothing at the project root is served. `banner` also accepts an absolute URL. Leave `bannerAlt` out, or set it to `""`, when the cover is decorative; set it when the image carries meaning the surrounding text does not.

### Dark-mode cover

The cover can have a dark twin, so it does not glare against the dark palette. The rule is a filename convention: keep the twin beside the light file with `-dark` before the extension.

```
/images/my-cover.jpg       ->  /images/my-cover-dark.jpg
```

That is all. The build checks the file on disk and emits a `<picture>` with a `(prefers-color-scheme: dark)` source only when the twin is really there — no twin, no switch, and the light cover is used in both schemes. Two frontmatter fields handle the cases the convention cannot:

```yaml
bannerDark: "https://cdn.example.com/my-cover-night.jpg"   # a twin that does not follow the convention
bannerDark: false                                          # keep one cover in both schemes
```

A remote `banner` does **not** get a guessed twin: nothing can prove the remote file exists, and a `<source>` that 404s breaks the cover in dark mode, which is worse than a cover that does not switch. Name the twin explicitly for remote images.

The same `.jpg`/`.png`/`.avif` works in both slots; what matters is that the dark file is actually dark. A copy of the light file is not a dark cover, it just makes the page do a pointless request.

The project's own favicon follows the same idea with two files, `public/favicon.svg` and `public/favicon-dark.svg`, wired in `MainLayout.astro` with a `media="(prefers-color-scheme: dark)"` link after the light default, so a browser that ignores `media` on icons keeps the light one rather than showing nothing.

Placement is responsive:

- **Wide screens (1440px and up).** Three columns: the menu, a thin gap, the portrait cover, a thin gap, then the article. The cover is 260px wide, runs the height of the viewport, and holds position while the article scrolls past it. The article begins directly after the cover, so its position on the page depends on whether a cover exists.
- **Narrower screens.** Three columns will not fit, so the cover becomes a portrait card, at most 360px wide, above the article, and the article keeps the reading column's normal position.

The 1440px threshold is derived, not arbitrary: it is the point where the rail (200px), the gaps, the 260px cover, and a 68ch article beside a 280px neighbourhood all fit. Adding a cover also lifts the reading column's 1260px cap (`content--banner`) and bounds the article at 1180px so an ultrawide window does not stretch the reader. Change the cover's 260px width or the rail's 200px and the threshold moves with them.

## Wide-screen reading

From 1920px the article's reading block also grows: 22px text over an 80ch measure (`--text-reading-wide` and `--measure-wide` in `tokens.css`), with the article's own `h2`/`h3` stepping up so the hierarchy does not flatten. Growing the size rather than only the measure keeps the block filling the width without stretching the line: at 1920 the text fills its column, and at 2560 the gap before the constellation is about 180px instead of 510px.

That trade is deliberate and has a ceiling. Filling the last of the gap at 2560 would mean roughly 108 characters per line, so the line is capped near 94 and the browser test fails above 100. If you want it wider still, raise `--measure-wide`; the character count rises with it.

Size the asset before committing; there is no image pipeline. A tall portrait crop works best, roughly 3:4 or taller, 400–600px wide, under about 250KB. `public/images/article-banner.jpg` is the current placeholder and is safe to replace.

## Social card

**The cover is not the card.** `banner` is a portrait image that sits beside the article; the link preview needs a 1200×630 landscape. So the preview is generated, per article, by the build itself:

- `npm run build` writes one PNG per article to `dist/og/posts/<slug>.png`, plus `dist/og/en.png` and `dist/og/pt.png` for the site routes. Nothing is committed to `public/`, and there is no prebuild step to remember.
- The card is drawn by `satori` into SVG and rasterized by `sharp` (`src/lib/og-card.mjs`), in the fonts the site already bundles and the colours `tokens.css` already declares — `src/lib/og-theme.mjs` mirrors them by role name, and `npm test` fails if the two drift apart.
- It carries the `mr.` wordmark, the article's island and date, and the title, at most four lines and ellipsized past that. Every string is real frontmatter or `src/i18n/ui.mjs`; nothing on the card is invented.
- Cards are keyed by **slug**, not by `translationKey`: a translated article gets its own card behind its own URL, in its own language. `teste_1` has `banner: false` and still gets one.

`MainLayout.astro` emits the tags, derived from the route: `og:locale` follows the article's frontmatter `lang` (a site route's own prefix), and `og:locale:alternate` is built from the same list as `hreflang`, so the two cannot disagree. Only the article page overrides anything — its description, its card, and `og:type=article`.

**Overriding one card.** Add `ogImage` to frontmatter, with the same rule as `banner` (a path under `public/`, or an absolute URL). It must be 1200×630: the tags declare that size, because the generated cards are.

```yaml
ogImage: "/images/rag-roadmap-card.png"
```

Prompts for hand-made artwork — for the site routes and for the graph article — live in [`image-prompts.md`](image-prompts.md), already constrained to these tokens.

After deploying, check a URL in LinkedIn's Post Inspector. LinkedIn holds a preview for about a week, so a re-scrape shows the old card until its cache turns over; the freshly built PNG is correct at its URL on the first build.

## Link articles

Write `[[posts/slug]]` to link to an article. Use `[[posts/slug|label]]` to override the visible text; the default label is the target's title. Both forms render as ordinary anchors to the canonical URL, and the same resolution produces the graph arrows and the backlinks, so rendered links and drawn edges can never disagree.

Targets are collection-qualified (`posts/...`) because bare titles and cross-file aliases are ambiguous and are deliberately not supported. Also unsupported: `![[embeds]]`, heading and block references (`[[posts/x#heading]]`), and empty or multi-part labels. Each one fails the build rather than resolving to something unintended.

Ordinary Markdown links to a known article work too, including reference-style links, and are treated as the same edge. External links are never graph nodes. Links inside inline code, fenced blocks, MDX expressions, and JSX attribute strings are ignored, so you can document the syntax without breaking the build.

Self-links render as anchors but draw no arrow. Repeated references to the same target produce one edge. Links pointing at an article marked `graph: false` render but are dropped from the graph.

## Failures you will hit

An unresolved or unsupported wikilink stops the build inside the markdown pipeline:

```
src/content/posts/my-post.md: Unresolved wikilink [[posts/does-not-exist]].
```

The message names the file and the exact target. Other checks fail early with their own message: an article whose `subject` is missing from the registry (or is a list), a duplicate article slug or duplicate subject id, a registry entry missing one of the two languages, and a `translationKey` used twice in the same language or on a group that does not have exactly one article per language.

## Verify before committing

```
npm test             # resolver, graph, and validation rules
npm run build        # real content through the real pipeline
npm run test:browser # interaction and layout at five widths
```

`npm run build` is the check that matters for a new article: it parses every file, resolves every link, and fails on the first problem. The dev server reports the same errors on save.

## Where the code lives

- `src/lib/knowledge.mjs` — link resolution, graph assembly, validation, layout. Pure functions, no file or Astro APIs; this is what `npm test` covers.
- `src/lib/content-index.mjs` — reads frontmatter and the subject registry from disk.
- `src/lib/remark-wikilinks.mjs` — wires the resolver into Astro's markdown and MDX pipeline.
- `src/i18n/ui.mjs` and `src/i18n/paths.mjs` — the language dictionary and the only source of language-aware URLs.
- `src/pages/pt/` — the Portuguese site routes; a single `src/pages/posts/[slug].astro` serves articles in both languages.
- `src/components/Constellation.astro` and `src/scripts/constellation.ts` — markup, SVG rendering, pan/zoom, keyboard handling, and the topic index.
- `src/components/ArticleNeighbors.astro` — the per-article local graph and link lists.
- `src/components/ArticleShare.astro` and `src/lib/share.mjs` — the LinkedIn share link: a static anchor whose URL is the article's own absolute canonical URL, built at build time by `linkedInShareUrl`, so it needs no client script.
- `src/lib/og.mjs`, `src/lib/og-theme.mjs`, `src/lib/og-card.mjs` and `src/pages/og/` — the generated social cards: their names and locale strings, the token mirror they draw with, the renderer, and the two endpoints that write them.
- `src/styles/constellation.css` and `tokens.css` — all styling, via named tokens.

Behaviour and design rationale are in [`constellation-blog.md`](constellation-blog.md); the build order that produced this is in [`implementation-plan.md`](implementation-plan.md).
