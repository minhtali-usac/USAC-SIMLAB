import { describe, it, expect } from 'vitest';
import { validateCosmology } from '../src/validation/cosmologyValidation';
import { cosmicFate, densityFractions, decelerationQ, PLANCK18 } from '../src/cosmology/friedmann';

const v = validateCosmology();

describe('D8 — Friedmann models', () => {
  it('ages: EdS 2/(3H0) and flat ΛCDM closed form to 1e-12; Planck 2018 age 13.786 Gyr', () => {
    expect(Math.abs(v.ages.edsNumeric / v.ages.edsExact - 1)).toBeLessThan(1e-12);
    expect(Math.abs(v.ages.flatNumeric / v.ages.flatExact - 1)).toBeLessThan(1e-12);
    expect(v.ages.planck).toBeCloseTo(13.786, 3);
  });
  it('a(t) matches EdS t^{2/3} and de Sitter exp(H0 t) to < 1e-9', () => {
    expect(v.aOfT.edsMaxRelErr).toBeLessThan(1e-9);
    expect(v.aOfT.deSitterMaxRelErr).toBeLessThan(1e-9);
  });
  it('closed matter-only universes follow the cycloid: a_max = Ωm/(Ωm−1), t_crunch = πΩm/[H0(Ωm−1)^{3/2}]', () => {
    for (const c of v.aOfT.closed) {
      expect(Math.abs(c.aMaxRoot! / c.aMaxExact - 1)).toBeLessThan(1e-12);
      expect(Math.abs(c.aMaxNumeric / c.aMaxExact - 1)).toBeLessThan(1e-4);
      expect(Math.abs(c.tCrunchNumeric / c.tCrunchExact - 1)).toBeLessThan(1e-5);
      expect(c.cycloidRelErr).toBeLessThan(2e-4);
    }
  });
  it('Ωm–ΩΛ boundaries from the roots of E²(a) equal the Carroll–Press–Turner closed forms (< 1e-9)', () => {
    expect(v.boundary.maxAbsErrRecollapse).toBeLessThan(1e-9);
    expect(v.boundary.maxAbsErrNoBigBang).toBeLessThan(1e-9);
  });
  it('acceleration onset: flat closed form 1+z = (2ΩΛ/Ωm)^{1/3}; Planck z ≈ 0.64, q0 ≈ −0.53', () => {
    expect(Math.abs(v.planck.zAccelerationFlatNoRadNumeric - v.planck.zAccelerationFlatNoRadExact)).toBeLessThan(1e-10);
    expect(v.planck.zAcceleration).toBeCloseTo(0.6416, 3);
    expect(v.planck.q0).toBeCloseTo(-0.5332, 3);
    expect(v.planck.fractionsSumAtA037).toBeCloseTo(1, 12);
  });
  it('fates of the sample models', () => {
    expect(cosmicFate({ H0: 70, Om: 1, OL: 0, Or: 0 })).toMatchObject({ bigBang: true, recollapse: false });
    expect(cosmicFate({ H0: 70, Om: 3, OL: 0, Or: 0 })).toMatchObject({ bigBang: true, recollapse: true });
    expect(cosmicFate({ H0: 70, Om: 0, OL: 1, Or: 0 })).toMatchObject({ bigBang: false, recollapse: false });
    expect(cosmicFate({ H0: 70, Om: 0.3, OL: -0.2, Or: 0 }).recollapse).toBe(true);
    const bounce = cosmicFate({ H0: 70, Om: 0.3, OL: 2, Or: 0 });
    expect(bounce.bigBang).toBe(false);
    expect(bounce.aMin).toBeGreaterThan(0);
    expect(cosmicFate(PLANCK18)).toMatchObject({ bigBang: true, recollapse: false });
    const f = densityFractions(PLANCK18, 1);
    expect(f.m).toBeCloseTo(0.3111, 10);
    expect(decelerationQ({ H0: 70, Om: 1, OL: 0, Or: 0 }, 0.3)).toBeCloseTo(0.5, 12);
  });
});
