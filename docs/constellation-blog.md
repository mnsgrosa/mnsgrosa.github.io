<!-- Hallmark · macrostructure: Map / Diagram · genre: modern-minimal · axes: light/mono/cool
     theme: Slate Blue (custom, v1, "electric blue on slate, in both schemes") · nav: N3 adapted side-rail · footer: Ft2
     pre-emit critique: P4 H4 E4 S5 R5 V4 · weakest: E, the sweep below still carries open Floor findings
     Document review only; no rendered UI verified. -->
# Constellation blog

**An About-first technical blog where readers explore a pannable, zoomable 2D constellation, expand subject islands, and follow linked MDX articles.**

Status: design and behavior brief, not an implemented feature or an approved migration plan. Confirmed decisions below come from the author; recommendations remain proposals until implementation scope is approved.

## Confirmed direction

- Audience: technical readers in data engineering, data science and AI, plus recruiters. The home supports two paths — contact or review experience, or explore connected articles.
- Entry: the author's About content, with the world below it and a topic list beside the world.
- World: a 2D constellation with pan and zoom, not a rotating 3D globe.
- Subjects: selecting a subject expands it into named article nodes.
- Membership: every article belongs to exactly one subject island.
- Connections: articles link to other articles, including across islands.
- Reading: show an article and its neighbors; allow navigation through article nodes.
- Authoring: MDX with Obsidian-style `[[wikilinks]]`.
- Visual identity: Slate Blue light (default) with Slate Blue Dark (automatic), playful constellation.
- Technology: framework choice is open; motion dependencies are permitted when useful.
- Hosting context: GitHub Actions and a custom domain.

## Repository baseline

Inspected `refactor/ground-up` without checking it out. This brief is written on `feat/world-md`; it does not merge either branch.

The reference branch already has Astro, `@astrojs/mdx`, static article routes, self-hosted Inter and JetBrains Mono, and a colour-token system described in `design.md` (single palette then; it now carries a light default and an automatic dark mode). It contains MDX under `src/content/estudos/` and `src/content/diversos/`.

Relevant reference-branch files:

- `src/content/config.ts`: collection schemas, currently without a subject field.
- `src/lib/content.ts`: existing content aggregation and tag parsing.
- `src/pages/[section]/[slug].astro`: article route ownership.
- `src/pages/index.astro`: current entry page.
- `docs/design.md`: existing visual-system source of truth.

**Recommendation: retain Astro and MDX.** Render About content, articles, topic lists, and links statically. Add client-side interaction only to the constellation. Do not replace the routing or publishing model merely to draw a graph. The precise renderer and dependency versions should be selected and verified during implementation, not assumed by this brief.

## Page shape

Hallmark macrostructure: **Map / Diagram**, preceded by the requested About introduction. The map is functional navigation, not hero decoration. The playful tone comes from discovery and expansion, while the existing typography and the Slate Blue light / Slate Blue Dark palette remain the visual foundation.

The structure is: a full-width name/contact entry and a practice-area diagram, then the article explorer, profile, experience and projects in one scroll. The eight-area overview is static HTML with decorative SVG connections; its lines illustrate practice-area relationships, not authored article links. The article constellation remains an interactive enhancement of a static topic index, and its only source of connections is the existing content resolver.

### Home

1. Home uses the N9 edge-aligned header with an outlined contact link; the footer is Ft1 mast-headed.
2. About: real author introduction and relevant existing links. Final copy comes from the author or approved existing content, never invented credentials.
3. Explore: constellation on the left, synchronized topic list on the right.
4. Compact footer using existing contact destinations.

The About section should introduce the author without consuming an obligatory full viewport. The explorer follows in normal document flow rather than taking over the whole page. Home content is bounded by `--home-width`; headings stack above content. On mobile the knowledge diagram becomes two staggered columns, with all eight labels readable.

#### Home scenes

On a roomy pointer desktop with motion enabled, the home sections are five scenes (knowledge, article map, about, experience, projects) in one vertical track that glides between them under `src/scripts/scene-navigation.ts`: wheel, arrow keys, the header links, the `scene-links` row and the previous/next buttons all move it, and the controls stay visible so the movement is never the only way out. It is a plain vertical glide — no rotation and no perspective — with `--dur-scene` and `--ease-scene`; only the active scene and the one leaving it are visible, everything else stays `inert` and `aria-hidden`. A scene taller than the viewport scrolls inside itself first and only glides onward at its boundary, so content is never skipped. `Use page scroll` (persisted per session) turns the glide off again.

