/**
 * Planetary positions from the VSOP87 theory (Bretagnon & Francou 1988), using the truncated series that
 * ship with Celestia. Coordinates are heliocentric, in the J2000 ecliptic and equinox frame, in au; time is
 * TDB ≈ TT (convert UTC with `jdUtToTt`: at 69 s, ignoring the offset costs ~16″ for Mercury).
 *
 * Note on "earth": the truncated series reproduce the Earth's centre, not the Earth–Moon barycentre -
 * measured against JPL Horizons DE441 (1900–2100) they agree with body 399 to 0.7″ but differ from body 3 by up
 * to 6.9″ (the ~4,700 km offset of the barycentre). Use `earthMoonBarycentre` (earthMoon.ts) when the barycentre
 * is wanted.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * Derived from Celestia 1.7.0, src/celephem/vsop87.cpp:
 *   Copyright (C) 2002, Chris Laurel <claurel@shatters.net> and the Celestia Development Team.
 * Modified for USAC SimLab by the USAC SimLab team on 2026-10-22: rewritten in TypeScript, spherical to
 * rectangular conversion in the J2000 ecliptic frame instead of Celestia's internal axes, analytic velocity,
 * and validation against JPL Horizons DE441 (docs/validation/E1-planets.json). See NOTICE.md.
 */
import { JD_J2000 } from '../units/constants';
import type { Vec3 } from '../math/vec';
import { VSOP87_PLANETS, VSOP87_SUN, type VsopBody, type VsopSeries } from './vsop87Data';

export type { VsopBody } from './vsop87Data';

const MILLENNIUM_DAYS = 365_250;

/** Σ_k t^k Σ_i A cos(B + C t) and its derivative with respect to t. */
function evaluate(series: VsopSeries, t: number): { value: number; slope: number } {
  let value = 0, slope = 0, tk = 1, tkm1 = 0;
  series.forEach((terms, k) => {
    let s = 0, ds = 0;
    for (let i = 0; i < terms.length; i += 3) {
      const arg = terms[i + 1] + terms[i + 2] * t;
      s += terms[i] * Math.cos(arg);
      ds -= terms[i] * terms[i + 2] * Math.sin(arg);
    }
    value += s * tk;
    slope += (k > 0 ? k * s * tkm1 : 0) + ds * tk;
    tkm1 = tk;
    tk *= t;
  });
  return { value, slope };
}

const tMillennia = (jdTt: number) => (jdTt - JD_J2000) / MILLENNIUM_DAYS;

/** Heliocentric ecliptic-J2000 position [au]; for "earth" the geocentre. */
export function vsop87Heliocentric(body: VsopBody, jdTt: number): Vec3 {
  return vsop87State(body, jdTt).position;
}

/** Position [au] and velocity [au/day], heliocentric ecliptic J2000. */
export function vsop87State(body: VsopBody, jdTt: number): { position: Vec3; velocity: Vec3 } {
  const { L, B, R } = VSOP87_PLANETS[body];
  const t = tMillennia(jdTt);
  const l = evaluate(L, t), b = evaluate(B, t), r = evaluate(R, t);
  const cl = Math.cos(l.value), sl = Math.sin(l.value), cb = Math.cos(b.value), sb = Math.sin(b.value);
  const position: Vec3 = [r.value * cb * cl, r.value * cb * sl, r.value * sb];
  // d/dt of (r cos b cos l, r cos b sin l, r sin b)
  const dl = l.slope, db = b.slope, dr = r.slope;
  const velocity: Vec3 = [
    (dr * cb * cl - r.value * sb * cl * db - r.value * cb * sl * dl) / MILLENNIUM_DAYS,
    (dr * cb * sl - r.value * sb * sl * db + r.value * cb * cl * dl) / MILLENNIUM_DAYS,
    (dr * sb + r.value * cb * db) / MILLENNIUM_DAYS,
  ];
  return { position, velocity };
}

/** Position [au] of the Sun relative to the solar-system barycentre (VSOP87E), ecliptic J2000. */
export function sunBarycentric(jdTt: number): Vec3 {
  const t = tMillennia(jdTt);
  return [evaluate(VSOP87_SUN.X, t).value, evaluate(VSOP87_SUN.Y, t).value, evaluate(VSOP87_SUN.Z, t).value];
}

/**
 * Sidereal orbital period [days]: the leading term of the t¹ series of L is the mean-longitude rate
 * (26087.9 rad per millennium for Mercury → 87.969 d).
 */
export function vsop87PeriodDays(body: VsopBody): number {
  const lead = VSOP87_PLANETS[body].L[1];
  return ((2 * Math.PI) / (lead[0] * Math.cos(lead[1]))) * MILLENNIUM_DAYS;
}

/**
 * Closed orbit polyline [au] for drawing: one sidereal period of `body` sampled uniformly in time around `jdTt`
 * (the actual perturbed path, not an osculating ellipse; the endpoints differ by the perturbation over a revolution).
 */
export function vsop87OrbitPath(body: VsopBody, jdTt: number, n = 360): Vec3[] {
  const period = vsop87PeriodDays(body);
  const pts: Vec3[] = [];
  for (let k = 0; k <= n; k++) pts.push(vsop87Heliocentric(body, jdTt + (k / n - 0.5) * period));
  return pts;
}
