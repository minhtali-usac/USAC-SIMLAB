/**
 * F8 reproducible checks: fast Simpson μ(z) vs the adaptive-quadrature distanceModulus (D8 core), offset marginalisation,
 * mock-catalogue recovery, and the fits to the real Union2.1 table (diagonal statistical errors only).
 */
import { distanceModulus } from '../cosmology/friedmann';
import { muModel, chi2Sn, chi2Grid, gridPosterior, flatLcdmFit, mockSn, type SnData } from '../cosmology/snInference';
import { UNION21_Z, UNION21_MU, UNION21_ERR, UNION21_N } from '../data/union21';

export const UNION21: SnData = { z: UNION21_Z, mu: UNION21_MU, err: UNION21_ERR, n: UNION21_N };

let cache: ReturnType<typeof compute> | null = null;
export const validateSn = () => (cache ??= compute());

function compute() {
  // 1. μ(z): fast Simpson vs adaptive Simpson (friedmann.ts), flat / open / closed
  const zs = [0.01, 0.1, 0.5, 1, 1.4];
  let maxMuDiff = 0;
  for (const [Om, OL] of [[0.3, 0.7], [0.3, 0.3], [0.5, 0.9], [1, 0]]) {
    const m = muModel('olcdm', Om, OL, zs)!;
    zs.forEach((z, i) => { maxMuDiff = Math.max(maxMuDiff, Math.abs(m[i] - distanceModulus({ H0: 70, Om, OL, Or: 0 }, z))); });
  }
  // 2. real data
  const grid = chi2Grid(UNION21, 'olcdm', [0, 1.2], [0, 1.6], 121, 161);
  const post = gridPosterior(grid, 'olcdm');
  const flat = flatLcdmFit(UNION21);
  const wGrid = chi2Grid(UNION21, 'wcdm', [0.05, 0.6], [-2, -0.3], 111, 171);
  const wPost = gridPosterior(wGrid, 'wcdm');
  // 3. mock recovery: truth (0.3, 0.7) for 20 seeds - fraction of 68% (Δχ² < 2.30) regions containing the truth
  let inside68 = 0;
  const seeds = 20;
  for (let s = 1; s <= seeds; s++) {
    const mock = mockSn(UNION21, 'olcdm', 0.3, 0.7, s);
    const g = chi2Grid(mock, 'olcdm', [0, 1.2], [0, 1.6], 49, 65);
    if (chi2Sn(mock, 'olcdm', 0.3, 0.7).chi2 - g.min < 2.3) inside68++;
  }
  return {
    maxMuDiff,
    union21: { n: UNION21.n, olcdm: { best: grid.best, chi2min: grid.min, dof: UNION21.n - 3, mean: post.mean, sd: post.sd, pAccel: post.pAccel }, flat, wcdm: { best: wGrid.best, chi2min: wGrid.min, mean: wPost.mean, sd: wPost.sd } },
    mockCoverage68: inside68 / seeds,
  };
}
