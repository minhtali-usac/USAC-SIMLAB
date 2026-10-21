/**
 * Lambert's problem (zero-revolution, prograde/retrograde) by universal variables:
 * Curtis, "Orbital Mechanics for Engineering Students" 4th ed., §5.3, Algorithm 5.2 (Bate, Mueller & White 1971).
 *   A = sin Δθ √(r₁r₂/(1 − cos Δθ)),  y(z) = r₁ + r₂ + A (z S(z) − 1)/√C(z)
 *   F(z) = (y/C)^{3/2} S + A √y − √μ Δt = 0,   f = 1 − y/r₁,  g = A √(y/μ),  ġ = 1 − y/r₂
 *   v₁ = (r₂ − f r₁)/g,  v₂ = (ġ r₂ − r₁)/g
 * The root in z is bracketed and solved by bisection to machine precision (F is monotonic in z on the
 * zero-revolution branch), which is slower than Newton but cannot diverge.
 */
import { cross, dot, norm, sub, scale, type Vec3 } from '../math/vec';
import { bisect } from '../math/roots';
import { stateToElements, perifocalToFrame, conicState } from './kepler';
import { timeSincePeriapsis } from './twoBody';

/** Stumpff functions S(z), C(z). */
export function stumpffS(z: number): number {
  if (z > 1e-8) { const s = Math.sqrt(z); return (s - Math.sin(s)) / (s * s * s); }
  if (z < -1e-8) { const s = Math.sqrt(-z); return (Math.sinh(s) - s) / (s * s * s); }
  return 1 / 6 - z / 120 + (z * z) / 5040;
}
export function stumpffC(z: number): number {
  if (z > 1e-8) return (1 - Math.cos(Math.sqrt(z))) / z;
  if (z < -1e-8) return (Math.cosh(Math.sqrt(-z)) - 1) / -z;
  return 0.5 - z / 24 + (z * z) / 720;
}

export interface LambertSolution {
  v1: Vec3; v2: Vec3;
  /** Universal variable z (z > 0 ellipse, z < 0 hyperbola). */
  z: number;
  /** Transfer angle Δθ [rad]. */
  dtheta: number;
  /** Residual |F(z)| / (√μ Δt). */
  residual: number;
}

/**
 * Solve for the orbit from r₁ to r₂ in time dt (same units as μ). `prograde`: motion with the +z angular
 * momentum of the reference plane (ecliptic north for planets). Returns null if no zero-rev solution exists.
 */
export function solveLambert(r1: Vec3, r2: Vec3, dt: number, mu: number, prograde = true): LambertSolution | null {
  const R1 = norm(r1), R2 = norm(r2);
  const c = cross(r1, r2);
  let dth = Math.acos(Math.max(-1, Math.min(1, dot(r1, r2) / (R1 * R2))));
  if (prograde ? c[2] < 0 : c[2] >= 0) dth = 2 * Math.PI - dth;
  const A = Math.sin(dth) * Math.sqrt((R1 * R2) / (1 - Math.cos(dth)));
  if (!Number.isFinite(A) || Math.abs(A) < 1e-14 * Math.sqrt(R1 * R2)) return null; // Δθ = 0 or π: plane undefined
  const sqmu = Math.sqrt(mu);
  const y = (z: number) => R1 + R2 + (A * (z * stumpffS(z) - 1)) / Math.sqrt(stumpffC(z));
  const F = (z: number) => {
    const yz = y(z);
    if (yz < 0) return -sqmu * dt; // below the y = 0 boundary the time is shorter than any solution
    const C = stumpffC(z);
    return (yz / C) ** 1.5 * stumpffS(z) + A * Math.sqrt(yz) - sqmu * dt;
  };
  const hi = 4 * Math.PI * Math.PI * (1 - 1e-12); // C(z) → 0 at z = 4π²: F → +∞ (zero-revolution limit)
  if (!(F(hi) > 0)) return null;
  let lo = -1;
  for (let k = 0; k < 80 && F(lo) > 0; k++) lo *= 2;
  if (F(lo) > 0) return null;
  const z = bisect(F, lo, hi, 0, 400);
  const yz = y(z);
  const f = 1 - yz / R1, g = A * Math.sqrt(yz / mu), gd = 1 - yz / R2;
  const v1 = scale(sub(r2, scale(r1, f)), 1 / g);
  const v2 = scale(sub(scale(r2, gd), r1), 1 / g);
  return { v1, v2, z, dtheta: dth, residual: Math.abs(F(z)) / (sqmu * dt) };
}

/** Points along the Lambert arc (3D, same frame), from the departure state over [0, dt]. */
export function lambertArc(r1: Vec3, v1: Vec3, dt: number, mu: number, n = 160): Vec3[] {
  const el = stateToElements(r1, v1, mu);
  const q = Number.isFinite(el.a) ? el.a * (1 - el.e) : (el.h * el.h) / (2 * mu);
  const nu0 = el.nu > Math.PI ? el.nu - 2 * Math.PI : el.nu; // stateToElements returns ν ∈ [0, 2π)
  const tp0 = timeSincePeriapsis(q, el.e, mu, nu0);
  const pts: Vec3[] = [];
  for (let k = 0; k <= n; k++) {
    const s = conicState(q, el.e, mu, tp0 + (dt * k) / n);
    pts.push(perifocalToFrame(s.x, s.y, el.Omega, el.i, el.omega));
  }
  return pts;
}