This is an enhancement, never the source of truth: the server-rendered page is a complete scrolling document, and small screens, coarse pointers, short viewports, `prefers-reduced-motion: reduce` or JavaScript disabled all keep that document untouched, including `#explore`-style deep links. In every one of those cases the page is the ordinary scrolling document, which is also what ink-link anchors (`#explore`, `#projects`, …) resolve to. No idle movement, scroll reveals, particles or fake browser chrome.

### Explorer

At overview scale, show named subject nodes rather than every article at once. A short instruction explains that a subject can be opened. Visible controls provide zoom in, zoom out, and reset view.

Selecting a subject from either the map or the list reveals its article nodes and names. The selected subject remains identifiable. Expansion should feel like opening a constellation, not scattering particles.

**Proposed interaction:** initially expand one island at a time to limit clutter. Keep other subjects visible as destinations. Choosing another subject changes the expanded island. This expansion limit is not part of the confirmed one-island membership rule.

Cross-island bridges represent actual article links, not inferred similarity. When a destination island is collapsed, a bridge may terminate visually at its subject node; opening it reveals the underlying article endpoints. The UI must distinguish that aggregate bridge from an individual article link.

### Reader

Selecting an article opens its canonical URL. On desktop, place readable prose beside a local neighborhood map and text links. Do not compress the article into a small floating popup. Reader and legacy routes retain the N3 sidebar and existing reader geometry.

**Proposed neighbor definition:** articles directly linked by the current article, plus articles linking to it. Distinguish "Links from this article" and "Articles linking here." Sharing an island alone does not make two articles linked neighbors.

Selecting a neighbor opens that article and updates the local graph. Keep its subject visible so readers understand when they cross an island boundary. Provide a return-to-map link.

Browser Back should return to the prior reading/exploration context. Proposed implementation: store home-map viewport and selected subject in session history, while article URLs remain independently shareable.

## Content and graph model

Keep **subject membership** separate from **article links**:

- Subject: stable identifier and displayed name.
- Article: stable route identity, displayed title, canonical URL, exactly one subject.
- Membership: one article-to-subject relationship.
- Link: a directed article-to-article reference extracted from authored content.
- Backlink: the reverse lookup of a link, computed rather than manually maintained.

A cross-island reference does not duplicate the destination article or give it a second subject. Existing collections such as `posts`, `estudos`, and `diversos` are publishing sections, not automatically subjects. Existing tags are not silently converted into islands.

**Proposed schema addition:** a required `subject` identifier for content included in the explorer, backed by an explicit subject registry. Existing articles need reviewed assignments before inclusion. Do not assign them a guessed topic or an automatic miscellaneous island.

Illustrative authoring example only, not existing content or an approved topic taxonomy:

```mdx
---
title: "Understanding table joins"
subject: "data-modeling"
---

Compare this with [[estudos/relational-model|the relational model]].
```

The current collection-specific frontmatter requirements still apply; this excerpt does not replace those schemas.

## Wikilink contract: proposed first release

Obsidian-style syntax is confirmed. Exact resolution and failure rules below are proposed, not a promise of full Obsidian compatibility.

- Support `[[section/slug]]` and `[[section/slug|display text]]`.
- Without an explicit display label, render the resolved article title.
- Use collection-qualified targets to avoid collisions across sections.
- Compile links into real anchors to the existing canonical article routes.
- Compute graph edges and backlinks at build time from the same resolved links.
- Parse Markdown/MDX structurally. Do not interpret examples inside inline code or fenced code blocks as links; do not rewrite JSX expressions with a global regex.
- Report unresolved targets with source file and target; proposed policy is to fail the build rather than publish dead links.
- Deduplicate repeated references into one directed graph edge while preserving every inline link in the article.
- Preserve self-links as authored navigation but omit self-loop graphics in the local map.
- Proposed scope includes ordinary static Markdown links to known article URLs in the same graph. External links are ordinary hyperlinks, not graph nodes.

Defer bare-title matching, heading/block references, aliases across renamed files, `![[embeds]]`, and links generated dynamically by MDX components. Unsupported wiki forms should produce an actionable diagnostic, not silently become a different target.

Before implementation, approve this contract or adjust it to match the author's existing Obsidian workflow.

## Visual language

