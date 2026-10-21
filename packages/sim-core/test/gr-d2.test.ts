import { describe, it, expect } from 'vitest';
import { validateGr } from '../src/validation/grValidation';
import { periapsisAdvanceExact } from '../src';

describe('D2 Schwarzschild geodesics (validate:gr)', () => {
  const v = validateGr();
  it('DOPRI5 periapsis advance equals the exact elliptic-integral value (< 1e-9 relative) for p = 12…500 M', () => {
    for (const a of v.advance) expect(a.relErr).toBeLessThan(1e-9);
  });
  it('exact advance → weak-field 6π/p as p → ∞', () => {
    expect(periapsisAdvanceExact(1e6, 0.2) / ((6 * Math.PI) / 1e6)).toBeCloseTo(1, 4);
  });
  it('Mercury: 42.98″ per century', () => { expect(v.mercury.arcsecPerCentury).toBeCloseTo(42.98, 2); });
  it('circular orbit dt/dτ = 1/√(1 − 3M/r); ISCO binding energy 5.72 %', () => {
    expect(v.circular.relErr).toBeLessThan(1e-14);
    expect(v.isco.bindingEfficiency).toBeCloseTo(1 - Math.sqrt(8 / 9), 12);
  });
});
