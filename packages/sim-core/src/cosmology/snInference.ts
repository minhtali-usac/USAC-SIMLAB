/**
 * Cosmological parameter inference from SN Ia distance moduli (developed from lss-lab's "How we infer model
 * parameters", github.com/MinhMPA/lss-lab, rebuilt on real data).
 *
 *  μ(z) = 5 log10(d_L / 1 Mpc) + 25,  d_L = (1 + z) D_M,  D_C = D_H ∫₀^z dz′/E(z′),  D_H = c/H₀ (H₀ = 70: the Union2.1
 *  standardisation; any other H₀ or M is absorbed by the marginalised offset).
 *  Models (radiation neglected - < 0.01 mag at z < 1.5):
 *    'olcdm': E² = Ωm(1+z)³ + Ωk(1+z)² + ΩΛ, Ωk = 1 − Ωm − ΩΛ   (parameters Ωm, ΩΛ)
 *    'wcdm' : E² = Ωm(1+z)³ + (1 − Ωm)(1+z)^{3(1+w)}, flat        (parameters Ωm, w)
 *  χ² with the additive offset (absolute magnitude M ⊕ H₀) removed analytically: χ² = A − B²/C with
 *  A = Σ Δᵢ²/σᵢ², B = Σ Δᵢ/σᵢ², C = Σ 1/σᵢ² (Goliath et al. 2001, A&A 380, 6). Diagonal errors only.
 *  Contours: Δχ² = 2.30 / 6.18 / 11.83 for 68.3 / 95.4 / 99.73 % with two parameters (Press et al., Numerical Recipes §15.6).
 */
import { mulberry32 } from './lss';

export type SnModel = 'olcdm' | 'wcdm';
export interface SnData { z: Float64Array; mu: Float64Array; err: Float64Array; n: number }

const C_KMS = 299792.458;
export const DH70 = C_KMS / 70; // Mpc
export const DCHI2_2D = [2.30, 6.18, 11.83] as const;

export function e2(model: SnModel, p1: number, p2: number, z: number): number {
  const x = 1 + z;
  if (model === 'olcdm') return p1 * x * x * x + (1 - p1 - p2) * x * x + p2;
  return p1 * x * x * x + (1 - p1) * Math.pow(x, 3 * (1 + p2));
}

/**
 * Distance moduli (H₀ = 70) at ascending redshifts zs by composite Simpson integration of 1/E between successive
 * redshifts (sub-steps ≤ 0.01). Returns null if E² ≤ 0 somewhere on [0, z_max] (no big bang / bounce).
 */
export function muModel(model: SnModel, p1: number, p2: number, zs: ArrayLike<number>, out?: Float64Array): Float64Array | null {
  const n = zs.length, mu = out ?? new Float64Array(n);
  const Ok = model === 'olcdm' ? 1 - p1 - p2 : 0, k = Math.sqrt(Math.abs(Ok));
  const invE = (z: number) => { const q = e2(model, p1, p2, z); return q > 0 ? 1 / Math.sqrt(q) : NaN; };
  let zPrev = 0, I = 0, fPrev = invE(0);
  for (let i = 0; i < n; i++) {
    const z = zs[i], dz = z - zPrev;
    if (dz > 0) {
      const m = 2 * Math.max(1, Math.ceil(dz / 0.02)), h = dz / m;
      let s = fPrev;
      for (let j = 1; j < m; j++) s += (j % 2 ? 4 : 2) * invE(zPrev + j * h);
      const fz = invE(z);
      s += fz;
      if (!Number.isFinite(s)) return null;
      I += (s * h) / 3;
      zPrev = z; fPrev = fz;
    }
    const DM = Ok > 1e-9 ? Math.sinh(k * I) / k : Ok < -1e-9 ? Math.sin(k * I) / k : I;
    if (DM <= 0) return null;
    mu[i] = 5 * Math.log10((1 + z) * DH70 * DM) + 25;
  }
  return mu;
}

/** Offset-marginalised χ² and the best-fit offset (μ_obs − μ_model) for one model point; Infinity if unphysical. */
export function chi2Sn(data: SnData, model: SnModel, p1: number, p2: number, scratch?: Float64Array) {
  const m = muModel(model, p1, p2, data.z, scratch);
  if (!m) return { chi2: Infinity, offset: NaN };
  let A = 0, B = 0, C = 0;
  for (let i = 0; i < data.n; i++) {
    const w = 1 / (data.err[i] * data.err[i]), d = data.mu[i] - m[i];
    A += d * d * w; B += d * w; C += w;
  }
  return { chi2: A - (B * B) / C, offset: B / C };
}

export interface SnGrid { n1: number; n2: number; r1: [number, number]; r2: [number, number]; chi2: Float64Array; min: number; best: [number, number] }

