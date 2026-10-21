import { describe, it, expect } from 'vitest';
import { muModel, chi2Sn, metropolis, mockSn, chi2Grid, q0, e2, DCHI2_2D } from '../src';
import { validateSn, UNION21 } from '../src/validation/snValidation';

describe('F8 SN Ia inference', () => {
  const v = validateSn();
  it('fast μ(z) matches the adaptive-quadrature distance modulus to < 1e-6 mag (flat, open, closed, EdS)', () => {
    expect(v.maxMuDiff).toBeLessThan(1e-6);
  });
  it('analytic offset marginalisation equals brute-force minimisation over the offset', () => {
    const { chi2, offset } = chi2Sn(UNION21, 'olcdm', 0.3, 0.7);
    const m = muModel('olcdm', 0.3, 0.7, UNION21.z)!;
    const f = (o: number) => { let s = 0; for (let i = 0; i < UNION21.n; i++) s += ((UNION21.mu[i] - m[i] - o) / UNION21.err[i]) ** 2; return s; };
    expect(f(offset)).toBeCloseTo(chi2, 6);
    expect(f(offset + 0.01)).toBeGreaterThan(chi2);
  });
  it('Union2.1 (stat. only): flat ΛCDM Ωm in [0.25, 0.31], χ²/dof ≈ 1, acceleration > 99.99 %', () => {
    expect(v.union21.flat.om).toBeGreaterThan(0.25);
    expect(v.union21.flat.om).toBeLessThan(0.31);
    expect(v.union21.olcdm.chi2min / v.union21.olcdm.dof).toBeGreaterThan(0.9);
    expect(v.union21.olcdm.chi2min / v.union21.olcdm.dof).toBeLessThan(1.1);
    expect(v.union21.olcdm.pAccel).toBeGreaterThan(0.9999);
    expect(Math.abs(v.union21.wcdm.mean[1] + 1)).toBeLessThan(2 * v.union21.wcdm.sd[1]);
  });
  it('mock catalogues: the 68 % region contains the truth in 40–90 % of 20 seeds', () => {
    expect(v.mockCoverage68).toBeGreaterThanOrEqual(0.4);
    expect(v.mockCoverage68).toBeLessThanOrEqual(0.9);
  });
  it('no-big-bang region is rejected; q₀ signs; flat wCDM with w = −1 equals ΛCDM', () => {
    expect(muModel('olcdm', 0.1, 1.6, [0.5, 1.0])).toBeNull();
    expect(q0('olcdm', 1, 0)).toBeCloseTo(0.5, 12);
    expect(q0('olcdm', 0.3, 0.7)).toBeLessThan(0);
    expect(q0('wcdm', 0.3, -1)).toBeCloseTo(q0('olcdm', 0.3, 0.7), 12);
    expect(e2('wcdm', 0.3, -1, 0.8)).toBeCloseTo(e2('olcdm', 0.3, 0.7, 0.8), 12);
  });
  it('Metropolis reproduces a correlated 2D Gaussian (mean, σ within 10 %) and the grid finds a mock truth', () => {
    const logp = (x: number[]) => -0.5 * ((x[0] ** 2 - 1.2 * x[0] * x[1] + x[1] ** 2) / (1 - 0.36));
    const ch = metropolis(logp, [0, 0], [1.2, 1.2], 5);
    let s0 = 0, s1 = 0, q0s = 0;
    const n = 60000;
    for (let i = 0; i < n; i++) { const { x } = ch.next(); s0 += x[0]; s1 += x[1]; q0s += x[0] * x[0]; }
    expect(Math.abs(s0 / n)).toBeLessThan(0.1);
    expect(Math.abs(Math.sqrt(q0s / n) - 1)).toBeLessThan(0.1);
    expect(ch.acceptance).toBeGreaterThan(0.2);
    const mock = mockSn(UNION21, 'olcdm', 0.3, 0.7, 99);
    const g = chi2Grid(mock, 'olcdm', [0, 1.2], [0, 1.6], 49, 65);
    expect(chi2Sn(mock, 'olcdm', 0.3, 0.7).chi2 - g.min).toBeLessThan(DCHI2_2D[1]);
  });
});
