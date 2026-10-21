/**
 * Circular restricted three-body problem (CR3BP), synodic rotating frame,
 * non-dimensional units: total mass = 1, separation = 1, mean motion = 1.
 * Primary m1 = 1−μ at (−μ, 0); secondary m2 = μ at (1−μ, 0).
 * Szebehely, "Theory of Orbits" (1967); Murray & Dermott, "Solar System Dynamics", ch. 3.
 *
 * Effective potential Ω = (x²+y²)/2 + (1−μ)/r1 + μ/r2
 * Equations of motion: ẍ − 2ẏ = ∂Ω/∂x,  ÿ + 2ẋ = ∂Ω/∂y
 * Jacobi constant C = 2Ω − (ẋ² + ẏ²) is conserved.
 */
import { bisect } from '../math/roots';
import type { Deriv } from '../math/ode';

export function omega(x: number, y: number, mu: number): number {
  const r1 = Math.hypot(x + mu, y);
  const r2 = Math.hypot(x - 1 + mu, y);
  return 0.5 * (x * x + y * y) + (1 - mu) / r1 + mu / r2;
}

export function omegaGrad(x: number, y: number, mu: number): [number, number] {
  const r1 = Math.hypot(x + mu, y);
  const r2 = Math.hypot(x - 1 + mu, y);
  const r13 = r1 * r1 * r1, r23 = r2 * r2 * r2;
  return [
    x - ((1 - mu) * (x + mu)) / r13 - (mu * (x - 1 + mu)) / r23,
    y - ((1 - mu) * y) / r13 - (mu * y) / r23,
  ];
}

/** State y = [x, y, vx, vy]. */
export function cr3bpDeriv(mu: number): Deriv {
  return (_t, s, d) => {
    const [ox, oy] = omegaGrad(s[0], s[1], mu);
    d[0] = s[2];
    d[1] = s[3];
    d[2] = 2 * s[3] + ox;
    d[3] = -2 * s[2] + oy;
  };
}

export const jacobiConstant = (s: ArrayLike<number>, mu: number) =>
  2 * omega(s[0], s[1], mu) - (s[2] * s[2] + s[3] * s[3]);

export interface LagrangePoint { name: 'L1' | 'L2' | 'L3' | 'L4' | 'L5'; x: number; y: number; C: number }

/** The five Lagrange points (collinear ones by bisection to machine precision). */
export function lagrangePoints(mu: number): LagrangePoint[] {
  const f = (x: number) => omegaGrad(x, 0, mu)[0];
  const eps = 1e-12;
  const xL1 = bisect(f, -mu + eps, 1 - mu - eps);
  const xL2 = bisect(f, 1 - mu + eps, 2 + mu);
  const xL3 = bisect(f, -2 - mu, -mu - eps);
  const pts: LagrangePoint[] = [
    { name: 'L1', x: xL1, y: 0, C: 0 },
    { name: 'L2', x: xL2, y: 0, C: 0 },
    { name: 'L3', x: xL3, y: 0, C: 0 },
    { name: 'L4', x: 0.5 - mu, y: Math.sqrt(3) / 2, C: 0 },
    { name: 'L5', x: 0.5 - mu, y: -Math.sqrt(3) / 2, C: 0 },
  ];
  for (const p of pts) p.C = 2 * omega(p.x, p.y, mu);
  return pts;
}

/** Routh's criterion: L4/L5 are linearly stable iff μ < μ_Routh = (1 − √(23/27))/2 ≈ 0.03852. */
export const ROUTH_MU = 0.5 * (1 - Math.sqrt(23 / 27));

/** Hill-sphere radius approximation (μ/3)^(1/3) in units of the separation. */
export const hillRadius = (mu: number) => Math.cbrt(mu / 3);

/** Hessian of Ω: [Ω_xx, Ω_yy, Ω_xy] (analytic). */
export function omegaHessian(x: number, y: number, mu: number): [number, number, number] {
  const dx1 = x + mu, dx2 = x - 1 + mu;
  const r1 = Math.hypot(dx1, y), r2 = Math.hypot(dx2, y);
  const r13 = r1 ** 3, r15 = r1 ** 5, r23 = r2 ** 3, r25 = r2 ** 5;
  const a = 1 - mu;
  return [
    1 - a * (1 / r13 - (3 * dx1 * dx1) / r15) - mu * (1 / r23 - (3 * dx2 * dx2) / r25),
    1 - a * (1 / r13 - (3 * y * y) / r15) - mu * (1 / r23 - (3 * y * y) / r25),
    (3 * a * dx1 * y) / r15 + (3 * mu * dx2 * y) / r25,
  ];
}

