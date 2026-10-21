/**
 * E1 / A1 reproducible accuracy checks against JPL Horizons (DE441) fixtures:
 *  - planets: Standish "Keplerian Elements for Approximate Positions" (Table 1) heliocentric ecliptic-J2000
 *    positions vs Horizons heliocentric vectors (Earth = Earth–Moon barycentre), 1980–2050;
 *  - Sun: Meeus ch. 25 apparent geocentric RA/Dec and distance vs Horizons apparent (airless), 1990–2040.
 * Inputs are passed in (fixtures are read by the script/test), so the library has no file I/O.
 */
import { planetHeliocentric, type PlanetId } from '../celestial/planets';
import { sunPosition, sunHorizontal, SUN_RISE_SET_ALT } from '../celestial/sun';
import { findRoots } from '../math/roots';
import { angularSeparation } from '../celestial/coords';
import { ARCSEC_PER_RAD } from '../units/convert';

export interface PlanetFixture { planets: Record<string, { jdTdb: number; xyz: [number, number, number] }[]> }
export interface SunFixture { rows: { utc: string; ra: number; dec: number; deltaAu: number }[] }

const stats = (v: number[]) => ({ max: Math.max(...v), rms: Math.sqrt(v.reduce((s, x) => s + x * x, 0) / v.length), n: v.length });

export function validatePlanets(fx: PlanetFixture) {
  return Object.entries(fx.planets).map(([id, rows]) => {
    const ang: number[] = [], dr: number[] = [];
    for (const { jdTdb, xyz } of rows) {
      const p = planetHeliocentric(id as PlanetId, jdTdb);
      const rp = Math.hypot(...p), rr = Math.hypot(...xyz);
      const c = (p[0] * xyz[0] + p[1] * xyz[1] + p[2] * xyz[2]) / (rp * rr);
      ang.push(Math.acos(Math.min(1, c)) * ARCSEC_PER_RAD);
      dr.push(Math.abs(rp - rr));
    }
    return { planet: id, angleArcsec: stats(ang), radiusAu: stats(dr) };
  });
}

const MONTHS: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
/** Parse a Horizons calendar string "1990-Jan-01 00:00" (UT) to a Julian Date. */
export function horizonsUtcToJd(s: string): number {
  const m = /^(\d{4})-([A-Za-z]{3})-(\d{2}) (\d{2}):(\d{2})/.exec(s.trim());
  if (!m) throw new Error(`bad Horizons date: ${s}`);
  const ms = Date.UTC(+m[1], MONTHS[m[2]], +m[3], +m[4], +m[5]);
  return ms / 86_400_000 + 2_440_587.5;
}

export function validateSun(fx: SunFixture) {
  const ang: number[] = [], dr: number[] = [];
  for (const r of fx.rows) {
    const s = sunPosition(horizonsUtcToJd(r.utc));
    ang.push(angularSeparation(s, { ra: r.ra, dec: r.dec }) * 3600);
    dr.push(Math.abs(s.distanceAu - r.deltaAu));
  }
  return { angleArcsec: stats(ang), distanceAu: stats(dr), span: [fx.rows[0].utc, fx.rows[fx.rows.length - 1].utc] };
}

export interface SunRiseSetFixture { sites: Record<string, { lat: number; lon: number; events: { utc: string; kind: 'r' | 's' }[] }> }

/**
 * Sunrise/sunset vs Horizons 'TVH' events (upper limb on the refracted horizon ≡ centre at −0°50′).
 * Horizons prints HH:MM, so the reference itself carries up to 1 min quantisation.
 */
export function validateSunRiseSet(fx: SunRiseSetFixture) {
  return Object.entries(fx.sites).map(([site, { lat, lon, events }]) => {
    const d: number[] = [];
    let missing = 0;
    for (const ev of events) {
      const jd = horizonsUtcToJd(ev.utc);
      const f = (x: number) => sunHorizontal(x, lat, lon, false).alt - SUN_RISE_SET_ALT;
      const roots = findRoots(f, jd - 0.04, jd + 0.04, 24, 1e-9).filter((x) => (f(x + 1e-4) > f(x - 1e-4)) === (ev.kind === 'r'));
      if (!roots.length) { missing++; continue; }
      const best = roots.reduce((a, b) => (Math.abs(b - jd) < Math.abs(a - jd) ? b : a));
      d.push((best - jd) * 1440);
    }
    const abs = d.map(Math.abs);
    // Horizons reports the minute that ENDS the interval containing the event → model − ref ∈ [−1, 0] min is exact.
    const outside = d.map((x) => (x > 0 ? x : x < -1 ? -1 - x : 0));
    return { site, lat, n: d.length, missing, maxBeyondQuantMin: Math.max(...outside), meanMin: d.reduce((a, b) => a + b, 0) / d.length, maxAbsMin: Math.max(...abs), p95AbsMin: abs.sort((a, b) => a - b)[Math.floor(0.95 * (abs.length - 1))] };
  });
}
