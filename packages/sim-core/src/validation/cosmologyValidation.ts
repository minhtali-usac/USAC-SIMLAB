/**
 * D8 reproducible checks for the Friedmann models.
 *  1. Ages: Einstein-de Sitter t0 = 2/(3H0); flat ΛCDM without radiation, closed form
 *     t0 = 2/(3H0√ΩΛ) asinh√(ΩΛ/Ωm); Planck 2018 base-ΛCDM with radiation.
 *  2. a(t) from the acceleration equation (scaleFactorHistory) vs exact solutions: EdS a = (t/t0)^{2/3},
 *     de Sitter a = exp[H0(t − t0)], closed matter-only cycloid (Ryden 2017, Introduction to Cosmology §5.4):
 *     a(θ) = Ωm(1 − cos θ)/[2(Ωm − 1)], t(θ) = Ωm(θ − sin θ)/[2H0(Ωm − 1)^{3/2}],
 *     hence a_max = Ωm/(Ωm − 1) and t_crunch = πΩm/[H0(Ωm − 1)^{3/2}].
 *  3. Ωm–ΩΛ plane boundaries (Ωr = 0) found numerically from the roots of E²(a), vs the closed forms quoted by
 *     Carroll, Press & Turner (1992, ARA&A 30, 499) after Felten & Isaacman (1986):
 *     recollapse: ΩΛ = 0 (Ωm ≤ 1), ΩΛ = 4Ωm cos³[⅓ arccos((1 − Ωm)/Ωm) + 4π/3] (Ωm > 1);
 *     no Big Bang: ΩΛ = 4Ωm cos³[⅓ arccos((1 − Ωm)/Ωm)] (Ωm ≥ ½; cosh/arccosh for Ωm < ½).
 *  4. Acceleration onset: flat, radiation-free closed form 1 + z = (2ΩΛ/Ωm)^{1/3}; Planck value with radiation.
 */
import {
  PLANCK18, ageAtZ, flatLcdmAgeGyr, hubbleTimeGyr, scaleFactorHistory, cosmicFate, recollapseBoundaryOL, noBigBangBoundaryOL,
  accelerationOnsetA, densityFractions, decelerationQ, type Cosmology,
} from '../cosmology/friedmann';

let cache: ReturnType<typeof compute> | null = null;
export const validateCosmology = () => (cache ??= compute());

/** Interpolate a(t) from a scaleFactorHistory point list. */
function aAt(pts: { t: number; a: number }[], t: number) {
  for (let i = 1; i < pts.length; i++) if (pts[i].t >= t) { const f = (t - pts[i - 1].t) / (pts[i].t - pts[i - 1].t); return pts[i - 1].a + f * (pts[i].a - pts[i - 1].a); }
  return pts[pts.length - 1].a;
}

export function boundaryRecollapseCPT(Om: number) {
  if (Om <= 1) return 0;
  return 4 * Om * Math.cos(Math.acos((1 - Om) / Om) / 3 + (4 * Math.PI) / 3) ** 3;
}
export function boundaryNoBigBangCPT(Om: number) {
  const x = (1 - Om) / Om;
  return Om >= 0.5 ? 4 * Om * Math.cos(Math.acos(x) / 3) ** 3 : 4 * Om * Math.cosh(Math.acosh(x) / 3) ** 3;
}

function compute() {
  const H0 = 67.66, tH = hubbleTimeGyr(H0);
  // 1. ages
  const eds: Cosmology = { H0, Om: 1, OL: 0, Or: 0 };
  const flat: Cosmology = { H0, Om: 0.3111, OL: 1 - 0.3111, Or: 0 };
  const ages = {
    edsNumeric: ageAtZ(eds), edsExact: (2 / 3) * tH,
    flatNumeric: ageAtZ(flat), flatExact: flatLcdmAgeGyr(H0, 0.3111),
    planck: ageAtZ(PLANCK18),
  };
  // 2. a(t) vs exact solutions (sampled where a ≥ 0.05)
  const hE = scaleFactorHistory(eds, 40, 4000);
  let edsErr = 0;
  for (const p of hE.points) if (p.a >= 0.05 && p.t <= 40) edsErr = Math.max(edsErr, Math.abs(p.a / (p.t / ages.edsExact) ** (2 / 3) - 1));
  const ds: Cosmology = { H0, Om: 0, OL: 1, Or: 0 };
  const hD = scaleFactorHistory(ds, 40, 4000), t0D = hD.age;
  let dsErr = 0;
  for (const p of hD.points) if (p.a >= 0.05 && p.a <= 20) dsErr = Math.max(dsErr, Math.abs(p.a / Math.exp((p.t - t0D) / tH) - 1));
  const closed = [1.5, 2, 3, 5].map((Om) => {
    const c: Cosmology = { H0, Om, OL: 0, Or: 0 };
    const h = scaleFactorHistory(c, 400, 20000);
    const aMaxNum = Math.max(...h.points.map((p) => p.a));
    const tCrunchNum = h.points[h.points.length - 1].t;
    const tCrunch = (Math.PI * Om * tH) / (Om - 1) ** 1.5;
    // cycloid check at mid-collapse θ = 3π/2
    const th = 1.5 * Math.PI, tTh = (Om * (th - Math.sin(th)) * tH) / (2 * (Om - 1) ** 1.5), aTh = (Om * (1 - Math.cos(th))) / (2 * (Om - 1));
    return {
      Om, aMaxExact: Om / (Om - 1), aMaxRoot: cosmicFate(c).aMax, aMaxNumeric: aMaxNum,
      tCrunchExact: tCrunch, tCrunchNumeric: tCrunchNum, cycloidRelErr: Math.abs(aAt(h.points, tTh) / aTh - 1),
    };
  });
  // 3. boundaries
  const oms = Array.from({ length: 30 }, (_, i) => 0.1 * (i + 1));
  let recErr = 0, bbErr = 0;
  const boundary = oms.map((Om) => {
    const rec = recollapseBoundaryOL(Om), bb = noBigBangBoundaryOL(Om), recC = boundaryRecollapseCPT(Om), bbC = boundaryNoBigBangCPT(Om);
    recErr = Math.max(recErr, Math.abs(rec - recC)); bbErr = Math.max(bbErr, Math.abs(bb - bbC));
    return { Om, recollapse: rec, recollapseCPT: recC, noBigBang: bb, noBigBangCPT: bbC };
  });
  // 4. acceleration onset and epochs (Planck 2018)
  const aAccFlat = accelerationOnsetA(flat)!;
  const zAccFlatExact = Math.cbrt((2 * flat.OL) / flat.Om) - 1;
  const aAcc = accelerationOnsetA(PLANCK18)!;
  const aEq = PLANCK18.Or / PLANCK18.Om, aML = Math.cbrt(PLANCK18.Om / PLANCK18.OL);
  const fr = densityFractions(PLANCK18, 0.37);
  return {
    ages,
    aOfT: { edsMaxRelErr: edsErr, deSitterMaxRelErr: dsErr, closed },
    boundary: { maxAbsErrRecollapse: recErr, maxAbsErrNoBigBang: bbErr, samples: boundary.filter((_, i) => i % 5 === 4) },
    planck: {
      zAcceleration: 1 / aAcc - 1, zAccelerationFlatNoRadExact: zAccFlatExact, zAccelerationFlatNoRadNumeric: 1 / aAccFlat - 1,
      zMatterRadiationEquality: 1 / aEq - 1, zMatterLambdaEquality: 1 / aML - 1, q0: decelerationQ(PLANCK18, 1),
      fractionsSumAtA037: fr.r + fr.m + fr.k + fr.L,
    },
  };
}
