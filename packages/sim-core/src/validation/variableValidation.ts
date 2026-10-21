/**
 * Reproducible validation of the A5 period-search and distance chain (npm run validate:var).
 * 1. GLS implementation vs an independent closed-form implementation (Zechmeister & Kürster 2009, eqs. 5–20).
 * 2. Period recovery Monte Carlo on synthetic series: N, baseline T, σ, nterms, per star kind.
 * 3. δ Cephei distance chain vs the HST parallax distance (single point check).
 */
import { glsPeriodogram, frequencyGrid, topPeaks, intensityMeanMag, leavittMV, cepheidDistance, glsFit } from '../photometry/gls';
import { syntheticSeries, syntheticMag } from '../photometry/synthetic';
import { VARIABLE_STARS } from '../data/variableStars';
import { gaussianRng } from '../exoplanets/detection';

/** Independent single-harmonic GLS power, closed form of Zechmeister & Kürster (2009). */
export function glsClosedForm(t: number[], y: number[], dy: number[], f: number): number {
  const w0 = dy.map((s) => 1 / (s * s));
  const W = w0.reduce((a, b) => a + b, 0);
  const w = w0.map((x) => x / W);
  const om = 2 * Math.PI * f;
  let Y = 0, C = 0, S = 0, YYh = 0, YCh = 0, YSh = 0, CCh = 0, SSh = 0, CSh = 0;
  for (let i = 0; i < t.length; i++) {
    const c = Math.cos(om * t[i]), s = Math.sin(om * t[i]);
    Y += w[i] * y[i]; C += w[i] * c; S += w[i] * s;
    YYh += w[i] * y[i] * y[i]; YCh += w[i] * y[i] * c; YSh += w[i] * y[i] * s;
    CCh += w[i] * c * c; SSh += w[i] * s * s; CSh += w[i] * c * s;
  }
  const YY = YYh - Y * Y, YC = YCh - Y * C, YS = YSh - Y * S, CC = CCh - C * C, SS = SSh - S * S, CS = CSh - C * S;
  const D = CC * SS - CS * CS;
  return (SS * YC * YC + CC * YS * YS - 2 * CS * YC * YS) / (YY * D);
}

export function validateGlsImplementation() {
  const rng = gaussianRng(7);
  let maxDiff = 0;
  for (let trial = 0; trial < 20; trial++) {
    const n = 30 + Math.floor(rng.uniform() * 100);
    const t = Array.from({ length: n }, () => rng.uniform() * 60).sort((a, b) => a - b);
    const dy = t.map(() => 0.01 + 0.09 * rng.uniform());
    const y = t.map((ti, i) => 4 + 0.4 * Math.sin(2 * Math.PI * ti / (1 + 9 * rng.uniform())) + dy[i] * rng.normal());
    const freqs = frequencyGrid(t, 0.05, 2.5, 4);
    const p = glsPeriodogram(t, y, dy, freqs, 1);
    for (let k = 0; k < freqs.length; k += 7) maxDiff = Math.max(maxDiff, Math.abs(p[k] - glsClosedForm(t, y, dy, freqs[k])));
  }
  // noise-free sinusoid: the peak must land on the true frequency with power → 1
  const t = Array.from({ length: 60 }, (_, i) => i * 0.83 + 0.2 * Math.sin(i));
  const y = t.map((x) => 5 + 0.3 * Math.cos((2 * Math.PI * x) / 3.7));
  const fr = frequencyGrid(t, 0.05, 1, 20);
  const pw = glsPeriodogram(t, y, null, fr, 1);
  const i = pw.indexOf(Math.max(...pw));
  return { maxAbsPowerDiffVsClosedForm: maxDiff, noiseFreePeakPeriod: 1 / fr[i], noiseFreePeakPower: pw[i] };
}

export interface RecoveryCell { star: string; N: number; T: number; sigma: number; nterms: number; runs: number; recovered: number; aliasOrHarmonic: number; medianRelErr: number }

/**
 * A run "recovers" the period when the highest GLS peak lies within 1 % of P_ref.
 * Wrong peaks are classified as alias/harmonic when within 3 resolution elements of
 * f_ref ± 1, 2 d⁻¹, 2 f_ref or f_ref/2.
 */
export function periodRecovery(opts: { Ns?: number[]; Ts?: number[]; sigmas?: number[]; nterms?: number[]; runs?: number; stars?: string[] } = {}): RecoveryCell[] {
  const Ns = opts.Ns ?? [20, 40, 80, 160], Ts = opts.Ts ?? [10, 40, 120], sigmas = opts.sigmas ?? [0.01, 0.03, 0.1];
  const nts = opts.nterms ?? [1], runs = opts.runs ?? 20;
  const stars = VARIABLE_STARS.filter((s) => !opts.stars || opts.stars.includes(s.id));
  const out: RecoveryCell[] = [];
  for (const star of stars) for (const nterms of nts) for (const N of Ns) for (const T of Ts) for (const sigma of sigmas) {
    let rec = 0, ali = 0;
    const errs: number[] = [];
    for (let r = 0; r < runs; r++) {
      const s = syntheticSeries(star, N, T, sigma, 1000 + r * 7919 + N);
      const freqs = frequencyGrid(s.t, 1 / 25, 2.5, 8);
      const pw = glsPeriodogram(s.t, s.y, s.dy, freqs, nterms);
      const [best] = topPeaks(freqs, pw, 1);
      const rel = Math.abs(best.P / star.P - 1);
      errs.push(rel);
      if (rel < 0.01) rec++;
      else {
        const fr = 1 / star.P, tol = 3 / T;
        if ([fr + 1, Math.abs(fr - 1), fr + 2, Math.abs(fr - 2), 2 * fr, fr / 2].some((fa) => Math.abs(best.f - fa) < tol)) ali++;
      }
    }
    errs.sort((a, b) => a - b);
    out.push({ star: star.id, N, T, sigma, nterms, runs, recovered: rec, aliasOrHarmonic: ali, medianRelErr: errs[Math.floor(errs.length / 2)] });
  }
  return out;
}

/** Point check of the full chain for δ Cephei with noise-free inputs at P_ref. */
export function deltaCepDistanceCheck() {
  const star = VARIABLE_STARS.find((s) => s.id === 'dcep')!;
  const meanV = intensityMeanMag((t) => syntheticMag(star, t), star.P, 2000);
  const { M, sigma } = leavittMV(star.P);
  const AV = star.AV ?? 0;
  const res = cepheidDistance(meanV, M, AV, sigma);
  const ref = star.refDistancePc!;
  // same chain from a noisy synthetic series: GLS (3 harmonics) → ⟨V⟩ from the fitted model
  const s = syntheticSeries(star, 120, 60, 0.02, 42);
  const fit = glsFit(s.t, s.y, s.dy, 1 / star.P, 3);
  const meanVfit = intensityMeanMag(fit.model, star.P);
  return { meanV, meanVfromFit: meanVfit, MV: M, sigmaMV: sigma, AV, mu0: res.mu0, d: res.d, sigmaD: res.sigmaD, ref, relDiff: res.d / ref.d - 1, nSigma: (res.d - ref.d) / Math.hypot(ref.sigma, res.sigmaD) };
}
