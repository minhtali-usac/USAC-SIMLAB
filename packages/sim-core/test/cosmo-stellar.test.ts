import { describe, it, expect } from 'vitest';
import {
  PLANCK18, ageAtZ, flatLcdmAgeGyr, comovingDistanceMpc, hubbleDistanceMpc, hubbleTimeGyr, scaleFactorHistory,
  luminosityDistanceMpc, habitableZone, equilibriumTemperature, luminosityFromRT, blackbodyRgb, wienPeakMeters,
  rvSemiAmplitude, transitFlux, overlapArea, transitDuration, radialVelocity, lombScargle, cepheidAbsMagV, distanceFromModulus,
  GM_SUN, G, M_SUN, GM_JUPITER, SIDEREAL_YEAR_DAYS, SECONDS_PER_DAY, T_SUN,
} from '../src';

describe('Cosmology (D8)', () => {
  it('Planck 2018 age ≈ 13.787 Gyr', () => {
    expect(Math.abs(ageAtZ(PLANCK18) - 13.787)).toBeLessThan(0.01); // Planck 2018 Table 2: 13.787 ± 0.020 Gyr
  });
  it('numerical age equals closed form for flat ΛCDM without radiation', () => {
    const c = { H0: 70, Om: 0.3, OL: 0.7, Or: 0 };
    expect(ageAtZ(c)).toBeCloseTo(flatLcdmAgeGyr(70, 0.3), 8);
  });
  it('Einstein–de Sitter: age = 2/(3H0), D_C = 2c/H0 (1 − 1/√(1+z))', () => {
    const c = { H0: 70, Om: 1, OL: 0, Or: 0 };
    expect(ageAtZ(c)).toBeCloseTo((2 / 3) * hubbleTimeGyr(70), 8);
    expect(comovingDistanceMpc(c, 3)).toBeCloseTo(2 * hubbleDistanceMpc(70) * (1 - 0.5), 6);
  });
  it('open empty universe: D_L = (c/H0) z (1 + z/2)', () => {
    const c = { H0: 70, Om: 0, OL: 0, Or: 0 };
    expect(luminosityDistanceMpc(c, 2)).toBeCloseTo(hubbleDistanceMpc(70) * 2 * 2, 6);
  });
  it('a(t) history: a(t0) = 1 at the computed age', () => {
    const h = scaleFactorHistory(PLANCK18);
    expect(h.hasBigBang).toBe(true);
    expect(h.age).toBeCloseTo(13.79, 1);
    const closed = scaleFactorHistory({ H0: 70, Om: 3, OL: 0, Or: 0 }, 200);
    expect(closed.points[closed.points.length - 1].a).toBeLessThan(0.01); // recollapse
  });
});

describe('Stars & habitable zones (A6)', () => {
  it('Sun: L = 4πR²σT⁴ ≈ 1 L☉; Wien peak ≈ 502 nm', () => {
    expect(luminosityFromRT(1, T_SUN)).toBeCloseTo(1, 2);
    expect(wienPeakMeters(T_SUN) * 1e9).toBeCloseTo(502, 0);
  });
  it('Solar HZ (Kopparapu 2014): runaway ≈ 0.95 au, max greenhouse ≈ 1.67 au', () => {
    const hz = habitableZone(1, 5780);
    expect(hz.runawayGreenhouse).toBeCloseTo(0.95, 2);
    expect(hz.maximumGreenhouse).toBeCloseTo(1.676, 2);
    expect(hz.recentVenus).toBeCloseTo(0.75, 2);
    expect(hz.earlyMars).toBeCloseTo(1.768, 2);
  });
  it('Earth equilibrium temperature ≈ 255 K (A = 0.3)', () => {
    expect(equilibriumTemperature(1, 1, 0.3)).toBeCloseTo(255, -1);
  });
  it('blackbody colours: hot is bluish, cool is reddish', () => {
    const hot = blackbodyRgb(20000), cool = blackbodyRgb(3000);
    expect(hot[2]).toBeGreaterThan(hot[0]);
    expect(cool[0]).toBeGreaterThan(cool[2]);
  });
});

describe('Exoplanets (A4)', () => {
  it('Jupiter induces K ≈ 12.5 m/s on the Sun; Earth ≈ 0.09 m/s', () => {
    const mJ = GM_JUPITER / G;
    const Kj = rvSemiAmplitude(4332.59 * SECONDS_PER_DAY, M_SUN, mJ, Math.PI / 2, 0.0484);
    expect(Kj).toBeCloseTo(12.5, 0);
    const Ke = rvSemiAmplitude(SIDEREAL_YEAR_DAYS * SECONDS_PER_DAY, GM_SUN / G, 5.9724e24);
    expect(Ke).toBeCloseTo(0.0895, 3);
  });
  it('uniform-disk transit depth = p² and ring integration matches exact overlap', () => {
    expect(1 - transitFlux(0, 0.1)).toBeCloseTo(0.01, 6);
    for (const d of [0.3, 0.95, 1.05]) {
      expect(1 - transitFlux(d, 0.1, 0, 0, 4000)).toBeCloseTo(overlapArea(d, 0.1) / Math.PI, 5);
    }
  });
  it('limb darkening deepens central transit', () => {
    expect(1 - transitFlux(0, 0.1, 0.4, 0.26)).toBeGreaterThan(0.01);
  });
  it('central transit duration of Earth–Sun ≈ 13 h', () => {
    const T = transitDuration(SIDEREAL_YEAR_DAYS * SECONDS_PER_DAY, 215.03, 0.00916, Math.PI / 2);
    expect(T / 3600).toBeCloseTo(13.0, 0);
  });
  it('RV curve amplitude is K for circular orbits', () => {
    expect(radialVelocity(0, 10)).toBeCloseTo(10, 12);
    expect(radialVelocity(0.5, 10)).toBeCloseTo(-10, 12);
  });
});

describe('Photometry (A5)', () => {
  it('Lomb–Scargle recovers a sinusoid period from uneven sampling', () => {
    const P = 5.366;
    const t: number[] = [], y: number[] = [];
    for (let i = 0; i < 120; i++) { const ti = i * 0.731 + 0.3 * Math.sin(i); t.push(ti); y.push(Math.sin((2 * Math.PI * ti) / P)); }
    const freqs = Array.from({ length: 4000 }, (_, k) => 0.02 + k * 0.0002);
    const pw = lombScargle(t, y, freqs);
    const best = freqs[pw.indexOf(Math.max(...pw))];
    expect(1 / best).toBeCloseTo(P, 1);
  });
  it('δ Cep distance via Leavitt law ≈ 270–300 pc', () => {
    const M = cepheidAbsMagV(5.366249);
    const d = distanceFromModulus(3.95, M, 0.23);
    expect(d).toBeGreaterThan(250);
    expect(d).toBeLessThan(300);
  });
});
