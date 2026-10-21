import { describe, it, expect } from 'vitest';
import {
  gamma, addVelocities, boost, boost1D, interval, rapidity, dopplerFactor, aberrateCos,
  schwarzschildRadius, M_SUN, GM_SUN, R_SUN, AU, ARCSEC_PER_RAD, SHADOW_B_M,
  perihelionAdvanceWeak, lightDeflectionWeak, lightDeflectionExact, orbitConstantsFromPE, integrateOrbit, integrateTimelike, launchConstants,
  circularOrbitRadii, kerrIsco, kerrHorizon, kerrPhotonOrbit, poundRebkaShift, clockRates, clockRatesGeoid, crossoverRadiusGeoid, GPS_SEMI_MAJOR_AXIS,
  infallProperTime, infallCoordinateTime, einsteinAngle, totalMagnification, imagePositions, lensMap,
  MUON_LIFETIME, G0, crossoverRadius, R_EARTH, type FourVector,
} from '../src';

describe('Special relativity (C1–C5)', () => {
  it.each([[0.5, 1.155], [0.9, 2.294], [0.99, 7.089]])('γ(%s) ≈ %s (brief §6)', (b, g) => {
    expect(gamma(b)).toBeCloseTo(g, 3);
  });
  it('velocity addition never exceeds c and matches rapidity sum', () => {
    expect(addVelocities(0.9, 0.9)).toBeCloseTo(0.994475, 6);
    expect(Math.tanh(rapidity(0.6) + rapidity(0.7))).toBeCloseTo(addVelocities(0.6, 0.7), 14);
  });
  it('general boost preserves the interval', () => {
    const X: FourVector = [3, 1, -2, 0.5];
    const Y = boost(X, [0.3, -0.4, 0.5]);
    expect(interval(Y)).toBeCloseTo(interval(X), 12);
    const [ct, x] = boost1D(2, 1, 0.8);
    expect(ct * ct - x * x).toBeCloseTo(3, 12);
  });
  it('Doppler and aberration limits', () => {
    expect(dopplerFactor(0.6, 1)).toBeCloseTo(2, 12); // √((1+β)/(1−β))
    expect(dopplerFactor(0.6, -1)).toBeCloseTo(0.5, 12);
    expect(aberrateCos(0, 0.5)).toBeCloseTo(0.5, 12);
  });
  it('muon lifetime 2.197 μs (PDG)', () => {
    expect(MUON_LIFETIME * 1e6).toBeCloseTo(2.197, 3);
  });
});

describe('Schwarzschild (D2, D3, B6)', () => {
  it('r_s(Sun) ≈ 2.95 km', () => {
    expect(schwarzschildRadius(M_SUN) / 1000).toBeCloseTo(2.953, 3);
  });
  it('Mercury perihelion advance ≈ 43″/century (Le Verrier/Einstein; 42.98″)', () => {
    const per = perihelionAdvanceWeak(GM_SUN, 0.387_098_93 * AU, 0.205_630_69);
    const orbitsPerCentury = 36525 / 87.969_257;
    const arcsec = per * orbitsPerCentury * ARCSEC_PER_RAD;
    expect(arcsec).toBeCloseTo(42.98, 1);
  });
  it('light deflection at the solar limb ≈ 1.75″', () => {
    expect(lightDeflectionWeak(GM_SUN, R_SUN) * ARCSEC_PER_RAD).toBeCloseTo(1.75, 2);
  });
  it('exact deflection agrees with 2nd-order expansion 4M/b + 15πM²/4b² at b = 1000M', () => {
    const b = 1000;
    const exact = lightDeflectionExact(b)!;
    const approx = 4 / b + (15 * Math.PI) / (4 * b * b);
    expect(Math.abs(exact / approx - 1)).toBeLessThan(1e-4);
  });
  it('photon capture below the shadow radius 3√3 M ≈ 5.196 M', () => {
    expect(SHADOW_B_M).toBeCloseTo(5.196, 3);
    expect(lightDeflectionExact(5.19)).toBeNull();
    expect(lightDeflectionExact(5.25)).not.toBeNull();
  });
  it('ISCO = 6M: circular orbits require L ≥ √12 M and merge at r = 6M', () => {
    const c = circularOrbitRadii(Math.sqrt(12))!;
    expect(c.stable).toBeCloseTo(6, 10);
    expect(c.unstable).toBeCloseTo(6, 10);
    expect(circularOrbitRadii(3.4)).toBeNull();
  });
  it('(p, e) orbit constants reproduce turning points', () => {
    const p = 20, e = 0.3;
    const { E, L } = orbitConstantsFromPE(p, e)!;
    for (const r of [p / (1 + e), p / (1 - e)]) {
      expect((1 - 2 / r) * (1 + (L * L) / (r * r))).toBeCloseTo(E * E, 12);
    }
  });
  it('numerical periapsis advance matches 6π/p for p = 500 M within 1 %', () => {
    const res = integrateOrbit(500, 0.2, 6 * 2 * Math.PI + 1, 6000)!;
    expect(res.advancePerOrbit).not.toBeNull();
    expect(Math.abs(res.advancePerOrbit! / ((6 * Math.PI) / 500) - 1)).toBeLessThan(0.01);
  });
  it('(p, e) beyond the separatrix (p < 6 + 2e): particle turns at u3 = 1/2 − 2/p instead of r_p', () => {
    const res = integrateOrbit(7, 0.6, 40, 4000)!;
    expect(res.stable).toBe(false);
    expect(res.plunged).toBe(false);
    const rMin = Math.min(...res.samples.map((s) => s.r));
    expect(rMin).toBeCloseTo(1 / (0.5 - 2 / 7), 3);
  });
  it('slow tangential launch plunges; fast launch escapes', () => {
    const slow = launchConstants(10, 0.2);
    expect(integrateTimelike(slow.E, slow.L, 10, false, 20, 2000).plunged).toBe(true);
    const fast = launchConstants(10, 0.6);
    expect(integrateTimelike(fast.E, fast.L, 10, false, 20, 2000).escaped).toBe(true);
    // circular orbit at r = 10 M needs local speed v = √(M/(r−2M))
    const circ = launchConstants(10, Math.sqrt(1 / 8));
    const run = integrateTimelike(circ.E, circ.L, 10, false, 30, 2000);
    expect(Math.max(...run.samples.map((s) => Math.abs(s.r - 10)))).toBeLessThan(1e-6);
  });
  it('radial infall: finite proper time, divergent coordinate time at the horizon', () => {
    expect(infallProperTime(10, 2)).toBeCloseTo((2 / 3) * (10 ** 1.5 - 2 ** 1.5) / Math.sqrt(2), 12);
    expect(infallCoordinateTime(10, 2.0001)).toBeGreaterThan(30);
    expect(infallCoordinateTime(10, 2.0000001)).toBeGreaterThan(infallCoordinateTime(10, 2.0001));
  });
});

