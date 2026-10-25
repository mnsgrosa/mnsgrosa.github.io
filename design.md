<!-- Hallmark · pre-emit critique: P4 H4 E4 S5 R5 V4 -->
# Design — Matheus Rosa

## Audience and intent
Technical readers in data engineering, data science and AI, plus recruiters.
The home supports two paths: contact/review experience, or explore connected
articles. Existing article URLs and publishing rules remain intact.

## Genre and macrostructure
Technical modern-minimal, with the established identity taking priority over
catalog defaults: Slate Blue as the light default, with Slate Blue Dark as the
automatic dark mode — the same palette with the Tailwind scale mirrored and the
ground inverted. Map / Diagram is retained at the owner's request.
The change is structural: full-width name/contact and a practice-area diagram,
then the article explorer, profile, experience and projects in one scroll.

- Home: N9 edge-aligned header, outlined contact link, Ft1 mast-headed footer.
- Reader and legacy routes: retain the N3 sidebar and existing reader geometry.
- The eight-area overview is static HTML with decorative SVG connections.
  Its lines illustrate practice-area relationships, not authored article links.
- The article constellation remains an interactive enhancement of a static
  topic index. Its only source of connections is the existing content resolver.

## Theme and typography
`tokens.css` is the runtime source of truth. Light (default): off-white slate
ground, deep-navy ink, electric blue for actions and focus, violet only for
visited links. Dark (automatic via `prefers-color-scheme: dark`) is the same set
mirrored on the same palette scales — navy slate ground, off-white ink, a lighter
blue for actions and focus, a lighter violet for visited links — because a
blue-600 accent on a navy-900 ground measures 3.45:1 and would fail AA as text.
Inter Variable 400 body; upright JetBrains Mono Variable 700 headings and code.
No additional fonts, external assets or motion libraries.
The homepage name uses `--text-home-display`; article typography is unchanged.

## Layout and motion
Use the existing named 4-point spacing scale. Home content is bounded by
`--home-width`; headings stack above content. On mobile the knowledge diagram
becomes two staggered columns, with all eight labels readable.

On a roomy pointer desktop with motion enabled, the five home scenes (knowledge,
article map, about, experience, projects) sit in one vertical track that glides
between them: the wheel, `←`/`→`, the header links and the scene links all move
the track, and `.scene-links` plus the arrow buttons are the explicit controls.
It is a plain vertical glide — no rotation, no perspective, no 3D faces — with
`--dur-scene` and `--ease-scene`; only the active scene and the one leaving it
are visible, everything else stays `inert` and `aria-hidden`. A long scene
scrolls inside itself first and only glides onward at its boundary, so content
is never skipped. `Use page scroll` (persisted per session) turns the glide off
again, and the mode is unavailable on small screens, coarse pointers, short
viewports, `prefers-reduced-motion: reduce`, and without JavaScript. In every one
of those cases the page is the ordinary scrolling document, which is also what
ink-link anchors (`#explore`, `#projects`, …) resolve to.

No idle movement, scroll reveals, particles or fake browser chrome. Existing
article expansion fades and explicit pan/zoom stay. Reduced motion disables
animation; focus outlines appear immediately.

## Interaction and CTA voice
Contact is a native `mailto:matheusnsampaio@gmail.com` link, not a submission
form. It must not claim that a message was sent. Native links have default,
hover, keyboard focus, active and visited states; loading/error/success and
disabled submission states do not apply. Map controls retain their disabled
limits, selected states, status text and renderer-failure fallback.

## Content boundaries
Reuse the real experience collection, rather than duplicating its business
claims. Profile copy is condensed from the existing published home content.
The current project collection contains example entries: the new home shows
an explicit catalogue-in-progress notice and the real GitHub destination,
not invented projects. Old routes remain available for existing links.
The demo dashboard is not promoted into the professional homepage.

## Verification
`npm test && npm run build && npm run test:browser`

