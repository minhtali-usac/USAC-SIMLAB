/**
 * Schwarzschild spacetime. Geometric units G = c = 1 with lengths in units of M
 * unless a function says otherwise. Signature (−,+,+,+).
 *
 * Timelike geodesics (equatorial):  (dr/dτ)² = E² − (1 − 2M/r)(1 + L²/r²)
 *   Binet form, u = 1/r:  d²u/dφ² + u = M/L² + 3M u²
 * Null geodesics:                  d²u/dφ² + u = 3M u²
 * References: Misner, Thorne & Wheeler, "Gravitation" ch. 25; Hartle, "Gravity" ch. 9;
 * Chandrasekhar, "The Mathematical Theory of Black Holes" ch. 3;
 * Cutler, Kennefick & Poisson 1994, PRD 50, 3816 (p, e parametrisation).
 */
import { C, G } from '../units/constants';
import { dopri5, type Deriv } from '../math/ode';

// ── Characteristic radii ────────────────────────────────────────────────────
/** Schwarzschild radius r_s = 2GM/c² [m] for mass in kg. */
export const schwarzschildRadius = (massKg: number) => (2 * G * massKg) / (C * C);
/** Gravitational length GM/c² [m] for a GM value [m^3/s^2]. */
export const gravLength = (gm: number) => gm / (C * C);

export const HORIZON_M = 2;
export const PHOTON_SPHERE_M = 3;
export const ISCO_M = 6;
/** Critical impact parameter (shadow radius seen from infinity) b_c = 3√3 M. */
export const SHADOW_B_M = 3 * Math.sqrt(3);
/** Marginally bound orbit r_mb = 4M. */
export const MARGINALLY_BOUND_M = 4;

// ── Effective potentials ────────────────────────────────────────────────────
/** V²_eff for timelike geodesics: (1 − 2M/r)(1 + L²/r²); orbit allowed where E² ≥ V². */
export const effPotentialTimelike = (r: number, L: number, M = 1) => (1 - (2 * M) / r) * (1 + (L * L) / (r * r));
/** Null effective potential (1 − 2M/r)/r²; photon allowed where 1/b² ≥ V. Max 1/(27M²) at r = 3M. */
export const effPotentialNull = (r: number, M = 1) => (1 - (2 * M) / r) / (r * r);
/** Newtonian counterpart (per unit mass, energy relative to rest): −M/r + L²/(2r²). */
export const effPotentialNewton = (r: number, L: number, M = 1) => -M / r + (L * L) / (2 * r * r);

/** Circular-orbit radii for angular momentum L: r = (L²/2M)(1 ± √(1 − 12M²/L²)). */
export function circularOrbitRadii(L: number, M = 1): { stable: number; unstable: number } | null {
  let d = 1 - (12 * M * M) / (L * L);
  if (d < -1e-12) return null;
  d = Math.max(0, d);
  const k = (L * L) / (2 * M);
  return { stable: k * (1 + Math.sqrt(d)), unstable: k * (1 - Math.sqrt(d)) };
}

/** E and L of a circular orbit at radius r (r > 3M). */
export function circularOrbitEL(r: number, M = 1): { E: number; L: number } {
  const E = (1 - (2 * M) / r) / Math.sqrt(1 - (3 * M) / r);
  const L = Math.sqrt(M * r) / Math.sqrt(1 - (3 * M) / r);
  return { E, L };
}

/**
 * Bound orbit with semi-latus rectum p (in M) and eccentricity e (Cutler et al. 1994):
 *   L² = p² M² / (p − 3 − e²),  E² = ((p − 2 − 2e)(p − 2 + 2e)) / (p (p − 3 − e²)).
 * Requires p > 3 + e². The orbit is stable (does not plunge) iff p > 6 + 2e.
 */
export function orbitConstantsFromPE(p: number, e: number, M = 1): { E: number; L: number; stable: boolean } | null {
  const den = p - 3 - e * e;
  if (den <= 0) return null;
  const L = (p * M) / Math.sqrt(den);
  const E = Math.sqrt(((p - 2 - 2 * e) * (p - 2 + 2 * e)) / (p * den));
  return { E, L, stable: p > 6 + 2 * e };
}

// ── Orbit integration in φ ──────────────────────────────────────────────────
/**
 * State y = [u, du/dφ, τ, t] for a timelike geodesic with constants E, L (M = 1).
 *   u'' = M/L² − u + 3Mu²,  dτ/dφ = 1/(L u²),  dt/dφ = E/(L u² (1 − 2Mu)).
 */
export function timelikeDeriv(E: number, L: number, M = 1): Deriv {
  return (_phi, y, d) => {
    const u = y[0];
    d[0] = y[1];
    d[1] = M / (L * L) - u + 3 * M * u * u;
    d[2] = 1 / (L * u * u);
    d[3] = E / (L * u * u * (1 - 2 * M * u));
  };
}

