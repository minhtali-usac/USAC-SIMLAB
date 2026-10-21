import { describe, it, expect } from 'vitest';
import { validateLens } from '../src/validation/lensValidation';

describe('D5 point-mass lensing (validate:lens)', () => {
  const v = validateLens();
  it('inverse ray shooting reproduces the uniform-disk magnification at alignment √(1 + 4/ρ²) to < 1e-4', () => {
    expect(v.aligned.relErr).toBeLessThan(1e-4);
  });
  it('small source (ρ = 0.02): ray shooting within 1 % of the point-source A(u) for u = 0.1…1', () => {
    for (const r of v.pointSource) expect(r.relErr).toBeLessThan(0.01);
  });
  it('image positions satisfy the lens equation; A₊ − A₋ = 1', () => {
    expect(v.maxLensEqErr).toBeLessThan(1e-12);
    expect(v.maxDiffErr).toBeLessThan(1e-12);
  });
  it('solar-limb deflection 1.75″; θ_E(0.5 M☉, 4 → 8 kpc) = 0.71 mas', () => {
    expect(v.solarLimbArcsec).toBeCloseTo(1.751, 3);
    expect(v.thetaEmas).toBeCloseTo(0.713, 3);
  });
});
