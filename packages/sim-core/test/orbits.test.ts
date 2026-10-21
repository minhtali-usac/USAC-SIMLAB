import { describe, it, expect } from 'vitest';
import {
  solveKepler, solveKeplerHyperbolic, solveBarker, conicState, orbitalPeriod, stateToElements,
  hohmann, lagrangePoints, jacobiConstant, cr3bpDeriv, dopri5, ROUTH_MU,
  stepNBody, totalEnergy, angularMomentumZ, type NBodySystem,
  AU, GM_SUN, GM_EARTH, GM_MOON, SECONDS_PER_DAY, planetPeriodDays,
} from '../src';

describe('Kepler equation (A2, B1)', () => {
  it('e = 0 returns M', () => {
    expect(solveKepler(1.234, 0)).toBe(1.234);
  });
  it.each([0.2, 0.5, 0.9, 0.99, 0.999])('residual < 1e-14 for e = %s', (e) => {
    for (let k = 0; k < 200; k++) {
      const M = -10 + (20 * k) / 199;
      const E = solveKepler(M, e);
      expect(Math.abs(E - e * Math.sin(E) - M)).toBeLessThan(1e-13);
    }
  });
  it('hyperbolic residual', () => {
    for (const e of [1.01, 1.5, 3, 10]) for (const M of [-50, -1, 0.1, 5, 100]) {
      const H = solveKeplerHyperbolic(M, e);
      expect(Math.abs(e * Math.sinh(H) - H - M) / Math.max(1, Math.abs(M))).toBeLessThan(1e-12);
    }
  });
  it('Barker equation', () => {
    for (const Mp of [-5, -0.3, 0, 0.7, 12]) {
      const D = solveBarker(Mp);
      expect(D + D ** 3 / 3).toBeCloseTo(Mp, 12);
    }
  });
});

describe('Two-body conic propagation', () => {
  it('Earth sidereal period ≈ 365.256 d (reference: Astronomical Almanac 365.25636 d)', () => {
    const T = orbitalPeriod(1.000_001_018 * AU, GM_SUN + GM_EARTH + GM_MOON) / SECONDS_PER_DAY;
    expect(T).toBeGreaterThan(365.24);
    expect(T).toBeLessThan(365.27);
    expect(planetPeriodDays('earth')).toBeCloseTo(365.256, 1);
  });
  it.each([0, 0.3, 0.9, 1, 1.5, 4])('energy and angular momentum constant along conic, e = %s', (e) => {
    const mu = 1, q = 1;
    const p = q * (1 + e);
    const eps0 = e === 1 ? 0 : -mu * (1 - e) / (2 * q);
    for (const t of [-7.3, -1, 0, 0.5, 2.2, 13.7]) {
      const s = conicState(q, e, mu, t);
      const eps = 0.5 * s.v * s.v - mu / s.r;
      expect(Math.abs(eps - eps0)).toBeLessThan(1e-12);
      const h = s.x * s.vy - s.y * s.vx;
      expect(h).toBeCloseTo(Math.sqrt(mu * p), 12);
    }
  });
  it('state → elements round trip', () => {
    const s = conicState(0.7, 0.4, 1, 1.3);
    const el = stateToElements([s.x, s.y, 0], [s.vx, s.vy, 0], 1);
    expect(el.e).toBeCloseTo(0.4, 12);
    expect(el.a).toBeCloseTo(0.7 / 0.6, 12);
  });
  it('analytic orbit has no energy drift after 1000 periods (< 1e-9 target, brief §6)', () => {
    const e = 0.6, q = 0.4, mu = 1;
    const a = q / (1 - e), P = 2 * Math.PI * Math.sqrt(a ** 3);
    const s = conicState(q, e, mu, 1000 * P + 0.123);
    const eps = 0.5 * s.v * s.v - 1 / s.r;
    expect(Math.abs(eps / (-1 / (2 * a)) - 1)).toBeLessThan(1e-9);
  });
});

