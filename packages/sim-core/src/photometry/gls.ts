/**
 * Generalised Lomb–Scargle periodogram (floating mean, weights) - Zechmeister & Kürster 2009,
 * A&A 496, 577; multi-harmonic extension as in VanderPlas 2018 (ApJS 236, 16, §6).
 *
 * At each trial frequency f the model  m(t) = c + Σ_{k=1..K} [a_k cos(2πkft) + b_k sin(2πkft)]
 * is fitted by weighted least squares (weights 1/σ_i²). With χ²_0 the residual of the
 * constant-only model and χ²_f the residual at f, the normalised power is
 *     P_GLS(f) = (χ²_0 − χ²_f) / χ²_0 ∈ [0, 1].
 * The power is NOT the probability that the period is right (see false-alarm probability below).
 */
import { gaussianRng } from '../exoplanets/detection';

/** Solve the symmetric positive-definite system A x = b (Gaussian elimination, partial pivoting). */
function solve(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-300) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = s / M[r][r];
  }
  return x;
}

export interface GlsFit {
  /** [c, a1, b1, a2, b2, …] */
  coef: number[];
  chi2: number;
  /** Model magnitude at time t. */
  model: (t: number) => number;
}

/** Weighted least-squares fit of the K-harmonic model at frequency f (cycles per time unit). */
export function glsFit(t: number[], y: number[], dy: number[] | null, f: number, nterms = 1): GlsFit {
  const n = t.length, m = 2 * nterms + 1;
  const w = dy ? dy.map((s) => 1 / (s * s)) : new Array(n).fill(1);
  const A = Array.from({ length: m }, () => new Array(m).fill(0));
  const b = new Array(m).fill(0);
  const basis = (ti: number) => {
    const v = [1];
    for (let k = 1; k <= nterms; k++) { const ph = 2 * Math.PI * k * f * ti; v.push(Math.cos(ph), Math.sin(ph)); }
    return v;
  };
  for (let i = 0; i < n; i++) {
    const v = basis(t[i]);
    for (let p = 0; p < m; p++) {
      b[p] += w[i] * v[p] * y[i];
      for (let q = p; q < m; q++) A[p][q] += w[i] * v[p] * v[q];
    }
  }
  for (let p = 0; p < m; p++) for (let q = 0; q < p; q++) A[p][q] = A[q][p];
  const coef = solve(A, b) ?? [b[0] / A[0][0], ...new Array(m - 1).fill(0)];
  const model = (ti: number) => basis(ti).reduce((s, v, k) => s + v * coef[k], 0);
  let chi2 = 0;
  for (let i = 0; i < n; i++) chi2 += w[i] * (y[i] - model(t[i])) ** 2;
  return { coef, chi2, model };
}

/** χ²_0 of the constant (weighted-mean) model. */
export function chi2Constant(y: number[], dy: number[] | null): number {
  const w = dy ? dy.map((s) => 1 / (s * s)) : y.map(() => 1);
  const W = w.reduce((a, b) => a + b, 0);
  const mean = y.reduce((s, v, i) => s + w[i] * v, 0) / W;
  return y.reduce((s, v, i) => s + w[i] * (v - mean) ** 2, 0);
}

/** GLS power on a frequency grid. */
export function glsPeriodogram(t: number[], y: number[], dy: number[] | null, freqs: number[], nterms = 1): number[] {
  const chi0 = chi2Constant(y, dy);
  return freqs.map((f) => (chi0 > 0 ? (chi0 - glsFit(t, y, dy, f, nterms).chi2) / chi0 : 0));
}

/** Uniform frequency grid, oversampled relative to the resolution 1/T (VanderPlas 2018 §7.1). */
export function frequencyGrid(t: number[], fMin: number, fMax: number, oversample = 8): number[] {
  const T = Math.max(...t) - Math.min(...t);
  const df = 1 / (oversample * Math.max(T, 1e-9));
  const out: number[] = [];
  for (let f = fMin; f <= fMax; f += df) out.push(f);
  return out;
}

export interface Peak { f: number; P: number; power: number; alias?: string }

