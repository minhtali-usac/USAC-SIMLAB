import { describe, it, expect } from 'vitest';
import { validateHz, hzClassify, hzTeffStatus, effectiveFlux, habitableZone, HZ_SYSTEMS } from '../src';

describe('A6 habitable zone (Kopparapu 2014)', () => {
  const r = validateHz();
  it('Sun boundaries match 0.75 / 0.95 / 1.68 / 1.77 au to the quoted precision', () => {
    expect(r.maxSunDiffAu).toBeLessThan(0.005);
  });
  it('Earth T_eq ≈ 255 K (A_B = 0.30) and ≈ 254 K (A_B = 0.306)', () => {
    expect(r.earthTeq030).toBeCloseTo(255, 0);
    expect(r.earthTeq0306).toBeGreaterThan(253.5);
    expect(r.earthTeq0306).toBeLessThan(254.5);
  });
  it('boundaries are ordered over the full fit range and r_HZ inverts S_eff exactly', () => {
    expect(r.ordered).toBe(true);
    expect(r.maxRelFluxErr).toBeLessThan(1e-12);
  });
  it('classification by flux; Earth is conservative, Venus too much flux, Mars (1.524 au < 1.676 au) still conservative', () => {
    expect(hzClassify(1, 5772)).toBe('conservative');
    expect(hzClassify(1 / 0.723 ** 2, 5772)).toBe('tooMuchFlux');
    expect(hzClassify(1 / 1.524 ** 2, 5772)).toBe('conservative');
    expect(hzClassify(1 / 1.72 ** 2, 5780)).toBe('optimisticOuter');
    expect(hzClassify(1 / 2 ** 2, 5780)).toBe('tooLittleFlux');
  });
  it('planet mass changes only the runaway inner edge (5 M⊕ moves it inward)', () => {
    const a = habitableZone(1, 5780, 1), b = habitableZone(1, 5780, 5);
    expect(b.runawayGreenhouse).toBeLessThan(a.runawayGreenhouse);
    expect(b.earlyMars).toBe(a.earlyMars);
    expect(effectiveFlux('runawayGreenhouse', 5780, 0.1)).toBeCloseTo(0.99, 10);
  });
  it('T_eff outside 2600–7200 K is flagged, not silently used', () => {
    expect(hzTeffStatus(2566)).toEqual({ inRange: false, teffUsed: 2600 });
    expect(hzTeffStatus(5772).inRange).toBe(true);
    expect(HZ_SYSTEMS.find((s) => s.id === 'trappist1')!.teff).toBe(2566);
  });
});
