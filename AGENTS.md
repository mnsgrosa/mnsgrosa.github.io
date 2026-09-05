Para qualquer mudança de UI, leia docs/design.md antes de editar src/styles/ ou src/layouts/

# AGENTS.md — mnsgrosa.github.io

Astro 4 + MDX static site deployed to GitHub Pages. Content is written in
Markdown/MDX under `src/content/`. This file explains how to add a new Markdown
page and how to add + link images.

## Quick reference

- Run the dev server: `npm run dev` (or `npm start`), then open the printed URL.
- Build locally: `npm run build` (output goes to `dist/`).
- Deploy: push to `main` — `.github/workflows/astro.yml` builds and publishes
  to GitHub Pages automatically (no manual deploy step).
- Static assets live in `public/` and are served from the site root.

## Adding a new Markdown/MDX page

### 1. Pick a section (collection)

Content lives in `src/content/<collection>/`. The valid collections are:

| Collection | Route | Frontmatter allowed | Notes |
|------------|-------|---------------------|-------|
| `posts`    | `/posts/<slug>/`   | `title`, `date`, `subtitle?`, `description?`, `lang?`, `bold?`, `toc?`, `tags?`, `image?` | `date` is **required**. Tags are a single comma-separated string ending with `.` |
| `estudos`  | `/estudos/<slug>/` | `title`, `date?`, `subtitle?`, `description?`, `toc?`, `image?` | Notes de estudo |
| `diversos` | `/diversos/<slug>/`| `title`, `date?`, `subtitle?`, `description?`, `toc?`, `tags?`, `image?` | Diversos |
| `portfolio`| `/portfolio/`      | `title`, `date?`, `subtitle?`, `description?`, `url?`, `repo?`, `tags?`, `toc?` | Single page, not a post list |
| `experience`| (rendered from `src/data/experience.ts`) | `title` | Do **not** add Markdown here |

> The schema is enforced by `src/content/config.ts`. Adding an invalid field
> fails the build. Stick to the fields listed above.

### 2. Create the file

The filename becomes the URL slug, e.g. `src/content/posts/hello-world.md` →
`/posts/hello-world/`. Filenames are case-sensitive and must be unique within a
collection. Use `.md` for plain Markdown, `.mdx` if you need components (see
"Advanced" below).

### 3. Frontmatter

Always start a post with YAML frontmatter:

```yaml
---
title: "My post title"
date: 2026-02-02
subtitle: "Optional one-line subtitle"
description: "Short summary shown on cards and in search."
lang: 'pt'
tags: "tag one, tag two, tag three."
toc: true
image: "/images/my-cover.png"
---
```

- `date` (required for `posts`) — use `YYYY-MM-DD`. Display date is actually
  derived from the **last git commit date**; the frontmatter `date` is a
  fallback for uncommitted drafts.
- `tags` (posts/diversos) — one comma-separated string ending with `.`.
- `toc: true` renders a table of contents from H2/H3 headings.
- `image` — cover/thumbnail URL for the card on the home grid (see Images).

Then write the body as normal Markdown.

### 4. Body Markdown

Standard Markdown works: `#`, `##` headings, paragraphs, lists, links, fenced
code blocks (syntax-highlighted via Shiki), blockquotes, tables (styled by
`src/styles/tables.css`).

Images inside the body: use the markdown image syntax (see Images below).

## Adding and linking images

### Where images live

- Put site images (covers, thumbnails, in-body figures) in **`public/images/`**
  (create the folder if needed). A placeholder exists at
  `public/images/placeholder.png`.
- Files under `public/` are served from the site root, so a file at
  `public/images/my-cover.png` is available at `/images/my-cover.png`.
- There is no image pipeline — upload the file into the repo and reference its
  root-relative path. Do not put images inside `src/content/`.

### A. Card cover image (the `image` frontmatter field)

Set `image` in the frontmatter to a **root-relative path** so the card works
regardless of the page URL. The image is shown as a thumbnail on the home grid:

```yaml
---
title: "My post"
date: 2026-02-02
image: "/images/my-cover.png"
---
```

- Use a leading slash and reference the file under `public/images/`.
- Alternatively you may use an absolute external URL (e.g.
  `https://example.com/cover.png`).
- This is a plain string in frontmatter — it is **not** automatically
  optimized; size the image before committing.

### B. Image inside the Markdown body

Reference local images with a **root-relative path**:

```markdown
![alt text](/images/my-cover.png)
```

You may also link to an absolute external URL. If you wrap an image in a
`figure`/`figcaption`, `src/styles/images.css` styles captions and rounded
borders automatically:

```markdown
<figure>
  <img src="/images/diagram.png" alt="Diagram">
  <figcaption>Caption text.</figcaption>
</figure>
```

### C. Image galleries

`src/styles/images.css` provides two gallery styles. Use a `<ul>` with the
`image-gallery` class:

```markdown
<ul class="image-gallery">
  <li><img src="/images/photo-1.png" alt="One"></li>
  <li><img src="/images/photo-2.png" alt="Two"></li>
</ul>
```

`image-gallery-img` behaves the same. `three-image-gallery` lays out up to
three images per row.

## Advanced

### MDX and components

`.mdx` files can import/use components. `GithubRepoCard`, `YouTube`, and
`Spotify` are auto-available in MDX (wired in
`src/pages/[section]/[slug].astro`) without an import. See
`src/content/diversos/widgets-test.mdx` for examples.

### Linking between pages

- To an internal post: use the rendered URL, e.g.
  `[Hello](/posts/hello-world/)`. The trailing slash matches how the site is
  generated.
- Keep root-relative links (start with `/`) so they survive the `base` path.

### Sorting

Posts are sorted on the home page by **git commit date**, newest first
(`src/lib/content.ts`). To control ordering, commit files in the order you want
them to appear.

## Common pitfalls

- **Invalid frontmatter** → build fails. Check the schema in
  `src/content/config.ts`.
- **Forgetting the trailing `.`** in `tags` → the last tag is parsed
  incorrectly.
- **Relative image paths** (`./img.png`) break because page URLs include the
  slug. Always use root-relative (`/images/...`) or absolute URLs.
- **New sections** that are still empty are fine — `safeGetCollection` returns
  `[]` without errors.
- After adding content, run `npm run build` locally to confirm it compiles
  before pushing.
