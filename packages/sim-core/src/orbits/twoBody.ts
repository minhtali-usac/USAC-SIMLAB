/**
 * B1 - Kepler two-body problem: conic classification, signed elements, invariants, time ↔ anomaly,
 * equal-time swept sectors and barycentric positions.
 *
 * Conventions (Vallado 4th ed. §2.2–2.3; Murray & Dermott ch. 2):
 *   r(ν) = p / (1 + e cos ν),  p = q(1 + e) = h²/μ,  μ = G(M + m)  (relative orbit of m about M)
 *   signed semi-major axis a = q/(1 − e): a > 0 ellipse, a < 0 hyperbola, a = ∞ parabola
 *   ε = v²/2 − μ/r = μ(e − 1)/(2q)  (= −μ/(2a) when a is finite)
 *   ellipse  M = E − e sin E,     M = n(t − T_p),   n = √(μ/a³)
 *   hyperbola M_h = e sinh H − H, M_h = n_h(t − T_p), n_h = √(μ/|a|³)
 *   parabola D + D³/3 = √(μ/(2q³)) (t − T_p),  D = tan(ν/2)   (Barker)
 *   dA/dt = h/2 (Kepler II);  P = 2π√(a³/μ) only for e < 1.
 * Barycentric positions: r_M = −m/(M+m) r,  r_m = M/(M+m) r,  r = r_m − r_M.
 */
import { adaptiveSimpson } from '../math/quadrature';
import { conicState, solveKepler, solveKeplerHyperbolic, solveBarker, PARABOLIC_E_TOL, type PlanarState } from './kepler';

export type ConicKind = 'circle' | 'ellipse' | 'parabola' | 'hyperbola';

/** e below this is reported as a circle (display only; the dynamics are identical). */
export const CIRCULAR_E_TOL = 1e-9;

/** Classify by eccentricity with explicit tolerances (no branch flipping from round-off near e = 1). */
export function classifyConic(e: number): ConicKind {
  if (Math.abs(e - 1) < PARABOLIC_E_TOL) return 'parabola';
  if (e < CIRCULAR_E_TOL) return 'circle';
  return e < 1 ? 'ellipse' : 'hyperbola';
}

export interface ConicElements {
  kind: ConicKind;
  q: number; e: number; mu: number;
  /** Signed semi-major axis (Infinity for a parabola). */
  a: number;
  /** Apoapsis distance Q = a(1 + e); null for open orbits. */
  Q: number | null;
  /** Semi-latus rectum p = q(1 + e). */
  p: number;
  /** Specific angular momentum h = √(μ p). */
  h: number;
  /** Specific orbital energy ε = μ(e − 1)/(2q). */
  energy: number;
  /** Mean motion n (ellipse) or n_h (hyperbola); √(μ/(2q³)) for the parabola (Barker rate). */
  n: number;
  /** Orbital period P = 2π/n; null when the orbit is open (e ≥ 1). */
  period: number | null;
}

export function conicElements(q: number, e: number, mu: number): ConicElements {
  if (!(q > 0) || !(e >= 0) || !(mu > 0)) throw new RangeError('conicElements: q > 0, e ≥ 0, μ > 0 required');
  const kind = classifyConic(e);
  const p = q * (1 + e);
  const a = kind === 'parabola' ? Infinity : q / (1 - e);
  const closed = kind === 'circle' || kind === 'ellipse';
  const n = kind === 'parabola' ? Math.sqrt(mu / (2 * q ** 3)) : Math.sqrt(mu / Math.abs(a) ** 3);
  return {
    kind, q, e, mu, a, p,
    Q: closed ? a * (1 + e) : null,
    h: Math.sqrt(mu * p),
    energy: kind === 'parabola' ? 0 : (mu * (e - 1)) / (2 * q),
    n,
    period: closed ? (2 * Math.PI) / n : null,
  };
}

