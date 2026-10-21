/**
 * B2 - ephemeris layer: dates when the REAL heliocentric phase angle of the target ahead of the departure
 * planet equals the ideal Hohmann value φ_H (geometric screening, not a mission launch window), and the
 * Lambert layer: departure/arrival v∞ and C3 from planet states (patched-conic heliocentric leg only).
 * Planet states: JPL Standish Table 1 approximate elements (ecliptic J2000, TDB ≈ UTC here).
 */
import { planetHeliocentric, planetHeliocentricVelocity, planetElements, type PlanetId } from '../celestial/planets';
import { JD_J2000 } from '../units/constants';
import { bisect } from '../math/roots';
import { hohmann } from './transfer';
import { solveLambert } from './lambert';
import { norm, sub, type Vec3 } from '../math/vec';

const wrapPi = (x: number) => ((x + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;

/** Heliocentric ecliptic longitude [rad]. */
export const helioLongitude = (id: PlanetId, jd: number) => { const p = planetHeliocentric(id, jd); return Math.atan2(p[1], p[0]); };

/** Real phase angle of `to` ahead of `from` at jd, in (−π, π] (ecliptic longitudes). */
export const realPhaseAngle = (from: PlanetId, to: PlanetId, jd: number) => wrapPi(helioLongitude(to, jd) - helioLongitude(from, jd));

/** Ideal circular-orbit Hohmann parameters using the J2000 semi-major axes of the two planets. */
export function idealHohmannBetween(from: PlanetId, to: PlanetId, mu: number) {
  return hohmann(planetElements(from, JD_J2000).a, planetElements(to, JD_J2000).a, mu);
}

/**
 * Dates where realPhase(jd) − φ_H crosses zero, searching forward (dir = +1) or backward (dir = −1)
 * from jdStart, `count` results. Each root is refined by bisection to |Δφ| < 1e-9 rad.
 */
export function hohmannPhaseDates(from: PlanetId, to: PlanetId, phiH: number, jdStart: number, count = 3, dir: 1 | -1 = 1, step = 1, maxDays = 40_000): number[] {
  const f = (jd: number) => wrapPi(realPhaseAngle(from, to, jd) - phiH);
  const out: number[] = [];
  let a = jdStart, fa = f(a);
  for (let k = 0; k * step < maxDays && out.length < count; k++) {
    const b = a + dir * step, fb = f(b);
    if (Math.sign(fa) !== Math.sign(fb) && Math.abs(fb - fa) < 1) out.push(bisect(f, Math.min(a, b), Math.max(a, b), 1e-9));
    a = b; fa = fb;
  }
  return out;
}

export interface LambertLeg {
  jdDep: number; jdArr: number; tof: number;
  rDep: Vec3; vDepPlanet: Vec3; rArr: Vec3; vArrPlanet: Vec3;
  v1: Vec3; v2: Vec3;
  /** v∞ at departure and arrival (spacecraft minus planet, heliocentric) [au/day]. */
  vInfDep: Vec3; vInfArr: Vec3;
  /** Characteristic departure energy C3 = |v∞,dep|² [au²/day²]. */
  c3: number;
  dtheta: number; residual: number;
}

/** Heliocentric Lambert leg between two planets (zero-revolution, prograde). */
export function lambertLeg(from: PlanetId, to: PlanetId, jdDep: number, tof: number, mu: number): LambertLeg | null {
  const rDep = planetHeliocentric(from, jdDep), rArr = planetHeliocentric(to, jdDep + tof);
  const sol = solveLambert(rDep, rArr, tof, mu, true);
  if (!sol) return null;
  const vDepPlanet = planetHeliocentricVelocity(from, jdDep), vArrPlanet = planetHeliocentricVelocity(to, jdDep + tof);
  const vInfDep = sub(sol.v1, vDepPlanet), vInfArr = sub(sol.v2, vArrPlanet);
  return { jdDep, jdArr: jdDep + tof, tof, rDep, vDepPlanet, rArr, vArrPlanet, v1: sol.v1, v2: sol.v2, vInfDep, vInfArr, c3: norm(vInfDep) ** 2, dtheta: sol.dtheta, residual: sol.residual };
}
