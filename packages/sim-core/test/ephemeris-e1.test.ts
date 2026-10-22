import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  validateVsop87, validateSatellites, validateEarthMoon, fitTheorySpin,
  vsop87Heliocentric, vsop87State, vsop87PeriodDays, vsop87OrbitPath, sunBarycentric,
  SATELLITES, SATELLITE_ERROR_DEG, satellitePosition, satelliteOrbitPath, satellitesOf, THEORY_FRAME,
  iauOrientation, poleEcliptic, bodyToEcliptic, matVec, planetHeliocentric, rotationPeriodHours, isRetrogradeRotator,
  EARTH_MOON_MASS_RATIO, earthMoonBarycentre, jdUtToTt, dateToJD, sunDiscCoverage, sunlightFraction, AU,
  type VsopBody, type Vec3,
} from '../src';

const fx = (f: string) => JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', f), 'utf8'));
const ranges = fx('horizons_planets_vsop_ranges.json');
const sats = fx('horizons_satellites_1900_2100.json');
const emb = fx('horizons_planets_1980_2050.json');
const J2000 = 2_451_545.0;
const norm = (v: Vec3) => Math.hypot(...v);
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const angleDeg = (a: Vec3, b: Vec3) => (Math.acos((a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (norm(a) * norm(b))) * 180) / Math.PI;

describe('E1 · VSOP87 planets vs JPL Horizons DE441', () => {
  const r = validateVsop87(ranges, { modern: [1800, 1900, 2000, 2100, 2200], wide: [-3000, -2000, -1000, 0, 1000, 2000, 3000] });
  const modern = Object.fromEntries(r.modern.planets.map((p) => [p.planet, p]));
  const wide = Object.fromEntries(r.wide.planets.map((p) => [p.planet, p]));

  it('1800–2200: every planet within 5.5″ (inner planets and Jupiter/Saturn within 1.5″, Uranus 2.7″)', () => {
    const limit: Record<string, number> = { mercury: 1.5, venus: 1.3, earth: 1.0, mars: 1.2, jupiter: 1.2, saturn: 1.5, uranus: 2.7, neptune: 5.5 };
    for (const [id, max] of Object.entries(limit)) expect(modern[id].angleArcsec.max, id).toBeLessThan(max);
  });
  it('−3000…+3000: degrades gracefully (inner planets < 20″, giants < 6′)', () => {
    const limit: Record<string, number> = { mercury: 20, venus: 15, earth: 22, mars: 13, jupiter: 190, saturn: 380, uranus: 75, neptune: 110 };
    for (const [id, max] of Object.entries(limit)) expect(wide[id].angleArcsec.max, id).toBeLessThan(max);
  });
  it('within a millennium of today the error is a few arcseconds at most', () => {
    for (const p of r.wide.planets) {
      const near = p.byInterval.filter((b) => b.fromYear >= 0 && b.toYear <= 2000);
      const cap = p.planet === 'uranus' || p.planet === 'neptune' ? 52 : p.planet === 'saturn' ? 6 : 4.5;
      for (const b of near) expect(b.maxArcsec, `${p.planet} ${b.fromYear}`).toBeLessThan(cap);
    }
  });
  it('radius error < 1e-4 au for the inner planets, < 3e-3 au for all', () => {
    for (const p of r.modern.planets) expect(p.radiusAu.max).toBeLessThan(p.planet === 'uranus' || p.planet === 'neptune' ? 1.2e-4 : 1e-5);
  });
  it('is 20–600× closer to DE441 than the Standish Kepler elements it replaces', () => {
    const helio = fx('horizons_planets_1980_2050.json').planets;
    for (const id of ['mercury', 'venus', 'mars', 'jupiter', 'saturn']) {
      let kep = 0, vs = 0;
      for (const { jdTdb, xyz } of helio[id]) {
        const a = planetHeliocentric(id as 'mars', jdTdb), b = vsop87Heliocentric(id as VsopBody, jdTdb);
        kep = Math.max(kep, angleDeg(a, xyz) * 3600); vs = Math.max(vs, angleDeg(b, xyz) * 3600);
      }
      expect(kep / vs, id).toBeGreaterThan(20);
    }
  });
});

describe('E1 · Earth and the Earth–Moon barycentre', () => {
  const e = validateEarthMoon(sats, emb);
  it('VSOP87 "earth" is the geocentre: 0.7″ from Horizons 399 but 6.9″ from the barycentre', () => {
    expect(e.geocentreMaxArcsec).toBeLessThan(0.9);
    expect(e.geocentreAsBarycentreMaxArcsec).toBeGreaterThan(5);
  });
  it('adding the Moon recovers the barycentre to < 0.9″', () => {
    expect(e.barycentreMaxArcsec).toBeLessThan(0.9);
  });
  it('the barycentre lies 1/(1+μ) of the way to the Moon: 4,330–4,940 km from the geocentre', () => {
    for (let k = 0; k < 30; k++) {
      const jd = J2000 + k * 1.0;
      const eb = earthMoonBarycentre(jd), ea = vsop87Heliocentric('earth', jd);
      const d = norm([eb[0] - ea[0], eb[1] - ea[1], eb[2] - ea[2]]) * 149_597_870.7;
      expect(d).toBeGreaterThan(4300);
      expect(d).toBeLessThan(4950);
    }
    expect(EARTH_MOON_MASS_RATIO).toBeCloseTo(81.3005, 3);
  });
});

describe('E1 · VSOP87 internals', () => {
  it('analytic velocity matches a central difference (Earth ≈ 29.78 km/s)', () => {
    const jd = 2_460_000.5, h = 0.01;
    const s = vsop87State('earth', jd), a = vsop87Heliocentric('earth', jd + h), b = vsop87Heliocentric('earth', jd - h);
    for (let i = 0; i < 3; i++) expect(s.velocity[i]).toBeCloseTo((a[i] - b[i]) / (2 * h), 9);
    expect(norm(s.velocity) * 149_597_870.7 / 86_400).toBeGreaterThan(29.2);
    expect(norm(s.velocity) * 149_597_870.7 / 86_400).toBeLessThan(30.3);
  });
  it('sidereal periods: Mercury 87.969 d, Earth 365.256 d, Jupiter 4332.59 d', () => {
    expect(vsop87PeriodDays('mercury')).toBeCloseTo(87.969, 2);
    expect(vsop87PeriodDays('earth')).toBeCloseTo(365.256, 2);
    expect(vsop87PeriodDays('jupiter')).toBeCloseTo(4332.589, 2);
  });
  it('the orbit polyline is closed to a small fraction of the radius and has n + 1 points', () => {
    const path = vsop87OrbitPath('mars', J2000, 200);
    expect(path).toHaveLength(201);
    expect(norm([path[0][0] - path[200][0], path[0][1] - path[200][1], path[0][2] - path[200][2]])).toBeLessThan(2e-3 * 1.52);
  });
  it('the Sun stays within ~0.01 au of the barycentre (Jupiter reflex) and 2 R☉ at most', () => {
    for (let k = 0; k < 40; k++) expect(norm(sunBarycentric(J2000 + k * 300))).toBeLessThan(0.0105);
  });
  it('TT − UTC ≈ 69 s today (the Mercury error of ignoring it is ~16″)', () => {
    const jd = dateToJD(Date.UTC(2026, 9, 22));
    expect((jdUtToTt(jd) - jd) * 86400).toBeGreaterThan(68);
    expect((jdUtToTt(jd) - jd) * 86400).toBeLessThan(70.5);
    const a = vsop87Heliocentric('mercury', jd), b = vsop87Heliocentric('mercury', jdUtToTt(jd));
    expect(angleDeg(a, b) * 3600).toBeGreaterThan(2);
    expect(angleDeg(a, b) * 3600).toBeLessThan(25);
  });
});

describe('E1 · satellites vs JPL Horizons (1900–2100)', () => {
  const stats = Object.fromEntries(validateSatellites(sats).map((s) => [s.id, s]));
  const limit: Record<string, number> = {
    moon: 0.01, io: 0.22, europa: 0.17, ganymede: 0.25, callisto: 0.14,
    mimas: 0.8, enceladus: 0.27, tethys: 0.14, dione: 0.14, rhea: 1.25, titan: 0.2, iapetus: 0.42,
    ariel: 0.95, umbriel: 1.35, titania: 0.95, oberon: 0.85, triton: 1.3,
  };
  it.each(Object.entries(limit))('%s within %s° as seen from its planet', (id, max) => {
    expect(stats[id].maxDeg).toBeLessThan(max);
  });
  it('the Moon is within 50 km of DE441 (the Meeus series it replaces in E1 is ~0.3° off)', () => {
    expect(stats.moon.maxKm).toBeLessThan(50);
  });
  it('lists the satellites of each planet and excludes the poorly modelled ones', () => {
    expect(satellitesOf('jupiter').map((s) => s.id)).toEqual(['io', 'europa', 'ganymede', 'callisto']);
    expect(satellitesOf('uranus')).toHaveLength(4);
    const ids = SATELLITES.map((s) => s.id);
    for (const dropped of ['phobos', 'deimos', 'miranda', 'hyperion']) expect(ids).not.toContain(dropped);
  });
  it('the published error table is within 15 % above the measured maxima', () => {
    for (const s of SATELLITES) {
      expect(SATELLITE_ERROR_DEG[s.id], s.id).toBeGreaterThanOrEqual(stats[s.id].maxDeg);
      expect(SATELLITE_ERROR_DEG[s.id], s.id).toBeLessThan(stats[s.id].maxDeg * 1.15 + 0.003);
    }
  });
  it('orbital radii and periods are those of the real moons', () => {
    const mean = (id: string) => stats[id].meanRadiusKm;
    expect(mean('io')).toBeGreaterThan(420_000); expect(mean('io')).toBeLessThan(423_000);
    expect(mean('titan')).toBeGreaterThan(1_220_000); expect(mean('titan')).toBeLessThan(1_224_000);
    expect(SATELLITES.find((s) => s.id === 'io')!.periodDays).toBeCloseTo(1.769138, 5);
    expect(SATELLITES.find((s) => s.id === 'titan')!.periodDays).toBeCloseTo(15.945, 2);
  });
  it('orbit polylines have n + 1 points and stay at the moon\'s distance', () => {
    const p = satelliteOrbitPath('europa', J2000, 64);
    expect(p).toHaveLength(65);
    for (const v of p) { expect(norm(v)).toBeGreaterThan(660_000); expect(norm(v)).toBeLessThan(682_000); }
  });
  it('Triton orbits retrograde: its angular momentum points against Neptune\'s pole', () => {
    const jd = J2000;
    const r = satellitePosition('triton', jd), r2 = satellitePosition('triton', jd + 0.05);
    const h = cross(r, [r2[0] - r[0], r2[1] - r[1], r2[2] - r[2]]);
    expect(angleDeg(h, poleEcliptic(iauOrientation('neptune', jd)))).toBeGreaterThan(90);
  });
  it('the reference longitudes of the Jovian, Saturnian and Uranian theories are re-derived from Horizons to 0.1°', () => {
    for (const parent of ['jupiter', 'saturn', 'uranus'] as const) {
      expect(Math.abs(fitTheorySpin(sats, parent, 23) - THEORY_FRAME[parent].spinDeg), parent).toBeLessThan(0.1);
    }
  });
});

describe('E1 · IAU orientation of the planets', () => {
  /**
   * Obliquity: angle between the spin axis and the orbit normal (VSOP87 position × velocity). The IAU pole is the
   * positive pole of the invariable plane's side; Venus and Uranus rotate retrograde, so their spin vector is opposite.
   */
  const obliquity = (planet: VsopBody) => {
    const s = vsop87State(planet, J2000);
    const a = angleDeg(poleEcliptic(iauOrientation(planet, J2000)), cross(s.position, s.velocity));
    return planet === 'venus' || planet === 'uranus' ? 180 - a : a;
  };
  it.each([
    ['earth', 23.44], ['mars', 25.19], ['jupiter', 3.13], ['saturn', 26.73],
    ['uranus', 97.77], ['neptune', 28.32], ['venus', 177.36], ['mercury', 0.03],
  ] as const)('%s axial tilt ≈ %s° (NASA fact sheet)', (planet, tilt) => {
    // the fact sheet quotes the tilt to the planet's own orbit (the IAU pole is tied to the invariable plane, a degree off at most)
    expect(Math.abs(obliquity(planet as VsopBody) - tilt)).toBeLessThan(0.6);
  });
  it('Earth: pole at the ecliptic latitude 66.56°, W = 190.147° at J2000 (UT1)', () => {
    const o = iauOrientation('earth', J2000, J2000);
    expect(o.primeMeridianDeg).toBeCloseTo(190.147, 3);
    expect(poleEcliptic(o)[2]).toBeCloseTo(Math.cos((23.4393 * Math.PI) / 180), 3);
  });
  it('Jupiter: IAU pole α₀ = 268.06°, δ₀ = 64.50° and System III rotation 870.536°/day', () => {
    const o = iauOrientation('jupiter', J2000);
    expect(o.poleRaDeg).toBeCloseTo(268.057, 1);
    expect(o.poleDecDeg).toBeCloseTo(64.495, 1);
    const a = iauOrientation('jupiter', J2000 + 1).primeMeridianDeg - o.primeMeridianDeg;
    expect(((a % 360) + 360) % 360).toBeCloseTo(870.536 % 360, 2);
  });
  it('sidereal rotation periods and senses: Earth 23.93 h, Mars 24.62 h, Jupiter 9.925 h, Venus/Uranus retrograde', () => {
    expect(rotationPeriodHours('earth')).toBeCloseTo(23.9345, 3);
    expect(rotationPeriodHours('mars')).toBeCloseTo(24.6229, 3);
    expect(rotationPeriodHours('jupiter')).toBeCloseTo(9.925, 3);
    expect(rotationPeriodHours('mercury')).toBeCloseTo(1407.5, 0);
    expect(rotationPeriodHours('venus')).toBeCloseTo(5832.5, -1);
    for (const b of ['venus', 'uranus'] as const) expect(isRetrogradeRotator(b), b).toBe(true);
    for (const b of ['earth', 'mars', 'jupiter', 'saturn', 'neptune', 'mercury'] as const) expect(isRetrogradeRotator(b), b).toBe(false);
  });
  it('the body-fixed → ecliptic matrix is a proper rotation and sends the pole axis to the pole', () => {
    const o = iauOrientation('saturn', J2000);
    const m = bodyToEcliptic(o);
    const z = matVec(m, [0, 0, 1]);
    for (let i = 0; i < 3; i++) expect(z[i]).toBeCloseTo(poleEcliptic(o)[i], 12);
    const det = m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    expect(det).toBeCloseTo(1, 12);
  });
});

describe('E1 · eclipse shadows (whole pipeline: VSOP87 + Moon theory + IAU Earth rotation + shadow geometry)', () => {
  const AU_KM = AU / 1000, R_EARTH = 6371, R_SUN = 695_700, R_MOON = 1737.4;
  /** The point on Earth's sunlit surface with the least sunlight, as [fraction, latitude°, east longitude°]. */
  function darkestPoint(jdUt: number): [number, number, number] {
    const jdTt = jdUtToTt(jdUt);
    const e = vsop87Heliocentric('earth', jdTt);
    const r = norm(e);
    const sunDir: Vec3 = [-e[0] / r, -e[1] / r, -e[2] / r];
    const moon = satellitePosition('moon', jdTt);
    const R = bodyToEcliptic(iauOrientation('earth', jdTt, jdUt));
    const at = (lat: number, lon: number) => {
      const d = matVec(R, [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)]);
      const p: Vec3 = [d[0] * R_EARTH, d[1] * R_EARTH, d[2] * R_EARTH];
      return d[0] * sunDir[0] + d[1] * sunDir[1] + d[2] * sunDir[2] > 0 ? sunlightFraction(p, sunDir, r * AU_KM, R_SUN, [{ position: moon, radiusKm: R_MOON }]) : 1;
    };
    let best: [number, number, number] = [2, 0, 0];
    for (let lat = -90; lat <= 90; lat += 1) for (let lon = -180; lon < 180; lon += 1) {
      const f = at((lat * Math.PI) / 180, (lon * Math.PI) / 180);
      if (f < best[0]) best = [f, lat, lon];
    }
    const [, la, lo] = best;
    for (let lat = la - 1; lat <= la + 1; lat += 0.02) for (let lon = lo - 1; lon <= lo + 1; lon += 0.02) {
      const f = at((lat * Math.PI) / 180, (lon * Math.PI) / 180);
      if (f < best[0]) best = [f, lat, lon];
    }
    return best;
  }
  it('disc-overlap fraction: none, partial, full and annular cases', () => {
    expect(sunDiscCoverage(1, 0.5, 2)).toBe(0);
    expect(sunDiscCoverage(1, 1, 0)).toBeCloseTo(1, 12);
    expect(sunDiscCoverage(1, 1.2, 0.1)).toBe(1);
    expect(sunDiscCoverage(1, 0.5, 0)).toBeCloseTo(0.25, 12);
    expect(sunDiscCoverage(1, 1, 1)).toBeCloseTo((2 * Math.acos(0.5) - Math.sin(2 * Math.acos(0.5))) / Math.PI, 12);
  });
  it('total eclipse of 8 April 2024: darkest point within 1° of the NASA greatest-eclipse point (25.29°N, 104.14°W at 18:17:16 UT)', () => {
    const [f, lat, lon] = darkestPoint(dateToJD(Date.UTC(2024, 3, 8, 18, 17, 16)));
    expect(f).toBeLessThan(0.01);
    expect(Math.abs(lat - 25.29)).toBeLessThan(1);
    expect(Math.abs(lon - -104.14)).toBeLessThan(1);
  });
  it('annular eclipse of 14 October 2023 at greatest eclipse (17:59:32 UT): a ring remains, about 9 % of the sunlight', () => {
    const [f, lat, lon] = darkestPoint(dateToJD(Date.UTC(2023, 9, 14, 17, 59, 32)));
    expect(f).toBeGreaterThan(0.06);
    expect(f).toBeLessThan(0.14);
    expect(Math.abs(lat - 11.4)).toBeLessThan(1.5);
    expect(Math.abs(lon - -83.1)).toBeLessThan(1.5);
  });
  it('no eclipse at full moon without alignment: nothing is shaded at first quarter', () => {
    const [f] = darkestPoint(dateToJD(Date.UTC(2024, 3, 15, 19, 13)));
    expect(f).toBeGreaterThan(0.999);
  });
});
