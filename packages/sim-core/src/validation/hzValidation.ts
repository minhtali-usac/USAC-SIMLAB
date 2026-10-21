/**
 * A6 reproducible checks. Reference values:
 *  - Solar-system HZ edges at T_eff = 5780 K (the polynomial's reference point, S_eff = S_eff☉):
 *    0.75 / 0.95 / 1.68 / 1.77 au (Kopparapu et al. 2014 coefficients, 1 M⊕).
 *  - Earth T_eq with Bond albedo 0.306 (NASA Earth Fact Sheet): ≈ 254 K; with A_B = 0.30: ≈ 255 K.
 */
import { HZ_LIMITS, HZ_TEFF_RANGE, effectiveFlux, habitableZone, equilibriumTemperature, insolation, type HzLimit } from '../stellar/habitable';

export const SUN_HZ_REFERENCE_AU: Record<HzLimit, number> = { recentVenus: 0.75, runawayGreenhouse: 0.95, maximumGreenhouse: 1.68, earlyMars: 1.77 };

export function validateHz() {
  const hz = habitableZone(1, 5780);
  const sun = HZ_LIMITS.map((k) => ({ limit: k, computedAu: hz[k], referenceAu: SUN_HZ_REFERENCE_AU[k], diffAu: hz[k] - SUN_HZ_REFERENCE_AU[k] }));
  const earthTeq030 = equilibriumTemperature(1, 1, 0.3);
  const earthTeq0306 = equilibriumTemperature(1, 1, 0.306);
  // Ordering S_RV > S_RG > S_MaxG > S_EM over the whole fit range (boundaries never cross).
  let ordered = true;
  for (let T = HZ_TEFF_RANGE[0]; T <= HZ_TEFF_RANGE[1]; T += 50) {
    const s = HZ_LIMITS.map((k) => effectiveFlux(k, T));
    if (!(s[0] > s[1] && s[1] > s[2] && s[2] > s[3])) ordered = false;
  }
  // Inverse-square consistency: S_p at r_HZ equals S_eff to machine precision.
  let maxRelFluxErr = 0;
  for (const L of [1e-4, 0.01, 1, 10]) for (const T of [2600, 3500, 5780, 7200]) {
    const h = habitableZone(L, T);
    for (const k of HZ_LIMITS) maxRelFluxErr = Math.max(maxRelFluxErr, Math.abs(insolation(L, h[k]) / effectiveFlux(k, T) - 1));
  }
  return { sun, maxSunDiffAu: Math.max(...sun.map((r) => Math.abs(r.diffAu))), earthTeq030, earthTeq0306, ordered, maxRelFluxErr };
}
