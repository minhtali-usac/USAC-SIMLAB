/**
 * State of the planets for the E1 viewer, from either model:
 *  - 'vsop87'  VSOP87 (Bretagnon & Francou 1988): sub-arcsecond to a few arcseconds, 1800–2200 (see E1-vsop87.json);
 *              "earth" is the Earth's centre.
 *  - 'kepler'  JPL approximate Keplerian elements (Standish): tens to hundreds of arcseconds; "earth" is the
 *              Earth–Moon barycentre. Kept as the teaching baseline.
 * Times are UT-based Julian dates, converted to TT once here (TT − UT ≈ 69 s).
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * Copyright (C) 2026, the USAC SimLab team. Uses vsop87.ts (derived from Celestia 1.7.0); see NOTICE.md.
 */
import { jdUtToTt } from '../time/julian';
import { ARCSEC_PER_RAD } from '../units/convert';
import type { Vec3 } from '../math/vec';
import { planetHeliocentric, planetHeliocentricVelocity, type PlanetId } from '../celestial/planets';
import { vsop87State } from './vsop87';

export type EphemerisModel = 'vsop87' | 'kepler';

export interface PlanetState {
  /** Heliocentric position, ecliptic J2000 [au]. */
  position: Vec3;
  /** Heliocentric velocity [au/day]. */
  velocity: Vec3;
}

export function planetState(id: PlanetId, jdUt: number, model: EphemerisModel = 'vsop87'): PlanetState {
  const jdTt = jdUtToTt(jdUt);
  if (model === 'vsop87') return vsop87State(id, jdTt);
  return { position: planetHeliocentric(id, jdTt), velocity: planetHeliocentricVelocity(id, jdTt) };
}

/** Angle [arcsec] between the two models' heliocentric directions of a planet - what the better model buys. */
export function modelDifferenceArcsec(id: PlanetId, jdUt: number): number {
  const a = planetState(id, jdUt, 'vsop87').position, b = planetState(id, jdUt, 'kepler').position;
  const c = (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (Math.hypot(...a) * Math.hypot(...b));
  return Math.acos(Math.min(1, c)) * ARCSEC_PER_RAD;
}
