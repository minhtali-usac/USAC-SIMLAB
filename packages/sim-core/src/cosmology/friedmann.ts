/**
 * FLRW cosmology: Friedmann equation, ages and distances.
 *   H(a)² = H0² [Ωr a⁻⁴ + Ωm a⁻³ + Ωk a⁻² + ΩΛ],   Ωk = 1 − Ωr − Ωm − ΩΛ
 * Distances: Hogg 1999, "Distance measures in cosmology", arXiv:astro-ph/9905116.
 * Default parameters: Planck 2018 results VI (A&A 641, A6, 2020), Table 2,
 * TT,TE,EE+lowE+lensing+BAO: H0 = 67.66 km/s/Mpc, Ωm = 0.3111, ΩΛ = 0.6889 (age 13.787 Gyr).
 * Radiation: Ωr h² = 4.18×10⁻⁵ (photons Ωγh² = 2.47×10⁻⁵ + 3.046 massless ν).
 */
import { C, MPC_KM, JULIAN_YEAR } from '../units/constants';
import { adaptiveSimpson } from '../math/quadrature';
import { dopri5 } from '../math/ode';

export interface Cosmology {
  H0: number; // km/s/Mpc
  Om: number;
  OL: number;
  Or: number;
}

/** Planck 2018 base-ΛCDM is spatially flat: ΩΛ is set to 1 − Ωm − Ωr (= 0.68881) so that Ωk = 0 exactly. */
const PLANCK18_OR = 4.18e-5 / 0.6766 ** 2;
export const PLANCK18: Cosmology = { H0: 67.66, Om: 0.3111, OL: 1 - 0.3111 - PLANCK18_OR, Or: PLANCK18_OR };

export const omegaK = (c: Cosmology) => 1 - c.Om - c.OL - c.Or;

/** E(z) = H(z)/H0. */
export const Ez = (c: Cosmology, z: number) => {
  const zp = 1 + z;
  return Math.sqrt(c.Or * zp ** 4 + c.Om * zp ** 3 + omegaK(c) * zp ** 2 + c.OL);
};

/** Hubble time 1/H0 in Gyr. */
export const hubbleTimeGyr = (H0: number) => (MPC_KM / H0) / (JULIAN_YEAR * 1e9);
/** Hubble distance c/H0 in Mpc. */
export const hubbleDistanceMpc = (H0: number) => (C / 1000) / H0;

/**
 * Age of the universe at redshift z [Gyr]: t(z) = (1/H0) ∫_0^{1/(1+z)} da / (a E(a)).
 * Written as ∫ da / √(Ωr a⁻² + Ωm a⁻¹ + Ωk + ΩΛ a²) - finite integrand at a → 0 when Ωr > 0 or Ωm > 0.
 */
export function ageAtZ(c: Cosmology, z = 0): number {
  const Ok = omegaK(c);
  const f = (a: number) => (a === 0 ? 0 : 1 / Math.sqrt(c.Or / (a * a) + c.Om / a + Ok + c.OL * a * a));
  // substitute a = s² to tame the a^{1/2} behaviour near 0 for matter-only
  const g = (s: number) => 2 * s * f(s * s);
  return hubbleTimeGyr(c.H0) * adaptiveSimpson(g, 0, Math.sqrt(1 / (1 + z)), 1e-12);
}

/** Lookback time to redshift z [Gyr]. */
export const lookbackTimeGyr = (c: Cosmology, z: number) => ageAtZ(c, 0) - ageAtZ(c, z);

/** Line-of-sight comoving distance D_C [Mpc]. */
export const comovingDistanceMpc = (c: Cosmology, z: number) =>
  hubbleDistanceMpc(c.H0) * adaptiveSimpson((x) => 1 / Ez(c, x), 0, z, 1e-12);

/** Transverse comoving distance D_M [Mpc] (curvature-aware). */
export function transverseComovingMpc(c: Cosmology, z: number): number {
  const DC = comovingDistanceMpc(c, z);
  const Ok = omegaK(c);
  const DH = hubbleDistanceMpc(c.H0);
  if (Math.abs(Ok) < 1e-8) return DC;
  const k = Math.sqrt(Math.abs(Ok));
  return Ok > 0 ? (DH / k) * Math.sinh((k * DC) / DH) : (DH / k) * Math.sin((k * DC) / DH);
}

