import { describe, it, expect } from 'vitest';
import { validateNBody } from '../src/validation/nbodyValidation';

describe('B4 N-body integrators (validate:nbody)', () => {
  const v = validateNBody();
  it('empirical convergence orders on the figure eight: leapfrog 2, Yoshida 4, RK4 4 (±0.1)', () => {
    const o = Object.fromEntries(v.convergence.map((c) => [c.method, c.order]));
    expect(Math.abs(o.leapfrog - 2)).toBeLessThan(0.1);
    expect(Math.abs(o.yoshida4 - 4)).toBeLessThan(0.1);
    expect(Math.abs(o.rk4 - 4)).toBeLessThan(0.1);
  });
  it('figure eight returns after one period (Yoshida-4, h = T/6400: < 1e-7) with |ΔE/E| < 1e-12', () => {
    const y = v.figure8Return.find((r) => r.method === 'yoshida4')!;
    expect(y.returnErr).toBeLessThan(1e-7);
    expect(y.dE).toBeLessThan(1e-12);
  });
  it('symplectic energy error stays bounded over 1000 yr; RK4 grows secularly (> 5× from first to last century)', () => {
    const L = Object.fromEntries(v.longTerm.map((r) => [r.method, r]));
    expect(L.leapfrog.maxRelErrLast100yr / L.leapfrog.maxRelErrFirst100yr).toBeLessThan(1.5);
    expect(L.yoshida4.maxRelErrLast100yr / L.yoshida4.maxRelErrFirst100yr).toBeLessThan(1.5);
    expect(L.rk4.maxRelErrLast100yr / L.rk4.maxRelErrFirst100yr).toBeGreaterThan(5);
  });
  it('two-body orbit after 10 periods matches the analytic conic (Yoshida-4 < 1e-6, RK4 < 1e-6)', () => {
    const K = Object.fromEntries(v.kepler.map((r) => [r.method, r.posErr]));
    expect(K.yoshida4).toBeLessThan(1e-6);
    expect(K.rk4).toBeLessThan(1e-6);
  });
  it('Pythagorean problem: adaptive DOPRI5 conserves energy to < 1e-7 and ends with the 4+5 binary (Szebehely & Peters 1967); fixed steps fail', () => {
    const d = v.pythagorean.find((r) => r.method === 'dopri5')!;
    expect(d.maxRelEnergyErr).toBeLessThan(1e-7);
    expect(d.boundPairs).toEqual(['4+5']);
    expect(v.pythagorean.find((r) => r.method === 'yoshida4')!.maxRelEnergyErr).toBeGreaterThan(1);
  });
});
