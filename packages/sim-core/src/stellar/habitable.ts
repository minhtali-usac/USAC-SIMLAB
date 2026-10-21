/**
 * Circumstellar habitable zone (HZ) - radiative/climate boundaries, NOT a life detector.
 * Kopparapu et al. 2014, ApJL 787, L29 (doi:10.1088/2041-8205/787/2/L29), update of Kopparapu et al. 2013,
 * ApJ 765, 131 (arXiv:1301.6674). 1-D cloud-free radiative–convective models, Earth-like N₂–H₂O–CO₂ atmosphere.
 *   S_eff,j = S_eff☉,j + a_j T′ + b_j T′² + c_j T′³ + d_j T′⁴,   T′ = T_eff − 5780 K,
 *   r_HZ,j = √((L/L☉) / S_eff,j) au.
 * Coefficients verified (2026-10-20) against Kopparapu's own reference implementation `hzcalc.py`
 * (personal.ems.psu.edu/~jfk4/ruk15/planets/hzcalc.py), arrays seffsun/a/b/c/d, same order as below.
 * Valid fit range: 2600 K ≤ T_eff ≤ 7200 K.
 */
import { SIGMA_SB, L_SUN, R_SUN, AU, T_SUN } from '../units/constants';

export type HzLimit = 'recentVenus' | 'runawayGreenhouse' | 'maximumGreenhouse' | 'earlyMars';
/** Planet masses for which Kopparapu 2014 publishes a runaway-greenhouse fit (other limits: 1 M⊕ only). */
export type HzPlanetMass = 0.1 | 1 | 5;

type Coeff = [number, number, number, number, number];
const COEFF: Record<HzLimit, Coeff> = {
  recentVenus: [1.776, 2.136e-4, 2.533e-8, -1.332e-11, -3.097e-15],
  runawayGreenhouse: [1.107, 1.332e-4, 1.58e-8, -8.308e-12, -1.931e-15],
  maximumGreenhouse: [0.356, 6.171e-5, 1.698e-9, -3.198e-12, -5.575e-16],
  earlyMars: [0.32, 5.547e-5, 1.526e-9, -2.874e-12, -5.011e-16],
};
const RUNAWAY_BY_MASS: Record<HzPlanetMass, Coeff> = {
  0.1: [0.99, 1.209e-4, 1.404e-8, -7.418e-12, -1.713e-15],
  1: COEFF.runawayGreenhouse,
  5: [1.188, 1.433e-4, 1.707e-8, -8.968e-12, -2.084e-15],
};

export const HZ_TEFF_RANGE: [number, number] = [2600, 7200];
export const HZ_LIMITS: HzLimit[] = ['recentVenus', 'runawayGreenhouse', 'maximumGreenhouse', 'earlyMars'];
export const HZ_LIMIT_INFO: Record<HzLimit, { edge: 'inner' | 'outer'; kind: 'optimistic' | 'conservative' }> = {
  recentVenus: { edge: 'inner', kind: 'optimistic' },
  runawayGreenhouse: { edge: 'inner', kind: 'conservative' },
  maximumGreenhouse: { edge: 'outer', kind: 'conservative' },
  earlyMars: { edge: 'outer', kind: 'optimistic' },
};

/** Whether T_eff lies inside the fit range, and the T_eff actually used for the polynomial. */
export function hzTeffStatus(teff: number) {
  const inRange = teff >= HZ_TEFF_RANGE[0] && teff <= HZ_TEFF_RANGE[1];
  const teffUsed = Math.min(Math.max(teff, HZ_TEFF_RANGE[0]), HZ_TEFF_RANGE[1]);
  return { inRange, teffUsed };
}

/**
 * Effective flux S_eff [S⊕] of a boundary. Outside 2600–7200 K the polynomial is evaluated at the nearest
 * range edge (it diverges if extrapolated); callers MUST surface `hzTeffStatus(teff).inRange === false`
 * to the user as an illustration-only result - never silently.
 */