**The palette is two value sets over one role vocabulary, not a theme to rotate away from.** The reference branch's token roles are retained; only the palette the roles resolve to changed, from Gruvbox Dark to Catppuccin Mocha and now to Slate Blue, at the owner's request. Slate Blue is the light default and Slate Blue Dark is the same scales mirrored, applied automatically under `prefers-color-scheme: dark`. `tokens.css` is the source of truth for the values, so read the roles there rather than from this prose:

- Light (default): off-white slate ground and stepped light surfaces; dark (automatic): navy slate ground and stepped dark surfaces, the same relationships inverted.
- Deep-navy ink (light) / off-white ink (dark), with quieter metadata in both.
- Electric blue for actionable links, active selection, and keyboard focus — blue-600 on the light ground, blue-400 on the dark one, since blue-600 on navy is 3.45:1 and would fail AA as text.
- Violet reserved for visited links, not arbitrary subject coloring — violet-700 (light) / violet-300 (dark).
- Inter Variable 400 body; upright JetBrains Mono Variable 700 headings and code. No additional fonts, external assets or motion libraries.
- The homepage name uses `--text-home-display`; article typography is unchanged.

The world should resemble a drawn knowledge map rather than a starfield wallpaper. Use sparse lines, readable labels, and clear selected states. Distinguish subjects from articles by geometry, size, and text, not color alone. Avoid glow clouds, fake browser frames, rainbow topic colors, and continuous particle motion.

Subject expansion and camera movement communicate context. No idle drifting, automatic panning, bounce, or endless force simulation. Stable positions help readers remember where a subject lives. A motion library is optional; selecting one is not a prerequisite to the document.

Use existing named tokens in implementation. Any needed graph-specific surface, line, spacing, or state value becomes a named token rather than an inline exception. Validate graph line and control contrast separately; existing decorative divider colors are not automatically suitable for meaningful connections.

### Theme toggle (temporary)

A temporary two-state light/dark toggle sits in both chrome headers (home header
and reader rail), rendered by `src/components/ThemeToggle.astro` and driven by an
inline head script that sets `data-theme` before first paint. It stores `light`
or `dark` in `localStorage.theme`; with nothing stored the page follows the OS,
and a no-JS browser keeps the button hidden and follows the OS as before. The
dark palette's values live once as `--dark-*` in `tokens.css`'s `:root`, mapped
onto the role names by the OS media query and the `[data-theme="dark"]`
override — see the deletion recipe below.

#### Deletion recipe — run after the palettes are compared

The toggle is scaffolding. Remove it and the losing palette in one pass. Step 1
removes the toggle regardless of which palette wins; then keep exactly one
palette and delete the other.

1. **Remove the toggle (common to both outcomes).**
   - Delete `src/components/ThemeToggle.astro`.
   - `src/layouts/MainLayout.astro`: remove the `ThemeToggle` import, the
     `<ThemeToggle lang={currentLang} />` inside `.home-header-actions`, and the
     `<script is:inline>…</script>` theme block in `<head>`.
   - `src/components/Sidebar.astro`: remove the `ThemeToggle` import and the
     `<ThemeToggle lang={lang} />` line.
   - `src/i18n/ui.mjs`: remove `theme.light` and `theme.dark` from both `en` and `pt`.
   - `src/styles/constellation.css`: remove the block beginning
     `/* Theme toggle · component: button …` (the `.theme-toggle…` rules).
   - `tests/browser.mjs`: remove the `// Theme toggle:` block and the two
     `theme toggle` assertions in the no-JS section.
   - `docs/constellation-blog.md`: remove this section.
2. **Keep light — delete the dark palette.**
   - `tokens.css`: delete the nine `--dark-*` declarations in `:root`; delete the
     whole `@media (prefers-color-scheme: dark) { … }` block; delete the
     `:root[data-theme="dark"] { … }` block. The light `--color-*` set stays.
   - `tests/color.test.mjs`: drop the `Slate Blue Dark` palette from `PALETTES`
     and the `dark` block in the pinned-ratios test (light-only gates remain).
   - Dead OS dark affordances: remove the dark `<link rel="icon" …
     href="/favicon-dark.svg" …>` and the dark `<meta name="theme-color"
     content="#0f172a" …>` in `MainLayout.astro`; delete `public/favicon-dark.svg`;
     delete the `@media (prefers-color-scheme: dark) { .astro-code … }` Shiki flip
     in `constellation.css`; change `html { color-scheme: light dark; }` to `light`.
   - Verify: `npm test && npm run build`.
