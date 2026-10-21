import { describe, it, expect } from 'vitest';
import {
  classifyConic, conicElements, conicState, timeSincePeriapsis, keplerResidual, sweptSectors, twoBodyState,
  validateKepler, KEPLER_PRESETS, MU_SUN_AU_DAY, GAUSSIAN_YEAR_DAYS, PARABOLIC_E_TOL,
} from '../src';

const preset = (id: string) => KEPLER_PRESETS.find((p) => p.id === id)!;

describe('B1 conic classification and signed elements', () => {
  it('classifies with explicit tolerances around e = 1', () => {
    expect(classifyConic(0)).toBe('circle');
    expect(classifyConic(0.5)).toBe('ellipse');
    expect(classifyConic(1 - PARABOLIC_E_TOL / 2)).toBe('parabola');
    expect(classifyConic(1 + 2 * PARABOLIC_E_TOL)).toBe('hyperbola');
  });
  it('ellipse: q = a(1 − e), Q = a(1 + e), p = a(1 − e²), ε = −μ/2a, finite P', () => {
    const el = conicElements(0.4, 0.7, 2);
    expect(el.q).toBeCloseTo(el.a * (1 - 0.7), 14);
    expect(el.Q!).toBeCloseTo(el.a * 1.7, 14);
    expect(el.p).toBeCloseTo(el.a * (1 - 0.49), 14);
    expect(el.energy).toBeCloseTo(-2 / (2 * el.a), 14);
    expect(el.period!).toBeCloseTo(2 * Math.PI * Math.sqrt(el.a ** 3 / 2), 12);
  });
  it('parabola: a = ∞, ε = 0, no period, no apoapsis', () => {
    const el = conicElements(1, 1, 1);
    expect(el.a).toBe(Infinity);
    expect(el.energy).toBe(0);
    expect(el.period).toBeNull();
    expect(el.Q).toBeNull();
  });
  it('hyperbola: a < 0, ε = μ(e − 1)/(2q) > 0, no period', () => {
    const el = conicElements(0.2559, 1.2011, MU_SUN_AU_DAY);
    expect(el.a).toBeLessThan(0);
    expect(el.energy).toBeGreaterThan(0);
    expect(el.energy).toBeCloseTo(-MU_SUN_AU_DAY / (2 * el.a), 15);
    expect(el.period).toBeNull();
  });
  it('e → 0: r = q and v = √(μ/q) everywhere', () => {
    for (const t of [0, 1, 5.5]) {
      const s = conicState(2, 0, 1, t);
      expect(s.r).toBeCloseTo(2, 14);
      expect(s.v).toBeCloseTo(Math.sqrt(0.5), 14);
    }
  });
});

describe('B1 time equations (Kepler, hyperbolic Kepler, Barker)', () => {
  it.each([0, 0.3, 0.9, 0.999999, 1, 1.000001, 1.2, 3.5])('residual, invariants and t(ν) round trip for e = %s', (e) => {
    const g = validateKepler().grid.find((x) => x.e === e)!;
    expect(g.maxResidual).toBeLessThan(1e-11);
    expect(g.maxEnergyDev).toBeLessThan(1e-14);
    expect(g.maxHDev).toBeLessThan(1e-8);
    expect(g.maxRoundTripRel).toBeLessThan(1e-11);
  });
  it('timeSincePeriapsis inverts conicState across several revolutions', () => {
    const s = conicState(1, 0.5, 1, 31.7);
    const P = conicElements(1, 0.5, 1).period!;
    expect(timeSincePeriapsis(1, 0.5, 1, s.nu)).toBeCloseTo(31.7, 9);
    expect(P).toBeGreaterThan(0);
  });
  it('keplerResidual is at round-off level', () => {
    expect(keplerResidual(1, 0.97, 1, 123.4)).toBeLessThan(1e-13);
  });
});

describe('B1 Kepler II: equal areas in equal times', () => {
  it('geometric area of each equal-time sector equals h Δt / 2 (e = 0.7 closed, e = 1.5 open window)', () => {
    const c = conicElements(0.4, 0.7, 1);
    const s1 = sweptSectors(0.4, 0.7, 1, 12, -c.period! / 2, c.period! / 2), s2 = sweptSectors(0.4, 1.5, 1, 12, -10, 10);
    for (const s of [s1, s2]) { expect(s.maxRelDev).toBeLessThan(1e-12); expect(s.maxRelDevQuad!).toBeLessThan(1e-10); }
  });
  it('holds over the whole e grid including e = 1 ± 1e-6', () => {
    for (const g of validateKepler().grid) {
      expect(g.sectorMaxRelDev).toBeLessThan(1e-9);
      if (g.sectorMaxRelDevQuad !== null) expect(g.sectorMaxRelDevQuad).toBeLessThan(1e-9);
    }
  });
});

describe('B1 Kepler III and the two-body μ = G(M + m)', () => {
  it('Gaussian year: massless body at a = 1 au, μ = GM☉ → 365.2568983 d', () => {
    expect(GAUSSIAN_YEAR_DAYS).toBeCloseTo(365.2568983, 6);
    expect(conicElements(1, 0, MU_SUN_AU_DAY).period!).toBeCloseTo(365.2568983, 6);
  });
  it('normalised form (P/yr_G)² = (a/au)³ / ((M+m)/M☉) for several M, m, a', () => {
    for (const M of [0.3, 1, 4]) for (const k of [0, 1e-3, 0.5]) for (const a of [0.5, 1, 30]) {
      const P = conicElements(a, 0, MU_SUN_AU_DAY * M * (1 + k)).period! / GAUSSIAN_YEAR_DAYS;
      expect(P * P).toBeCloseTo(a ** 3 / (M * (1 + k)), 9);
    }
  });
  it('Earth preset (Standish J2000, μ = G(M☉ + M⊕ + M☾)) within 1e-5 of NASA 365.256 d', () => {
    const p = preset('earth');
    const P = conicElements(p.q, p.e, MU_SUN_AU_DAY * (1 + p.massRatio)).period!;
    expect(Math.abs(P / 365.256 - 1)).toBeLessThan(1e-5);
  });
  it('including m brings Jupiter’s Kepler-III period within 3e-5 of the JPL mean motion (vs 4.5e-4 for m = 0)', () => {
    const r = validateKepler().presets.find((x) => x.id === 'jupiter')!;
    expect(Math.abs(r.relDiff)).toBeLessThan(3e-5);
    expect(Math.abs(r.periodTestParticleDays / r.refPeriodDays - 1)).toBeGreaterThan(4e-4);
  });
  it('SBDB small bodies (Ceres, Halley) reproduce their catalogue period to < 1e-9', () => {
    for (const id of ['ceres', 'halley']) expect(Math.abs(validateKepler().presets.find((x) => x.id === id)!.relDiff)).toBeLessThan(1e-9);
  });
  it('barycentric split: M r_M + m r_m = 0 and r_m − r_M = r', () => {
    expect(validateKepler().barycentreMaxError).toBeLessThan(1e-14);
    const s = twoBodyState(1, 0.3, 2, 1, 0.7);
    expect(Math.hypot(s.M.x, s.M.y)).toBeCloseTo(Math.hypot(s.m.x, s.m.y), 14);
  });
});
