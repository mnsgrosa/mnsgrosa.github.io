# Design: Matheus Rosa

The locked system. Every Hallmark run reads this first and pages share it. Change it on purpose; the file is the rule.

## System
- Genre: modern-minimal
- Shape of the first page: Map / Diagram — an About-first entry (name + contact), the world below it, the topic list beside it
- Theme: Slate Blue (custom, v1, "electric blue on slate, in both schemes")
- Axes: light/mono/cool · posture: none declared — the About entry opens the page, the diagram follows in document flow

The axes sit near the catalog theme Wayfind (light/mono/cool); the palette is named custom, not dealt, because its roles resolve to Tailwind's stock slate/blue/violet. Gate 74 is open on that and is recorded (not waived) in `docs/constellation-blog.md`.

## Tokens
`tokens.css` is the source of truth; read values there, never from this prose.

- Colour roles: `--color-paper`, `--color-panel`, `--color-surface`, `--color-rule`, `--color-ink`, `--color-secondary`, `--color-muted`, `--color-accent`, `--color-visited`; the dark set lives once as `--dark-*`, mapped onto the role names by the OS media query and the `[data-theme="dark"]` override.
- Aliases: `--color-focus` (accent), `--color-accent-ink` (paper), `--color-edge` (muted), `--color-clear`.
- Type: `--font-body` Inter Variable, `--font-display`/`--font-mono` JetBrains Mono Variable; the scale runs `--text-sm` to `--text-display`/`--text-home-display`.
- Space: the named 4-point scale `--space-2xs` … `--space-3xl`; container `--home-width`; measure `--measure`/`--measure-wide`.
- Motion: `--ease-out`/`-in`/`-in-out`, `--dur-micro`, `--dur-short`, plus the scene glide's `--dur-scene`/`--ease-scene`.

## Controls
- Primary: outlined accent link (`.contact-cta`) · radius `--radius-sm` (4px) · min-height 48px
- Secondary: filled panel button · hairline muted border · radius `--radius-sm` (4px) · min-height 44px

## Motion
- Character: calm. One reveal at most; the home's five-scene vertical glide and its no-JS/reduced-motion fallbacks are described in `docs/constellation-blog.md`.
- Under reduced motion everything ends at once; focus outlines appear immediately.

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
