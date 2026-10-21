/**
 * Time scales.
 * Julian Date from Unix time: JD = ms/86 400 000 + 2 440 587.5 (Unix epoch = JD 2440587.5).
 * GMST: IAU 1982 expression (Meeus, Astronomical Algorithms 2nd ed., eq. 12.4).
 *
 * Simplification (documented in model cards): UT1 ≈ UTC (|UT1−UTC| < 0.9 s) and
 * TT = UT1 + ΔT with ΔT interpolated from a table of observed values (deltaTSeconds).
 */
import { JD_J2000, JULIAN_CENTURY_DAYS } from '../units/constants';
import { wrap360 } from '../units/convert';

export const JD_UNIX_EPOCH = 2_440_587.5;
const MS_PER_DAY = 86_400_000;

/** ΔT = TT − UT1 [s], nominal 2020s value (kept for reference; use deltaTSeconds(year)). */
export const DELTA_T_SECONDS = 69.2;

/**
 * ΔT = TT − UT1 [s] by linear interpolation in observed values (Espenak & Meeus, NASA
 * "Delta T" tables; IERS for 2000–2025). After 2025 ΔT is held at 69.2 s - future ΔT cannot be
 * predicted precisely (TODO: cần xác minh / update from IERS Bulletin A).
 */
const DT_TABLE: [number, number][] = [
  [1900, -2.79], [1910, 10.38], [1920, 21.16], [1930, 24.02], [1940, 24.33], [1950, 29.15], [1960, 33.15],
  [1970, 40.18], [1980, 50.54], [1990, 56.86], [2000, 63.83], [2005, 64.69], [2010, 66.07], [2015, 67.64],
  [2020, 69.36], [2025, 69.2],
];
export function deltaTSeconds(year: number): number {
  if (year <= DT_TABLE[0][0]) return DT_TABLE[0][1];
  for (let i = 1; i < DT_TABLE.length; i++) {
    const [y1, d1] = DT_TABLE[i];
    if (year <= y1) { const [y0, d0] = DT_TABLE[i - 1]; return d0 + ((year - y0) / (y1 - y0)) * (d1 - d0); }
  }
  return DT_TABLE[DT_TABLE.length - 1][1];
}

export function dateToJD(date: Date | number): number {
  const ms = typeof date === 'number' ? date : date.getTime();
  return ms / MS_PER_DAY + JD_UNIX_EPOCH;
}

export function jdToDate(jd: number): Date {
  return new Date((jd - JD_UNIX_EPOCH) * MS_PER_DAY);
}

/** Convert a UT Julian Date to TT. */
export const jdUtToTt = (jdUt: number) => jdUt + deltaTSeconds(2000 + (jdUt - 2_451_545.0) / 365.25) / 86_400;

/** Julian centuries since J2000.0. */
export const centuriesSinceJ2000 = (jd: number) => (jd - JD_J2000) / JULIAN_CENTURY_DAYS;

/** Greenwich mean sidereal time [deg] for a UT1 Julian Date. Meeus eq. 12.4. */
export function gmstDeg(jdUt: number): number {
  const d = jdUt - JD_J2000;
  const T = d / JULIAN_CENTURY_DAYS;
  return wrap360(280.460_618_37 + 360.985_647_366_29 * d + 0.000_387_933 * T * T - (T * T * T) / 38_710_000);
}

/** Local mean sidereal time [deg]; east longitude positive. */
export const lmstDeg = (jdUt: number, lonDeg: number) => wrap360(gmstDeg(jdUt) + lonDeg);