Browser coverage includes the requested four mobile/tablet widths plus desktop,
name/contact, eight non-overlapping areas, section order, real experience,
project destination, graph exclusion, keyboard, no-JS and reader regressions.
Screenshots: `/tmp/constellation-browser/`.

## Exports
The following snapshots reproduce the current system for reuse. They are not
extra runtime styles or dependencies; update them when `tokens.css` changes.

### CSS

```css
:root {
  --color-paper: oklch(98.41519% 0.003413 247.8575);
  --color-panel: oklch(92.87613% 0.012619 255.5078);
  --color-surface: oklch(96.82603% 0.006854 247.8956);
  --color-rule: oklch(86.89814% 0.019848 252.8943);
  --color-ink: oklch(20.76819% 0.039824 265.7549);
  --color-secondary: oklch(37.16963% 0.039156 257.2870);
  --color-muted: oklch(55.43910% 0.040717 257.4166);
  --color-accent: oklch(54.61497% 0.215208 262.8809);
  --color-visited: oklch(49.06665% 0.241232 292.5809);
  --color-focus: oklch(54.61497% 0.215208 262.8809);
  --color-accent-ink: oklch(98.41519% 0.003413 247.8575);
  --color-edge: oklch(55.43910% 0.040717 257.4166);
  --color-clear: transparent;
  --font-body: 'Inter Variable', sans-serif;
  --font-display: 'JetBrains Mono Variable', monospace;
  --font-mono: var(--font-display);
  --space-2xs: .25rem;
  --space-xs: .5rem;
  --space-sm: .75rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2.5rem;
  --space-2xl: 4rem;
  --space-3xl: 6rem;
  --text-reading: 1rem;
  --text-reading-wide: 1.375rem;
  --measure: 68ch;
  --measure-wide: 80ch;
  --text-sm: .8125rem;
  --text-base: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5625rem;
  --text-2xl: 1.953rem;
  --text-display: clamp(2.25rem, 4vw, 4rem);
  --text-home-display: clamp(2.25rem, 6vw, 5.5rem);
  --text-knowledge: clamp(.875rem, 1.6vw, 1.25rem);
  --home-width: 1120px;
  --ease-out: cubic-bezier(.16, 1, .3, 1);
  --ease-in: cubic-bezier(.7, 0, .84, 0);
  --ease-in-out: cubic-bezier(.65, 0, .35, 1);
  --dur-micro: 120ms;
  --dur-short: 220ms;
  --radius-sm: 4px;
  --radius-md: 8px;
  --rule-width: 1px;
}

/* Dark is automatic: the same nine roles, overridden by the OS preference. */
@media (prefers-color-scheme: dark) {
  :root {
    --color-paper: oklch(20.76819% 0.039824 265.7549);
    --color-panel: oklch(37.16963% 0.039156 257.2870);
    --color-surface: oklch(27.94952% 0.036848 260.0310);
    --color-rule: oklch(44.55331% 0.037447 257.2808);
    --color-ink: oklch(98.41519% 0.003413 247.8575);
    --color-secondary: oklch(86.89814% 0.019848 252.8943);
    --color-muted: oklch(71.06716% 0.035114 256.7878);
    --color-accent: oklch(71.37400% 0.143381 254.6240);
    --color-visited: oklch(81.11618% 0.101287 293.5712);
  }
}
```

### Tailwind v4