describe('Kerr characteristic radii (D4)', () => {
  it('ISCO: a=0 → 6M; a=1 → 1M prograde, 9M retrograde (Bardeen et al. 1972)', () => {
    expect(kerrIsco(0)).toBeCloseTo(6, 10);
    expect(kerrIsco(1, true)).toBeCloseTo(1, 6);
    expect(kerrIsco(1, false)).toBeCloseTo(9, 10);
    expect(kerrHorizon(0)).toBe(2);
    expect(kerrPhotonOrbit(0)).toBeCloseTo(3, 10);
    expect(kerrPhotonOrbit(1, true)).toBeCloseTo(1, 10);
    expect(kerrPhotonOrbit(1, false)).toBeCloseTo(4, 10);
  });
});

describe('Clocks: Pound–Rebka and GPS (D1)', () => {
  it('Pound–Rebka Δf/f ≈ 2.46e-15 over 22.5 m', () => {
    expect(poundRebkaShift(G0, 22.5)).toBeCloseTo(2.455e-15, 17);
  });
  it('GPS vs geoid clock reproduces Ashby (2003) factory offset 4.4647e-10 = 38.58 μs/day', () => {
    const r = clockRatesGeoid(GPS_SEMI_MAJOR_AXIS);
    expect(r.net).toBeCloseTo(4.4647e-10, 14);
    expect(r.netUsPerDay).toBeCloseTo(38.575, 2);
    expect(r.srUsPerDay).toBeCloseTo(-7.21, 2);
    expect((crossoverRadiusGeoid() - 6.3781e6) / 1000).toBeCloseTo(3167, -1);
  });
  it('GPS point-mass model (pole clock, R_eq): GR ≈ +45.65, SR ≈ −7.21, net ≈ +38.44 μs/day', () => {
    const r = clockRates(GPS_SEMI_MAJOR_AXIS);
    expect(r.grUsPerDay).toBeCloseTo(45.65, 1);
    expect(r.srUsPerDay).toBeCloseTo(-7.21, 1);
    expect(r.netUsPerDay).toBeCloseTo(38.44, 1);
    expect(crossoverRadius() / R_EARTH).toBe(1.5);
  });
});

describe('Gravitational lensing (D5)', () => {
  it('lens equation and magnification', () => {
    const [tp, tm] = imagePositions(0.5, 1);
    for (const t of [tp, tm]) expect(lensMap(t, 0)[0]).toBeCloseTo(0.5, 12);
    expect(totalMagnification(1)).toBeCloseTo(3 / Math.sqrt(5), 12);
  });
  it('Einstein angle of a 1 M☉ lens halfway to the Galactic bulge (8 kpc) ≈ 1 mas', () => {
    const kpc = 3.0856775814913673e19;
    const th = einsteinAngle(M_SUN, 4 * kpc, 8 * kpc) * ARCSEC_PER_RAD * 1000;
    expect(th).toBeGreaterThan(0.95);
    expect(th).toBeLessThan(1.05);
  });
});
