/**
 * Two-body (Kepler) problem - analytic solution, all conic sections.
 *
 * Elliptic:   M = E − e sin E                 (Halley iteration, Danby 1988 starter)
 * Hyperbolic: M = e sinh H − H                (Halley iteration, asinh starter)
 * Parabolic:  Barker's equation, closed-form Cardano solution.
 * References: Vallado, "Fundamentals of Astrodynamics and Applications" 4th ed., §2.2–2.3;
 *             Murray & Dermott, "Solar System Dynamics", ch. 2.
 */
import { TWO_PI, wrapPi } from '../units/convert';
import type { Vec3 } from '../math/vec';
import { cross, dot, norm, sub, scale } from '../math/vec';

/** |e − 1| below this is treated as a parabola (Barker branch); shared by all callers. */
export const PARABOLIC_E_TOL = 1e-9;

/** Solve Kepler's equation M = E − e sin E for 0 ≤ e < 1. Returns E with the same 2π branch as M. */
export function solveKepler(M: number, e: number, tol = 1e-15, maxIter = 60): number {
  if (!(e >= 0 && e < 1)) throw new RangeError(`solveKepler: e must be in [0,1), got ${e}`);
  const Mn = wrapPi(M);
  const offset = M - Mn;
  if (e === 0) return M;
  // Danby (1988) starter: E0 = M + 0.85 e sign(sin M)
  let E = Mn + 0.85 * e * Math.sign(Math.sin(Mn) || 1);
  for (let i = 0; i < maxIter; i++) {
    const sE = Math.sin(E), cE = Math.cos(E);
    const f = E - e * sE - Mn;
    const f1 = 1 - e * cE;
    const f2 = e * sE;
    const dE = -(2 * f * f1) / (2 * f1 * f1 - f * f2);
    E += dE;
    if (Math.abs(dE) <= tol * Math.max(1, Math.abs(E))) break;
  }
  return E + offset;
}

/** Solve the hyperbolic Kepler equation M = e sinh H − H for e > 1. */
export function solveKeplerHyperbolic(M: number, e: number, tol = 1e-15, maxIter = 100): number {
  if (!(e > 1)) throw new RangeError(`solveKeplerHyperbolic: e must be > 1, got ${e}`);
  let H = Math.asinh(M / e);
  for (let i = 0; i < maxIter; i++) {
    const sH = Math.sinh(H), cH = Math.cosh(H);
    const f = e * sH - H - M;
    const f1 = e * cH - 1;
    const f2 = e * sH;
    const dH = -(2 * f * f1) / (2 * f1 * f1 - f * f2);
    H += dH;
    if (Math.abs(dH) <= tol * Math.max(1, Math.abs(H))) break;
  }
  return H;
}

/** Solve Barker's equation D + D³/3 = Mp for D = tan(ν/2) (closed form). */
export function solveBarker(Mp: number): number {
  const s = 1.5 * Mp;
  const Y = Math.cbrt(s + Math.sqrt(s * s + 1));
  return Y - 1 / Y;
}

export const eccentricAnomalyToTrue = (E: number, e: number) =>
  2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));

export const trueAnomalyToEccentric = (nu: number, e: number) =>
  2 * Math.atan2(Math.sqrt(1 - e) * Math.sin(nu / 2), Math.sqrt(1 + e) * Math.cos(nu / 2));

export interface PlanarState {
  x: number; y: number; vx: number; vy: number;
  r: number; v: number;
  /** True anomaly [rad]. */
  nu: number;
}

/**
 * Perifocal state for a conic with periapsis distance q, eccentricity e and
 * gravitational parameter mu, at time t since periapsis passage (any units, consistent).
 * The periapsis lies on +x, motion is counter-clockwise.
 */
