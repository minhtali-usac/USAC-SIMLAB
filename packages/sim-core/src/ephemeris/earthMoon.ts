/**
 * Earth–Moon barycentre from the VSOP87 geocentre and the Moon's geocentric position:
 *   r_EMB = r_Earth + r_Moon / (1 + μ),  μ = M_⊕ / M_☾.
 *
 * Earth/Moon mass ratio 81.30056907 (JPL DE440: Park et al. 2021, AJ 161, 105, Table 2).
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * Copyright (C) 2026, the USAC SimLab team. Companion to vsop87.ts (derived from Celestia 1.7.0); see NOTICE.md.
 */
import { moonPosition } from '../celestial/moon';
import { deltaTSeconds } from '../time/julian';
import { DEG } from '../units/convert';
import { AU } from '../units/constants';
import type { Vec3 } from '../math/vec';
import { vsop87Heliocentric } from './vsop87';
import { precessionLongitudeDeg } from './rotation';

export const EARTH_MOON_MASS_RATIO = 81.300_569_07;

/** TT → UT1 (the Moon series takes UT and applies ΔT itself). */
const jdTtToUt = (jdTt: number) => jdTt - deltaTSeconds(2000 + (jdTt - 2_451_545.0) / 365.25) / 86_400;

/** Geocentric Moon position [au], J2000 ecliptic (the series gives longitude of date; precession removed). jdTt = TT. */
export function moonGeocentricJ2000(jdTt: number): Vec3 {
  const m = moonPosition(jdTtToUt(jdTt));
  const T = (jdTt - 2_451_545.0) / 36_525;
  const lon = (m.lon - precessionLongitudeDeg(T)) * DEG, lat = m.lat * DEG;
  const r = m.distanceKm * 1000 / AU;
  return [r * Math.cos(lat) * Math.cos(lon), r * Math.cos(lat) * Math.sin(lon), r * Math.sin(lat)];
}

/** Earth–Moon barycentre, heliocentric ecliptic J2000 [au], for a TT Julian date. */
export function earthMoonBarycentre(jdTt: number): Vec3 {
  const earth = vsop87Heliocentric('earth', jdTt);
  const moon = moonGeocentricJ2000(jdTt);
  const k = 1 / (1 + EARTH_MOON_MASS_RATIO);
  return [earth[0] + moon[0] * k, earth[1] + moon[1] * k, earth[2] + moon[2] * k];
}
