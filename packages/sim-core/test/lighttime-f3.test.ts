import { describe, it, expect } from 'vitest';
import { lightTimeSeconds, earthMoonLight, earthSunLight, earthPlanetLight, sunPlanetAu, FAR_TARGETS, farTargetLight, AU, dateToJD } from '../src';

describe('F3 light-travel times', () => {
  it('1 au takes 499.004784 s (IAU 2012 au, exact c)', () => {
    expect(lightTimeSeconds(AU)).toBeCloseTo(499.004784, 6);
  });
  it('Moon 1.19–1.36 s and Sun 490–508 s over a year (perigee/apogee, perihelion/aphelion)', () => {
    const jd0 = dateToJD(Date.UTC(2026, 0, 1));
    let mMin = 9, mMax = 0, sMin = 1e9, sMax = 0;
    for (let d = 0; d < 366; d += 0.5) {
      const m = earthMoonLight(jd0 + d).seconds, s = earthSunLight(jd0 + d).seconds;
      mMin = Math.min(mMin, m); mMax = Math.max(mMax, m); sMin = Math.min(sMin, s); sMax = Math.max(sMax, s);
    }
    expect(mMin).toBeGreaterThan(1.19); expect(mMax).toBeLessThan(1.36);
    expect(sMin).toBeGreaterThan(490); expect(sMax).toBeLessThan(508);
  });
  it('Earth–Mars one-way light time stays within 3–23 min; Neptune ≈ 4.1 h from the Sun', () => {
    const jd0 = dateToJD(Date.UTC(2026, 0, 1));
    for (let d = 0; d < 800; d += 20) { const m = earthPlanetLight('mars', jd0 + d).seconds / 60; expect(m).toBeGreaterThan(3); expect(m).toBeLessThan(23); }
    expect(sunPlanetAu('neptune', jd0) * 499.004784 / 3600).toBeGreaterThan(4.0);
    expect(sunPlanetAu('neptune', jd0) * 499.004784 / 3600).toBeLessThan(4.25);
  });
  it('Proxima ≈ 4.25 ly, Andromeda ≈ 2.56 million ly (from the cited distances)', () => {
    const P = farTargetLight(FAR_TARGETS.find((t) => t.id === 'proxima')!), A = farTargetLight(FAR_TARGETS.find((t) => t.id === 'andromeda')!);
    expect(P.ly).toBeCloseTo(4.2465, 3);
    expect(A.ly / 1e6).toBeCloseTo(2.56, 2);
  });
});