export const luminosityDistanceMpc = (c: Cosmology, z: number) => (1 + z) * transverseComovingMpc(c, z);
export const angularDiameterDistanceMpc = (c: Cosmology, z: number) => transverseComovingMpc(c, z) / (1 + z);
/** Distance modulus μ = 5 log10(D_L / 10 pc). */
export const distanceModulus = (c: Cosmology, z: number) => 5 * Math.log10(luminosityDistanceMpc(c, z) * 1e5);

/** Flat ΛCDM (no radiation) closed-form age [Gyr]: t0 = 2/(3H0√ΩΛ) · asinh(√(ΩΛ/Ωm)). */
export const flatLcdmAgeGyr = (H0: number, Om: number) => {
  const OL = 1 - Om;
  return ((2 / (3 * Math.sqrt(OL))) * Math.asinh(Math.sqrt(OL / Om))) * hubbleTimeGyr(H0);
};

/**
 * Scale factor history a(t) by integrating the acceleration equation
 *   ä/a = −H0²[Ωr a⁻⁴ + ½ Ωm a⁻³] + H0² ΩΛ   (handles recollapse),
 * from today (a = 1, ȧ = H0) backward to the Big Bang and forward to tMaxGyr or a Big Crunch.
 * Time unit: Gyr, measured from the Big Bang.
 */
export function scaleFactorHistory(c: Cosmology, tMaxGyr = 40, n = 400) {
  const H0 = 1 / hubbleTimeGyr(c.H0); // 1/Gyr
  const acc = (a: number) => H0 * H0 * (-(c.Or / (a * a * a)) - (0.5 * c.Om) / (a * a) + c.OL * a);
  const f = (_t: number, y: Float64Array, d: Float64Array) => { d[0] = y[1]; d[1] = acc(Math.max(y[0], 1e-9)); };
  const back: { t: number; a: number }[] = [];
  const res = dopri5(f, 0, new Float64Array([1, H0]), -60, { rtol: 1e-10, atol: 1e-13, stop: (_t, y) => y[0] <= 1e-3 },
    (t, y) => back.push({ t, a: y[0] }));
  // close the gap to a = 0 with the matter-era power law a ∝ t^{2/3} (error ≲ 1 Myr)
  const hasBigBang = res.stopped;
  const tBang = hasBigBang ? res.t - (2 / 3) * (res.y[0] / Math.max(res.y[1], 1e-12)) : res.t;
  const fwd: { t: number; a: number }[] = [];
  const age = -tBang;
  dopri5(f, 0, new Float64Array([1, H0]), tMaxGyr - age, { rtol: 1e-10, atol: 1e-13, stop: (_t, y) => y[0] <= 1e-3 },
    (t, y) => fwd.push({ t, a: y[0] }));
  const head = hasBigBang ? [{ t: tBang, a: 0 }] : [];
  const pts = [...head, ...back.reverse(), { t: 0, a: 1 }, ...fwd].map((p) => ({ t: p.t - tBang, a: p.a }));
  // downsample
  const step = Math.max(1, Math.floor(pts.length / n));
  return { age, hasBigBang, points: pts.filter((_, i) => i % step === 0 || i === pts.length - 1) };
}

/** E²(a) = H²/H0² = Ωr a⁻⁴ + Ωm a⁻³ + Ωk a⁻² + ΩΛ. */
export const E2a = (c: Cosmology, a: number) => c.Or / a ** 4 + c.Om / a ** 3 + omegaK(c) / (a * a) + c.OL;

/** Deceleration parameter q(a) = −ä a/ȧ² = [Ωr a⁻⁴ + ½ Ωm a⁻³ − ΩΛ] / E²(a) (from the acceleration equation). */
export const decelerationQ = (c: Cosmology, a: number) => (c.Or / a ** 4 + (0.5 * c.Om) / a ** 3 - c.OL) / E2a(c, a);

/** Density parameters at scale factor a: Ω_i(a) = Ω_i a^{−n_i} / E²(a) (n = 4, 3, 2, 0); they sum to 1. */
export function densityFractions(c: Cosmology, a: number) {
  const e2 = E2a(c, a);
  return { r: c.Or / a ** 4 / e2, m: c.Om / a ** 3 / e2, k: omegaK(c) / (a * a) / e2, L: c.OL / e2 };
}

/**
 * Scale factor at which ä = 0, i.e. Ωr a⁻⁴ + ½ Ωm a⁻³ = ΩΛ (onset of acceleration). The left side decreases
 * monotonically with a, so the root is unique; null when ΩΛ ≤ 0 or there is no matter/radiation.
 * Flat, radiation-free check: a = (Ωm / 2ΩΛ)^{1/3}.
 */
