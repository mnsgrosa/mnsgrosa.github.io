<!-- Hallmark · pre-emit critique: P4 H4 E4 S5 R5 V4. Document review only; no rendered UI verified. -->
# Constellation blog

**An About-first technical blog where readers explore a pannable, zoomable 2D constellation, expand subject islands, and follow linked MDX articles.**

Status: design and behavior brief, not an implemented feature or an approved migration plan. Confirmed decisions below come from the author; recommendations remain proposals until implementation scope is approved.

## Confirmed direction

- Audience: beginner-to-intermediate data engineers and data scientists.
- Entry: the author's About content, with the world below it and a topic list beside the world.
- World: a 2D constellation with pan and zoom, not a rotating 3D globe.
- Subjects: selecting a subject expands it into named article nodes.
- Membership: every article belongs to exactly one subject island.
- Connections: articles link to other articles, including across islands.
- Reading: show an article and its neighbors; allow navigation through article nodes.
- Authoring: MDX with Obsidian-style `[[wikilinks]]`.
- Visual identity: Gruvbox Dark, playful constellation.
- Technology: framework choice is open; motion dependencies are permitted when useful.
- Hosting context: GitHub Actions and a custom domain.

## Repository baseline

Inspected `refactor/ground-up` without checking it out. This brief is written on `feat/world-md`; it does not merge either branch.

The reference branch already has Astro, `@astrojs/mdx`, static article routes, self-hosted Inter and JetBrains Mono, and a Gruvbox Dark system in `docs/design.md`. It contains MDX under `src/content/estudos/` and `src/content/diversos/`.

Relevant reference-branch files:

- `src/content/config.ts`: collection schemas, currently without a subject field.
- `src/lib/content.ts`: existing content aggregation and tag parsing.
- `src/pages/[section]/[slug].astro`: article route ownership.
- `src/pages/index.astro`: current entry page.
- `docs/design.md`: existing visual-system source of truth.

**Recommendation: retain Astro and MDX.** Render About content, articles, topic lists, and links statically. Add client-side interaction only to the constellation. Do not replace the routing or publishing model merely to draw a graph. The precise renderer and dependency versions should be selected and verified during implementation, not assumed by this brief.

## Page shape

Hallmark macrostructure: **Map / Diagram**, preceded by the requested About introduction. The map is functional navigation, not hero decoration. The playful tone comes from discovery and expansion, while the existing Gruvbox typography and palette remain the visual foundation.

### Home

1. Existing site navigation, preserving established destinations.
2. About: real author introduction and relevant existing links. Final copy comes from the author or approved existing content, never invented credentials.
3. Explore: constellation on the left, synchronized topic list on the right.
4. Compact footer using existing contact destinations.

The About section should introduce the author without consuming an obligatory full viewport. The explorer follows in normal document flow rather than taking over the whole page.

### Explorer

At overview scale, show named subject nodes rather than every article at once. A short instruction explains that a subject can be opened. Visible controls provide zoom in, zoom out, and reset view.

Selecting a subject from either the map or the list reveals its article nodes and names. The selected subject remains identifiable. Expansion should feel like opening a constellation, not scattering particles.

**Proposed interaction:** initially expand one island at a time to limit clutter. Keep other subjects visible as destinations. Choosing another subject changes the expanded island. This expansion limit is not part of the confirmed one-island membership rule.

Cross-island bridges represent actual article links, not inferred similarity. When a destination island is collapsed, a bridge may terminate visually at its subject node; opening it reveals the underlying article endpoints. The UI must distinguish that aggregate bridge from an individual article link.

### Reader

Selecting an article opens its canonical URL. On desktop, place readable prose beside a local neighborhood map and text links. Do not compress the article into a small floating popup.

**Proposed neighbor definition:** articles directly linked by the current article, plus articles linking to it. Distinguish “Links from this article” and “Articles linking here.” Sharing an island alone does not make two articles linked neighbors.

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

**Gruvbox Dark is chosen, not a theme to rotate away from.** Follow the reference branch's `docs/design.md`, retaining its established token roles:

- Warm charcoal paper and stepped dark surfaces.
- Warm cream text with quieter metadata.
- Orange for actionable links, active selection, and keyboard focus.
- Purple reserved for visited links, not arbitrary subject coloring.
- Inter body text; upright JetBrains Mono headings and code.

The world should resemble a drawn knowledge map rather than a starfield wallpaper. Use sparse lines, readable labels, and clear selected states. Distinguish subjects from articles by geometry, size, and text, not color alone. Avoid glow clouds, fake browser frames, rainbow topic colors, and continuous particle motion.

Subject expansion and camera movement communicate context. No idle drifting, automatic panning, bounce, or endless force simulation. Stable positions help readers remember where a subject lives. A motion library is optional; selecting one is not a prerequisite to the document.

Use existing named tokens in implementation. Any needed graph-specific surface, line, spacing, or state value becomes a named token rather than an inline exception. Validate graph line and control contrast separately; existing decorative divider colors are not automatically suitable for meaningful connections.

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
