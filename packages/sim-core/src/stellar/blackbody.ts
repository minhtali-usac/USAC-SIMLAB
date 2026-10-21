/**
 * Blackbody radiation and its perceived colour.
 * Planck's law B_λ(T) = 2hc²/λ⁵ · 1/(exp(hc/λkT) − 1).
 * Colour: CIE 1931 2° colour-matching functions via the multi-lobe Gaussian fit of
 * Wyman, Sloan & Shirley (2013), JCGT 2(2); XYZ → linear sRGB (IEC 61966-2-1, D65).
 * The colour is normalised (chromaticity only) - brightness is handled by the caller.
 */
import { C, H_PLANCK, K_B } from '../units/constants';

export function planckLambda(lambdaM: number, T: number): number {
  const a = (2 * H_PLANCK * C * C) / lambdaM ** 5;
  const x = (H_PLANCK * C) / (lambdaM * K_B * T);
  return a / Math.expm1(x);
}

/** Wien displacement: λ_max = b/T, b = 2.897771955×10⁻³ m K (CODATA 2018). */
export const wienPeakMeters = (T: number) => 2.897_771_955e-3 / T;

const g = (x: number, mu: number, s1: number, s2: number) => {
  const t = (x - mu) / (x < mu ? s1 : s2);
  return Math.exp(-0.5 * t * t);
};
export const cieX = (l: number) => 1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2);
export const cieY = (l: number) => 0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1);
export const cieZ = (l: number) => 1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8);

const toSrgb = (c: number) => (c <= 0.003_130_8 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/** sRGB colour (0…1 per channel, max channel = 1) of a blackbody at temperature T [K]. */
export function blackbodyRgb(T: number): [number, number, number] {
  let X = 0, Y = 0, Z = 0;
  for (let l = 380; l <= 780; l += 5) {
    const B = planckLambda(l * 1e-9, T);
    X += B * cieX(l); Y += B * cieY(l); Z += B * cieZ(l);
  }
  let r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z;
  let gg = -0.9689 * X + 1.8758 * Y + 0.0415 * Z;
  let b = 0.0557 * X - 0.204 * Y + 1.057 * Z;
  r = Math.max(0, r); gg = Math.max(0, gg); b = Math.max(0, b);
  const m = Math.max(r, gg, b) || 1;
  return [toSrgb(r / m), toSrgb(gg / m), toSrgb(b / m)];
}

const cache = new Map<number, string>();
/** CSS colour string for a blackbody (temperature rounded to 50 K and cached). */
export function blackbodyCss(T: number): string {
  const key = Math.round(Math.min(Math.max(T, 800), 60000) / 50) * 50;
  let s = cache.get(key);
  if (!s) {
    const [r, g2, b] = blackbodyRgb(key);
    s = `rgb(${Math.round(r * 255)},${Math.round(g2 * 255)},${Math.round(b * 255)})`;
    cache.set(key, s);
  }
  return s;
}
