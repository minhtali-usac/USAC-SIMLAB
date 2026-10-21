/**
 * B2 reproducible checks: Hohmann numbers, inward/outward sign convention, synodic period, ephemeris
 * phase-date residuals, bi-elliptic thresholds, Lambert against Curtis Example 5.2 and against an
 * independent numerical propagation, and a Lambert C3 scan of the next Earth→Mars opportunity.
 */
import { hohmann, biElliptic, biEllipticLimitDv, biEllipticThresholds } from '../orbits/transfer';
import { solveLambert, lambertArc } from '../orbits/lambert';
import { hohmannPhaseDates, idealHohmannBetween, realPhaseAngle, lambertLeg } from '../orbits/launchWindows';
import { dopri5 } from '../math/ode';
import { norm, sub, type Vec3 } from '../math/vec';
import { AU, GM_SUN, SECONDS_PER_DAY } from '../units/constants';

export const MU_SUN_AU_DAY_B2 = (GM_SUN / AU ** 3) * SECONDS_PER_DAY ** 2;
const KMS = AU / SECONDS_PER_DAY / 1000;

/** Two-body propagation by DOPRI5 (independent of the Lambert algebra). */
export function propagateTwoBody(r: Vec3, v: Vec3, dt: number, mu: number): Vec3 {
  const f = (_t: number, y: Float64Array, d: Float64Array) => {
    const rr = Math.hypot(y[0], y[1], y[2]), k = -mu / (rr * rr * rr);
    d[0] = y[3]; d[1] = y[4]; d[2] = y[5]; d[3] = k * y[0]; d[4] = k * y[1]; d[5] = k * y[2];
  };
  const res = dopri5(f, 0, new Float64Array([...r, ...v]), dt, { rtol: 1e-13, atol: 1e-16 });
  return [res.y[0], res.y[1], res.y[2]];
}

export function validateTransfer(jdStart: number) {
  // 1. Hohmann Earth → Mars, r1 = 1 au, r2 = 1.524 au, SI
  const hm = hohmann(AU, 1.524 * AU, GM_SUN);
  const hohmannEM = { dv1Kms: hm.dv1 / 1000, dv2Kms: hm.dv2 / 1000, dvTotalKms: hm.dvTotal / 1000, tofDays: hm.tof / SECONDS_PER_DAY, phaseDeg: (hm.phaseAngle * 180) / Math.PI, synodicDays: hm.synodicPeriod / SECONDS_PER_DAY };
  // 2. inward sign convention (Earth → Venus) and symmetry
  const out = hohmann(0.723, 1, 1), inw = hohmann(1, 0.723, 1);
  const inward = { dv1: inw.dv1, dv2: inw.dv2, phaseDeg: (inw.phaseAngle * 180) / Math.PI, symmetryError: Math.abs(inw.dv1 + out.dv2) + Math.abs(inw.dv2 + out.dv1) };
  // 3. ideal planets (J2000 a) and ephemeris phase dates
  const ideal = idealHohmannBetween('earth', 'mars', MU_SUN_AU_DAY_B2);
  const dates = hohmannPhaseDates('earth', 'mars', ideal.phaseAngle, jdStart, 6);
  const phaseResiduals = dates.map((jd) => Math.abs(((realPhaseAngle('earth', 'mars', jd) - ideal.phaseAngle + 3 * Math.PI) % (2 * Math.PI)) - Math.PI));
  const spacings = dates.slice(1).map((d, i) => d - dates[i]);
  // 4. bi-elliptic thresholds and r_b sweep at R = 20
  const th = biEllipticThresholds();
  const sweep = [1.01, 2, 5, 20, 100, 1e4].map((k) => { const b = biElliptic(1, 20, 20 * k, 1); return { rbOverR2: k, dvTotal: b.dvTotal, tof: b.tof }; });
  const limitAt20 = biEllipticLimitDv(1, 20, 1), hohmannAt20 = hohmann(1, 20, 1).dvTotal;
  // 5. Lambert: Curtis Example 5.2 (km, s, μ⊕ = 398600 km³/s²)
  const cr1: Vec3 = [5000, 10000, 2100], cr2: Vec3 = [-14600, 2500, 7000];
  const cs = solveLambert(cr1, cr2, 3600, 398600, true)!;
  const curtis = { v1: cs.v1, v2: cs.v2, z: cs.z, reference: { v1: [-5.9925, 1.9254, 3.2456], v2: [-3.3125, -4.1966, -0.38529] }, propagationErrorKm: norm(sub(propagateTwoBody(cr1, cs.v1, 3600, 398600), cr2)), arcEndErrorKm: norm(sub(lambertArc(cr1, cs.v1, 3600, 398600, 8)[8], cr2)) };
  // 6. Lambert reduces to Hohmann near Δθ = 180° in the plane
  const th0 = (179.99 * Math.PI) / 180;
  const lh = solveLambert([1, 0, 0], [1.524 * Math.cos(th0), 1.524 * Math.sin(th0), 0], hohmann(1, 1.524, 1).tof, 1, true)!;
  const lambertVsHohmann = { v1: norm(lh.v1), vPerihelionHohmann: 1 + hohmann(1, 1.524, 1).dv1, relDiff: norm(lh.v1) / (1 + hohmann(1, 1.524, 1).dv1) - 1 };
  // 7. Real Earth → Mars leg at the next phase date: C3 scan over departure ±60 d, TOF 150–330 d
  let best = { c3Kms2: Infinity, jdDep: 0, tofDays: 0, vInfArrKms: 0 };
  if (dates.length) for (let dd = -60; dd <= 60; dd += 2) for (let tof = 150; tof <= 330; tof += 3) {
    const leg = lambertLeg('earth', 'mars', dates[0] + dd, tof, MU_SUN_AU_DAY_B2);
    if (leg && leg.c3 * KMS * KMS < best.c3Kms2) best = { c3Kms2: leg.c3 * KMS * KMS, jdDep: leg.jdDep, tofDays: tof, vInfArrKms: norm(leg.vInfArr) * KMS };
  }
  return { hohmannEM, inward, idealEM: { phaseDeg: (ideal.phaseAngle * 180) / Math.PI, tofDays: ideal.tof, synodicDays: ideal.synodicPeriod }, phaseDates: dates, phaseResidualsRad: phaseResiduals, spacingsDays: spacings, thresholds: th, sweepR20: sweep, limitAt20, hohmannAt20, curtis, lambertVsHohmann, minC3NextWindow: best };
}
