/**
 * Coordinate transformations on the celestial sphere (all angles in degrees).
 * Formulas: Meeus, Astronomical Algorithms 2nd ed., ch. 13.
 */
import { DEG, RAD, wrap360 } from '../units/convert';
import { OBLIQUITY_J2000_DEG } from '../units/constants';

export interface Equatorial { ra: number; dec: number }
export interface Ecliptic { lon: number; lat: number }
export interface Horizontal { alt: number; az: number }

/** Mean obliquity of the ecliptic [deg] for T Julian centuries (IAU 1980, Meeus eq. 22.2). */
export function meanObliquityDeg(T: number): number {
  return OBLIQUITY_J2000_DEG + (-46.815 * T - 0.000_59 * T * T + 0.001_813 * T * T * T) / 3600;
}

export function eclipticToEquatorial({ lon, lat }: Ecliptic, epsDeg: number): Equatorial {
  const l = lon * DEG, b = lat * DEG, e = epsDeg * DEG;
  const ra = Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
  const dec = Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
  return { ra: wrap360(ra * RAD), dec: dec * RAD };
}

export function equatorialToEcliptic({ ra, dec }: Equatorial, epsDeg: number): Ecliptic {
  const a = ra * DEG, d = dec * DEG, e = epsDeg * DEG;
  const lon = Math.atan2(Math.sin(a) * Math.cos(e) + Math.tan(d) * Math.sin(e), Math.cos(a));
  const lat = Math.asin(Math.sin(d) * Math.cos(e) - Math.cos(d) * Math.sin(e) * Math.sin(a));
  return { lon: wrap360(lon * RAD), lat: lat * RAD };
}

/**
 * Equatorial → horizontal. `lstDeg` = local sidereal time.
 * Azimuth measured from North through East (0° = N, 90° = E).
 */
export function equatorialToHorizontal({ ra, dec }: Equatorial, latDeg: number, lstDeg: number): Horizontal {
  const H = (lstDeg - ra) * DEG, d = dec * DEG, p = latDeg * DEG;
  const alt = Math.asin(Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(H));
  const az = Math.atan2(-Math.cos(d) * Math.sin(H), Math.sin(d) * Math.cos(p) - Math.cos(d) * Math.sin(p) * Math.cos(H));
  return { alt: alt * RAD, az: wrap360(az * RAD) };
}

/**
 * Atmospheric refraction R [deg] computed from the TRUE (airless) altitude h [deg]:
 * Sæmundsson (1986), R = 1.02′ / tan(h + 10.3/(h + 5.11)), standard conditions (1010 hPa, 10 °C). Meeus eq. 16.4.
 */
export function refractionDeg(trueAltDeg: number): number {
  if (trueAltDeg < -1.9) return 0;
  const h = trueAltDeg;
  return (1.02 / Math.tan((h + 10.3 / (h + 5.11)) * DEG)) / 60;
}

/** Unit vector (x toward az=0 North, y toward East, z up) for a horizontal direction. */
export function horizontalToVector({ alt, az }: Horizontal): [number, number, number] {
  const a = alt * DEG, z = az * DEG;
  return [Math.cos(a) * Math.cos(z), Math.cos(a) * Math.sin(z), Math.sin(a)];
}

/** Angular separation between two equatorial positions [deg]. */
export function angularSeparation(p: Equatorial, q: Equatorial): number {
  const d1 = p.dec * DEG, d2 = q.dec * DEG, da = (p.ra - q.ra) * DEG;
  const s = Math.sin((d2 - d1) / 2) ** 2 + Math.cos(d1) * Math.cos(d2) * Math.sin(da / 2) ** 2;
  return 2 * Math.asin(Math.min(1, Math.sqrt(s))) * RAD;
}