```css
@theme {
  --color-paper: oklch(98.41519% 0.003413 247.8575);
  --color-panel: oklch(92.87613% 0.012619 255.5078);
  --color-surface: oklch(96.82603% 0.006854 247.8956);
  --color-rule: oklch(86.89814% 0.019848 252.8943);
  --color-ink: oklch(20.76819% 0.039824 265.7549);
  --color-secondary: oklch(37.16963% 0.039156 257.2870);
  --color-muted: oklch(55.43910% 0.040717 257.4166);
  --color-accent: oklch(54.61497% 0.215208 262.8809);
  --color-visited: oklch(49.06665% 0.241232 292.5809);
  --color-focus: oklch(54.61497% 0.215208 262.8809);
  --color-accent-ink: oklch(98.41519% 0.003413 247.8575);
  --color-edge: oklch(55.43910% 0.040717 257.4166);
  --color-clear: transparent;
  --font-body: 'Inter Variable', sans-serif;
  --font-display: 'JetBrains Mono Variable', monospace;
  --font-mono: 'JetBrains Mono Variable', monospace;
  --spacing-2xs: .25rem;
  --spacing-xs: .5rem;
  --spacing-sm: .75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2.5rem;
  --spacing-2xl: 4rem;
  --spacing-3xl: 6rem;
  --text-reading: 1rem;
  --text-reading-wide: 1.375rem;
  --measure: 68ch;
  --measure-wide: 80ch;
  --text-sm: .8125rem;
  --text-base: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5625rem;
  --text-2xl: 1.953rem;
  --text-display: clamp(2.25rem, 4vw, 4rem);
  --text-home-display: clamp(2.25rem, 6vw, 5.5rem);
  --text-knowledge: clamp(.875rem, 1.6vw, 1.25rem);
  --home-width: 1120px;
  --ease-out: cubic-bezier(.16, 1, .3, 1);
  --ease-in: cubic-bezier(.7, 0, .84, 0);
  --ease-in-out: cubic-bezier(.65, 0, .35, 1);
  --dur-micro: 120ms;
  --dur-short: 220ms;
  --radius-sm: 4px;
  --radius-md: 8px;
  --rule-width: 1px;
}
```

### DTCG token snapshot

Dimension values containing CSS functions remain CSS expressions and need
resolution for token pipelines that require fixed dimensions.

```json
{
  "color-paper": {"$value":"oklch(98.41519% 0.003413 247.8575)","$type":"color"},
  "color-panel": {"$value":"oklch(92.87613% 0.012619 255.5078)","$type":"color"},
  "color-surface": {"$value":"oklch(96.82603% 0.006854 247.8956)","$type":"color"},
  "color-rule": {"$value":"oklch(86.89814% 0.019848 252.8943)","$type":"color"},
  "color-ink": {"$value":"oklch(20.76819% 0.039824 265.7549)","$type":"color"},
  "color-secondary": {"$value":"oklch(37.16963% 0.039156 257.2870)","$type":"color"},
  "color-muted": {"$value":"oklch(55.43910% 0.040717 257.4166)","$type":"color"},
  "color-accent": {"$value":"oklch(54.61497% 0.215208 262.8809)","$type":"color"},
  "color-visited": {"$value":"oklch(49.06665% 0.241232 292.5809)","$type":"color"},
  "color-focus": {"$value":"oklch(54.61497% 0.215208 262.8809)","$type":"color"},
  "color-accent-ink": {"$value":"oklch(98.41519% 0.003413 247.8575)","$type":"color"},
  "color-edge": {"$value":"oklch(55.43910% 0.040717 257.4166)","$type":"color"},
  "color-clear": {"$value":"transparent","$type":"color"},
  "font-body": {"$value":"'Inter Variable', sans-serif","$type":"fontFamily"},
  "font-display": {"$value":"'JetBrains Mono Variable', monospace","$type":"fontFamily"},
  "font-mono": {"$value":"'JetBrains Mono Variable', monospace","$type":"fontFamily"},
  "space-2xs": {"$value":".25rem","$type":"dimension"},
  "space-xs": {"$value":".5rem","$type":"dimension"},
  "space-sm": {"$value":".75rem","$type":"dimension"},
  "space-md": {"$value":"1rem","$type":"dimension"},
  "space-lg": {"$value":"1.5rem","$type":"dimension"},
  "space-xl": {"$value":"2.5rem","$type":"dimension"},
  "space-2xl": {"$value":"4rem","$type":"dimension"},
  "space-3xl": {"$value":"6rem","$type":"dimension"},
  "text-reading": {"$value":"1rem","$type":"dimension"},
  "text-reading-wide": {"$value":"1.375rem","$type":"dimension"},
  "measure": {"$value":"68ch","$type":"dimension"},
  "measure-wide": {"$value":"80ch","$type":"dimension"},
  "text-sm": {"$value":".8125rem","$type":"dimension"},
  "text-base": {"$value":"1rem","$type":"dimension"},
  "text-lg": {"$value":"1.25rem","$type":"dimension"},
  "text-xl": {"$value":"1.5625rem","$type":"dimension"},
  "text-2xl": {"$value":"1.953rem","$type":"dimension"},
  "text-display": {"$value":"clamp(2.25rem, 4vw, 4rem)","$type":"dimension"},
  "text-home-display": {"$value":"clamp(2.25rem, 6vw, 5.5rem)","$type":"dimension"},
  "text-knowledge": {"$value":"clamp(.875rem, 1.6vw, 1.25rem)","$type":"dimension"},
  "home-width": {"$value":"1120px","$type":"dimension"},
  "ease-out": {"$value":[0.16,1,0.3,1],"$type":"cubicBezier"},
  "ease-in": {"$value":[0.7,0,0.84,0],"$type":"cubicBezier"},
  "ease-in-out": {"$value":[0.65,0,0.35,1],"$type":"cubicBezier"},
  "dur-micro": {"$value":"120ms","$type":"duration"},
  "dur-short": {"$value":"220ms","$type":"duration"},
  "radius-sm": {"$value":"4px","$type":"dimension"},
  "radius-md": {"$value":"8px","$type":"dimension"},
  "rule-width": {"$value":"1px","$type":"dimension"}
}
```