export interface OrbitSample { phi: number; r: number; tau: number; t: number }

/**
 * E and L (per unit rest mass) of a particle launched at radius r0 with speed v (units of c)
 * measured by a local static observer, at angle `radialAngle` from the tangential direction
 * (positive = outward). E = γ√(1−2M/r0), L = γ v r0 cos(angle).
 */
export function launchConstants(r0: number, v: number, radialAngle = 0, M = 1) {
  const g = 1 / Math.sqrt(1 - v * v);
  return { E: g * Math.sqrt(1 - (2 * M) / r0), L: g * v * r0 * Math.cos(radialAngle), outward: radialAngle > 0 };
}

/**
 * Integrate a timelike geodesic with constants E, L from r0 (radial direction given by `outward`)
 * over Δφ = phiMax in `samples` output points. Stops just outside the horizon (r < 2.002M).
 * Also returns the periapsis advance per orbit measured from successive minima of r.
 */
export function integrateTimelike(E: number, L: number, r0: number, outward: boolean, phiMax: number, samples = 4000, M = 1) {
  const u0 = 1 / r0;
  const up2 = (E * E - (1 - 2 * M * u0) * (1 + L * L * u0 * u0)) / (L * L);
  const up0 = Math.sqrt(Math.max(0, up2)) * (outward ? -1 : 1);
  const f = timelikeDeriv(E, L, M);
  const y0 = new Float64Array([u0, up0, 0, 0]);
  const out: OrbitSample[] = [{ phi: 0, r: r0, tau: 0, t: 0 }];
  let y: Float64Array = y0, phi = 0;
  const dphi = phiMax / samples;
  let plunged = false, escaped = false;
  const uH = 0.999 / (2 * M);
  for (let k = 1; k <= samples; k++) {
    const res = dopri5(f, phi, y, phi + dphi, { rtol: 1e-11, atol: 1e-14, stop: (_t, s) => s[0] >= uH || s[0] <= 1e-4 });
    y = res.y; phi = res.t;
    if (y[0] <= 1e-4) { escaped = true; break; }
    out.push({ phi, r: 1 / y[0], tau: y[2], t: y[3] });
    if (y[0] >= uH) { plunged = true; break; }
  }
  // periapsis angles from local minima of r (refined by parabola fit)
  const peri: number[] = [];
  for (let k = 1; k < out.length - 1; k++) {
    if (out[k].r < out[k - 1].r && out[k].r <= out[k + 1].r) {
      const r0 = out[k - 1].r, r1 = out[k].r, r2 = out[k + 1].r;
      const den = r0 - 2 * r1 + r2;
      const off = den !== 0 ? (0.5 * (r0 - r2)) / den : 0;
      peri.push(out[k].phi + off * dphi);
    }
  }
  let advancePerOrbit: number | null = null;
  if (peri.length >= 2) advancePerOrbit = (peri[peri.length - 1] - peri[0]) / (peri.length - 1) - 2 * Math.PI;
  return { E, L, samples: out, plunged, escaped, periapsisAngles: peri, advancePerOrbit };
}

/**
 * Bound orbit given by (p, e), starting at apoapsis r_a = p/(1−e) with u' = 0.
 * NOTE: if p < 6 + 2e the requested periapsis is not reached - the particle turns at the
 * third root u3 = 1/(2M) − 2/(pM) instead (the (p,e) pair lies beyond the separatrix).
 */
export function integrateOrbit(p: number, e: number, phiMax: number, samples = 4000, M = 1) {
  const c = orbitConstantsFromPE(p, e, M);
  if (!c) return null;
  return { ...integrateTimelike(c.E, c.L, (p * M) / (1 - e), false, phiMax, samples, M), stable: c.stable };
}

/** Weak-field perihelion advance per orbit Δφ = 6πGM/(c² a(1−e²)) [rad]. */
export const perihelionAdvanceWeak = (gm: number, a: number, e: number) => (6 * Math.PI * gm) / (C * C * a * (1 - e * e));
/** Same in geometric units with p = a(1−e²) in M: 6π/p. */
export const perihelionAdvanceWeakPM = (p: number) => (6 * Math.PI) / p;

// ── Light ───────────────────────────────────────────────────────────────────
/** Weak-field light deflection α = 4GM/(c² b) [rad] for GM [m^3/s^2] and impact parameter b [m]. */
export const lightDeflectionWeak = (gm: number, b: number) => (4 * gm) / (C * C * b);

/**
 * Exact deflection angle of a light ray with impact parameter b (in M) by numerical
 * integration of u'' = −u + 3Mu² from u = 0 to the next u = 0. Returns null if captured (b < 3√3 M).
 */
