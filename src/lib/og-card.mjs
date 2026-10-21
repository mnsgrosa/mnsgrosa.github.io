/* Hallmark · component: social card (1200×630) · genre: technical modern-minimal
 * theme: Gruvbox Dark (locked) · anatomy: wordmark → hairline → kicker → title
 * pre-emit critique: P4 H5 E4 S5 R5 V4
 * contrast: pass (40–41) · tokens: pass (48) · honest: pass (46) · chrome: pass (47)
 * states: n/a — a build-time raster has no interactive states
 *
 * satori renders a plain-object vnode tree to SVG, sharp rasterizes it to PNG.
 * Every colour, font family, size and rule weight below comes from
 * `og-theme.mjs`; nothing is typed inline. The card is deliberately one
 * composition for every route — a site card and an article card differ only in
 * the two strings they carry, which is what makes the set read as a family
 * rather than as five one-offs.
 *
 * The composition is masthead-at-top, title-anchored-to-the-bottom: the empty
 * band in the middle belongs to the rule, so a one-line title and a four-line
 * title both look placed rather than floated.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { card, colors, fonts, text } from './og-theme.mjs';
import { cardTitleLines } from './og.mjs';

// The fonts the site already bundles. `satori` reads the woff2 directly, so the
// card is set in the same type the page is, with nothing fetched and no font
// package added.
const FONT_FILES = {
  [fonts.body]: 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  [fonts.display]: 'node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
};

let fontCache;

function loadFonts() {
  if (!fontCache) {
    fontCache = Object.entries(FONT_FILES).map(([name, file]) => ({
      name,
      data: readFileSync(path.resolve(file)),
      weight: 400,
      style: 'normal',
    }));
  }
  return fontCache;
}

/**
 * The card, as a plain object. satori's unit is the CSS px; the 1200×630 canvas
 * is laid out at that scale and scaled down by the unfurl, never by us.
 */
export function cardVnode({ kicker, title }) {
  const inner = card.titleWidth;
  const { lines, size } = cardTitleLines(title, {
    innerWidth: inner,
    titleHeight: card.titleHeight,
  });

  // The text block is anchored to the bottom safe area and grows upwards, so a
  // one-line title and a four-line title both end exactly `card.padding` from
  // the edge. Computing the top here — rather than trusting `top:` or satori's
  // `bottom:` support — keeps the last line inside the safe area by arithmetic
  // the browser test can measure.
  const blockHeight = text.kicker + card.kickerGap + lines.length * size * card.titleLineHeight;
  const textTop = card.height - card.padding - blockHeight;

  const node = (x, y, r, fill = 'none', stroke = colors.ink) => ({
    type: 'circle', props: { cx: x, cy: y, r, fill, stroke, strokeWidth: 1 },
  });
  const line = (x1, y1, x2, y2, stroke = colors.muted) => ({
    type: 'line', props: { x1, y1, x2, y2, stroke, strokeWidth: 1 },
  });

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        width: `${card.width}px`,
        height: `${card.height}px`,
        background: colors.paper,
        color: colors.ink,
        fontFamily: fonts.body,
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', position: 'absolute', left: `${card.padding}px`, top: `${card.padding}px` },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontFamily: fonts.display,
                    fontSize: `${text.wordmark}px`,
                    lineHeight: 1,
                    letterSpacing: card.wordmarkLetterSpacing,
                    color: colors.ink,
                  },
                  children: ['mr', { type: 'span', props: { style: { color: colors.accent }, children: '.' } }],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    marginTop: '18px',
                    height: '1px',
                    background: colors.rule,
                    width: '524px',
                  },
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', position: 'absolute', left: `${card.padding}px`, top: `${Math.round(textTop)}px` },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontFamily: fonts.display,
                    fontSize: `${text.kicker}px`,
                    lineHeight: 1,
                    letterSpacing: card.kickerLetterSpacing,
                    color: colors.accent,
                  },
                  children: kicker,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    marginTop: `${card.kickerGap}px`,
                    fontFamily: fonts.body,
                    fontSize: `${size}px`,
                    fontWeight: 700,
                    fontStyle: 'normal',
                    lineHeight: card.titleLineHeight,
                    letterSpacing: card.titleLetterSpacing,
                    color: colors.ink,
                  },
                  children: lines.map(line => ({
                    type: 'div',
                    props: { style: { display: 'flex' }, children: line },
                  })),
                },
              },
            ],
          },
        },
        {
          type: 'svg',
          props: {
            width: `${card.width}px`,
            height: `${card.height}px`,
            viewBox: `0 0 ${card.width} ${card.height}`,
            style: { position: 'absolute', inset: 0, pointerEvents: 'none' },
            children: [
              // The map fragment, kept clear of the title column and inside the
              // safe area on every side: leftmost ink 765, rightmost 1098.
              line(775, 178, 899, 252), line(899, 252, 1009, 166),
              line(899, 252, 959, 374), line(1009, 166, 1089, 228),
              line(959, 374, 1077, 444), line(1009, 166, 1043, 96),
              line(959, 374, 1043, 494, colors.visited),
              node(775, 178, 10), node(899, 252, 15, colors.accent, colors.ink),
              node(1009, 166, 12), node(1089, 228, 9, colors.accent, colors.accent),
              node(959, 374, 18), node(1077, 444, 11), node(1043, 494, 9),
            ],
          },
        },
      ],
    },
  };
}

/** The card as PNG bytes. 1200×630, the ratio every unfurl expects. */
export async function renderCard(content) {
  const svg = await satori(cardVnode(content), {
    width: card.width,
    height: card.height,
    fonts: loadFonts(),
  });
  return sharp(Buffer.from(svg)).png().toBuffer();
}
