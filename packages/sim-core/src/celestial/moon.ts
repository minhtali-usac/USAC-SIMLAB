/**
 * Low-precision lunar ephemeris - Astronomical Almanac "low precision formulae
 * for the Moon" (also Montenbruck & Pfleger, Astronomy on the Personal Computer, §3.3).
 * Accuracy: ~0.3° in longitude, ~0.2° in latitude, ~0.003° in parallax.
 * Phase quantities: Meeus, Astronomical Algorithms 2nd ed., ch. 48.
 */
import { DEG, RAD, wrap360, wrap180 } from '../units/convert';
import { centuriesSinceJ2000, jdUtToTt, lmstDeg } from '../time/julian';
import { eclipticToEquatorial, equatorialToHorizontal, meanObliquityDeg, refractionDeg, type Equatorial, type Horizontal } from './coords';
import { sunPosition } from './sun';
import { bisect, findRoots } from '../math/roots';
import { nextPrincipalPhase } from './lunarPhases';
import { R_EARTH, AU, SYNODIC_MONTH_DAYS } from '../units/constants';

const s = (d: number) => Math.sin(d * DEG);
const c = (d: number) => Math.cos(d * DEG);

export interface MoonPosition extends Equatorial {
  lon: number;
  lat: number;
  /** Horizontal parallax [deg]. */
  parallax: number;
  /** Geocentric distance [km]. */
  distanceKm: number;
}

export function moonPosition(jdUt: number): MoonPosition {
  const T = centuriesSinceJ2000(jdUtToTt(jdUt));
  const lon = wrap360(
    218.32 + 481_267.881 * T +
    6.29 * s(135.0 + 477_198.87 * T) -
    1.27 * s(259.3 - 413_335.36 * T) +
    0.66 * s(235.7 + 890_534.22 * T) +
    0.21 * s(269.9 + 954_397.74 * T) -
    0.19 * s(357.5 + 35_999.05 * T) -
    0.11 * s(186.5 + 966_404.03 * T),
  );
  const lat =
    5.13 * s(93.3 + 483_202.02 * T) +
    0.28 * s(228.2 + 960_400.89 * T) -
    0.28 * s(318.3 + 6_003.15 * T) -
    0.17 * s(217.6 - 407_332.21 * T);
  const parallax =
    0.9508 +
    0.0518 * c(135.0 + 477_198.87 * T) +
    0.0095 * c(259.3 - 413_335.36 * T) +
    0.0078 * c(235.7 + 890_534.22 * T) +
    0.0028 * c(269.9 + 954_397.74 * T);
  const distanceKm = R_EARTH / 1000 / Math.sin(parallax * DEG);
  const eq = eclipticToEquatorial({ lon, lat }, meanObliquityDeg(T));
  return { ...eq, lon, lat, parallax, distanceKm };
}

/** Topocentric horizontal position of the Moon (parallax in altitude applied, Meeus ch. 40 simplified). */
export function moonHorizontal(jdUt: number, latDeg: number, lonDeg: number, refraction = true): Horizontal {
  const m = moonPosition(jdUt);
  const h = equatorialToHorizontal(m, latDeg, lmstDeg(jdUt, lonDeg));
  const altTopo = h.alt - m.parallax * Math.cos(h.alt * DEG);
  return { alt: refraction ? altTopo + refractionDeg(altTopo) : altTopo, az: h.az };
}

/** Standard refraction at the horizon used for rise/set, 34′ (USNO / Meeus ch. 15). */
export const HORIZON_REFRACTION_DEG = 0.5667;
/** Ratio of lunar radius to Earth's equatorial radius (Meeus ch. 55): s = arcsin(k sin π). */
const K_MOON = 0.272_481;

/**
 * Altitude condition for moonrise/moonset, expressed for the TOPOCENTRIC geometric altitude of the
 * Moon's centre (what `moonHorizontal(..., refraction=false)` returns):
 *   h_topo = −0.5667° − s☾,   s☾ = arcsin(k sin π)  (upper limb on the refracted horizon).
 * (For a GEOCENTRIC altitude the condition would instead be h_geo = −0.5667° − s☾ + π.)
 */
export function moonRiseSetAltitude(parallaxDeg: number): number {
  const s = Math.asin(K_MOON * Math.sin(parallaxDeg * DEG)) * RAD;
  return -HORIZON_REFRACTION_DEG - s;
}

export interface RiseSetEvent { type: 'rise' | 'set'; jd: number }

/**
 * All moonrises/moonsets in [jd0, jd1) (UT): scan the topocentric altitude every 10 min and refine
 * every sign change of h_topo − h0 by bisection on the full model (≈ 0.1 s).
 */
export function moonRiseSetEvents(jd0: number, jd1: number, latDeg: number, lonDeg: number): RiseSetEvent[] {
  const f = (jd: number) => moonHorizontal(jd, latDeg, lonDeg, false).alt - moonRiseSetAltitude(moonPosition(jd).parallax);
  const n = Math.max(1, Math.ceil((jd1 - jd0) * 144));
  return findRoots(f, jd0, jd1, n, 1e-6).map((jd) => ({ type: f(jd + 1e-3) > f(jd - 1e-3) ? 'rise' : 'set', jd }));
}

/** First moonrise and moonset in the civil day starting at jdDayStart (UT of local midnight). */
export function moonRiseSet(jdDayStart: number, latDeg: number, lonDeg: number): { rise: number | null; set: number | null } {
  const ev = moonRiseSetEvents(jdDayStart, jdDayStart + 1, latDeg, lonDeg);
  return { rise: ev.find((e) => e.type === 'rise')?.jd ?? null, set: ev.find((e) => e.type === 'set')?.jd ?? null };
}

