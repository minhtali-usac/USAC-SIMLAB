/**
 * Period search for unevenly sampled light curves.
 * Lomb–Scargle periodogram: Lomb 1976 (Ap&SS 39, 447), Scargle 1982 (ApJ 263, 835);
 * normalised by the sample variance (Horne & Baliunas 1986). VanderPlas 2018 (ApJS 236, 16) for practice.
 * Cepheid period–luminosity relation: Benedict et al. 2007, AJ 133, 1810 (HST parallaxes):
 *   M_V = −2.43 (log P − 1) − 4.05.
 */
import { TWO_PI } from '../units/convert';

export function lombScargle(t: number[], y: number[], freqs: number[]): number[] {
  const n = t.length;
  const mean = y.reduce((a, b) => a + b, 0) / n;
  const yc = y.map((v) => v - mean);
  const variance = yc.reduce((a, b) => a + b * b, 0) / (n - 1);
  return freqs.map((f) => {
    const w = TWO_PI * f;
    let s2 = 0, c2 = 0;
    for (let i = 0; i < n; i++) { s2 += Math.sin(2 * w * t[i]); c2 += Math.cos(2 * w * t[i]); }
    const tau = Math.atan2(s2, c2) / (2 * w);
    let yc_c = 0, yc_s = 0, cc = 0, ss = 0;
    for (let i = 0; i < n; i++) {
      const arg = w * (t[i] - tau);
      const c = Math.cos(arg), s = Math.sin(arg);
      yc_c += yc[i] * c; yc_s += yc[i] * s; cc += c * c; ss += s * s;
    }
    return (0.5 * ((yc_c * yc_c) / cc + (yc_s * yc_s) / ss)) / variance;
  });
}

/** Phase-fold times by period P with epoch t0 → phases in [0,1). */
export const fold = (t: number[], P: number, t0 = 0) => t.map((x) => (((x - t0) / P) % 1 + 1) % 1);

/** Cepheid absolute V magnitude from period [days] (Benedict et al. 2007). */
export const cepheidAbsMagV = (periodDays: number) => -2.43 * (Math.log10(periodDays) - 1) - 4.05;

/** Distance [pc] from apparent magnitude m, absolute magnitude M and extinction A. */
export const distanceFromModulus = (m: number, M: number, A = 0) => 10 ** ((m - M - A + 5) / 5);

export type VariableKind = 'cepheid' | 'rrlyrae' | 'eclipsing';

/**
 * Synthetic light-curve templates (magnitude offset vs phase). These are ILLUSTRATIVE
 * shapes (Fourier / Gaussian), not fitted to a specific star - labelled as synthetic in the UI.
 */
export function templateMag(kind: VariableKind, phase: number): number {
  const p = TWO_PI * phase;
  switch (kind) {
    case 'cepheid':
      // fast rise, slow decline (Fourier amplitudes typical of classical Cepheids, R21≈0.4)
      return 0.36 * Math.cos(p) + 0.14 * Math.cos(2 * p + 4.2 - Math.PI) + 0.06 * Math.cos(3 * p + 2.0) + 0.02 * Math.cos(4 * p + 5.5);
    case 'rrlyrae':
      return 0.42 * Math.cos(p) + 0.21 * Math.cos(2 * p + 0.6) + 0.13 * Math.cos(3 * p + 1.3) + 0.08 * Math.cos(4 * p + 2.0) + 0.05 * Math.cos(5 * p + 2.7);
    case 'eclipsing': {
      const d1 = Math.min(Math.abs(phase), Math.abs(phase - 1));
      const d2 = Math.abs(phase - 0.5);
      return 1.3 * Math.exp(-0.5 * (d1 / 0.035) ** 2) + 0.06 * Math.exp(-0.5 * (d2 / 0.035) ** 2);
    }
  }
}
