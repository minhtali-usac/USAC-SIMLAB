/**
 * Instants of the principal lunar phases - Meeus, Astronomical Algorithms 2nd ed., ch. 49
 * (mean phase + periodic terms + 14 planetary arguments). Meeus quotes a mean error of
 * ~3.7 s against ELP-2000/82 for 1980–2020; our own validation against JPL Horizons is in
 * docs/validation/A3-moon.json (run `npm run validate:moon`).
 *
 * Phase is defined by the apparent geocentric ecliptic longitude difference λ☾ − λ☉
 * = 0° (new), 90° (first quarter), 180° (full), 270° (last quarter).
 */
import { DEG } from '../units/convert';
import { deltaTSeconds, jdToDate } from '../time/julian';

export type PrincipalPhase = 0 | 90 | 180 | 270;

const s = (x: number) => Math.sin(x * DEG);
const c = (x: number) => Math.cos(x * DEG);

/** JDE (TT) of the phase with lunation number k (k integer + 0, .25, .5, .75; k = 0 ↔ new moon of 2000-01-06). */
export function phaseJde(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T, T3 = T2 * T, T4 = T3 * T;
  let jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T2 - 0.00000015 * T3 + 0.00000000073 * T4;
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const M = 2.5534 + 29.1053567 * k - 0.0000014 * T2 - 0.00000011 * T3;
  const Mp = 201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4;
  const F = 160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4;
  const Om = 124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3;
  const frac = Math.round((k - Math.floor(k)) * 4) % 4; // 0 new, 1 first q., 2 full, 3 last q.

  if (frac === 0 || frac === 2) {
    const nm = frac === 0;
    jde +=
      (nm ? -0.4072 : -0.40614) * s(Mp) +
      (nm ? 0.17241 : 0.17302) * E * s(M) +
      (nm ? 0.01608 : 0.01614) * s(2 * Mp) +
      (nm ? 0.01039 : 0.01043) * s(2 * F) +
      (nm ? 0.00739 : 0.00734) * E * s(Mp - M) -
      (nm ? 0.00514 : 0.00515) * E * s(Mp + M) +
      (nm ? 0.00208 : 0.00209) * E * E * s(2 * M) -
      0.00111 * s(Mp - 2 * F) -
      0.00057 * s(Mp + 2 * F) +
      0.00056 * E * s(2 * Mp + M) -
      0.00042 * s(3 * Mp) +
      0.00042 * E * s(M + 2 * F) +
      0.00038 * E * s(M - 2 * F) -
      0.00024 * E * s(2 * Mp - M) -
      0.00017 * s(Om) -
      0.00007 * s(Mp + 2 * M) +
      0.00004 * s(2 * Mp - 2 * F) +
      0.00004 * s(3 * M) +
      0.00003 * s(Mp + M - 2 * F) +
      0.00003 * s(2 * Mp + 2 * F) -
      0.00003 * s(Mp + M + 2 * F) +
      0.00003 * s(Mp - M + 2 * F) -
      0.00002 * s(Mp - M - 2 * F) -
      0.00002 * s(3 * Mp + M) +
      0.00002 * s(4 * Mp);
  } else {
    jde +=
      -0.62801 * s(Mp) +
      0.17172 * E * s(M) -
      0.01183 * E * s(Mp + M) +
      0.00862 * s(2 * Mp) +
      0.00804 * s(2 * F) +
      0.00454 * E * s(Mp - M) +
      0.00204 * E * E * s(2 * M) -
      0.0018 * s(Mp - 2 * F) -
      0.0007 * s(Mp + 2 * F) -
      0.0004 * s(3 * Mp) -
      0.00034 * E * s(2 * Mp - M) +
      0.00032 * E * s(M + 2 * F) +
      0.00032 * E * s(M - 2 * F) -
      0.00028 * E * E * s(Mp + 2 * M) +
      0.00027 * E * s(2 * Mp + M) -
      0.00017 * s(Om) -
      0.00005 * s(Mp - M - 2 * F) +
      0.00004 * s(2 * Mp + 2 * F) -
      0.00004 * s(Mp + M + 2 * F) +
      0.00004 * s(Mp - 2 * M) +
      0.00003 * s(Mp + M - 2 * F) +
      0.00003 * s(3 * M) +
      0.00002 * s(2 * Mp - 2 * F) +
      0.00002 * s(Mp - M + 2 * F) -
      0.00002 * s(3 * Mp + M);
    const W = 0.00306 - 0.00038 * E * c(M) + 0.00026 * c(Mp) - 0.00002 * c(Mp - M) + 0.00002 * c(Mp + M) + 0.00002 * c(2 * F);
    jde += frac === 1 ? W : -W;
  }

  // additional corrections for all phases (planetary arguments A1…A14)
  const A = [
    299.77 + 0.107408 * k - 0.009173 * T2, 251.88 + 0.016321 * k, 251.83 + 26.651886 * k, 349.42 + 36.412478 * k,
    84.66 + 18.206239 * k, 141.74 + 53.303771 * k, 207.14 + 2.453732 * k, 154.84 + 7.30686 * k, 34.52 + 27.261239 * k,
    207.19 + 0.121824 * k, 291.34 + 1.844379 * k, 161.72 + 24.198154 * k, 239.56 + 25.513099 * k, 331.55 + 3.592518 * k,
  ];
  const K = [0.000325, 0.000165, 0.000164, 0.000126, 0.00011, 0.000062, 0.00006, 0.000056, 0.000047, 0.000042, 0.00004, 0.000037, 0.000035, 0.000023];
  for (let i = 0; i < 14; i++) jde += K[i] * s(A[i]);
  return jde;
}

/** JD (UT) of a phase from its lunation number. */
export function phaseJdUt(k: number): number {
  const jde = phaseJde(k);
  return jde - deltaTSeconds(jdToDate(jde).getUTCFullYear() + 0.5) / 86400;
}

/** First principal phase of the given kind at or after jdUt. */
export function nextPrincipalPhase(jdUt: number, phase: PrincipalPhase): number {
  const q = phase / 360;
  let k = Math.floor((jdUt - 2451550.09766) / 29.530588861 - q) + q;
  let jd = phaseJdUt(k);
  while (jd < jdUt) { k += 1; jd = phaseJdUt(k); }
  while (phaseJdUt(k - 1) >= jdUt) { k -= 1; jd = phaseJdUt(k); }
  return jd;
}