/** Time since periapsis t − T_p for true anomaly ν (|ν| < ν_∞ for open orbits). Inverse of `conicState`. */
export function timeSincePeriapsis(q: number, e: number, mu: number, nu: number): number {
  const el = conicElements(q, e, mu);
  if (el.kind === 'parabola') { const D = Math.tan(nu / 2); return (D + (D * D * D) / 3) / el.n; }
  if (e < 1) {
    const turns = Math.round(nu / (2 * Math.PI));
    const nw = nu - turns * 2 * Math.PI;
    const E = 2 * Math.atan2(Math.sqrt(1 - e) * Math.sin(nw / 2), Math.sqrt(1 + e) * Math.cos(nw / 2));
    return (E - e * Math.sin(E) + turns * 2 * Math.PI) / el.n;
  }
  const H = 2 * Math.atanh(Math.sqrt((e - 1) / (e + 1)) * Math.tan(nu / 2));
  return (e * Math.sinh(H) - H) / el.n;
}

/** Asymptotic true anomaly ν_∞ = arccos(−1/e) for e ≥ 1 (π for the parabola); null for closed orbits. */
export const trueAnomalyLimit = (e: number) => (e >= 1 - PARABOLIC_E_TOL ? Math.acos(Math.max(-1, -1 / e)) : null);

/** True anomaly where r = rMax on an open (or closed, if reachable) orbit; null if never reached. */
export function trueAnomalyAtRadius(q: number, e: number, r: number): number | null {
  const c = (q * (1 + e) / r - 1) / e;
  if (e === 0 || c > 1 || c < -1) return null;
  return Math.acos(c);
}

/**
 * Residual of the time equation actually solved at time t (|M − (E − e sin E)| etc.), in radians of mean
 * anomaly - the quantity the root finder drives to zero.
 */
export function keplerResidual(q: number, e: number, mu: number, t: number): number {
  const el = conicElements(q, e, mu);
  if (el.kind === 'parabola') { const Mp = el.n * t; const D = solveBarker(Mp); return Math.abs(D + D ** 3 / 3 - Mp); }
  if (e < 1) {
    const M = el.n * t;
    const E = solveKepler(M, e);
    return Math.abs(E - e * Math.sin(E) - M);
  }
  const M = el.n * t;
  const H = solveKeplerHyperbolic(M, e);
  return Math.abs(e * Math.sinh(H) - H - M) / Math.max(1, Math.abs(M));
}

export interface TwoBodyState {
  rel: PlanarState;
  /** Barycentric positions/velocities of the central body M and the orbiting body m. */
  M: { x: number; y: number; vx: number; vy: number };
  m: { x: number; y: number; vx: number; vy: number };
}

/** Relative conic state plus barycentric split for mass ratio k = m/M (μ must already be G(M+m)). */
export function twoBodyState(q: number, e: number, mu: number, massRatio: number, t: number): TwoBodyState {
  const rel = conicState(q, e, mu, t);
  const fM = massRatio / (1 + massRatio), fm = 1 / (1 + massRatio);
  return {
    rel,
    M: { x: -fM * rel.x, y: -fM * rel.y, vx: -fM * rel.vx, vy: -fM * rel.vy },
    m: { x: fm * rel.x, y: fm * rel.y, vx: fm * rel.vx, vy: fm * rel.vy },
  };
}

export interface SweptSector {
  t0: number; t1: number;
  /** Boundary polyline for drawing (focus first). */
  pts: [number, number][];
  /** Independent quadrature ½∫r²dν (null very close to e = 1, where it is too costly). */
  areaQuad: number | null;
  /** Geometric area ½∫r(ν)² dν between the two equal-time marks (independent of h/2·Δt). */
  area: number;
}

/**
 * N sectors of equal duration Δt = (t1 − t0)/N, bounded by equal-TIME marks (not equal angles).
 * Expected area of each: h Δt / 2.
 */