/** χ² on an n1 × n2 grid (index j·n1 + i ↔ p1 = r1 lerp i, p2 = r2 lerp j). */
export function chi2Grid(data: SnData, model: SnModel, r1: [number, number], r2: [number, number], n1: number, n2: number): SnGrid {
  const chi2 = new Float64Array(n1 * n2), scratch = new Float64Array(data.n);
  let min = Infinity, best: [number, number] = [NaN, NaN];
  for (let j = 0; j < n2; j++) for (let i = 0; i < n1; i++) {
    const p1 = r1[0] + ((r1[1] - r1[0]) * i) / (n1 - 1), p2 = r2[0] + ((r2[1] - r2[0]) * j) / (n2 - 1);
    const c = chi2Sn(data, model, p1, p2, scratch).chi2;
    chi2[j * n1 + i] = c;
    if (c < min) { min = c; best = [p1, p2]; }
  }
  return { n1, n2, r1, r2, chi2, min, best };
}

/** Deceleration parameter today: q₀ = Ωm/2 − ΩΛ (olcdm) or ½[1 + 3w(1 − Ωm)] (flat wCDM). */
export const q0 = (model: SnModel, p1: number, p2: number) => (model === 'olcdm' ? p1 / 2 - p2 : 0.5 * (1 + 3 * p2 * (1 - p1)));

/** Posterior summaries from a χ² grid with flat priors: marginal means/σ and P(q₀ < 0). */
export function gridPosterior(g: SnGrid, model: SnModel) {
  let Z = 0, m1 = 0, m2 = 0, s1 = 0, s2 = 0, acc = 0;
  for (let j = 0; j < g.n2; j++) for (let i = 0; i < g.n1; i++) {
    const c = g.chi2[j * g.n1 + i];
    if (!Number.isFinite(c)) continue;
    const w = Math.exp(-0.5 * (c - g.min));
    const p1 = g.r1[0] + ((g.r1[1] - g.r1[0]) * i) / (g.n1 - 1), p2 = g.r2[0] + ((g.r2[1] - g.r2[0]) * j) / (g.n2 - 1);
    Z += w; m1 += w * p1; m2 += w * p2; s1 += w * p1 * p1; s2 += w * p2 * p2;
    if (q0(model, p1, p2) < 0) acc += w;
  }
  m1 /= Z; m2 /= Z;
  return { mean: [m1, m2] as [number, number], sd: [Math.sqrt(Math.max(0, s1 / Z - m1 * m1)), Math.sqrt(Math.max(0, s2 / Z - m2 * m2))] as [number, number], pAccel: acc / Z };
}

/** 1D profile for flat ΛCDM (ΩΛ = 1 − Ωm): best Ωm and the Δχ² = 1 interval. */
export function flatLcdmFit(data: SnData, lo = 0.05, hi = 0.8, n = 751) {
  const scratch = new Float64Array(data.n), om: number[] = [], c: number[] = [];
  for (let i = 0; i < n; i++) { const x = lo + ((hi - lo) * i) / (n - 1); om.push(x); c.push(chi2Sn(data, 'olcdm', x, 1 - x, scratch).chi2); }
  let k = 0;
  for (let i = 1; i < n; i++) if (c[i] < c[k]) k = i;
  const lim = c[k] + 1;
  let a = k, b = k;
  while (a > 0 && c[a] < lim) a--;
  while (b < n - 1 && c[b] < lim) b++;
  return { om: om[k], chi2: c[k], lo: om[a], hi: om[b] };
}

/** Mock catalogue: same z and σ as `like`, μ drawn from the model plus Gaussian noise (seeded). */
export function mockSn(like: SnData, model: SnModel, p1: number, p2: number, seed: number): SnData {
  const m = muModel(model, p1, p2, like.z)!, r = mulberry32(seed), mu = new Float64Array(like.n);
  for (let i = 0; i < like.n; i++) {
    const g = Math.sqrt(-2 * Math.log(r() || 1e-12)) * Math.cos(2 * Math.PI * r());
    mu[i] = m[i] + like.err[i] * g;
  }
  return { z: like.z, mu, err: like.err, n: like.n };
}

/** Random-walk Metropolis sampler (Gaussian proposals with per-parameter step), seeded and resumable. */
export function metropolis(logp: (x: number[]) => number, x0: number[], step: number[], seed: number) {
  const r = mulberry32(seed);
  let x = x0.slice(), lp = logp(x), nAcc = 0, nTot = 0;
  const gauss = () => Math.sqrt(-2 * Math.log(r() || 1e-12)) * Math.cos(2 * Math.PI * r());
  return {
    next() {
      const y = x.map((v, i) => v + step[i] * gauss()), ly = logp(y);
      nTot++;
      const accepted = Number.isFinite(ly) && Math.log(r() || 1e-300) < ly - lp;
      if (accepted) { x = y; lp = ly; nAcc++; }
      return { x: x.slice(), proposal: y, accepted, logp: lp };
    },
    get acceptance() { return nTot ? nAcc / nTot : 0; },
    set(xn: number[]) { x = xn.slice(); lp = logp(x); },
  };
}
