/**
 * Clock-rate corrections for orbiting clocks relative to a clock on the ground.
 * Weak-field, first order in Φ/c² and v²/c²:
 *   (dτ_sat − dτ_ground)/dt = (Φ_ground − Φ_sat)/c² + (v_ground² − v_sat²)/(2c²)
 * Ashby, "Relativity in the Global Positioning System", Living Rev. Relativity 6 (2003) 1.
 * Earth modelled as a point mass (J2 neglected, ~1% effect on the GR term).
 */
import { C, GM_EARTH, R_EARTH, OMEGA_EARTH, SECONDS_PER_DAY } from '../units/constants';

export interface ClockRates {
  /** Gravitational (GR) rate offset, satellite − ground [s/s]. Positive: satellite runs fast. */
  gr: number;
  /** Velocity (SR) rate offset, satellite − ground [s/s]. */
  sr: number;
  net: number;
  /** Per day in microseconds. */
  grUsPerDay: number;
  srUsPerDay: number;
  netUsPerDay: number;
  orbitalSpeed: number;
}

/**
 * Rates for a clock on a circular orbit of radius r [m] compared with a clock
 * on the equator (includeRotation) or at the pole (ground speed 0).
 */
export function clockRates(r: number, includeGroundRotation = false, gm = GM_EARTH, rGround = R_EARTH): ClockRates {
  const v = Math.sqrt(gm / r);
  const vg = includeGroundRotation ? OMEGA_EARTH * rGround : 0;
  const gr = (gm / (C * C)) * (1 / rGround - 1 / r);
  const sr = (vg * vg - v * v) / (2 * C * C);
  const k = SECONDS_PER_DAY * 1e6;
  return { gr, sr, net: gr + sr, grUsPerDay: gr * k, srUsPerDay: sr * k, netUsPerDay: (gr + sr) * k, orbitalSpeed: v };
}

/** Orbit radius at which GR and SR effects cancel (ground clock at rest): r = 3R/2. */
export const crossoverRadius = (rGround = R_EARTH) => 1.5 * rGround;

/**
 * IAU 2000 Resolution B1.9 defining constant L_G = W₀/c² = 6.969290134×10⁻¹⁰, where W₀ is the geoid
 * potential (gravity + centrifugal). Every clock on the geoid ticks at the same rate (TT), so this
 * reference already contains the ground clock's rotation and Earth's oblateness (J2).
 */
export const L_G = 6.969_290_134e-10;

/**
 * Rates for a clock on a circular orbit of radius r relative to a clock ON THE GEOID (Ashby 2003, §5):
 *   gr = L_G − GM/(r c²)   (potential difference, ground term from the geoid),
 *   sr = −v²/(2c²),  v² = GM/r.
 * GPS (a = 26 561.75 km): net = 4.4647×10⁻¹⁰ = 38.58 μs/day, the factory offset quoted by Ashby.
 * The satellite potential is still point-mass (J2 at GPS altitude changes it by ~10⁻¹³ - neglected).
 */
export function clockRatesGeoid(r: number, gm = GM_EARTH): ClockRates {
  const v = Math.sqrt(gm / r);
  const gr = L_G - gm / (r * C * C);
  const sr = -(v * v) / (2 * C * C);
  const k = SECONDS_PER_DAY * 1e6;
  return { gr, sr, net: gr + sr, grUsPerDay: gr * k, srUsPerDay: sr * k, netUsPerDay: (gr + sr) * k, orbitalSpeed: v };
}

/** Orbit radius where the net rate vs the geoid vanishes: L_G = (3/2) GM/(r c²). */
export const crossoverRadiusGeoid = (gm = GM_EARTH) => (1.5 * gm) / (C * C * L_G);
