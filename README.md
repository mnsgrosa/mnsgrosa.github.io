# mnsgrosa.github.io

Personal site: data engineering, data science, and AI. The home page is an About
section plus an interactive map where each island is a subject and each dot is an
article, linked to the articles it references.

Built with Astro, published to GitHub Pages by `.github/workflows/astro.yml` on
every push to `main`, at https://mnsgrosa.github.io.

## Run it locally

```
npm install
npm run dev      # http://localhost:4321
```

Before committing, run the checks:

```
npm test             # link resolution, graph rules, validation
npm run build        # parses every article and resolves every link
npm run test:browser # layout and interaction at 320 / 375 / 414 / 768 / 1440
```

`npm run build` is the one that catches a broken article: it fails on the first
unresolved link and names the file.

## Where articles go

**`src/content/posts/`** — one file per article, `.md` or `.mdx`. The filename
becomes the URL, so `src/content/posts/my-post.md` is published at
`/posts/my-post/`. Filenames are case-sensitive and must be unique.

The other collections (`src/content/pages/`, `projects/`, `experiences/`) are
separate parts of the site and do **not** appear on the map.

## How to structure an article

Frontmatter, then body:

```md
---
title: "Understanding routing"
pubDate: 2026-02-03
description: "Which model answers, and why."
lang: "en"
subject: ai-engineering
---

Body in normal Markdown. Link to another article with [[posts/stepback]].
```

The first four fields are required, and `lang` is either `"pt"` or `"en"`. The
last field is what places the article on the map:

| Field | Meaning |
| --- | --- |
| `subject` | The island id to join, from `src/data/subjects.json`. Omit it and the article is published normally but stays off the map. |
| `graph: false` | Publishes and indexes nothing: keeps a draft or off-topic post out of the map. |
| `banner` | Cover image, e.g. `"/images/my-cover.jpg"`. Omit it to use the default; set `false` for no cover. |
| `bannerAlt` | Alt text for the cover. Defaults to empty, i.e. decorative. |

Every article gets a cover without declaring one: the default lives in
`src/data/defaults.json`. Change that file to change the cover for all of them,
or override it per article.

The cover is a portrait image that follows the article as you scroll. On wide
screens it becomes a column between the menu and the article, a thin gap from
each, and the article starts directly after it. Below that width it becomes a
portrait card above the article. Put the file in `public/images/` and reference
it with a leading slash.

Inside the body, standard Markdown works: headings, lists, tables, fenced code
blocks, blockquotes, images. `.mdx` files additionally allow components.

Images go in `public/images/` and are referenced root-relative, so a file at
`public/images/chart.png` is written `![Chart](/images/chart.png)`. Only files
under `public/` are served: a file left at the project root is never published.

## Put an article on the map

**1. Choose or create the island** in `src/data/subjects.json`:

```json
[{ "id": "ai-engineering", "title": "AI Engineering", "description": "LLMs, agents, tools, and routing." }]
```

**2. Name it in frontmatter** with `subject: <id>`. An article belongs to exactly
one island.

**3. Link it** to the articles it relates to, so readers can travel between them.

## Link articles to each other

Write `[[posts/slug]]` to link to an article. Add a label with a pipe:
`[[posts/stepback|Dando um passo atrás]]`. Both render as normal links, and the
same resolution draws the map arrows and builds the backlinks, so the two can
never disagree.

Every target is written as `posts/…`. A target that does not exist stops the
build on purpose, with the file and the target named. Drafts that mention the
syntax are fine: links inside code blocks and inline code are ignored.

## Docs

- [`docs/authoring.md`](docs/authoring.md) — the full authoring contract,
  including every wikilink form that fails and why.
- [`docs/constellation-blog.md`](docs/constellation-blog.md) — what the explorer
  is meant to do, and the visual language.
- [`docs/implementation-plan.md`](docs/implementation-plan.md) — how the map was
  built.
- [`AGENTS.md`](AGENTS.md) — orientation for AI coding sessions.
