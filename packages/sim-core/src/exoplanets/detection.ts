/**
 * Exoplanet detection: radial velocity and transit photometry.
 * RV semi-amplitude: K = (2πG/P)^{1/3} m_p sin i / ((M★ + m_p)^{2/3} √(1−e²))
 *   (Lovis & Fischer 2010, "Radial Velocity Techniques for Exoplanets", in Exoplanets, ed. Seager, eq. 14).
 * RV curve: v_r = K[cos(ν + ω) + e cos ω] + γ.
 * Transit: thin opaque disk over a quadratic limb-darkened star I(μ) = 1 − u1(1−μ) − u2(1−μ)²
 *   (Mandel & Agol 2002, ApJ 580, L171) - evaluated here by exact ring integration (numerical).
 * Duration: Seager & Mallén-Ornelas 2003, ApJ 585, 1038, eq. 3.
 */
import { G } from '../units/constants';
import { solveKepler, eccentricAnomalyToTrue } from '../orbits/kepler';
import { TWO_PI } from '../units/convert';

export function rvSemiAmplitude(periodS: number, mStarKg: number, mPlanetKg: number, inclRad = Math.PI / 2, e = 0): number {
  return (Math.cbrt((TWO_PI * G) / periodS) * mPlanetKg * Math.sin(inclRad)) / ((mStarKg + mPlanetKg) ** (2 / 3) * Math.sqrt(1 - e * e));
}

/** Stellar radial velocity at phase (t − t_peri)/P. */
export function radialVelocity(phase: number, K: number, e = 0, omega = 0, gamma = 0): number {
  const M = TWO_PI * phase;
  const nu = e === 0 ? M : eccentricAnomalyToTrue(solveKepler(M, e), e);
  return K * (Math.cos(nu + omega) + e * Math.cos(omega)) + gamma;
}

/** Normalised stellar intensity at radius r (0…1 of R★). */
export const limbDarkening = (r: number, u1: number, u2: number) => {
  const mu = Math.sqrt(Math.max(0, 1 - r * r));
  return 1 - u1 * (1 - mu) - u2 * (1 - mu) ** 2;
};

/**
 * Relative flux during transit for a planet of radius p (R★ units) at projected
 * separation d (R★ units). Midpoint ring quadrature (n rings) of the limb-darkened intensity; converges
 * to the Mandel & Agol (2002) analytic result (uniform-disk check against `overlapArea`).
 */
export function transitFlux(d: number, p: number, u1 = 0, u2 = 0, n = 400): number {
  if (d >= 1 + p) return 1;
  const total = Math.PI * (1 - u1 / 3 - u2 / 6);
  const rMin = Math.max(0, d - p), rMax = Math.min(1, d + p);
  const h = (rMax - rMin) / n;
  let blocked = 0;
  for (let k = 0; k < n; k++) {
    const r = rMin + (k + 0.5) * h;
    let arc: number;
    if (r + d <= p) arc = TWO_PI; // ring fully inside the planet disk
    else {
      const cosK = (r * r + d * d - p * p) / (2 * r * d);
      arc = cosK >= 1 ? 0 : cosK <= -1 ? TWO_PI : 2 * Math.acos(cosK);
    }
    blocked += limbDarkening(r, u1, u2) * arc * r * h;
  }
  return 1 - blocked / total;
}

/** Exact overlap area of two circles (radii 1 and p, centre distance d) - uniform-disk reference. */
export function overlapArea(d: number, p: number): number {
  if (d >= 1 + p) return 0;
  if (d <= Math.abs(1 - p)) return Math.PI * Math.min(1, p) ** 2;
  const k0 = Math.acos((p * p + d * d - 1) / (2 * p * d));
  const k1 = Math.acos((1 - p * p + d * d) / (2 * d));
  return p * p * k0 + k1 - 0.5 * Math.sqrt(Math.max(0, 4 * d * d - (1 + d * d - p * p) ** 2));
}

/** Projected separation [R★] for a circular orbit at orbital phase φ (0 = mid-transit), a in R★. */
export function projectedSeparation(phase: number, aOverR: number, inclRad: number): { d: number; inFront: boolean } {
  const th = TWO_PI * phase;
  const x = aOverR * Math.sin(th);
  const y = aOverR * Math.cos(th) * Math.cos(inclRad);
  return { d: Math.hypot(x, y), inFront: Math.cos(th) > 0 };
}

/** Total transit duration T14 (circular orbit). */
export function transitDuration(periodS: number, aOverR: number, k: number, inclRad: number): number {
  const b = aOverR * Math.cos(inclRad);
  const arg = Math.sqrt(Math.max(0, (1 + k) ** 2 - b * b)) / (aOverR * Math.sin(inclRad));
  if (arg <= 0) return 0;
  return (periodS / Math.PI) * Math.asin(Math.min(1, arg));
}

/** Seeded Gaussian random generator (Mulberry32 + Box–Muller) for reproducible synthetic noise. */
export function gaussianRng(seed: number) {
  let s = seed >>> 0;
  const uni = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return { uniform: uni, normal: () => Math.sqrt(-2 * Math.log(uni() || 1e-12)) * Math.cos(TWO_PI * uni()) };
}
