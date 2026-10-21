/**
 * Heliocentric planetary positions from JPL's approximate Keplerian elements:
 * E. M. Standish, "Keplerian Elements for Approximate Positions of the Major Planets",
 * JPL Solar System Dynamics, Table 1 (valid 1800 AD – 2050 AD; J2000 ecliptic & equinox).
 * Error estimates (Standish, Table 1, 1800–2050, max RA·cos δ): Mercury 15″, Venus 20″, EMB 20″, Mars 40″,
 * Jupiter 400″, Saturn 600″, Uranus 50″, Neptune 10″.
 * "Earth" is the Earth–Moon barycentre (EMB).
 *
 * Physical data: NASA Planetary Fact Sheet (Williams, NSSDCA), mean radii.
 */
import { DEG, wrap180 } from '../units/convert';
import { JD_J2000, JULIAN_CENTURY_DAYS } from '../units/constants';
import { solveKepler } from '../orbits/kepler';
import type { Vec3 } from '../math/vec';

export type PlanetId = 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune';

/** [a(au), e, I(deg), L(deg), ϖ(deg), Ω(deg)] and their rates per Julian century. */
type Row = readonly [number, number, number, number, number, number];

const ELEMENTS: Record<PlanetId, { el: Row; rate: Row }> = {
  mercury: { el: [0.387_099_27, 0.205_635_93, 7.004_979_02, 252.250_323_50, 77.457_796_28, 48.330_765_93], rate: [0.000_000_37, 0.000_019_06, -0.005_947_49, 149_472.674_111_75, 0.160_476_89, -0.125_340_81] },
  venus: { el: [0.723_335_66, 0.006_776_72, 3.394_676_05, 181.979_099_50, 131.602_467_18, 76.679_842_55], rate: [0.000_003_90, -0.000_041_07, -0.000_788_90, 58_517.815_387_29, 0.002_683_29, -0.277_694_18] },
  earth: { el: [1.000_002_61, 0.016_711_23, -0.000_015_31, 100.464_571_66, 102.937_681_93, 0.0], rate: [0.000_005_62, -0.000_043_92, -0.012_946_68, 35_999.372_449_81, 0.323_273_64, 0.0] },
  mars: { el: [1.523_710_34, 0.093_394_10, 1.849_691_42, -4.553_432_05, -23.943_629_59, 49.559_538_91], rate: [0.000_018_47, 0.000_078_82, -0.008_131_31, 19_140.302_684_99, 0.444_410_88, -0.292_573_43] },
  jupiter: { el: [5.202_887_00, 0.048_386_24, 1.304_396_95, 34.396_440_51, 14.728_479_83, 100.473_909_09], rate: [-0.000_116_07, -0.000_132_53, -0.001_837_14, 3_034.746_127_75, 0.212_526_68, 0.204_691_06] },
  saturn: { el: [9.536_675_94, 0.053_861_79, 2.485_991_87, 49.954_244_23, 92.598_878_31, 113.662_424_48], rate: [-0.001_250_60, -0.000_509_91, 0.001_936_09, 1_222.493_622_01, -0.418_972_16, -0.288_677_94] },
  uranus: { el: [19.189_164_64, 0.047_257_44, 0.772_637_83, 313.238_104_51, 170.954_276_30, 74.016_925_03], rate: [-0.001_961_76, -0.000_043_97, -0.002_429_39, 428.482_027_85, 0.408_052_81, 0.042_405_89] },
  neptune: { el: [30.069_922_76, 0.008_590_48, 1.770_043_47, -55.120_029_69, 44.964_762_27, 131.784_225_74], rate: [0.000_262_91, 0.000_051_05, 0.000_353_72, 218.459_453_25, -0.322_414_64, -0.005_086_64] },
};

export interface PlanetInfo {
  id: PlanetId;
  /** Mean radius [km]. */
  radiusKm: number;
  /** Mass [kg]. */
  massKg: number;
  /** Sidereal rotation period [h], negative = retrograde. */
  rotationHours: number;
  /** Axial tilt (obliquity to orbit) [deg]. */
  obliquityDeg: number;
  color: string;
}

