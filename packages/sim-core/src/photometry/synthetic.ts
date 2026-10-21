/**
 * Synthetic photometric time series for A5 (clearly labelled synthetic in the UI).
 * Shape: illustrative template (templateMag) mapped linearly onto the catalogue V range.
 * Sampling: random nights within the baseline, one epoch per sample between 18 h and 05 h local
 * (night-time only → produces 1 d⁻¹ aliases, as in real ground-based campaigns).
 * Noise: white Gaussian, σ in magnitudes, seeded.
 */
import { templateMag, type VariableKind } from './periodogram';
import { gaussianRng } from '../exoplanets/detection';
import type { VariableStarPreset } from '../data/variableStars';

const range = new Map<VariableKind, [number, number]>();
function templateRange(kind: VariableKind): [number, number] {
  let r = range.get(kind);
  if (!r) {
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < 4000; i++) { const v = templateMag(kind, i / 4000); lo = Math.min(lo, v); hi = Math.max(hi, v); }
    r = [lo, hi];
    range.set(kind, r);
  }
  return r;
}

function rawMag(star: VariableStarPreset, ph: number): number {
  const [lo, hi] = templateRange(star.kind);
  return star.vBright + ((templateMag(star.kind, ph) - lo) / (hi - lo)) * (star.vFaint - star.vBright);
}

const shiftCache = new Map<string, number>();
/** Offset so that the template's intensity-mean ⟨V⟩ equals the catalogue value (amplitude preserved). */
function meanShift(star: VariableStarPreset): number {
  if (star.meanV === undefined) return 0;
  let s = shiftCache.get(star.id);
  if (s === undefined) {
    let acc = 0;
    for (let i = 0; i < 4000; i++) acc += 10 ** (-0.4 * rawMag(star, (i + 0.5) / 4000));
    s = star.meanV - -2.5 * Math.log10(acc / 4000);
    shiftCache.set(star.id, s);
  }
  return s;
}

/**
 * Noise-free V magnitude of the synthetic star at time t [days] (phase 0 at t = 0): template mapped onto
 * the catalogue amplitude, shifted so the intensity mean equals the catalogue ⟨V⟩ when known.
 */
export function syntheticMag(star: VariableStarPreset, t: number): number {
  const ph = (((t / star.P) % 1) + 1) % 1;
  return rawMag(star, ph) + meanShift(star);
}

export interface SyntheticSeries { t: number[]; y: number[]; dy: number[] }

export function syntheticSeries(star: VariableStarPreset, n: number, baselineDays: number, sigma: number, seed: number): SyntheticSeries {
  const rng = gaussianRng(seed);
  const pts: [number, number][] = [];
  for (let k = 0; k < n; k++) {
    const night = Math.floor(rng.uniform() * baselineDays);
    const ti = night + (18 + rng.uniform() * 11) / 24;
    pts.push([ti, syntheticMag(star, ti) + sigma * rng.normal()]);
  }
  pts.sort((a, b) => a[0] - b[0]);
  return { t: pts.map((p) => p[0]), y: pts.map((p) => p[1]), dy: pts.map(() => Math.max(sigma, 1e-4)) };
}