export interface MoonPhase {
  /** Elongation Moon–Sun as seen from Earth [deg], 0…180. */
  elongation: number;
  /** Phase angle Sun–Moon–Earth [deg]. */
  phaseAngle: number;
  /** Illuminated fraction of the disk, 0…1. */
  illuminated: number;
  /** Ecliptic longitude difference Moon − Sun [deg], 0…360 (0 = new, 180 = full). */
  phaseLon: number;
  /** Approximate age since new moon [days]. */
  ageDays: number;
  waxing: boolean;
}

export function moonPhase(jdUt: number): MoonPhase {
  const m = moonPosition(jdUt);
  const sun = sunPosition(jdUt);
  const cosPsi = Math.cos(m.lat * DEG) * Math.cos((m.lon - sun.lon) * DEG);
  const psi = Math.acos(Math.max(-1, Math.min(1, cosPsi)));
  const R = sun.distanceAu * (AU / 1000); // km
  const delta = m.distanceKm;
  const i = Math.atan2(R * Math.sin(psi), delta - R * Math.cos(psi));
  const phaseLon = wrap360(m.lon - sun.lon);
  return {
    elongation: psi * RAD,
    phaseAngle: i * RAD,
    illuminated: (1 + Math.cos(i)) / 2,
    phaseLon,
    ageDays: (phaseLon / 360) * SYNODIC_MONTH_DAYS,
    waxing: phaseLon < 180,
  };
}

/**
 * Next time (at or after jdUt) at which the Moon–Sun longitude difference equals `targetDeg`
 * (0 new, 90 first quarter, 180 full, 270 last quarter). Meeus ch. 49 series (see lunarPhases.ts).
 */
export function nextLunarPhase(jdUt: number, targetDeg: 0 | 90 | 180 | 270): number {
  return nextPrincipalPhase(jdUt, targetDeg);
}

/** The next occurrence of each of the four principal phases at or after jdUt, in chronological order. */
export function upcomingLunarPhases(jdUt: number): { phase: 0 | 90 | 180 | 270; jd: number }[] {
  return ([0, 90, 180, 270] as const).map((phase) => ({ phase, jd: nextPrincipalPhase(jdUt, phase) })).sort((a, b) => a.jd - b.jd);
}

/** Same, by root-finding on the low-precision series (kept for comparison in validation). */
export function nextLunarPhaseApprox(jdUt: number, targetDeg: 0 | 90 | 180 | 270): number {
  const f = (jd: number) => wrap180(moonPhase(jd).phaseLon - targetDeg);
  // the difference increases ~12.19°/day; step 1 day, look for − → + crossing
  let a = jdUt;
  let fa = f(a);
  for (let k = 0; k < 40; k++) {
    const b = a + 1;
    const fb = f(b);
    if (fa < 0 && fb >= 0 && fb - fa < 90) return bisect(f, a, b, 1e-7);
    a = b;
    fa = fb;
  }
  throw new Error('nextLunarPhase: not found');
}

/** Moon's mean longitude L [deg] (same low-precision theory as moonPosition): the uniform synchronous-rotation angle. */
export const moonMeanLongitude = (jdUt: number) => wrap360(218.32 + 481_267.881 * centuriesSinceJ2000(jdUtToTt(jdUt)));

/** Longitude of the Moon's mean ascending node Ω [deg] (Meeus eq. 47.7, leading terms). */
export const moonAscendingNode = (jdUt: number) => wrap360(125.0445479 - 1934.1362891 * centuriesSinceJ2000(jdUtToTt(jdUt)));

/**
 * Optical libration in longitude, approximated as the difference between the true and the mean longitude,
 * l ≈ λ − L (dominant equation-of-centre term; Meeus ch. 53 gives the full expression, |l| ≲ 7.9°).
 * Positive: the Earth-facing point lies east of the mean sub-Earth point.
 */
export const moonLibrationLongitude = (jdUt: number) => wrap180(moonPosition(jdUt).lon - moonMeanLongitude(jdUt));

/** Sampled geocentric track (ecliptic lon/lat [deg], distance [km]) over [jd0, jd1] - the real perturbed path. */
export function moonTrack(jd0: number, jd1: number, n = 240) {
  const out: { jd: number; lon: number; lat: number; distanceKm: number }[] = [];
  for (let k = 0; k <= n; k++) { const jd = jd0 + ((jd1 - jd0) * k) / n; const m = moonPosition(jd); out.push({ jd, lon: m.lon, lat: m.lat, distanceKm: m.distanceKm }); }
  return out;
}

/** Perigee and apogee passages in [jd0, jd1]: roots of dr/dt of the low-precision distance (accuracy ~±0.1 d, ~±1000 km). */
export function moonApsides(jd0: number, jd1: number) {
  const dr = (jd: number) => moonPosition(jd + 0.01).distanceKm - moonPosition(jd - 0.01).distanceKm;
  return findRoots(dr, jd0, jd1, Math.ceil((jd1 - jd0) * 2), 1e-6).map((jd) => {
    const d = moonPosition(jd).distanceKm;
    return { jd, distanceKm: d, kind: (dr(jd + 0.5) > 0 ? 'perigee' : 'apogee') as 'perigee' | 'apogee' };
  });
}
