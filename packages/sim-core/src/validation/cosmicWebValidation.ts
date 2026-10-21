/**
 * F6 reproducible checks (64³ particles, 250 Mpc/h box, Planck 2018 spectrum).
 *  1. Particle P(k) (CIC on 64³) vs amp²·P_lin(k) at small amplitude, k < 0.1 h/Mpc.
 *  2. Redshift-space / real-space monopole ratio at k < 0.1 h/Mpc vs the Kaiser factor 1 + 2f/3 + f²/5 (two seeds).
 *  3. Halo proxy at a = 1: number, mass range and abundance n(> M_min).
 *  4. Amplitude at fixed primordial A_s: absolute σ₈ from A_s for Planck 2018 (vs the published 0.811) and the
 *     anchored σ₈(Ωm, ns) used by the module.
 *  5. LPT particles are not truncated: 1LPT displacement is exactly linear in the amplitude (no particle frozen),
 *     and the CIC density contrast of the box grows with σ₈ (rms δ and the dense-cell fraction).
 */
import { PLANCK18_LSS, PLANCK18_AS, lptFields, linearPk, measurePk, sigma8FromAs, sigma8AtFixedAs } from '../cosmology/lss';
import { lptParticles, depositCIC3D, smoothedLinear, findHalos, kaiserMonopole } from '../cosmology/cosmicWeb';

let cache: ReturnType<typeof compute> | null = null;
export const validateCosmicWeb = () => (cache ??= compute());

function compute() {
  const N = 64, BOX = 250, P = linearPk(PLANCK18_LSS);
  const seeds = [11, 2026].map((seed) => {
    const F = lptFields(PLANCK18_LSS, N, BOX, seed, 1);
    const amp = 0.05, f = 0.53;
    const r = lptParticles(F, { amp }), s = lptParticles(F, { amp, los: 2, f });
    const pr = measurePk(depositCIC3D(r.pos, r.n, BOX, N), N, BOX, 12), ps = measurePk(depositCIC3D(s.pos, s.n, BOX, N), N, BOX, 12);
    const idx = pr.k.map((_k, i) => i).filter((i) => pr.k[i] < 0.1);
    const kaiserRatio = idx.reduce((a, i) => a + ps.P[i] / pr.P[i], 0) / idx.length / kaiserMonopole(f);
    const pkRatio = idx.map((i) => ({ k: pr.k[i], ratio: pr.P[i] / (amp * amp * P(pr.k[i])), modes: pr.n[i] }));
    return { seed, kaiserRatioOverPrediction: kaiserRatio, pkRatio };
  });
  const F = lptFields(PLANCK18_LSS, N, BOX, 2026, 1), radii = [3, 4.5, 6.75, 10];
  const H = findHalos(F, smoothedLinear(F, radii), radii, 1, PLANCK18_LSS.Om);
  // 4. fixed-A_s amplitude
  const fixedAs = {
    sigma8AbsolutePlanck: sigma8FromAs(PLANCK18_LSS, PLANCK18_AS), sigma8PublishedPlanck: PLANCK18_LSS.sigma8,
    byOm: [0.1, 0.15, 0.2, 0.315, 0.45, 0.55, 0.6].map((Om) => ({ Om, sigma8: sigma8AtFixedAs({ ...PLANCK18_LSS, Om }) })),
    byNs: [0.8, 0.965, 1.1, 1.25].map((ns) => ({ ns, sigma8: sigma8AtFixedAs({ ...PLANCK18_LSS, ns }) })),
  };
  // 5. no truncation: linear scaling of the 1LPT displacement, and density contrast vs σ₈ (2LPT)
  const q = lptParticles(F, { amp: 1e-9 }).pos, p1 = lptParticles(F, { amp: 1 }).pos, p2 = lptParticles(F, { amp: 2 }).pos;
  let linErr = 0;
  const wrap = (d: number) => d - BOX * Math.round(d / BOX);
  for (let i = 0; i < p1.length; i++) { const d1 = wrap(p1[i] - q[i]), d2 = wrap(p2[i] - q[i]); linErr = Math.max(linErr, Math.abs(d2 - 2 * d1)); }
  const F2 = lptFields(PLANCK18_LSS, N, BOX, 2026, 2);
  const contrast = [0.45, 0.811, 1.1, 1.3].map((s8) => {
    const P2 = lptParticles(F2, { amp: s8 / PLANCK18_LSS.sigma8, order2: true });
    const g = depositCIC3D(P2.pos, P2.n, BOX, N);
    let v = 0, dense = 0, voids = 0;
    for (let i = 0; i < g.length; i++) { v += g[i] * g[i]; if (g[i] + 1 > 10) dense++; if (g[i] + 1 < 0.2) voids++; }
    return { sigma8: s8, rmsDelta: Math.sqrt(v / g.length), denseCellFraction: dense / g.length, voidCellFraction: voids / g.length };
  });
  return { N, box: BOX, seeds, halos: { n: H.n, Mmin: H.M[H.n - 1], Mmax: H.M[0], numberDensity: H.n / BOX ** 3 }, fixedAs, noTruncation: { maxLinearityErrMpc: linErr, contrast } };
}
