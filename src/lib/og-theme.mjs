/* Hallmark · component: social card (1200×630) · genre: technical modern-minimal
 * theme: Catppuccin Mocha (locked — mirror of tokens.css, never a catalog pick)
 * pre-emit critique: P4 H5 E4 S5 R5 V4
 * contrast: pass (40–41) · tokens: pass (48) · honest: pass (46) · chrome: pass (47)
 * states: n/a — a build-time raster has no interactive states
 *
 * This file is a MIRROR of the design system, not a second one. `tokens.css` is
 * the runtime source of truth; `satori` cannot read custom properties, so the
 * same values travel here under the same role names. `tests/og.test.mjs` fails
 * the build's test run if the two drift apart.
 *
 * Rule for the whole social-card module: every colour and every font in the
 * card vnode comes from this object. No hex, no font-family string, no one-off
 * size may be typed inline in `og-card.mjs` (slop-test gate 48).
 */

/** Colour roles, in tokens.css order. Values are the Catppuccin Mocha hexes its comments cite. */
export const colors = {
  paper: '#1e1e2e',
  panel: '#181825',
  surface: '#313244',
  rule: '#45475a',
  ink: '#cdd6f4',
  secondary: '#bac2de',
  muted: '#a6adc8',
  accent: '#cba6f7',
  visited: '#f5c2e7',
};

/**
 * Font roles. `satori` needs the family names it is handed in `fonts`, so these
 * are the runtime family names tokens.css names, without the CSS fallback list.
 */
export const fonts = {
  body: 'Inter',
  display: 'JetBrains Mono',
};

/**
 * Type sizes for the card, in CSS px (a raster has no `rem` and no user root
 * font size). These are the `--text-*` roles expressed at card scale: the card
 * is a 1200 px canvas whose thumbnail is ~300 px wide, so a 68 px title lands at
 * ~17 px in an unfurl. Buckets are picked by `cardTitleLines`, never inline.
 */
export const text = {
  titleXl: 68,
  titleL: 64,
  titleM: 60,
  titleS: 58,
  titleXs: 56,
  kicker: 20,
  wordmark: 34,
};

/** Spacing, in CSS px, on the same 4-point scale tokens.css declares (1rem = 16px). */
export const space = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 40,
  '2xl': 64,
  '3xl': 96,
};

/** Card geometry and rule weights. */
export const card = {
  width: 1200,
  height: 630,
  // The one safe-area margin: text and artwork both stay this far from every
  // edge, and `padding` is the only place the number is written.
  padding: 96,
  ruleWidth: 1,
  titleLineHeight: 1.15,
  titleWidth: 640,
  // Four lines at the smallest bucket (4 × 56 × 1.15 = 257.6), because the
  // title column is 640 px wide: a long title needs the fourth line rather than
  // losing its last word to an ellipsis.
  titleHeight: 260,
  kickerGap: 18,
  kickerLetterSpacing: '0.14em',
  wordmarkLetterSpacing: '-0.08em',
  titleLetterSpacing: '-0.035em',
};