/**
 * Geometric area of the focal sector between true anomalies ν0 < ν1 (closed form, no time equation):
 *   ellipse   A = (a b / 2) [ (E − e sin E) ]_{E0}^{E1},   tan(E/2) = √((1−e)/(1+e)) tan(ν/2)
 *   hyperbola A = (|a| b / 2) [ (e sinh H − H) ]_{H0}^{H1}, tanh(H/2) = √((e−1)/(e+1)) tan(ν/2)
 *   parabola  A = (p² / 4) [ D + D³/3 ]_{D0}^{D1},          D = tan(ν/2)
 * Unwrapped ν (several revolutions) is handled for the ellipse.
 */
export function focalSectorArea(q: number, e: number, nu0: number, nu1: number): number {
  const kind = classifyConic(e);
  const p = q * (1 + e);
  if (kind === 'parabola') { const F = (nu: number) => { const D = Math.tan(nu / 2); return D + D ** 3 / 3; }; return (p * p / 4) * (F(nu1) - F(nu0)); }
  if (e < 1) {
    const a = q / (1 - e), b = a * Math.sqrt(1 - e * e);
    const F = (nu: number) => {
      const turns = Math.round(nu / (2 * Math.PI)), nw = nu - turns * 2 * Math.PI;
      const E = 2 * Math.atan2(Math.sqrt(1 - e) * Math.sin(nw / 2), Math.sqrt(1 + e) * Math.cos(nw / 2));
      return E - e * Math.sin(E) + turns * 2 * Math.PI;
    };
    return (a * b / 2) * (F(nu1) - F(nu0));
  }
  const A = q / (e - 1), b = A * Math.sqrt(e * e - 1);
  const F = (nu: number) => { const H = 2 * Math.atanh(Math.sqrt((e - 1) / (e + 1)) * Math.tan(nu / 2)); return e * Math.sinh(H) - H; };
  return (A * b / 2) * (F(nu1) - F(nu0));
}

/**
 * N sectors of equal duration Δt = (t1 − t0)/N, bounded by equal-TIME marks (not equal angles).
 * `area` is the closed-form focal-sector area between the ν of the two marks; `areaQuad` (when
 * |e − 1| ≥ 1e-4) is an independent adaptive-Simpson ½∫r(ν)²dν. Expected area of each: h Δt / 2.
 */
export function sweptSectors(q: number, e: number, mu: number, N: number, t0: number, t1: number, drawPts = 40) {
  const el = conicElements(q, e, mu);
  const dt = (t1 - t0) / N;
  const p = el.p;
  const half = (nu: number) => 0.5 * (p / (1 + e * Math.cos(nu))) ** 2;
  const quad = Math.abs(e - 1) >= 1e-4;
  const list: SweptSector[] = [];
  for (let k = 0; k < N; k++) {
    const a0 = t0 + k * dt;
    const pts: [number, number][] = [[0, 0]];
    for (let i = 0; i <= drawPts; i++) { const s = conicState(q, e, mu, a0 + (dt * i) / drawPts); pts.push([s.x, s.y]); }
    const nu0 = conicState(q, e, mu, a0).nu, nu1 = conicState(q, e, mu, a0 + dt).nu;
    const area = Math.abs(focalSectorArea(q, e, nu0, nu1));
    const areaQuad = quad ? Math.abs(adaptiveSimpson(half, nu0, nu1, 1e-11 * (el.h * dt) / 2, 40)) : null;
    list.push({ t0: a0, t1: a0 + dt, pts, area, areaQuad });
  }
  const expected = (el.h * dt) / 2;
  const maxRelDev = Math.max(...list.map((s) => Math.abs(s.area / expected - 1)));
  const qs = list.filter((s) => s.areaQuad !== null);
  const maxRelDevQuad = qs.length ? Math.max(...qs.map((s) => Math.abs(s.areaQuad! / expected - 1))) : null;
  return { list, dt, expected, maxRelDev, maxRelDevQuad };
}