3. **Keep dark — delete the light palette.**
   - `tokens.css`: replace the nine light `--color-*` values in `:root` with the
     dark values and re-annotate each `/* Slate Blue #<dark-hex> */`; delete the
     `--dark-*` declarations, the `@media (prefers-color-scheme: dark) { … }`
     block, and the `:root[data-theme="dark"] { … }` block.
   - `src/lib/og-theme.mjs`: set `colors` to the dark hexes — `paper #0f172a`,
     `panel #334155`, `surface #1e293b`, `rule #475569`, `ink #f8fafc`,
     `secondary #cbd5e1`, `muted #94a3b8`, `accent #60a5fa`, `visited #c4b5fd` —
     so the card mirror follows the surviving palette.
   - `tests/color.test.mjs`: gate the single surviving palette with the `dark`
     pinned ratios (the file already carries them); drop the light set.
   - Light-only affordances: in `MainLayout.astro` drop the light `<meta
     name="theme-color" content="#f8fafc" …>` and make `public/favicon.svg` the
     dark favicon; change `html { color-scheme: light dark; }` to `dark`.
   - Verify: `npm test && npm run build`.

## Interaction and CTA voice

Contact is a native `mailto:matheusnsampaio@gmail.com` link, not a submission
form, and it must not claim that a message was sent. Native links have default,
hover, keyboard focus, active and visited states; loading/error/success and
disabled submission states do not apply. Map controls retain their disabled
limits, selected states, status text and renderer-failure fallback.

## Content boundaries

Reuse the real experience collection rather than duplicating its business
claims; profile copy is condensed from the existing published home content. The
current project collection contains example entries: the home shows an explicit
catalogue-in-progress notice and the real GitHub destination, not invented
projects. Old routes remain available for existing links, and the demo dashboard
is not promoted into the professional homepage.

## Accessibility and small screens

The graph is an enhancement, never the only route to content.

- The topic list exposes the same subjects and article destinations, usable by keyboard and assistive technology.
- Topic expansion uses a button with an announced expanded state; article destinations remain links.
- Hover information is also available on focus or selection. No hover-only titles.
- Keep visible focus static and move focus predictably when an island closes. Do not strand focus in removed nodes.
- Provide non-drag alternatives for navigation and zoom. Zooming the graph must not disable browser zoom.
- Scope gesture handling to the explorer; ordinary page scrolling outside it remains intact.
- On narrow screens, stack the topic list and map, and place the article neighborhood after the prose or behind an explicitly labelled toggle. Exact ordering should be tested with a prototype.
- With reduced motion, replace spatial expansion/camera animation with immediate state changes or brief opacity transitions.
- Without JavaScript, articles and the topic/article index remain navigable. Renderer failure must leave those links available.

Verify at 320, 375, 414, and 768 px, plus desktop. Long titles must remain discoverable without overlap or page-level horizontal scrolling. Keep control labels on one line; use a readable list when graph labels cannot all fit.

## Verification

`npm test && npm run build && npm run test:browser`

Browser coverage includes the requested four mobile/tablet widths plus desktop,
name/contact, eight non-overlapping areas, section order, real experience,
project destination, graph exclusion, keyboard, no-JS and reader regressions.
Screenshots land in `/tmp/constellation-browser/`.

## Known open findings (sloplint, recorded not waived)

The sweep `sloplint src tokens.css --genre modern-minimal` reports **7 FAIL, 12 WARN**. These are recorded open here; they were not fixed because the owner has not approved that batch. A stamp claiming a clean sweep here would be slop.

**Floor — never waived, owner's batch to fix:**

- **30a** `src/components/ArticleShare.astro:12` — emoji `↗` passed as an icon.
- **34** `src/layouts/MainLayout.astro:1` — no `overflow-x: clip` on `html` and `body` (also `src/pages/dashboard.astro:1`).
- **48** `src/pages/dashboard.astro:12` — colour literals `#f0f4f8` and `#555` outside tokens; `src/components/MyChart.jsx:13` — inline-style `#007bff`.
- **63** `src/components/KnowledgeOverview.astro:50` — arrow glued to the label `{t('knowledge.cta')} →`.
- **40** `src/styles/constellation.css:221` — `.post-language-switch a` at 4.07:1 against its surface, below the 4.5:1 body threshold. The static tier reports this as WARN because it suspects the pair rather than proving it; the gate itself is Floor, so it is listed here, and it stays open until the pair is measured in the render tier or darkened.
- **28a** `src/components/GithubRepoCard.astro:21` — the first image is `loading="lazy"` and is likely the LCP element. A video/LCP gate is Floor; ordering is what decides it, so this stays open until the render tier names the LCP.

