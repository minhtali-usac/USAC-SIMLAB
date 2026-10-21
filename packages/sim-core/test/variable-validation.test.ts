/** A5 — reproducible validation (full report: npm run validate:var). */
import { describe, it, expect } from 'vitest';
import { validateGlsImplementation, periodRecovery, deltaCepDistanceCheck, leavittMV, cepheidDistance, intensityMeanMag } from '../src';

describe('A5 GLS periodogram', () => {
  it('matches the independent Zechmeister & Kürster closed form (< 1e-10)', () => {
    const r = validateGlsImplementation();
    expect(r.maxAbsPowerDiffVsClosedForm).toBeLessThan(1e-10);
    expect(r.noiseFreePeakPeriod).toBeCloseTo(3.7, 1);
    expect(r.noiseFreePeakPower).toBeGreaterThan(0.99);
  });
  it('δ Cep (N = 80, T = 40 d, σ = 0.03): ≥ 17/20 recovered with one harmonic (measured 18/20)', () => {
    const [c] = periodRecovery({ stars: ['dcep'], Ns: [80], Ts: [40], sigmas: [0.03], nterms: [1] });
    expect(c.recovered).toBeGreaterThanOrEqual(17);
  });
  it('Algol needs harmonics: 1 term ≤ 8/20, 3 terms ≥ 17/20 (measured 4 and 19)', () => {
    const [one] = periodRecovery({ stars: ['algol'], Ns: [80], Ts: [40], sigmas: [0.03], nterms: [1] });
    const [three] = periodRecovery({ stars: ['algol'], Ns: [80], Ts: [40], sigmas: [0.03], nterms: [3] });
    expect(one.recovered).toBeLessThanOrEqual(8);
    expect(three.recovered).toBeGreaterThanOrEqual(17);
  });
});

describe('A5 distance chain', () => {
  it('Leavitt law (Benedict 2007): M_V(10 d) = −4.05 ± 0.02', () => {
    const r = leavittMV(10);
    expect(r.M).toBeCloseTo(-4.05, 10);
    expect(r.sigma).toBeCloseTo(0.02, 10);
  });
  it('extinction enters the modulus: μ0 = m − A_V − M; A_V = 1 mag shrinks d by 10^{0.2}', () => {
    const a = cepheidDistance(10, -4, 0), b = cepheidDistance(10, -4, 1);
    expect(a.mu0 - b.mu0).toBeCloseTo(1, 12);
    expect(a.d / b.d).toBeCloseTo(10 ** 0.2, 12);
  });
  it('intensity mean ≠ magnitude mean for a ±1 mag sinusoid (brighter)', () => {
    expect(intensityMeanMag((t) => 5 + Math.sin(2 * Math.PI * t), 1)).toBeLessThan(5);
  });
  it('δ Cep chain within 1σ of the HST parallax distance 273 ± 11 pc (measured 265 pc, −0.66σ)', () => {
    const r = deltaCepDistanceCheck();
    expect(Math.abs(r.nSigma)).toBeLessThan(1);
  });
});
