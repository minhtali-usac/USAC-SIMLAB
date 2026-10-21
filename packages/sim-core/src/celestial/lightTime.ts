/**
 * Light-travel times (developed from lss-lab's "Speed of light" journey, github.com/MinhMPA/lss-lab).
 * One-way light time t = d / c with c = 299 792 458 m/s (exact, SI). Solar-system distances come from the ephemerides
 * in this package (Meeus Moon, JPL mean elements for the planets) at the requested date; stellar and galactic distances
 * are published measurements listed below with their sources.
 */
import { C, AU, PARSEC, LIGHT_YEAR } from '../units/constants';
import { moonPosition } from './moon';
import { sunPosition } from './sun';
import { planetHeliocentric, type PlanetId } from './planets';
import { jdUtToTt } from '../time/julian';

export const lightTimeSeconds = (meters: number) => meters / C;

/** Geocentric Earth–Moon centre distance [km] and the one-way light time [s]. */
export function earthMoonLight(jdUt: number) {
  const km = moonPosition(jdUt).distanceKm;
  return { km, seconds: lightTimeSeconds(km * 1e3) };
}

/** Earth–Sun distance [au] and light time [s]. */
export function earthSunLight(jdUt: number) {
  const au = sunPosition(jdUt).distanceAu;
  return { au, seconds: lightTimeSeconds(au * AU) };
}

/** Heliocentric distance of a planet [au] (geometric, TDB ≈ TT). */
export function sunPlanetAu(id: PlanetId, jdUt: number) {
  const [x, y, z] = planetHeliocentric(id, jdUtToTt(jdUt));
  return Math.hypot(x, y, z);
}

/** Earth–planet distance [au] and one-way light time [s] (geometric; light-time iteration omitted, < 1e-4 relative). */
export function earthPlanetLight(id: PlanetId, jdUt: number) {
  const jd = jdUtToTt(jdUt), p = planetHeliocentric(id, jd), e = planetHeliocentric('earth', jd);
  const au = Math.hypot(p[0] - e[0], p[1] - e[1], p[2] - e[2]);
  return { au, seconds: lightTimeSeconds(au * AU) };
}

export interface FarTarget { id: string; pc: number; source: string }
/** Published distances (parsec). */
export const FAR_TARGETS: FarTarget[] = [
  { id: 'proxima', pc: 1000 / 768.0665, source: 'Gaia DR3 parallax 768.0665 mas (Gaia Collaboration 2023)' },
  { id: 'sirius', pc: 1000 / 379.21, source: 'Hipparcos parallax 379.21 mas (van Leeuwen 2007)' },
  { id: 'galacticCentre', pc: 8178, source: 'GRAVITY Collaboration 2019, A&A 625, L10 (R₀ = 8178 pc)' },
  { id: 'lmc', pc: 49_590, source: 'Pietrzyński et al. 2019, Nature 567, 200 (49.59 kpc)' },
  { id: 'andromeda', pc: 785_000, source: 'McConnachie et al. 2005, MNRAS 356, 979 (785 ± 25 kpc)' },
];
export const pcToLightYears = (pc: number) => (pc * PARSEC) / LIGHT_YEAR;
export const farTargetLight = (t: FarTarget) => ({ ly: pcToLightYears(t.pc), seconds: lightTimeSeconds(t.pc * PARSEC) });