`src/pages/dashboard.astro` and `src/components/MyChart.jsx` are a demo route excluded from the site's scope; their findings stand until those files are deleted.

**Reflex — open, no guard holds:**

- **74** the stock swatch — the roles resolve to Tailwind's slate/blue/violet hexes. Its guard is "the pre-flight found it in the project", and the pre-flight found Gruvbox, so the guard does not hold. The mirror was chosen deliberately for AA contrast; closing 74 means mixing the roles off the stock scales in OKLCH. Open.
- **25** `src/styles/constellation.css:363` — `.home-footer p` measure 40ch (below the 45–75ch range).
- **49** `src/components/ThemeToggle.astro:16` — the toggle's label has no `nowrap`. The gate splits: 49a (a button label wrapping) is Floor, 49b (a footer link, tab or breadcrumb) is Reflex. This is a button, so it is Floor if it wraps at any width from 320 to 1920; the static tier cannot tell, so it is recorded undecided rather than waived.

**Finish — answered as open, not blocking:**

- **F3** no `text-wrap: balance` on display heads (`src/styles/constellation.css:24`, `src/components/PostCatalog.astro:141`).
- **F6** numeric selectors without `tabular-nums` (`.map-hint/.map-legend/.map-status:165`, `.topic-count:176`, `.practice-figure figcaption:341`).
- **F15** two container widths on one page (1260, 1120px) (`src/styles/constellation.css:1`).
- **F16** `::selection` unthemed (`src/styles/constellation.css:1`).
- **F2** `src/pages/dashboard.astro:25` — three-period ellipsis in prose (demo route).

## Implementation stages, not authorization to build

1. **Content foundation:** approve subject taxonomy and wikilink contract; build a validated article/link index from the reference branch's MDX pipeline.
2. **Accessible navigation:** generate topic lists, canonical links, and backlinks without requiring the visualization.
3. **Constellation prototype:** add pan/zoom, subject expansion, cross-island bridges, and list synchronization using real content or explicitly labelled fixtures.
4. **Reader integration:** render the local neighborhood alongside articles and preserve browser navigation behavior.
5. **Verification:** check content resolution, responsive layouts, keyboard use, reduced motion, and the existing static deployment.

No branch switch, migration, production deletion, dependency install, domain change, or deployment is authorized by this document. Preserve existing routes and content when an implementation plan is approved.

## Acceptance checks for the future build

These are requirements to test, not completed results.

- Home begins with About content and places the explorer below it.
- The map supports bounded pan/zoom and reset; it never replaces normal page scrolling.
- Selecting a subject from the map or list produces the same selected state and article set.
- Each included article belongs to exactly one declared subject; missing or invalid assignments have explicit diagnostics.
- Wikilinks resolve to canonical anchors; custom labels work; code examples do not create edges.
- A deliberate broken wikilink triggers the approved failure behavior.
- Duplicate references, reciprocal links, self-links, and cross-island references have fixtures.
- Article neighbors agree with the link index; outgoing links and backlinks are distinguishable.
- Deep links and browser Back work without first visiting the home explorer.
- Empty subjects, articles with no neighbors, long titles, unavailable renderer, and no-JavaScript navigation remain understandable.
- Keyboard-only readers can reach every article through the text interface.
- Reduced-motion mode removes spatial animation, and mobile widths have no page overflow.
- Existing content widgets, routes, and custom-domain configuration remain intact.

Repository build check: `npm run build` must pass on the eventual implementation branch. Add automated graph/parser tests during implementation; no test runner or test command for them is claimed to exist yet. A successful static build alone does not verify visual or interaction acceptance.

## Decisions still proposed

Before coding, approve the wikilink resolution contract, article-to-subject assignments, one-expanded-island behavior, and incoming-plus-outgoing neighbor definition. Renderer choice and performance limits should follow a prototype measured against the actual article count and link density.

This document has been reviewed for consistency with the confirmed brief. No site build, browser rendering, mobile audit, or Hallmark 58-gate UI pass is claimed by this documentation-only change.
