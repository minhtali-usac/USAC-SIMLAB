import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { validatePlanets, validateSun, validateSunRiseSet, horizonsUtcToJd } from '../src';

const fx = (f: string) => JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', f), 'utf8'));

describe('E1 planets vs JPL Horizons DE441 (1980–2050)', () => {
  const helio = Object.fromEntries(validatePlanets(fx('horizons_planets_1980_2050.json')).map((p) => [p.planet, p]));
  const bary = Object.fromEntries(validatePlanets(fx('horizons_planets_bary_1980_2050.json')).map((p) => [p.planet, p]));
  it('inner planets (heliocentric): Mercury/Venus/EMB < 30″, Mars < 100″', () => {
    for (const k of ['mercury', 'venus', 'earth']) expect(helio[k].angleArcsec.max).toBeLessThan(30);
    expect(helio.mars.angleArcsec.max).toBeLessThan(100);
  });
  it('giants (heliocentric): Jupiter/Saturn < 10′, Uranus < 2′, Neptune < 1′', () => {
    expect(helio.jupiter.angleArcsec.max).toBeLessThan(600);
    expect(helio.saturn.angleArcsec.max).toBeLessThan(600);
    expect(helio.uranus.angleArcsec.max).toBeLessThan(120);
    expect(helio.neptune.angleArcsec.max).toBeLessThan(60);
  });
  it('Neptune tracks the barycentric orbit to ≈ 10″ (Standish quotes 10″)', () => {
    expect(bary.neptune.angleArcsec.max).toBeLessThan(12);
  });
});

describe('A1 Sun (Meeus ch. 25) vs Horizons apparent RA/Dec (1990–2040)', () => {
  const s = validateSun(fx('horizons_sun_apparent_1990_2040.json'));
  it('max angular error < 0.01° (36″), distance < 1e-4 au', () => {
    expect(s.angleArcsec.max).toBeLessThan(36);
    expect(s.distanceAu.max).toBeLessThan(1e-4);
  });
  it('sunrise/sunset at 10.8°N…60.2°N and 33.9°S within 0.15 min beyond the reference 1-min quantisation', () => {
    for (const r of validateSunRiseSet(fx('horizons_sun_riseset_2025.json'))) {
      expect(r.missing).toBe(0);
      expect(r.maxBeyondQuantMin).toBeLessThan(0.15);
    }
  });
  it('parses Horizons calendar dates', () => {
    expect(horizonsUtcToJd('2000-Jan-01 12:00')).toBeCloseTo(2451545.0, 9);
  });
});