### shadcn-compatible OKLCH channel variables

For consumers using `oklch(var(--background))`; adapt to the receiving
project's color-function convention.

```css
:root {
  --background: 98.41519% 0.003413 247.8575;
  --foreground: 20.76819% 0.039824 265.7549;
  --card: 92.87613% 0.012619 255.5078;
  --card-foreground: 20.76819% 0.039824 265.7549;
  --popover: 92.87613% 0.012619 255.5078;
  --popover-foreground: 20.76819% 0.039824 265.7549;
  --primary: 54.61497% 0.215208 262.8809;
  --primary-foreground: 98.41519% 0.003413 247.8575;
  --secondary: 96.82603% 0.006854 247.8956;
  --secondary-foreground: 37.16963% 0.039156 257.2870;
  --muted: 96.82603% 0.006854 247.8956;
  --muted-foreground: 55.43910% 0.040717 257.4166;
  --accent: 96.82603% 0.006854 247.8956;
  --accent-foreground: 20.76819% 0.039824 265.7549;
  --border: 86.89814% 0.019848 252.8943;
  --input: 55.43910% 0.040717 257.4166;
  --ring: 54.61497% 0.215208 262.8809;
  --radius: 4px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --background: 20.76819% 0.039824 265.7549;
    --foreground: 98.41519% 0.003413 247.8575;
    --card: 37.16963% 0.039156 257.2870;
    --card-foreground: 98.41519% 0.003413 247.8575;
    --popover: 37.16963% 0.039156 257.2870;
    --popover-foreground: 98.41519% 0.003413 247.8575;
    --primary: 71.37400% 0.143381 254.6240;
    --primary-foreground: 20.76819% 0.039824 265.7549;
    --secondary: 27.94952% 0.036848 260.0310;
    --secondary-foreground: 86.89814% 0.019848 252.8943;
    --muted: 27.94952% 0.036848 260.0310;
    --muted-foreground: 71.06716% 0.035114 256.7878;
    --accent: 27.94952% 0.036848 260.0310;
    --accent-foreground: 98.41519% 0.003413 247.8575;
    --border: 44.55331% 0.037447 257.2808;
    --input: 71.06716% 0.035114 256.7878;
    --ring: 71.37400% 0.143381 254.6240;
  }
}
```