export function conicState(q: number, e: number, mu: number, t: number): PlanarState {
  if (q <= 0 || e < 0) throw new RangeError('conicState: q > 0 and e ≥ 0 required');
  const p = q * (1 + e); // semi-latus rectum
  let nu: number;
  if (Math.abs(e - 1) < PARABOLIC_E_TOL) {
    const Mp = Math.sqrt(mu / (2 * q * q * q)) * t;
    nu = 2 * Math.atan(solveBarker(Mp));
  } else if (e < 1) {
    const a = q / (1 - e);
    const n = Math.sqrt(mu / (a * a * a));
    const E = solveKepler(n * t, e);
    const Ew = wrapPi(E);
    // keep whole revolutions so the angle is continuous
    nu = eccentricAnomalyToTrue(Ew, e) + (E - Ew);
  } else {
    const a = q / (1 - e); // negative
    const n = Math.sqrt(mu / (-a * -a * -a));
    const H = solveKeplerHyperbolic(n * t, e);
    nu = 2 * Math.atan2(Math.sqrt(e + 1) * Math.sinh(H / 2), Math.sqrt(e - 1) * Math.cosh(H / 2));
  }
  const r = p / (1 + e * Math.cos(nu));
  const x = r * Math.cos(nu), y = r * Math.sin(nu);
  const k = Math.sqrt(mu / p);
  const vx = -k * Math.sin(nu), vy = k * (e + Math.cos(nu));
  return { x, y, vx, vy, r, v: Math.hypot(vx, vy), nu };
}

/** Orbital period [s] for semi-major axis a [m] and gravitational parameter mu [m^3/s^2]. */
export const orbitalPeriod = (a: number, mu: number) => TWO_PI * Math.sqrt((a * a * a) / mu);

/** Vis-viva speed at distance r. a < 0 for hyperbolae, a = Infinity for parabolae. */
export const visViva = (r: number, a: number, mu: number) => Math.sqrt(mu * (2 / r - (Number.isFinite(a) ? 1 / a : 0)));

/** Escape speed at distance r. */
export const escapeSpeed = (r: number, mu: number) => Math.sqrt((2 * mu) / r);

/** Specific orbital energy ε = v²/2 − μ/r. */
export const specificEnergy = (r: number, v: number, mu: number) => 0.5 * v * v - mu / r;

export interface OrbitalElements {
  a: number; e: number;
  /** Inclination, longitude of ascending node, argument of periapsis, true anomaly [rad]. */
  i: number; Omega: number; omega: number; nu: number;
  /** Specific angular momentum magnitude and specific energy. */
  h: number; energy: number;
}

/** Cartesian state → classical elements (Vallado Algorithm 9 "RV2COE"). */
export function stateToElements(r: Vec3, v: Vec3, mu: number): OrbitalElements {
  const hv = cross(r, v);
  const h = norm(hv);
  const rn = norm(r);
  const vn = norm(v);
  const nv: Vec3 = [-hv[1], hv[0], 0];
  const n = norm(nv);
  const ev = scale(sub(scale(r, vn * vn - mu / rn), scale(v, dot(r, v))), 1 / mu);
  const e = norm(ev);
  const energy = 0.5 * vn * vn - mu / rn;
  const a = Math.abs(e - 1) < 1e-14 ? Infinity : -mu / (2 * energy);
  const i = Math.acos(Math.max(-1, Math.min(1, hv[2] / h)));
  let Omega = n > 1e-14 ? Math.acos(Math.max(-1, Math.min(1, nv[0] / n))) : 0;
  if (nv[1] < 0) Omega = TWO_PI - Omega;
  let omega: number;
  if (n > 1e-14 && e > 1e-14) {
    omega = Math.acos(Math.max(-1, Math.min(1, dot(nv, ev) / (n * e))));
    if (ev[2] < 0) omega = TWO_PI - omega;
  } else if (e > 1e-14) {
    omega = Math.atan2(ev[1], ev[0]);
    if (hv[2] < 0) omega = -omega;
    if (omega < 0) omega += TWO_PI;
  } else omega = 0;
  let nu: number;
  if (e > 1e-14) {
    nu = Math.acos(Math.max(-1, Math.min(1, dot(ev, r) / (e * rn))));
    if (dot(r, v) < 0) nu = TWO_PI - nu;
  } else {
    nu = Math.atan2(r[1], r[0]);
  }
  return { a, e, i, Omega, omega, nu, h, energy };
}

/** Rotate a perifocal vector to the reference frame given (Ω, i, ω). */
export function perifocalToFrame(xp: number, yp: number, Omega: number, i: number, omega: number): Vec3 {
  const cO = Math.cos(Omega), sO = Math.sin(Omega);
  const ci = Math.cos(i), si = Math.sin(i);
  const cw = Math.cos(omega), sw = Math.sin(omega);
  return [
    (cw * cO - sw * sO * ci) * xp + (-sw * cO - cw * sO * ci) * yp,
    (cw * sO + sw * cO * ci) * xp + (-sw * sO + cw * cO * ci) * yp,
    sw * si * xp + cw * si * yp,
  ];
}
