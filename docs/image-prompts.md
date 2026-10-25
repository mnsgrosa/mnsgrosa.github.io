# Image prompts — banners for non-post routes and for the graph article

/* Hallmark · component: social card artwork · genre: modern-minimal · theme: Slate Blue (custom, v1)
 * pre-emit critique: P5 H4 E4 S5 R5 V4 · weakest: E, raster output is verified by hand at 300px, never swept
 * Prose prompts for an external image model. Not a build step. */

These are prompts for an **external** image model, used to replace a generated card
by a hand-made one. The site's own cards are rendered deterministically
(`src/lib/og-card.mjs`); nothing here runs during `npm run build`, and no model is
called by this repository. See [`authoring.md`](authoring.md) § Social card for how
a produced file is wired in.

The `hallmark` disciplines that bind here — locked palette, no invented content, no
re-drawn chrome, roman type only, restraint over ornament — are translated into
prompt language below. The one rule an image model breaks most often is **text**:
letters come out garbled, so prompt A asks for no text at all, and the preview's
title and description are left to the `og:` tags, where they are real strings.

## 1. Shared constraint block

Paste after every subject block. It is the part that keeps a generated image from
drifting into AI-slop and away from this site.

```
Rendering: flat vector / technical diagram. Solid fills and 1 px strokes only.
No gradient, no glow, no blur, no drop shadow, no bevel, no 3D, no isometric, no
glassmorphism, no noise, no grain, no paper texture, no vignette, no lens flare.
Palette is exactly these six and nothing else: #f8fafc (ground), #0f172a (ink),
#64748b (muted), #cbd5e1 (rules), #2563eb (accent), #6d28d9 (secondary accent).
No green, no red, no orange, no magenta, no neon, no pure #000000 or #ffffff.
Do not substitute a near-miss for the accent blue or the violet: a model that
returns #3b82f6 or #7c3aed puts the artwork off the site's palette just as surely
as a wrong ground.
Composition: off-centre, deliberately asymmetric, generous negative space;
never a centred symmetric motif, never a full-bleed illustration edge to edge.
Keep the outer 96 px on every side free of content (safe area).
Output: 1200×630 landscape, sRGB, PNG, under 250 KB, no watermark, no signature,
no border, no caption, no text, no letters, no numerals, no logo.
```

**Negative prompt** (if the model takes one):

```
gradient, glow, neon, bokeh, blur, 3D render, plastic, glass, chrome, green, red,
orange, magenta, synthwave, cyberpunk city, hologram, humanoid robot, glowing
brain, brain half-circuit, neural network spaghetti, magnifying glass, lightbulb,
gears, handshake, rocket, laptop on desk, stock-photo person, team meeting,
mountain summit, chess pieces, maze, watermark, signature, text, letters, numbers,
captions, toolbars, browser window, code editor chrome
```

If the model **will not** stop adding text: keep the text but make it the literal
string `mr.` and nothing else, then check the letters by hand before committing —
a garbled wordmark is worse than no wordmark.

---

## 2. Banner for the site routes (not a post)

Targets `/` and `/pt/`: the identity card behind the home page and both catalogues.
The site's identity does not change per language, so **one image serves both
languages**; the language difference is carried by the tags, not the artwork.

Subject block:

```
An abstract constellation map on a solid #f8fafc ground. Nine small circles of
ink #0f172a — radii between 8 and 22 px — joined by 1 px #64748b lines into a
sparse, open, irregular network that reads as a knowledge map with no centre.
Three circles are filled solid #2563eb; one connecting line is #6d28d9. The
network occupies the right 40% of the canvas and runs off the right edge, as if
cut from something larger. In the upper left, a single 1 px #cbd5e1 horizontal
rule, 560 px long, with a 12 px #2563eb square sitting on its right end. The
left 45% of the canvas is empty ground. Everything is flat, print-like, precise,
unhurried — closer to a star chart in a technical manual than to a poster.
```

Then the shared block. Save as `public/images/cards/site.png`.

**Why the wordmark is not in the prompt:** `mr.` already exists as type in the site
chrome, and a model cannot reproduce the mono letterforms at 1:1. If you want it in
the image, add this sentence and check the glyphs afterwards:

```
Lower left, 32 px above the safe area: the wordmark "mr." in #0f172a letter-spaced
monospace, the period in #2563eb and nothing else.
```

---

## 3. Banner for the article that is in the graph

Target: `rag-to-production` (EN) and `como_comecaria` (PT) — the only translation
pair with `graph: true`, so the only article that appears as a node on the home
map with a drawn edge to its island. The artwork says exactly that and invents
nothing else: one article node, one island node, one edge.

Subject block:

```
A single constellation, small and isolated on a solid #f8fafc ground. One circle
of ink #0f172a, 26 px radius, filled solid #2563eb, near the right third of the
canvas at chest height. From it, one straight 2 px #2563eb line rises to a second
circle, 14 px radius, drawn as a 1 px #64748b outline with no fill, at the upper
right. One further 1 px #64748b line continues off the right edge of the canvas,
implying the rest of the map without drawing it. Two short 1 px #cbd5e1 ticks mark
the left margin. The left 60% of the canvas is empty ground, reserved for a title
that is not part of the image.
```

Then the shared block. Save as `public/images/cards/rag-to-production.png` and use
the same file for `como_comecaria` — the pair is one article in two languages, and
an image that carries no text cannot contradict either.

Optional accent for the Portuguese file only, if you want the pair to differ:
replace the last two sentences with

```
One 1 px #6d28d9 line crosses the empty left third at y=60%, ending in a 6 px
#6d28d9 square at x=96 px.
```

---

## 4. Wiring a produced image in

**Article** — one line of frontmatter, nothing else. The path must start with `/`
(a file under `public/`) or `http(s)://`, and the file should be 1200×630 because
the tags always declare that size:

```yaml
ogImage: "/images/cards/rag-to-production.png"
```

**Site routes** — `MainLayout.astro` takes an `image` prop; pass it from
`src/pages/index.astro` and `src/pages/pt/index.astro`. Do **not** place the file
at `public/og/en.png`: that path is written by the card endpoint during the build
and the two would collide.

```astro
<MainLayout title={…} lang="en" image="/images/cards/site.png" imageAlt="…" …>
```

Alt text is not per-post configurable today: articles derive it as `title — island`
and site routes use `site.cardAlt` from `src/i18n/ui.mjs`. If the artwork changes
what the card shows, change that string, not the image.

## 5. Check before believing it

- `npm run build`, then open the PNG and look at it at **300 px wide** — the size a
  feed actually shows. If the composition only reads at full size, it does not work.
- Confirm the six palette values, not "something close": a model that substitutes
  `#f9fafb` puts the card off the site's ground.
- Check for stray text, then check the tags: the built HTML must still show the
  absolute `og:image` URL and `1200`/`630`, and `npm run test:browser` must pass.
- A card is a preview, never a poster: it may not carry a claim, a metric, a date or
  a label that the article itself does not make.