export function accelerationOnsetA(c: Cosmology): number | null {
  if (c.OL <= 0 || c.Om + c.Or <= 0) return null;
  const g = (la: number) => { const a = 10 ** la; return c.Or / a ** 4 + (0.5 * c.Om) / a ** 3 - c.OL; };
  let lo = -10, hi = 10;
  for (let k = 0; k < 200; k++) { const m = 0.5 * (lo + hi); if (g(m) > 0) lo = m; else hi = m; }
  return 10 ** (0.5 * (lo + hi));
}

/** Smallest a in (aFrom, aTo] (scanning outward from aFrom on a log grid) where E²(a) = 0, or null. */
function firstRootE2(c: Cosmology, aFrom: number, aTo: number, n = 3000): number | null {
  const l0 = Math.log10(aFrom), l1 = Math.log10(aTo), f = (la: number) => E2a(c, 10 ** la);
  const bisect = (a: number, b: number) => { for (let k = 0; k < 100; k++) { const m = 0.5 * (a + b); if (f(m) > 0) a = m; else b = m; } return 10 ** (0.5 * (a + b)); };
  // golden-section minimum of E² on [a, b] (log a), used to catch narrow dips between grid points
  const gmin = (a: number, b: number) => {
    const r = (Math.sqrt(5) - 1) / 2;
    let x1 = b - r * (b - a), x2 = a + r * (b - a), f1 = f(x1), f2 = f(x2);
    for (let k = 0; k < 80; k++) { if (f1 < f2) { b = x2; x2 = x1; f2 = f1; x1 = b - r * (b - a); f1 = f(x1); } else { a = x1; x1 = x2; f1 = f2; x2 = a + r * (b - a); f2 = f(x2); } }
    return 0.5 * (a + b);
  };
  let prevL = l0, prev = f(l0), prev2 = Infinity;
  for (let k = 1; k <= n; k++) {
    const l = l0 + ((l1 - l0) * k) / n, v = f(l);
    if (v <= 0) return bisect(prevL, l);
    if (prev < prev2 && prev <= v) { // local minimum around prevL
      const lp = l0 + ((l1 - l0) * (k - 2)) / n, lm = gmin(Math.min(lp, l), Math.max(lp, l));
      if (f(lm) <= 0) return bisect(l0 < l1 ? Math.min(lp, lm) : Math.max(lp, lm), lm);
    }
    prev2 = prev; prev = v; prevL = l;
  }
  return null;
}

/**
 * Past and future of a Friedmann model from the roots of E²(a) (Felten & Isaacman 1986, Rev. Mod. Phys. 58, 689):
 *  - aMin: a root of E² below a = 1 ⇒ the expansion began from a bounce, no Big Bang;
 *  - bigBang: no such root and a finite age (Ωr, Ωm or Ωk > 0, so ∫ da/(aE) converges at a → 0);
 *  - aMax: a root above a = 1 ⇒ the expansion halts at a = aMax and recollapses (Big Crunch).
 */
export function cosmicFate(c: Cosmology) {
  const aMin = firstRootE2(c, 1, 1e-8);
  const aMax = firstRootE2(c, 1, 1e8);
  const finiteAge = c.Or > 0 || c.Om > 0 || omegaK(c) > 0;
  return { bigBang: aMin === null && finiteAge, recollapse: aMax !== null, aMin, aMax };
}

/** ΩΛ on the expand-forever / recollapse boundary for given Ωm (Ωr = 0), by bisection on cosmicFate. */
export function recollapseBoundaryOL(Om: number): number {
  let lo = -2, hi = 2; // recollapse at lo, expands forever at hi
  for (let k = 0; k < 50; k++) { const m = 0.5 * (lo + hi); if (firstRootE2({ H0: 70, Om, OL: m, Or: 0 }, 1, 1e8, 1500) !== null) lo = m; else hi = m; }
  return 0.5 * (lo + hi);
}

/** ΩΛ on the Big Bang / bounce ("no Big Bang") boundary for given Ωm > 0 (Ωr = 0), by bisection on cosmicFate. */
export function noBigBangBoundaryOL(Om: number): number {
  let lo = 0, hi = 12; // Big Bang at lo, bounce at hi
  for (let k = 0; k < 50; k++) { const m = 0.5 * (lo + hi); if (firstRootE2({ H0: 70, Om, OL: m, Or: 0 }, 1, 1e-8, 1500) === null) lo = m; else hi = m; }
  return 0.5 * (lo + hi);
}
