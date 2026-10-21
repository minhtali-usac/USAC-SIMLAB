/**
 * Apparent position of the Sun - low-precision algorithm of Meeus,
 * Astronomical Algorithms 2nd ed., ch. 25 (≈0.01° accuracy for 1950–2050),
 * as also used by the NOAA Solar Calculator.
 * Equation of time: Meeus eq. 28.3 (Smart's formula).
 */
import { DEG, RAD, wrap360, wrap180 } from '../units/convert';
import { centuriesSinceJ2000, jdUtToTt, lmstDeg } from '../time/julian';
import { equatorialToHorizontal, refractionDeg, type Equatorial, type Horizontal } from './coords';
import { findRoots } from '../math/roots';

export interface SunPosition extends Equatorial {
  /** Apparent ecliptic longitude [deg]. */
  lon: number;
  /** Sun–Earth distance [au]. */
  distanceAu: number;
  /** True obliquity [deg]. */
  obliquity: number;
  /** Equation of time [minutes] = apparent solar time − mean solar time. */
  eotMinutes: number;
}

export function sunPosition(jdUt: number): SunPosition {
  const T = centuriesSinceJ2000(jdUtToTt(jdUt));
  const L0 = wrap360(280.466_46 + 36_000.769_83 * T + 0.000_303_2 * T * T);
  const M = wrap360(357.529_11 + 35_999.050_29 * T - 0.000_153_7 * T * T);
  const e = 0.016_708_634 - 0.000_042_037 * T - 0.000_000_126_7 * T * T;
  const Mr = M * DEG;
  const C =
    (1.914_602 - 0.004_817 * T - 0.000_014 * T * T) * Math.sin(Mr) +
    (0.019_993 - 0.000_101 * T) * Math.sin(2 * Mr) +
    0.000_289 * Math.sin(3 * Mr);
  const trueLon = L0 + C;
  const nu = M + C;
  const R = (1.000_001_018 * (1 - e * e)) / (1 + e * Math.cos(nu * DEG));
  const omega = 125.04 - 1934.136 * T;
  const lambda = trueLon - 0.005_69 - 0.004_78 * Math.sin(omega * DEG);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.000_59 - T * 0.001_813))) / 60) / 60;
  const eps = eps0 + 0.002_56 * Math.cos(omega * DEG);
  const l = lambda * DEG, er = eps * DEG;
  const ra = wrap360(Math.atan2(Math.cos(er) * Math.sin(l), Math.cos(l)) * RAD);
  const dec = Math.asin(Math.sin(er) * Math.sin(l)) * RAD;

  const y = Math.tan((eps * DEG) / 2) ** 2;
  const L0r = L0 * DEG;
  const E =
    y * Math.sin(2 * L0r) -
    2 * e * Math.sin(Mr) +
    4 * e * y * Math.sin(Mr) * Math.cos(2 * L0r) -
    0.5 * y * y * Math.sin(4 * L0r) -
    1.25 * e * e * Math.sin(2 * Mr);
  return { ra, dec, lon: wrap360(lambda), distanceAu: R, obliquity: eps, eotMinutes: 4 * E * RAD };
}

/** Topocentric horizontal coordinates of the Sun, optionally with refraction. */
export function sunHorizontal(jdUt: number, latDeg: number, lonDeg: number, refraction = true): Horizontal {
  const s = sunPosition(jdUt);
  const h = equatorialToHorizontal(s, latDeg, lmstDeg(jdUt, lonDeg));
  // solar parallax 8.794″ is negligible here
  return refraction ? { alt: h.alt + refractionDeg(h.alt), az: h.az } : h;
}

/** Standard altitude of the Sun's centre at rise/set: −0°50′ (refraction 34′ + semidiameter 16′). Meeus ch. 15. */
export const SUN_RISE_SET_ALT = -0.8333;

export interface SunEvents {
  /** JD of sunrise / sunset / solar noon (UT); null if the event does not occur that day. */
  rise: number | null;
  set: number | null;
  noon: number;
  noonAltitude: number;
  /** Hours of daylight (rise→set), 24 for polar day, 0 for polar night. */
  dayLengthHours: number;
}

/**
 * Sunrise, sunset and transit for the civil day starting at `jdDayStartUt`
 * (local midnight expressed in UT). Found by scanning the true geometric altitude
 * every 10 min and refining by bisection on the full algorithm (robust at high latitude).
 */
export function sunEvents(jdDayStartUt: number, latDeg: number, lonDeg: number): SunEvents {
  const geomAlt = (jd: number) => sunHorizontal(jd, latDeg, lonDeg, false).alt;
  const f = (jd: number) => geomAlt(jd) - SUN_RISE_SET_ALT;
  const roots = findRoots(f, jdDayStartUt, jdDayStartUt + 1, 144, 1e-7);
  let rise: number | null = null, set: number | null = null;
  for (const r of roots) {
    const rising = f(r + 1e-4) > f(r - 1e-4);
    if (rising && rise === null) rise = r;
    if (!rising && set === null) set = r;
  }
  // transit: hour angle = 0
  const ha = (jd: number) => wrap180(lmstDeg(jd, lonDeg) - sunPosition(jd).ra);
  const transitRoots = findRoots(ha, jdDayStartUt, jdDayStartUt + 1, 48, 1e-8)
    .filter((r) => Math.abs(ha(r)) < 1); // drop the ±180° wrap discontinuity
  const noon = transitRoots[0] ?? jdDayStartUt + 0.5;
  const noonAltitude = sunHorizontal(noon, latDeg, lonDeg, false).alt;
  let dayLengthHours: number;
  if (rise !== null && set !== null) dayLengthHours = (set > rise ? set - rise : set + 1 - rise) * 24;
  else if (rise !== null) dayLengthHours = (jdDayStartUt + 1 - rise) * 24;
  else if (set !== null) dayLengthHours = (set - jdDayStartUt) * 24;
  else dayLengthHours = f(noon) > 0 ? 24 : 0;
  return { rise, set, noon, noonAltitude, dayLengthHours };
}
