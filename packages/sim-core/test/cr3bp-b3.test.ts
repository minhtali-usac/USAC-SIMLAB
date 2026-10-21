import { describe, it, expect } from 'vitest';
import { validateCr3bp, hillGates, lagrangePoints, linearStability, ROUTH_MU, MU_EARTH_MOON, cr3bpUnits, GM_EARTH, GM_MOON, omegaHessian } from '../src';

const r = validateCr3bp();

describe('B3 Lagrange points and critical Jacobi values (Earth–Moon, μ = 0.0121506)', () => {
  it('positions match the reference table and ∇Ω ≈ 0 at every point', () => {
    const [L1, L2, L3, L4] = r.points;
    expect(L1.x).toBeCloseTo(0.8369, 4);
    expect(L2.x).toBeCloseTo(1.1557, 4);
    expect(L3.x).toBeCloseTo(-1.0051, 4);
    expect(L4.x).toBeCloseTo(0.48785, 5);
    expect(L4.y).toBeCloseTo(Math.sqrt(3) / 2, 15);
    for (const x of r.residuals) expect(x.residual).toBeLessThan(1e-14);
  });
  it('C_L1 = 3.18834, C_L2 = 3.17216, C_L3 = 3.01215, C_L4 = 3 − μ + μ² = 2.987997', () => {
    const [L1, L2, L3, L4] = r.points;
    expect(L1.C).toBeCloseTo(3.18834, 5);
    expect(L2.C).toBeCloseTo(3.17216, 5);
    expect(L3.C).toBeCloseTo(3.01215, 5);
    expect(L4.C).toBeCloseTo(r.cL4Formula, 14);
  });
  it('Hill necks: closed above C_i, touching at C_i, open below; ordering C_L1 > C_L2 > C_L3', () => {
    const [L1, L2, L3] = r.points;
    expect(L1.C > L2.C && L2.C > L3.C).toBe(true);
    expect(hillGates(3.18839, MU_EARTH_MOON).map((g) => g.state)).toEqual(['closed', 'closed', 'closed']);
    expect(hillGates(L1.C, MU_EARTH_MOON)[0].state).toBe('touching');
    expect(hillGates(3.18, MU_EARTH_MOON).map((g) => g.state)).toEqual(['open', 'closed', 'closed']);
    expect(hillGates(2.988368, MU_EARTH_MOON).map((g) => g.state)).toEqual(['open', 'open', 'open']);
  });
});

describe('B3 linear stability', () => {
  it('L1, L2, L3 linearly unstable; L4, L5 linearly stable for Earth–Moon', () => {
    expect(r.stability.map((s) => s.stable)).toEqual([false, false, false, true, true]);
  });
  it('eigen-analysis reproduces the Routh threshold μ_R = 0.0385209 independently', () => {
    expect(ROUTH_MU).toBeCloseTo(0.0385209, 7);
    expect(r.routh).toEqual({ below: true, above: false });
  });
  it('analytic Hessian agrees with finite differences of the gradient', () => {
    const mu = 0.1, x = 0.3, y = 0.4, h = 1e-6;
    const [xx, yy, xy] = omegaHessian(x, y, mu);
    const L = lagrangePoints(mu); void L;
    const g = (a: number, b: number) => { const r1 = Math.hypot(a + mu, b), r2 = Math.hypot(a - 1 + mu, b); return [a - ((1 - mu) * (a + mu)) / r1 ** 3 - (mu * (a - 1 + mu)) / r2 ** 3, b - ((1 - mu) * b) / r1 ** 3 - (mu * b) / r2 ** 3]; };
    expect((g(x + h, y)[0] - g(x - h, y)[0]) / (2 * h)).toBeCloseTo(xx, 6);
    expect((g(x, y + h)[1] - g(x, y - h)[1]) / (2 * h)).toBeCloseTo(yy, 6);
    expect((g(x, y + h)[0] - g(x, y - h)[0]) / (2 * h)).toBeCloseTo(xy, 6);
    expect(linearStability(0.5 - mu, Math.sqrt(3) / 2, mu).stable).toBe(false); // μ = 0.1 > μ_R
  });
});

describe('B3 numerical reliability (DOPRI5)', () => {
  it('state placed exactly at L4 with zero rotating-frame velocity stays put for t = 100; at L1 for t = 5', () => {
    expect(r.equilibrium.l4At100).toBeLessThan(1e-12);
    expect(r.equilibrium.l1At5).toBeLessThan(1e-9);
  });
  it('position error and Jacobi drift converge as rtol decreases (1e-8 → 1e-12), T = 20', () => {
    for (const c of r.convergence) {
      const [a, b, d] = c.rows;
      expect(d.posErr).toBeLessThan(a.posErr);
      expect(d.maxJacobiDrift).toBeLessThan(b.maxJacobiDrift);
      expect(d.maxJacobiDrift).toBeLessThan(1e-11);
    }
  });
  it('independent fixed-step RK4 (h = 1e-4) agrees with the DOPRI5 reference to < 1e-10', () => {
    for (const c of r.convergence) expect(c.rk4VsRefPos).toBeLessThan(1e-10);
  });
  it('physical units: Earth–Moon time unit gives a 27.3-day period at d = 384 400 km', () => {
    expect(cr3bpUnits(384400, GM_EARTH + GM_MOON).periodDays).toBeCloseTo(27.28, 1);
  });
});
