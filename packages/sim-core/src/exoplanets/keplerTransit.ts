/**
 * Eccentric-orbit transit geometry and radial velocity, one consistent convention:
 * Winn, J. N. (2010), "Transits and Occultations", in Exoplanets (ed. Seager), §2:
 *   X = −r cos(ω + f),  Y = −r sin(ω + f) cos i,  Z = r sin(ω + f) sin i   (Z towards the observer)
 *   r = a(1 − e²)/(1 + e cos f)
 * ω is the argument of periastron of the PLANET’s orbit; mid-transit (inferior conjunction) is at
 * f = π/2 − ω. Time enters ONLY through the mean anomaly (linear in time):
 *   M(t) = 2π (t − T_p)/P,   M = E − e sin E,   tan(f/2) = √((1+e)/(1−e)) tan(E/2).
 * Stellar radial velocity (positive = receding), same ω:
 *   v_r = γ + K [cos(f + ω) + e cos ω]
 * (derived from v_r ∝ dZ/dt of the planet; decreasing through mid-transit).
 */
import { solveKepler } from '../orbits/kepler';
import { transitFlux } from './detection';
import { bisect } from '../math/roots';

export interface OrbitGeometry {
  /** Orbital period (any time unit; results use the same unit). */
  P: number;
  e: number;
  /** Argument of periastron of the planet [rad]. */
  omega: number;
  /** Semi-major axis in stellar radii. */
  aR: number;
  /** Inclination [rad]. */
  inc: number;
}

const TWO_PI = 2 * Math.PI;

/** True anomaly → eccentric → mean anomaly. */
function meanFromTrue(f: number, e: number): number {
  const E = 2 * Math.atan2(Math.sqrt(1 - e) * Math.sin(f / 2), Math.sqrt(1 + e) * Math.cos(f / 2));
  return E - e * Math.sin(E);
}

/** Time of periastron passage T_p relative to mid-transit (conjunction) at t = 0. */
export function periastronTime(g: OrbitGeometry): number {
  const fTr = Math.PI / 2 - g.omega;
  return (-meanFromTrue(fTr, g.e) / TWO_PI) * g.P;
}

/** Mean, eccentric and true anomaly at time t (t = 0 ↔ mid-transit). */
export function anomalies(t: number, g: OrbitGeometry) {
  const M = (TWO_PI * (t - periastronTime(g))) / g.P;
  const E = solveKepler(M, g.e);
  const f = 2 * Math.atan2(Math.sqrt(1 + g.e) * Math.sin(E / 2), Math.sqrt(1 - g.e) * Math.cos(E / 2));
  return { M, E, f };
}

/** Sky-plane position of the planet relative to the star, in stellar radii. */
export function skyPosition(t: number, g: OrbitGeometry) {
  const { f, M, E } = anomalies(t, g);
  const r = (g.aR * (1 - g.e * g.e)) / (1 + g.e * Math.cos(f));
  const u = g.omega + f;
  const X = -r * Math.cos(u), Y = -r * Math.sin(u) * Math.cos(g.inc), Z = r * Math.sin(u) * Math.sin(g.inc);
  return { X, Y, Z, d: Math.hypot(X, Y), r, f, M, E };
}

/** Normalised flux at time t (planet must be in front, Z > 0). */
export function transitFluxAt(t: number, g: OrbitGeometry, k: number, u1 = 0, u2 = 0, n = 400): number {
  const s = skyPosition(t, g);
  return s.Z > 0 ? transitFlux(s.d, k, u1, u2, n) : 1;
}

/** Stellar radial velocity at time t. */
export function radialVelocityAt(t: number, g: OrbitGeometry, K: number, gamma = 0): number {
  const { f } = anomalies(t, g);
  return gamma + K * (Math.cos(f + g.omega) + g.e * Math.cos(g.omega));
}

/** Impact parameter at conjunction (Winn 2010 eq. 7): b = (a cos i / R★)(1 − e²)/(1 + e sin ω). */
export const impactParameter = (g: OrbitGeometry) => (g.aR * Math.cos(g.inc) * (1 - g.e * g.e)) / (1 + g.e * Math.sin(g.omega));

/**
 * Contact times found NUMERICALLY from the Keplerian sky motion (no circular-orbit formula):
 * t1/t4 where d = 1 + k, t2/t3 where d = 1 − k (if the transit is full). Times relative to conjunction.
 */
export function transitContacts(g: OrbitGeometry, k: number) {
  const d = (t: number) => skyPosition(t, g).d;
  // minimum separation near conjunction (golden-section search on ±P/8)
  let a = -g.P / 8, b = g.P / 8;
  const gr = (Math.sqrt(5) - 1) / 2;
  for (let i = 0; i < 120; i++) {
    const c = b - gr * (b - a), e2 = a + gr * (b - a);
    if (d(c) < d(e2)) b = e2; else a = c;
  }
  const tMin = (a + b) / 2, dMin = d(tMin);
  if (dMin >= 1 + k) return { transits: false as const, tMin, dMin };
  const span = g.P / 4;
  const root = (level: number, lo: number, hi: number) => bisect((t) => d(t) - level, lo, hi, 1e-12 * g.P);
  const t1 = root(1 + k, tMin - span, tMin), t4 = root(1 + k, tMin, tMin + span);
  const full = dMin < 1 - k;
  const t2 = full ? root(1 - k, tMin - span, tMin) : NaN, t3 = full ? root(1 - k, tMin, tMin + span) : NaN;
  return { transits: true as const, tMin, dMin, t1, t2, t3, t4, T14: t4 - t1, T23: full ? t3 - t2 : 0 };
}

/**
 * Winn (2010) eqs. 14 & 16 analytic approximation for T14 of an eccentric orbit
 * (used only as a cross-check of the numerical contacts).
 */
export function transitDurationWinn(g: OrbitGeometry, k: number): number {
  const b = impactParameter(g);
  const arg = Math.sqrt(Math.max(0, (1 + k) ** 2 - b * b)) / (g.aR * Math.sin(g.inc));
  return (g.P / Math.PI) * Math.asin(Math.min(1, arg)) * (Math.sqrt(1 - g.e * g.e) / (1 + g.e * Math.sin(g.omega)));
}

/** Semi-major axis in stellar radii from Kepler’s third law. masses [kg], P [s], R★ [m]. */
export function aOverRstar(Pseconds: number, mStar: number, mPlanet: number, rStar: number, G = 6.6743e-11): number {
  return Math.cbrt((G * (mStar + mPlanet) * Pseconds * Pseconds) / (4 * Math.PI * Math.PI)) / rStar;
}

/**
 * Detection metrics (white-noise approximations, see Model Card):
 *   SNR_RV ≈ (K/σ_RV) √(N/2)  - N epochs spread uniformly in phase, circular-like signal;
 *   SNR_tr ≈ (δ/σ_ph) √N_in   - N_in independent photometric points inside one transit.
 */
export const snrRV = (K: number, sigma: number, N: number) => (sigma > 0 ? (K / sigma) * Math.sqrt(N / 2) : Infinity);
export const snrTransit = (depth: number, sigma: number, nIn: number) => (sigma > 0 ? (depth / sigma) * Math.sqrt(nIn) : Infinity);