/**
 * Linear stability of an equilibrium of the planar CR3BP (Szebehely 1967, §5; Murray & Dermott §3.8).
 * Linearised: ξ̈ − 2η̇ = Ω_xx ξ + Ω_xy η,  η̈ + 2ξ̇ = Ω_xy ξ + Ω_yy η
 * ⇒ Λ² + (4 − Ω_xx − Ω_yy) Λ + (Ω_xx Ω_yy − Ω_xy²) = 0 with Λ = λ².
 * Linearly stable (bounded) iff both roots Λ are real and negative (purely imaginary λ, distinct).
 */
export function linearStability(x: number, y: number, mu: number) {
  const [xx, yy, xy] = omegaHessian(x, y, mu);
  const b = 4 - xx - yy, c = xx * yy - xy * xy;
  const disc = b * b - 4 * c;
  if (disc < 0) return { stable: false, lambda2: null as [number, number] | null, maxGrowth: Math.sqrt(Math.sqrt(c)) * Math.abs(Math.cos(0.5 * Math.atan2(Math.sqrt(-disc), -b))) };
  const L1 = (-b + Math.sqrt(disc)) / 2, L2 = (-b - Math.sqrt(disc)) / 2;
  const stable = L1 < 0 && L2 < 0;
  const maxGrowth = Math.max(L1 > 0 ? Math.sqrt(L1) : 0, L2 > 0 ? Math.sqrt(L2) : 0);
  return { stable, lambda2: [L1, L2] as [number, number], maxGrowth };
}

/** |∇Ω| at each Lagrange point (equilibrium residual). */
export const lagrangeResiduals = (mu: number) => lagrangePoints(mu).map((p) => { const [gx, gy] = omegaGrad(p.x, p.y, mu); return { name: p.name, residual: Math.hypot(gx, gy) }; });

export type GateState = 'closed' | 'touching' | 'open';
/**
 * State of the Hill-region necks at L1, L2, L3 for Jacobi value C: closed if C > C_i, open if C < C_i,
 * touching if |C − C_i| ≤ tol (the zero-velocity curve just touches at L_i).
 */
export function hillGates(C: number, mu: number, tol = 1e-9) {
  return lagrangePoints(mu).slice(0, 3).map((p) => ({ name: p.name, Ci: p.C, state: (Math.abs(C - p.C) <= tol ? 'touching' : C < p.C ? 'open' : 'closed') as GateState }));
}

/** Physical units of the normalised CR3BP: length d [km], time 1/n [s] with n = √(G(m₁+m₂)/d³). */
export function cr3bpUnits(dKm: number, gmTotalSI: number) {
  const d = dKm * 1000;
  const n = Math.sqrt(gmTotalSI / (d * d * d));
  return { lengthKm: dKm, timeS: 1 / n, periodDays: (2 * Math.PI) / n / 86400, speedKms: (d * n) / 1000 };
}

/** Fixed-step classical RK4 propagation (independent check of DOPRI5). */
export function cr3bpRk4(mu: number, y0: ArrayLike<number>, T: number, h: number): Float64Array {
  const f = cr3bpDeriv(mu);
  const n = Math.ceil(T / h), hh = T / n;
  let y = Float64Array.from(y0);
  const k1 = new Float64Array(4), k2 = new Float64Array(4), k3 = new Float64Array(4), k4 = new Float64Array(4), t = new Float64Array(4);
  for (let s = 0; s < n; s++) {
    f(0, y, k1);
    for (let i = 0; i < 4; i++) t[i] = y[i] + 0.5 * hh * k1[i];
    f(0, t, k2);
    for (let i = 0; i < 4; i++) t[i] = y[i] + 0.5 * hh * k2[i];
    f(0, t, k3);
    for (let i = 0; i < 4; i++) t[i] = y[i] + hh * k3[i];
    f(0, t, k4);
    const yn = new Float64Array(4);
    for (let i = 0; i < 4; i++) yn[i] = y[i] + (hh / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    y = yn;
  }
  return y;
}

/** Named initial conditions; offsets are explicit so the UI can display them. */
export function cr3bpPreset(id: string, mu: number): { state: [number, number, number, number]; ref: string | null; dPos: [number, number]; dVel: [number, number] } {
  const L = lagrangePoints(mu);
  const at = (k: number, dp: [number, number], dv: [number, number]) => ({ state: [L[k].x + dp[0], L[k].y + dp[1], dv[0], dv[1]] as [number, number, number, number], ref: L[k].name, dPos: dp, dVel: dv });
  switch (id) {
    case 'l4exact': return at(3, [0, 0], [0, 0]);
    case 'l1exact': return at(0, [0, 0], [0, 0]);
    case 'l1': return at(0, [-0.002, 0], [0, 0.0005]);
    case 'chaos': return { state: [0.5 - mu, 0, 0, 0.9], ref: null, dPos: [0, 0], dVel: [0, 0] };
    case 'l4':
    default: return at(3, [0.012, 0.006], [0, 0]);
  }
}
