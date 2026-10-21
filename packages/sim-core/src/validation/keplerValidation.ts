/**
 * B1 reproducible checks over the full eccentricity range, including the neighbourhood of e = 1.
 * Every number reported here is measured, not assumed.
 */
import { conicState, solveKepler, solveKeplerHyperbolic, solveBarker } from '../orbits/kepler';
import { conicElements, keplerResidual, sweptSectors, timeSincePeriapsis, twoBodyState } from '../orbits/twoBody';
import { KEPLER_PRESETS } from '../data/keplerPresets';
import { AU, GM_SUN, SECONDS_PER_DAY } from '../units/constants';

/** μ☉ in au³/day². */
export const MU_SUN_AU_DAY = (GM_SUN / AU ** 3) * SECONDS_PER_DAY ** 2;
/** Gaussian year: period of a massless body at a = 1 au with μ = GM☉ (2π/k days, k = Gaussian constant). */
export const GAUSSIAN_YEAR_DAYS = 2 * Math.PI / Math.sqrt(MU_SUN_AU_DAY);

export const B1_E_GRID = [0, 1e-6, 0.0167, 0.3, 0.7, 0.9, 0.99, 0.999, 0.999999, 1, 1 + 1e-6, 1.001, 1.2, 2, 3.5];

let cache: ReturnType<typeof compute> | null = null;
/** Memoised: the report is deterministic. */
export function validateKepler() { return (cache ??= compute()); }

function compute() {
  const mu = 1, q = 1;
  const grid = B1_E_GRID.map((e) => {
    const el = conicElements(q, e, mu);
    const T = el.period ?? 20 / el.n;
    let maxResidual = 0, maxEnergyDev = 0, maxHDev = 0, maxRoundTrip = 0;
    for (let k = 0; k <= 400; k++) {
      const t = -T + (2 * T * k) / 400 + 0.123;
      const s = conicState(q, e, mu, t);
      maxResidual = Math.max(maxResidual, keplerResidual(q, e, mu, t));
      const eps = 0.5 * s.v * s.v - mu / s.r;
      maxEnergyDev = Math.max(maxEnergyDev, Math.abs(eps - el.energy) / (mu / q));
      maxHDev = Math.max(maxHDev, Math.abs((s.x * s.vy - s.y * s.vx) / el.h - 1));
      const tBack = timeSincePeriapsis(q, e, mu, s.nu);
      const tWrapped = el.period ? t - Math.round((t - tBack) / el.period) * el.period : t;
      maxRoundTrip = Math.max(maxRoundTrip, Math.abs(tBack - tWrapped) / T);
    }
    const sec = el.period ? sweptSectors(q, e, mu, 12, -el.period / 2, el.period / 2) : sweptSectors(q, e, mu, 12, -T / 4, T / 4);
    return { e, kind: el.kind, maxResidual, maxEnergyDev, maxHDev, maxRoundTripRel: maxRoundTrip, sectorMaxRelDev: sec.maxRelDev, sectorMaxRelDevQuad: sec.maxRelDevQuad };
  });
  const presets = KEPLER_PRESETS.filter((p) => p.refPeriodDays).map((p) => {
    const P = conicElements(p.q, p.e, MU_SUN_AU_DAY * (1 + p.massRatio)).period!;
    const P0 = conicElements(p.q, p.e, MU_SUN_AU_DAY).period!;
    return { id: p.id, periodDays: P, periodTestParticleDays: P0, refPeriodDays: p.refPeriodDays!, relDiff: P / p.refPeriodDays! - 1, source: p.refPeriodSource };
  });
  // barycentre: M r_M + m r_m = 0 and r_m − r_M = r
  let maxCom = 0;
  for (const k of [0, 1e-3, 0.1, 1]) for (const t of [-3, 0.4, 7]) {
    const s = twoBodyState(1, 0.5, 1 + k, k, t);
    maxCom = Math.max(maxCom, Math.hypot(s.M.x + k * s.m.x, s.M.y + k * s.m.y), Math.hypot(s.m.x - s.M.x - s.rel.x, s.m.y - s.M.y - s.rel.y));
  }
  return { grid, presets, gaussianYearDays: GAUSSIAN_YEAR_DAYS, barycentreMaxError: maxCom, solvers: { solveKepler: 'Halley, Danby starter', solveKeplerHyperbolic: 'Halley, asinh starter', solveBarker: 'Cardano closed form' } };
}

// keep the solver symbols referenced for documentation in the report
void solveKepler; void solveKeplerHyperbolic; void solveBarker;
