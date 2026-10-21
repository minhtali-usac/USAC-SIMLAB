import { describe, it, expect } from 'vitest';
import { validateSr } from '../src/validation/srValidation';

describe('C1/C2/C4 special relativity (validate:sr)', () => {
  const v = validateSr();
  it('γ relative error limited by float64 rounding of β: < 3e-16/(1 − β)', () => {
    for (const g of v.gamma) expect(g.factoredRelErr).toBeLessThan(3e-16 / g.eps + 1e-15);
  });
  it('interval invariant under boosts (< 1e-12) and velocity addition = tanh(η₁ + η₂) (< 1e-14)', () => {
    expect(v.maxIntervalErr).toBeLessThan(1e-12);
    expect(v.maxAddErr).toBeLessThan(1e-14);
  });
  it('twin paradox: traveller ages 6.36 yr on a 2 × 4.24 ly trip at β = 0.8; boost and formula agree', () => {
    const t = v.twins.find((x) => x.beta === 0.8)!;
    expect(t.tHome).toBeCloseTo(10.6, 10);
    expect(t.tauTraveller).toBeCloseTo(6.36, 10);
    for (const x of v.twins) expect(x.relErr).toBeLessThan(1e-12);
  });
  it('aberration and Doppler formulas equal a full photon 4-momentum boost (< 1e-12)', () => {
    expect(v.aberration.maxCosErr).toBeLessThan(1e-12);
    expect(v.aberration.maxDopplerRelErr).toBeLessThan(1e-11);
  });
  it('muons: cτ₀ = 658.6 m; Earth-frame and muon-frame survival agree; β = 0.9995, 15 km → 48.7 %', () => {
    expect(v.muon.cTau0).toBeCloseTo(658.64, 1);
    expect(Math.abs(v.muon.survivalEarthFrame - v.muon.survivalMuonFrame)).toBeLessThan(1e-14);
    expect(v.muon.survivalEarthFrame).toBeCloseTo(0.4865, 3);
  });
});