describe('Hohmann transfer Earth → Mars (B2)', () => {
  it('Δv and time of flight match textbook values (Curtis Ex. 8.3: ≈ 2.94 + 2.65 km/s, 259 d)', () => {
    const h = hohmann(1.0 * AU, 1.524 * AU, GM_SUN);
    expect(h.dv1 / 1000).toBeCloseTo(2.94, 1);
    expect(h.dv2 / 1000).toBeCloseTo(2.65, 1);
    expect(h.tof / SECONDS_PER_DAY).toBeGreaterThan(255);
    expect(h.tof / SECONDS_PER_DAY).toBeLessThan(262);
    expect((h.phaseAngle * 180) / Math.PI).toBeCloseTo(44.3, 0);
  });
});

describe('CR3BP (B3)', () => {
  const mu = (GM_EARTH + GM_MOON) / (GM_SUN + GM_EARTH + GM_MOON);
  it('Sun–Earth L1 ≈ 1.5 million km from Earth (brief §6)', () => {
    const L1 = lagrangePoints(mu)[0];
    const km = (1 - mu - L1.x) * AU / 1000;
    expect(km).toBeGreaterThan(1.48e6);
    expect(km).toBeLessThan(1.50e6);
  });
  it('L4/L5 form equilateral triangles; Routh value', () => {
    const L = lagrangePoints(0.01);
    expect(Math.hypot(L[3].x + 0.01, L[3].y)).toBeCloseTo(1, 12);
    expect(ROUTH_MU).toBeCloseTo(0.03852, 5);
  });
  it('Jacobi constant is conserved by DOPRI5 to < 1e-9', () => {
    const m = 0.012_150_585; // Earth–Moon
    const y0 = new Float64Array([0.5, 0, 0, 0.9]);
    const C0 = jacobiConstant(y0, m);
    const r = dopri5(cr3bpDeriv(m), 0, y0, 20, { rtol: 1e-12, atol: 1e-14 });
    expect(Math.abs(jacobiConstant(r.y, m) - C0)).toBeLessThan(1e-9);
  });
});

describe('N-body integrators (B4)', () => {
  const figure8 = (): NBodySystem => ({
    G: 1, softening: 0,
    bodies: [
      { m: 1, x: 0.97000436, y: -0.24308753, z: 0, vx: 0.466203685, vy: 0.43236573, vz: 0 },
      { m: 1, x: -0.97000436, y: 0.24308753, z: 0, vx: 0.466203685, vy: 0.43236573, vz: 0 },
      { m: 1, x: 0, y: 0, z: 0, vx: -0.93240737, vy: -0.86473146, vz: 0 },
    ],
  });
  it('Yoshida-4 keeps figure-eight energy to < 1e-8 over one period (T ≈ 6.3259)', () => {
    const s = figure8();
    const E0 = totalEnergy(s), L0 = angularMomentumZ(s);
    const n = 6000, h = 6.3259 / n;
    for (let i = 0; i < n; i++) stepNBody(s, h, 'yoshida4');
    expect(Math.abs((totalEnergy(s) - E0) / E0)).toBeLessThan(1e-8);
    expect(Math.abs(angularMomentumZ(s) - L0)).toBeLessThan(1e-10);
    // returns close to the initial configuration after one period
    expect(Math.hypot(s.bodies[0].x - 0.97000436, s.bodies[0].y + 0.24308753)).toBeLessThan(1e-3);
  });
  it('leapfrog energy error stays bounded (no secular drift)', () => {
    const s = figure8();
    const E0 = totalEnergy(s);
    let maxErr = 0;
    for (let i = 0; i < 20000; i++) {
      stepNBody(s, 0.001, 'leapfrog');
      maxErr = Math.max(maxErr, Math.abs((totalEnergy(s) - E0) / E0));
    }
    expect(maxErr).toBeLessThan(1e-5);
  });
});