export function lightDeflectionExact(b: number, M = 1): number | null {
  if (b <= SHADOW_B_M * M) return null;
  const f: Deriv = (_p, y, d) => { d[0] = y[1]; d[1] = -y[0] + 3 * M * y[0] * y[0]; };
  const res = dopri5(f, 0, new Float64Array([0, 1 / b]), 10 * Math.PI, { rtol: 1e-13, atol: 1e-20, hMax: 0.02, stop: (_t, y) => y[0] < 0 && y[1] < 0 });
  if (!res.stopped) return null;
  // near u = 0 the orbit is u ≈ A sin(φ0 − φ) (3Mu² negligible): solve for φ0
  const phiZero = res.t + Math.atan(res.y[0] / -res.y[1]);
  return phiZero - Math.PI;
}

/** Gravitational redshift for a static emitter at r to infinity: 1 + z = (1 − r_s/r)^(−1/2). */
export const gravitationalRedshift = (r: number, rs: number) => 1 / Math.sqrt(1 - rs / r) - 1;
/** Weak-field fractional frequency shift over height h in gravity g: Δf/f = gh/c² (Pound–Rebka). */
export const poundRebkaShift = (g: number, h: number) => (g * h) / (C * C);

// ── Radial infall (from rest at infinity, E = 1) ────────────────────────────
/** Proper time to fall from r0 to r (r < r0), M = 1: τ = (2/3)(r0^{3/2} − r^{3/2})/√(2M). */
export const infallProperTime = (r0: number, r: number, M = 1) => ((2 / 3) * (r0 ** 1.5 - r ** 1.5)) / Math.sqrt(2 * M);

/**
 * Schwarzschild coordinate time for the same infall (diverges at r = 2M):
 * t(r) = −2M[ (2/3)x³ + 2x + ln|(x−1)/(x+1)| ],  x = √(r/2M), relative to r0.
 */
export function infallCoordinateTime(r0: number, r: number, M = 1): number {
  const F = (rr: number) => {
    const x = Math.sqrt(rr / (2 * M));
    return -2 * M * ((2 / 3) * x ** 3 + 2 * x + Math.log(Math.abs((x - 1) / (x + 1))));
  };
  return F(r) - F(r0);
}

/** Radial tidal acceleration difference across length ℓ at radius r [SI]: Δa = 2GMℓ/r³. */
export const tidalAcceleration = (gm: number, r: number, ell: number) => (2 * gm * ell) / (r * r * r);

// ── Kerr equatorial characteristic radii (Bardeen, Press & Teukolsky 1972) ──
/** ISCO radius in M for dimensionless spin a ∈ [0,1]; prograde or retrograde. */
export function kerrIsco(a: number, prograde = true): number {
  const z1 = 1 + Math.cbrt(1 - a * a) * (Math.cbrt(1 + a) + Math.cbrt(1 - a));
  const z2 = Math.sqrt(3 * a * a + z1 * z1);
  const s = Math.sqrt((3 - z1) * (3 + z1 + 2 * z2));
  return 3 + z2 + (prograde ? -s : s);
}
/** Outer horizon r+ = M + √(M² − a²) in M. */
export const kerrHorizon = (a: number) => 1 + Math.sqrt(1 - a * a);
/** Equatorial photon orbit (Bardeen et al. 1972): r = 2M{1 + cos[(2/3) arccos(∓a)]}. */
export const kerrPhotonOrbit = (a: number, prograde = true) => 2 * (1 + Math.cos((2 / 3) * Math.acos(prograde ? -a : a)));

/** Complete elliptic integral of the first kind K(k) by the arithmetic–geometric mean: K = π / (2 AGM(1, √(1−k²))). */
export function ellipticK(k: number): number {
  let a = 1, b = Math.sqrt(1 - k * k);
  for (let i = 0; i < 40 && Math.abs(a - b) > 1e-16 * a; i++) { const an = (a + b) / 2; b = Math.sqrt(a * b); a = an; }
  return Math.PI / (2 * a);
}

/**
 * Exact periapsis advance per radial period of a bound Schwarzschild geodesic with semi-latus rectum p (in M)
 * and eccentricity e (Cutler, Kennefick & Poisson 1994, PRD 50, 3816, eq. 2.8 ff.):
 *   Δφ = 4 K(k) / √(1 − (6 − 2e)/p) − 2π,   k² = 4e / (p − 6 + 2e).   Requires p > 6 + 2e.
 */
export function periapsisAdvanceExact(p: number, e: number): number {
  const k2 = (4 * e) / (p - 6 + 2 * e);
  return (4 * ellipticK(Math.sqrt(k2))) / Math.sqrt(1 - (6 - 2 * e) / p) - 2 * Math.PI;
}