export function effectiveFlux(limit: HzLimit, teff: number, planetMass: HzPlanetMass = 1): number {
  const [s0, a, b, c, d] = limit === 'runawayGreenhouse' ? RUNAWAY_BY_MASS[planetMass] : COEFF[limit];
  const T = hzTeffStatus(teff).teffUsed - 5780;
  return s0 + a * T + b * T * T + c * T ** 3 + d * T ** 4;
}

/** HZ boundary distance r_HZ [au] for a star of luminosity L [L☉] and T_eff [K]. */
export const hzDistanceAu = (limit: HzLimit, lumSolar: number, teff: number, planetMass: HzPlanetMass = 1) =>
  Math.sqrt(lumSolar / effectiveFlux(limit, teff, planetMass));

export function habitableZone(lumSolar: number, teff: number, planetMass: HzPlanetMass = 1) {
  return {
    recentVenus: hzDistanceAu('recentVenus', lumSolar, teff),
    runawayGreenhouse: hzDistanceAu('runawayGreenhouse', lumSolar, teff, planetMass),
    maximumGreenhouse: hzDistanceAu('maximumGreenhouse', lumSolar, teff),
    earlyMars: hzDistanceAu('earlyMars', lumSolar, teff),
  };
}

export type HzClass = 'tooMuchFlux' | 'optimisticInner' | 'conservative' | 'optimisticOuter' | 'tooLittleFlux';
/**
 * Classify a planet by its incident flux S_p [S⊕] against the boundary fluxes (flux comparison is exact;
 * distance comparison is equivalent only for a circular orbit).
 */
export function hzClassify(sp: number, teff: number, planetMass: HzPlanetMass = 1): HzClass {
  const s = (k: HzLimit) => effectiveFlux(k, teff, planetMass);
  if (sp > s('recentVenus')) return 'tooMuchFlux';
  if (sp > s('runawayGreenhouse')) return 'optimisticInner';
  if (sp >= s('maximumGreenhouse')) return 'conservative';
  if (sp >= s('earlyMars')) return 'optimisticOuter';
  return 'tooLittleFlux';
}

/** Stellar luminosity [L☉] from radius [R☉] and T_eff [K]: L = 4πR²σT⁴. */
export const luminosityFromRT = (radiusSolar: number, teff: number) =>
  (4 * Math.PI * (radiusSolar * R_SUN) ** 2 * SIGMA_SB * teff ** 4) / L_SUN;

/**
 * Radiative equilibrium temperature [K] - NOT a surface temperature (no greenhouse effect):
 *   T_eq = [L (1 − A_B) / (16 π σ r²)]^{1/4},  A_B = Bond albedo, full heat redistribution, emissivity 1.
 * Earth (A_B ≈ 0.3): ≈ 255 K, whereas the observed mean surface temperature is ≈ 288 K.
 */
export const equilibriumTemperature = (lumSolar: number, rAu: number, bondAlbedo = 0.3) =>
  ((lumSolar * L_SUN * (1 - bondAlbedo)) / (16 * Math.PI * SIGMA_SB * (rAu * AU) ** 2)) ** 0.25;

/** Incident stellar flux at distance r relative to Earth's (S_p/S⊕ = (L/L☉)/(r/au)²). */
export const insolation = (lumSolar: number, rAu: number) => lumSolar / (rAu * rAu);

/**
 * Rough main-sequence relations (for exploration only, ±20–50 %):
 * L ∝ M^4 (0.43–2 M☉), L ∝ 0.23 M^2.3 (< 0.43 M☉), L ∝ 1.4 M^3.5 (> 2 M☉) - Duric, "Advanced Astrophysics" (2004);
 * R ∝ M^0.8. T_eff then follows from L = 4πR²σT⁴.
 */
export function mainSequence(massSolar: number) {
  const M = massSolar;
  let L: number;
  if (M < 0.43) L = 0.23 * M ** 2.3;
  else if (M < 2) L = M ** 4;
  else if (M < 55) L = 1.4 * M ** 3.5;
  else L = 32000 * M;
  const R = M ** 0.8;
  const teff = T_SUN * (L / (R * R)) ** 0.25;
  const lifetimeGyr = 10 * M / L;
  return { L, R, teff, lifetimeGyr };
}
