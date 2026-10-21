/**
 * A3 lunar model vs JPL Horizons (DE441) — reproducible validation.
 * Fixtures: reference/fetch_horizons_moon.mjs. Full report: npm run validate:moon.
 * Thresholds are set from the measured results (2026-10-19) with a small margin; they guard
 * against regressions, they are not the published accuracy (see docs/validation/A3-moon.json).
 */
import { describe, it, expect } from 'vitest';
import phases from './fixtures/horizons_moon_phases_2000_2030.json';
import riseset from './fixtures/horizons_moon_riseset_2024_2025.json';
import illum from './fixtures/horizons_moon_illumination_2024_2025.json';
import { validatePhases, validateRiseSet, validateIllumination, phaseJde, moonRiseSetAltitude, deltaTSeconds, type PhaseRef, type RiseSetSiteRef } from '../src';

describe('A3 — principal lunar phases vs Horizons 2000–2030', () => {
  it('Meeus Example 49.a: new moon k = −283 → JDE 2443192.65118', () => {
    expect(phaseJde(-283)).toBeCloseTo(2443192.65118, 4);
  });
  it('all 1 533 phases within 1 minute (measured max 0.3 min)', () => {
    const r = validatePhases(phases.phases as PhaseRef[]);
    expect(r.all.n).toBe(1533);
    expect(r.all.maxAbsMin).toBeLessThan(1);
    expect(Math.abs(r.all.meanMin)).toBeLessThan(0.2);
  });
});

describe('A3 — moonrise/moonset vs Horizons (TVH) 2024–2025, six sites −34°…+60°', () => {
  it('rise/set condition is topocentric: h0 = −0.5667° − s☾ ≈ −0.83° for π = 0.95°', () => {
    expect(moonRiseSetAltitude(0.9508)).toBeCloseTo(-0.5667 - 0.2591, 3);
  });
  it('no missing events; p95 < 2 min; max < 5 min (measured 1.5 / 4.0 min)', () => {
    const r = validateRiseSet(Object.values(riseset.sites) as RiseSetSiteRef[]);
    expect(r.all.missing).toBe(0);
    expect(r.all.n).toBeGreaterThan(8000);
    expect(r.all.p95AbsMin).toBeLessThan(2);
    expect(r.all.maxAbsMin).toBeLessThan(5);
  });
  it('ΔT table: 63.83 s in 2000, 69.36 s in 2020', () => {
    expect(deltaTSeconds(2000)).toBeCloseTo(63.83, 2);
    expect(deltaTSeconds(2020)).toBeCloseTo(69.36, 2);
  });
});

describe('A3 — illuminated fraction vs Horizons 2024–2025', () => {
  it('|Δk| < 0.3 percentage points at every 6-hour sample (measured max 0.19)', () => {
    const r = validateIllumination(illum.samples);
    expect(r.n).toBe(2925);
    expect(r.maxAbsPct).toBeLessThan(0.3);
  });
});
