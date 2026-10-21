/**
 * B3 reproducible checks of the planar CR3BP: Lagrange positions/residuals, critical Jacobi values,
 * linear stability vs Routh, equilibrium hold, Jacobi drift and convergence across tolerances,
 * and an independent fixed-step RK4 cross-check.
 */
import { lagrangePoints, lagrangeResiduals, linearStability, jacobiConstant, cr3bpDeriv, cr3bpRk4, cr3bpPreset, ROUTH_MU } from '../orbits/cr3bp';
import { dopri5 } from '../math/ode';
import { GM_EARTH, GM_MOON, GM_SUN, GM_JUPITER } from '../units/constants';

export const MU_EARTH_MOON = GM_MOON / (GM_EARTH + GM_MOON);
export const MU_SUN_JUPITER = GM_JUPITER / (GM_SUN + GM_JUPITER);

/** Integrate with DOPRI5, tracking the maximum relative Jacobi drift over every accepted step. */
export function runCr3bp(mu: number, y0: number[], T: number, rtol: number) {
  const C0 = jacobiConstant(y0, mu);
  let maxDrift = 0;
  const res = dopri5(cr3bpDeriv(mu), 0, new Float64Array(y0), T, { rtol, atol: rtol * 1e-2, hMax: 0.05 }, (_t, y) => {
    maxDrift = Math.max(maxDrift, Math.abs((jacobiConstant(y, mu) - C0) / C0));
  });
  return { y: res.y, maxDrift, accepted: res.accepted, rejected: res.rejected };
}

export function validateCr3bp() {
  const mu = MU_EARTH_MOON;
  const L = lagrangePoints(mu);
  const reference = { L1: 0.8369, L2: 1.1557, L3: -1.0051, L4x: 0.48785, C1: 3.18834, C2: 3.17216, C3: 3.01215, C4: 2.987998 };
  const stability = L.map((p) => ({ name: p.name, ...linearStability(p.x, p.y, mu) }));
  const routh = { below: linearStability(lagrangePoints(ROUTH_MU * 0.999)[3].x, lagrangePoints(ROUTH_MU * 0.999)[3].y, ROUTH_MU * 0.999).stable, above: linearStability(lagrangePoints(ROUTH_MU * 1.001)[3].x, lagrangePoints(ROUTH_MU * 1.001)[3].y, ROUTH_MU * 1.001).stable };
  // equilibrium hold: exactly at L4 (stable) for t = 100 and at L1 (unstable, growth e^{2.93 t}) for t = 5
  const hold = (id: string, T: number) => { const p = cr3bpPreset(id, mu); const r = runCr3bp(mu, p.state, T, 1e-12); return Math.hypot(r.y[0] - p.state[0], r.y[1] - p.state[1]); };
  const equilibrium = { l4At100: hold('l4exact', 100), l1At5: hold('l1exact', 5) };
  // convergence: three presets, T = 20, rtol 1e-8 / 1e-10 / 1e-12 against rtol 1e-13, plus RK4 h = 1e-4
  const cases = [
    { id: 'l4-earthMoon', mu, y0: cr3bpPreset('l4', mu).state },
    { id: 'l4-sunJupiter', mu: MU_SUN_JUPITER, y0: cr3bpPreset('l4', MU_SUN_JUPITER).state },
    { id: 'chaos-earthMoon', mu, y0: cr3bpPreset('chaos', mu).state },
  ];
  const T = 20;
  const convergence = cases.map((c) => {
    const ref = runCr3bp(c.mu, [...c.y0], T, 1e-13);
    const rows = [1e-8, 1e-10, 1e-12].map((rtol) => {
      const r = runCr3bp(c.mu, [...c.y0], T, rtol);
      return { rtol, posErr: Math.hypot(r.y[0] - ref.y[0], r.y[1] - ref.y[1]), maxJacobiDrift: r.maxDrift, accepted: r.accepted, rejected: r.rejected };
    });
    const rk = cr3bpRk4(c.mu, c.y0, T, 1e-4);
    return { id: c.id, T, refMaxJacobiDrift: ref.maxDrift, rows, rk4VsRefPos: Math.hypot(rk[0] - ref.y[0], rk[1] - ref.y[1]) };
  });
  return { mu, points: L.map((p) => ({ name: p.name, x: p.x, y: p.y, C: p.C })), reference, residuals: lagrangeResiduals(mu), cL4Formula: 3 - mu + mu * mu, stability, routh, equilibrium, convergence };
}
