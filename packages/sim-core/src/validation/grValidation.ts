/**
 * D2 reproducible checks for Schwarzschild timelike geodesics.
 *  1. Periapsis advance per orbit: DOPRI5 integration (integrateOrbit) vs the exact elliptic-integral result.
 *  2. Weak-field limit 6π/p and Mercury's advance per century.
 *  3. Circular orbits: dt/dτ = 1/√(1 − 3M/r); ISCO binding energy 1 − √(8/9).
 */
import { integrateOrbit, periapsisAdvanceExact, perihelionAdvanceWeakPM, perihelionAdvanceWeak, circularOrbitEL } from '../relativity-gr/schwarzschild';
import { GM_SUN, AU } from '../units/constants';

let cache: ReturnType<typeof compute> | null = null;
export const validateGr = () => (cache ??= compute());

function compute() {
  const cases: [number, number][] = [[12, 0.6], [14, 0.5], [20, 0.5], [50, 0.2], [100, 0.1], [500, 0.2]];
  const advance = cases.map(([p, e]) => {
    const res = integrateOrbit(p, e, 2 * Math.PI * 6 + 1, 24000)!;
    const exact = periapsisAdvanceExact(p, e);
    return { p, e, numericDeg: ((res.advancePerOrbit ?? NaN) * 180) / Math.PI, exactDeg: (exact * 180) / Math.PI, weakDeg: (perihelionAdvanceWeakPM(p) * 180) / Math.PI, relErr: Math.abs((res.advancePerOrbit ?? NaN) / exact - 1) };
  });
  // Mercury: J2000 mean elements (Standish), sidereal period 87.9691 d
  const a = 0.38709927 * AU, e = 0.20563593, P = 87.9691;
  const perOrbit = perihelionAdvanceWeak(GM_SUN, a, e);
  const mercuryArcsecPerCentury = ((perOrbit * 180) / Math.PI) * 3600 * (36525 / P);
  // circular orbit clock rate and ISCO
  const r = 10, { E, L } = circularOrbitEL(r);
  const dtdtau = E / (1 - 2 / r), expected = 1 / Math.sqrt(1 - 3 / r);
  const isco = circularOrbitEL(6);
  return { advance, mercury: { arcsecPerCentury: mercuryArcsecPerCentury }, circular: { r, L, dtdtau, expected, relErr: Math.abs(dtdtau / expected - 1) }, isco: { E: isco.E, bindingEfficiency: 1 - isco.E } };
}
