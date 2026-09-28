# Initial constellation implementation

Branch: `feat/world-md`. No branch import or production-file deletion.

## Approved scope

Use the three existing AI articles in an editable `ai-engineering` island. Keep the test post available outside the graph. Add wikilinks to existing article references, MDX support for future writing, an About-first home explorer, and reader neighborhoods. Preserve current routes and deployment configuration.

## Ordered work

1. Implement and test shared wikilink resolution and graph validation; add MDX integration, subject registry, and explicit article membership.
2. Implement the SVG explorer with pan/zoom, one expanded island, equivalent text navigation, and reader neighborhoods.
3. Add Gruvbox tokens and responsive shared styling. Retain site navigation and existing content ownership.
4. Run parser/graph tests, production build, and browser interaction checks at 320/375/414/768 and desktop. Document evidence and remaining limitations.

## Expected files

Modify `package.json`, `package-lock.json`, `astro.config.mjs`, `src/content/config.ts`, the three AI posts, `src/content/posts/teste_1.md` (explicit graph exclusion), `src/pages/index.astro`, `src/pages/posts/[slug].astro`, `src/layouts/MainLayout.astro`, and `src/components/Sidebar.astro`.

Create `tokens.css`, `src/styles/constellation.css`, `src/data/subjects.json`, `src/lib/knowledge.mjs`, `src/lib/content-index.mjs`, `src/lib/remark-wikilinks.mjs`, `src/components/Constellation.astro`, `src/components/ArticleNeighbors.astro`, `src/scripts/constellation.ts`, `tests/knowledge.test.mjs`, `tests/browser.mjs`, and `docs/authoring.md`. Record Hallmark decisions in `.hallmark/`.

No framework migration, external content import, publication, git commit, or deployment. Parser scope is collection-qualified article links and aliases, not full Obsidian embeds/block references.

## Acceptance

- `npm test`: graph/parser fixtures pass, including MDX syntax and invalid references.
- `npm run build`: existing routes and graph render successfully.
- `npm run test:browser`: responsive/interaction checks against a freshly built preview server.
- Inspect screenshots of home and reader; no fake UI-pass score before verification.
