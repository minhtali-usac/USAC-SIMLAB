/** A4 — reproducible validation (full report: npm run validate:exo). Thresholds from measured results + margin. */
import { describe, it, expect } from 'vitest';
import { validateTransitFlux, validateEccentricGeometry, validatePresets, transitContacts, anomalies, type OrbitGeometry } from '../src';

describe('A4 transit flux, n = 400 rings', () => {
  const r = validateTransitFlux();
  it('uniform disk vs exact overlap: max |ΔF| < 1e-5 (measured 4.8e-6)', () => {
    expect(r.uniformVsExactOverlap.maxAbsDF).toBeLessThan(1e-5);
  });
  it('quadratic limb darkening vs independent 2-D quadrature: max |ΔF| < 1e-5 (measured 5.2e-6)', () => {
    expect(r.limbDarkenedVs2DQuadrature.maxAbsDF).toBeLessThan(1e-5);
  });
});

describe('A4 eccentric orbit geometry', () => {
  const g = validateEccentricGeometry();
  it('e = 0: numerical contacts reproduce the exact circular T14 (< 1e-8)', () => {
    expect(g.circularNumericalVsExactMaxRel).toBeLessThan(1e-8);
  });
  it('e ≤ 0.5: numerical T14 within 0.2 % of Winn (2010) approximation', () => {
    expect(g.eccentricNumericalVsWinnMaxRel).toBeLessThan(2e-3);
  });
  it('RV sign convention: v_r ∝ +dZ/dt (correlation 1)', () => {
    expect(g.rvVsDZdtCorrelation).toBeGreaterThan(0.999999);
  });
  it('mean anomaly is linear in time; true anomaly is not (e = 0.6)', () => {
    const o: OrbitGeometry = { P: 1, e: 0.6, omega: 0.3, aR: 10, inc: 1.5 };
    const dM = anomalies(0.1, o).M - anomalies(0, o).M;
    expect(dM).toBeCloseTo(2 * Math.PI * 0.1, 12);
    const df1 = anomalies(0.1, o).f - anomalies(0, o).f, df2 = anomalies(0.6, o).f - anomalies(0.5, o).f;
    expect(Math.abs(df1 - df2)).toBeGreaterThan(0.1);
  });
  it('mid-transit (minimum separation) is at conjunction for e = 0', () => {
    const c = transitContacts({ P: 1, e: 0, omega: Math.PI / 2, aR: 8, inc: 1.52 }, 0.1);
    expect(Math.abs(c.tMin)).toBeLessThan(1e-9);
  });
});

describe('A4 presets vs the published solution they cite', () => {
  for (const p of validatePresets()) {
    it(`${p.id} (${p.solution})`, () => {
      if (p.relDiff.K !== undefined) expect(Math.abs(p.relDiff.K)).toBeLessThan(0.01);
      if (p.relDiff.aR !== undefined) expect(Math.abs(p.relDiff.aR)).toBeLessThan(0.005);
      if (p.relDiff.b !== undefined) expect(Math.abs(p.relDiff.b)).toBeLessThan(0.01);
      if (p.relDiff.T14h !== undefined) expect(Math.abs(p.relDiff.T14h)).toBeLessThan(0.005);
      if (p.relDiff.k !== undefined) expect(Math.abs(p.relDiff.k)).toBeLessThan(1e-9);
    });
  }
});
