# Authoring an island

How to publish an article, place it on the map, and link it to others. Only the `posts` collection is indexed by the map today; articles outside it stay routable but invisible to the graph.

## Add or change an island

Edit `src/data/subjects.json`. An entry has three fields:

```json
[{ "id": "ai-engineering", "title": "AI Engineering", "description": "LLMs, agents, tools, and routing." }]
```

The `id` is lowercase kebab-case and is what frontmatter references. Adding an entry with no articles is valid and renders as an empty island. Renaming an `id` breaks every article that still points at the old one, so update the frontmatter in the same commit.

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
---
```

**`subject`** names exactly one island from the registry. Leave it off and the article is still published at its URL but omitted from the map, the counts, and the neighborhood lists. Membership is single by design: an article belongs to one island, and its links are what cross between islands.

**`graph: false`** publishes and indexes nothing, for drafts and off-topic posts. `teste_1` uses this. Setting both a valid `subject` and `graph: false` is pointless; the exclusion wins.

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

The message names the file and the exact target. Two other checks fail early with their own message: an article whose `subject` is missing from the registry (or is a list), and a duplicate article slug or duplicate subject id.

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
- `src/components/Constellation.astro` and `src/scripts/constellation.ts` — markup, SVG rendering, pan/zoom, keyboard handling, and the topic index.
- `src/components/ArticleNeighbors.astro` — the per-article local graph and link lists.
- `src/styles/constellation.css` and `tokens.css` — all styling, via named tokens.

Behaviour and design rationale are in [`constellation-blog.md`](constellation-blog.md); the build order that produced this is in [`implementation-plan.md`](implementation-plan.md).
