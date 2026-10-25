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
 * Roles are resolved through the derived `var(--color-…)` aliases too, so
 * `--color-focus` and `--color-edge` are gated against what they actually
 * point at rather than against a second copy of the value.
 */

const root = path.resolve('.');
const css = readFileSync(path.join(root, 'tokens.css'), 'utf8');

/** OKLCH triples and `var()` aliases, both keyed by role name. */
const oklch = new Map();
const alias = new Map();
for (const [, role, l, c, h] of css.matchAll(/--color-([a-z-]+):\s*oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/g)) {
  oklch.set(role, [Number(l) / 100, Number(c), Number(h)]);
}
for (const [, role, target] of css.matchAll(/--color-([a-z-]+):\s*var\(--color-([a-z-]+)\)/g)) {
  alias.set(role, target);
}

const ROLES = ['paper', 'panel', 'surface', 'rule', 'ink', 'secondary', 'muted', 'accent', 'visited'];

/** The OKLCH triple for a role, following `var()` aliases to the declaring role. */
function role(name) {
  if (oklch.has(name)) return oklch.get(name);
  if (alias.has(name)) return role(alias.get(name));
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
function luminance(name) {
  const [r, g, b] = linearSrgb(role(name)).map(channel => Math.min(1, Math.max(0, channel)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio, 1–21, order-independent. */
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

test('the nine colour roles the mirror depends on are all authored in OKLCH', () => {
  assert.equal(oklch.size, 9, `tokens.css declares ${oklch.size} OKLCH colour roles, expected 9`);
  assert.deepEqual([...oklch.keys()], ROLES, 'the roles are declared in tokens.css order');
  for (const name of ROLES) {
    for (const channel of linearSrgb(role(name))) {
      // A clipped channel means the authored OKLCH sits outside sRGB and the
      // browser would paint something other than the palette hex.
      assert.ok(channel >= -0.001 && channel <= 1.001, `${name} is inside sRGB (${channel.toFixed(4)})`);
    }
  }
});

test('body text clears AA on the paper ground', () => {
  // 4.5:1 is the AA floor for text below 18.66px bold / 24px regular; every
  // reading size in tokens.css is smaller than that.
  for (const name of ['ink', 'secondary', 'muted']) {
    assert.ok(contrast(name, 'paper') >= 4.5, `${name} on paper is ${contrast(name, 'paper').toFixed(2)}:1, below AA 4.5:1`);
  }
});

test('the accent and the visited cue are legible as text, not just as decoration', () => {
  for (const name of ['accent', 'visited']) {
    assert.ok(contrast(name, 'paper') >= 4.5, `${name} on paper is ${contrast(name, 'paper').toFixed(2)}:1, below AA 4.5:1`);
  }
});

test('ink drawn on an accent fill clears AA', () => {
  // `--color-accent-ink` aliases the paper role, so the ratio is the same
  // measurement read the other way round; asserting both keeps the alias honest.
  assert.ok(contrast('accent-ink', 'accent') >= 4.5, `accent-ink on accent is ${contrast('accent-ink', 'accent').toFixed(2)}:1, below AA 4.5:1`);
});

test('non-text UI clears the 3:1 graphical floor', () => {
  // WCAG 1.4.11: focus indicators and the graph's edges are not text, so 3:1.
  assert.ok(contrast('focus', 'paper') >= 3, `focus ring on paper is ${contrast('focus', 'paper').toFixed(2)}:1, below 3:1`);
  assert.ok(contrast('edge', 'panel') >= 3, `edge on panel is ${contrast('edge', 'panel').toFixed(2)}:1, below 3:1`);
});

test('the measured ratios are the ones this palette was accepted with', () => {
  // A conversion bug (wrong matrix, sRGB instead of linear input, an inverted
  // ratio) shows up as a plausible-looking number in the wrong place; pinning
  // the documented ratios makes that failure loud.
  const expected = [
    ['ink', 'paper', 11.34],
    ['secondary', 'paper', 9.26],
    ['muted', 'paper', 7.37],
    ['accent', 'paper', 8.07],
    ['visited', 'paper', 10.74],
    ['accent-ink', 'accent', 8.07],
  ];
  for (const [fg, bg, want] of expected) {
    const got = contrast(fg, bg);
    assert.ok(Math.abs(got - want) < 0.02, `${fg} on ${bg} measures ${got.toFixed(2)}:1, documented as ${want}:1`);
  }
});
