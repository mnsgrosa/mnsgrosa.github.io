import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * WCAG contrast gates for the colour roles in `tokens.css`.
 *
 * The roles are authored in OKLCH (the palette's native space) and WCAG is
 * defined on sRGB relative luminance, so the ratio cannot be read off the
 * stylesheet: this file converts OKLCH → linear sRGB at runtime, with no
 * dependency, exactly the way the browser will. A palette edit that keeps the
 * site legible passes without touching this file; a palette edit that darkens
 * the ink below AA fails here instead of in a reader's browser.
 *
 * `tokens.css` declares two value sets over the same nine roles: the light
 * `--color-*` set in `:root` and the dark set as `--dark-*` in `:root`, which
 * the OS media query and the `[data-theme="dark"]` override both map onto the
 * role names. Each set is parsed separately and gated separately, so a palette
 * that only clears AA in one scheme fails rather than hiding behind the other.
 *
 * Roles are resolved through the derived `var(--color-…)` aliases too, so
 * `--color-focus` and `--color-edge` are gated against what they actually
 * point at rather than against a second copy of the value.
 */

const root = path.resolve('.');
const css = readFileSync(path.join(root, 'tokens.css'), 'utf8');

/** OKLCH triples, keyed by role name, from one annotated palette block. */
function parseBlock(label, prefix) {
  const map = new Map();
  const re = new RegExp(`${prefix}([a-z-]+):\\s*oklch\\(([\\d.]+)%\\s+([\\d.]+)\\s+([\\d.]+)\\);\\s*\\/\\* ${label} (#[0-9a-f]{6}) \\*\\/`, 'g');
  for (const [, role, l, c, h] of css.matchAll(re)) {
    map.set(role, [Number(l) / 100, Number(c), Number(h)]);
  }
  return map;
}

const light = parseBlock('Slate Blue', '--color-');
const dark = parseBlock('Slate Blue Dark', '--dark-');

/** `var()` aliases (the derived roles), keyed by role name. Declared once in `:root`. */
const alias = new Map();
for (const [, role, target] of css.matchAll(/--color-([a-z-]+):\s*var\(--color-([a-z-]+)\)/g)) {
  alias.set(role, target);
}

const ROLES = ['paper', 'panel', 'surface', 'rule', 'ink', 'secondary', 'muted', 'accent', 'visited'];

/** The OKLCH triple for a role in one palette, following `var()` aliases to the declaring role. */
function role(name, palette) {
  if (palette.has(name)) return palette.get(name);
  if (alias.has(name)) return role(alias.get(name), palette);
  throw new Error(`tokens.css declares no colour role "${name}"`);
}

/** OKLCH → linear sRGB (Björn Ottosson's matrices), unclamped so gamut errors surface. */
function linearSrgb([L, C, H]) {
  const rad = (H * Math.PI) / 180;
  const a = C * Math.cos(rad);
  const b = C * Math.sin(rad);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

/** WCAG 2.x relative luminance of an OKLCH triple (linear sRGB is already the input space). */
function luminance(name, palette) {
  const [r, g, b] = linearSrgb(role(name, palette)).map(channel => Math.min(1, Math.max(0, channel)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio, 1–21, order-independent. */
function contrast(a, b, palette) {
  const [hi, lo] = [luminance(a, palette), luminance(b, palette)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const PALETTES = [['Slate Blue (light)', light], ['Slate Blue Dark', dark]];

test('each palette declares the nine colour roles in OKLCH, all inside sRGB', () => {
  for (const [label, palette] of PALETTES) {
    assert.equal(palette.size, 9, `tokens.css declares ${palette.size} ${label} colour roles, expected 9`);
    assert.deepEqual([...palette.keys()], ROLES, `${label} roles are declared in tokens.css order`);
    for (const name of ROLES) {
      for (const channel of linearSrgb(role(name, palette))) {
        // A clipped channel means the authored OKLCH sits outside sRGB and the
        // browser would paint something other than the palette hex.
        assert.ok(channel >= -0.001 && channel <= 1.001, `${label} ${name} is inside sRGB (${channel.toFixed(4)})`);
      }
    }
  }
});

test('body text clears AA on the paper ground in both palettes', () => {
  // 4.5:1 is the AA floor for text below 18.66px bold / 24px regular; every
  // reading size in tokens.css is smaller than that.
  for (const [label, palette] of PALETTES) {
    for (const name of ['ink', 'secondary', 'muted']) {
      assert.ok(contrast(name, 'paper', palette) >= 4.5, `${label} ${name} on paper is ${contrast(name, 'paper', palette).toFixed(2)}:1, below AA 4.5:1`);
    }
  }
});

test('the accent and the visited cue are legible as text in both palettes', () => {
  for (const [label, palette] of PALETTES) {
    for (const name of ['accent', 'visited']) {
      assert.ok(contrast(name, 'paper', palette) >= 4.5, `${label} ${name} on paper is ${contrast(name, 'paper', palette).toFixed(2)}:1, below AA 4.5:1`);
    }
  }
});

test('ink drawn on an accent fill clears AA in both palettes', () => {
  // `--color-accent-ink` aliases the paper role, so the ratio is the same
  // measurement read the other way round; asserting both keeps the alias honest.
  for (const [label, palette] of PALETTES) {
    assert.ok(contrast('accent-ink', 'accent', palette) >= 4.5, `${label} accent-ink on accent is ${contrast('accent-ink', 'accent', palette).toFixed(2)}:1, below AA 4.5:1`);
  }
});

test('non-text UI clears the 3:1 graphical floor in both palettes', () => {
  // WCAG 1.4.11: focus indicators and the graph's edges are not text, so 3:1.
  for (const [label, palette] of PALETTES) {
    assert.ok(contrast('focus', 'paper', palette) >= 3, `${label} focus ring on paper is ${contrast('focus', 'paper', palette).toFixed(2)}:1, below 3:1`);
    assert.ok(contrast('edge', 'panel', palette) >= 3, `${label} edge on panel is ${contrast('edge', 'panel', palette).toFixed(2)}:1, below 3:1`);
  }
});

test('the measured ratios are the ones each palette was accepted with', () => {
  // A conversion bug (wrong matrix, sRGB instead of linear input, an inverted
  // ratio) shows up as a plausible-looking number in the wrong place; pinning
  // the documented ratios makes that failure loud.
  const expected = {
    light: [
      ['ink', 'paper', 17.06],
      ['secondary', 'paper', 9.90],
      ['muted', 'paper', 4.55],
      ['accent', 'paper', 4.94],
      ['visited', 'paper', 6.79],
      ['accent-ink', 'accent', 4.94],
    ],
    dark: [
      ['ink', 'paper', 17.06],
      ['secondary', 'paper', 12.02],
      ['muted', 'paper', 6.96],
      ['accent', 'paper', 7.02],
      ['visited', 'paper', 9.67],
      ['accent-ink', 'accent', 7.02],
    ],
  };
  for (const [label, palette] of [['light', light], ['dark', dark]]) {
    for (const [fg, bg, want] of expected[label]) {
      const got = contrast(fg, bg, palette);
      assert.ok(Math.abs(got - want) < 0.02, `${label} ${fg} on ${bg} measures ${got.toFixed(2)}:1, documented as ${want}:1`);
    }
  }
});