/** NASA Planetary Fact Sheet values. */
export const PLANETS: PlanetInfo[] = [
  { id: 'mercury', radiusKm: 2439.7, massKg: 0.330_11e24, rotationHours: 1407.6, obliquityDeg: 0.034, color: '#b7b2a8' },
  { id: 'venus', radiusKm: 6051.8, massKg: 4.8675e24, rotationHours: -5832.6, obliquityDeg: 177.4, color: '#e8c98a' },
  { id: 'earth', radiusKm: 6371.0, massKg: 5.9724e24, rotationHours: 23.9345, obliquityDeg: 23.44, color: '#5aa2ff' },
  { id: 'mars', radiusKm: 3389.5, massKg: 0.641_71e24, rotationHours: 24.6229, obliquityDeg: 25.19, color: '#e2704a' },
  { id: 'jupiter', radiusKm: 69_911, massKg: 1898.19e24, rotationHours: 9.925, obliquityDeg: 3.13, color: '#d9b38c' },
  { id: 'saturn', radiusKm: 58_232, massKg: 568.34e24, rotationHours: 10.656, obliquityDeg: 26.73, color: '#e9d39b' },
  { id: 'uranus', radiusKm: 25_362, massKg: 86.813e24, rotationHours: -17.24, obliquityDeg: 97.77, color: '#9fe3e6' },
  { id: 'neptune', radiusKm: 24_622, massKg: 102.413e24, rotationHours: 16.11, obliquityDeg: 28.32, color: '#5b7fff' },
];

export interface PlanetElementsAtDate {
  a: number; e: number; I: number; L: number; varpi: number; Omega: number;
  /** Argument of perihelion and mean anomaly [deg]. */
  omega: number; M: number;
}

export function planetElements(id: PlanetId, jdTdb: number): PlanetElementsAtDate {
  const T = (jdTdb - JD_J2000) / JULIAN_CENTURY_DAYS;
  const { el, rate } = ELEMENTS[id];
  const [a, e, I, L, varpi, Omega] = el.map((v, k) => v + rate[k] * T);
  return { a, e, I, L, varpi, Omega, omega: varpi - Omega, M: wrap180(L - varpi) };
}

/** Heliocentric ecliptic J2000 position [au] of a planet (EMB for "earth"). */
export function planetHeliocentric(id: PlanetId, jdTdb: number): Vec3 {
  const p = planetElements(id, jdTdb);
  return positionFromElements(p.a, p.e, p.I, p.Omega, p.omega, p.M);
}

/** Position [au] from Keplerian elements (angles in degrees), J2000 ecliptic frame. */
export function positionFromElements(a: number, e: number, Ideg: number, Odeg: number, wdeg: number, Mdeg: number): Vec3 {
  const E = solveKepler(Mdeg * DEG, e);
  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const w = wdeg * DEG, O = Odeg * DEG, I = Ideg * DEG;
  const cw = Math.cos(w), sw = Math.sin(w), cO = Math.cos(O), sO = Math.sin(O), cI = Math.cos(I), sI = Math.sin(I);
  return [
    (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
    (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
    sw * sI * xp + cw * sI * yp,
  ];
}

/** Sampled orbit polyline [au] for drawing (elements frozen at jd). */
export function planetOrbitPath(id: PlanetId, jdTdb: number, n = 256): Vec3[] {
  const p = planetElements(id, jdTdb);
  const pts: Vec3[] = [];
  for (let k = 0; k <= n; k++) {
    // sample uniformly in eccentric anomaly → convert to mean anomaly
    const E = (k / n) * 2 * Math.PI;
    const M = (E - p.e * Math.sin(E)) / DEG;
    pts.push(positionFromElements(p.a, p.e, p.I, p.Omega, p.omega, M));
  }
  return pts;
}

/** Sidereal orbital period [days] from the mean-longitude rate. */
export function planetPeriodDays(id: PlanetId): number {
  return (360 / ELEMENTS[id].rate[3]) * JULIAN_CENTURY_DAYS;
}

/**
 * Heliocentric ecliptic-J2000 velocity [au/day] by central difference of `planetHeliocentric`
 * (h = 0.05 d; truncation error ~ (h/P)² ≈ 1e-9 relative for Mercury, smaller for the others).
 */
export function planetHeliocentricVelocity(id: PlanetId, jdTdb: number, h = 0.05): Vec3 {
  const a = planetHeliocentric(id, jdTdb + h), b = planetHeliocentric(id, jdTdb - h);
  return [(a[0] - b[0]) / (2 * h), (a[1] - b[1]) / (2 * h), (a[2] - b[2]) / (2 * h)];
}
