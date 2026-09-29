<!-- Hallmark · pre-emit critique: P4 H4 E4 S5 R5 V4 -->
# Design — Matheus Rosa

## Audience and intent
Technical readers in data engineering, data science and AI, plus recruiters.
The home supports two paths: contact/review experience, or explore connected
articles. Existing article URLs and publishing rules remain intact.

## Genre and macrostructure
Technical modern-minimal, with the established Gruvbox identity taking priority
over catalog defaults. Map / Diagram is retained at the owner's request.
The change is structural: full-width name/contact and a practice-area diagram,
then the article explorer, profile, experience and projects in one scroll.

- Home: N9 edge-aligned header, outlined contact link, Ft1 mast-headed footer.
- Reader and legacy routes: retain the N3 sidebar and existing reader geometry.
- The eight-area overview is static HTML with decorative SVG connections.
  Its lines illustrate practice-area relationships, not authored article links.
- The article constellation remains an interactive enhancement of a static
  topic index. Its only source of connections is the existing content resolver.

## Theme and typography
`tokens.css` is the runtime source of truth. Warm charcoal surfaces, cream text,
orange for actions and focus, purple only for visited links. No light mode.
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
  --color-paper: oklch(27.68482% 0.000000 89.8756);
  --color-panel: oklch(31.08824% 0.003375 48.6190);
  --color-surface: oklch(34.40675% 0.006603 48.5229);
  --color-rule: oklch(41.09760% 0.011527 51.8658);
  --color-ink: oklch(89.41459% 0.056590 89.2405);
  --color-secondary: oklch(82.54901% 0.050676 85.1158);
  --color-muted: oklch(69.02596% 0.034629 76.3067);
  --color-accent: oklch(73.10874% 0.182011 51.6932);
  --color-visited: oklch(70.54014% 0.097578 2.1895);
  --color-focus: var(--color-accent);
  --color-accent-ink: var(--color-paper);
  --color-edge: var(--color-muted);
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
```

### Tailwind v4

```css
@theme {
  --color-paper: oklch(27.68482% 0.000000 89.8756);
  --color-panel: oklch(31.08824% 0.003375 48.6190);
  --color-surface: oklch(34.40675% 0.006603 48.5229);
  --color-rule: oklch(41.09760% 0.011527 51.8658);
  --color-ink: oklch(89.41459% 0.056590 89.2405);
  --color-secondary: oklch(82.54901% 0.050676 85.1158);
  --color-muted: oklch(69.02596% 0.034629 76.3067);
  --color-accent: oklch(73.10874% 0.182011 51.6932);
  --color-visited: oklch(70.54014% 0.097578 2.1895);
  --color-focus: oklch(73.10874% 0.182011 51.6932);
  --color-accent-ink: oklch(27.68482% 0.000000 89.8756);
  --color-edge: oklch(69.02596% 0.034629 76.3067);
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
  "color-paper": {"$value":"oklch(27.68482% 0.000000 89.8756)","$type":"color"},
  "color-panel": {"$value":"oklch(31.08824% 0.003375 48.6190)","$type":"color"},
  "color-surface": {"$value":"oklch(34.40675% 0.006603 48.5229)","$type":"color"},
  "color-rule": {"$value":"oklch(41.09760% 0.011527 51.8658)","$type":"color"},
  "color-ink": {"$value":"oklch(89.41459% 0.056590 89.2405)","$type":"color"},
  "color-secondary": {"$value":"oklch(82.54901% 0.050676 85.1158)","$type":"color"},
  "color-muted": {"$value":"oklch(69.02596% 0.034629 76.3067)","$type":"color"},
  "color-accent": {"$value":"oklch(73.10874% 0.182011 51.6932)","$type":"color"},
  "color-visited": {"$value":"oklch(70.54014% 0.097578 2.1895)","$type":"color"},
  "color-focus": {"$value":"oklch(73.10874% 0.182011 51.6932)","$type":"color"},
  "color-accent-ink": {"$value":"oklch(27.68482% 0.000000 89.8756)","$type":"color"},
  "color-edge": {"$value":"oklch(69.02596% 0.034629 76.3067)","$type":"color"},
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
  --background: 27.68482% 0.000000 89.8756;
  --foreground: 89.41459% 0.056590 89.2405;
  --card: 31.08824% 0.003375 48.6190;
  --card-foreground: 89.41459% 0.056590 89.2405;
  --popover: 31.08824% 0.003375 48.6190;
  --popover-foreground: 89.41459% 0.056590 89.2405;
  --primary: 73.10874% 0.182011 51.6932;
  --primary-foreground: 27.68482% 0.000000 89.8756;
  --secondary: 34.40675% 0.006603 48.5229;
  --secondary-foreground: 82.54901% 0.050676 85.1158;
  --muted: 34.40675% 0.006603 48.5229;
  --muted-foreground: 69.02596% 0.034629 76.3067;
  --accent: 34.40675% 0.006603 48.5229;
  --accent-foreground: 89.41459% 0.056590 89.2405;
  --border: 41.09760% 0.011527 51.8658;
  --input: 69.02596% 0.034629 76.3067;
  --ring: 73.10874% 0.182011 51.6932;
  --radius: 4px;
}
```