/**
 * The `count` highest local maxima, separated by at least `minSep` in frequency. Each candidate
 * is tagged when it lies at f_best ± k·(1 day⁻¹) (daily-sampling alias, k = 1, 2) or at a
 * harmonic/sub-harmonic of the best peak (2f, f/2), within `tol` (default: the resolution 1/T).
 */
export function topPeaks(freqs: number[], power: number[], count = 4, minSep = 0, tol = 0): Peak[] {
  const loc: Peak[] = [];
  for (let i = 1; i < power.length - 1; i++) if (power[i] >= power[i - 1] && power[i] >= power[i + 1]) loc.push({ f: freqs[i], P: 1 / freqs[i], power: power[i] });
  loc.sort((a, b) => b.power - a.power);
  const out: Peak[] = [];
  for (const p of loc) {
    if (out.every((q) => Math.abs(q.f - p.f) > minSep)) out.push(p);
    if (out.length >= count) break;
  }
  const best = out[0];
  if (best) for (const p of out.slice(1)) {
    for (const k of [1, 2]) if (Math.abs(Math.abs(p.f - best.f) - k) < tol) p.alias = `f ± ${k} d⁻¹`;
    if (!p.alias && Math.abs(p.f - 2 * best.f) < tol) p.alias = '2f';
    if (!p.alias && Math.abs(p.f - best.f / 2) < tol) p.alias = 'f/2';
  }
  return out;
}

/**
 * False-alarm probability of the highest peak by bootstrap (VanderPlas 2018 §7.4.2):
 * resample magnitudes with replacement at the original times, record the maximum power,
 * FAP = fraction of bootstrap maxima ≥ the observed maximum. Resolution 1/nBoot.
 */
export function bootstrapFap(t: number[], y: number[], dy: number[] | null, freqs: number[], observedMax: number, nBoot = 100, nterms = 1, seed = 1): { fap: number; nBoot: number; exceed: number } {
  const rng = gaussianRng(seed);
  let exceed = 0;
  for (let b = 0; b < nBoot; b++) {
    const idx = t.map(() => Math.floor(rng.uniform() * t.length));
    const yb = idx.map((i) => y[i]);
    const db = dy ? idx.map((i) => dy[i]) : null;
    const pw = glsPeriodogram(t, yb, db, freqs, nterms);
    if (Math.max(...pw) >= observedMax) exceed++;
  }
  return { fap: exceed / nBoot, nBoot, exceed };
}

/**
 * Intensity-averaged mean magnitude ⟨m⟩ = −2.5 log10 ⟨10^{−0.4 m(φ)}⟩ over one cycle of a
 * fitted model - the mean used for Cepheid period–luminosity relations (not the mean of
 * instantaneous magnitudes).
 */
export function intensityMeanMag(model: (t: number) => number, P: number, n = 400): number {
  let s = 0;
  for (let i = 0; i < n; i++) s += 10 ** (-0.4 * model(((i + 0.5) / n) * P));
  return -2.5 * Math.log10(s / n);
}

/**
 * Leavitt law, V band, classical Cepheids - Benedict et al. 2007, AJ 133, 1810:
 *   M_V = a (log10 P − 1) + b,  a = −2.43 ± 0.12,  b = −4.05 ± 0.02  (P in days).
 * σ_M propagates only the coefficient uncertainties (assumed uncorrelated); the intrinsic scatter
 * of the relation is NOT included (TODO: cần xác minh the published rms before adding it).
 */
export function leavittMV(periodDays: number) {
  const x = Math.log10(periodDays) - 1;
  const M = -2.43 * x - 4.05;
  const sigma = Math.hypot(0.12 * x, 0.02);
  return { M, sigma };
}

/**
 * Extinction-corrected distance modulus μ0 = m_V − A_V − M_V and d = 10^{(μ0+5)/5} pc,
 * with σ_d/d = (ln 10 / 5) σ_μ.
 */
export function cepheidDistance(mV: number, MV: number, AV: number, sigmaMu = 0) {
  const mu0 = mV - AV - MV;
  const d = 10 ** ((mu0 + 5) / 5);
  return { mu0, d, sigmaD: d * (Math.LN10 / 5) * sigmaMu };
}
