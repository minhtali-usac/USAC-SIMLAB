import { describe, it, expect } from 'vitest';
import {
  PLANCK18_LSS, lptFields, linearPk, measurePk, lptParticles, depositCIC3D, smoothedLinear, findHalos, populateHod,
  hodExpected, kaiserMonopole, growthRate2, DELTA_C, interpolateCIC3D,
} from '../src';

const N = 32, BOX = 250;
const F1 = lptFields(PLANCK18_LSS, N, BOX, 11, 2);

describe('3D LPT particles', () => {
  it('amp → 0 leaves particles on the Lagrangian grid; positions stay in [0, box)', () => {
    const p = lptParticles(F1, { amp: 0 });
    const cell = BOX / N;
    expect(p.pos[3 * 5]).toBeCloseTo(5 * cell, 4);
    const q = lptParticles(F1, { amp: 1.5, order2: true });
    let ok = true;
    for (let i = 0; i < q.pos.length; i++) if (!(q.pos[i] >= 0 && q.pos[i] < BOX)) ok = false;
    expect(ok).toBe(true);
  });
  it('redshift-space distortion moves particles only along the line of sight', () => {
    const r = lptParticles(F1, { amp: 1 }), s = lptParticles(F1, { amp: 1, los: 2, f: 0.5 });
    let dxy = 0, dz = 0;
    for (let i = 0; i < r.n; i++) { dxy += Math.abs(r.pos[3 * i] - s.pos[3 * i]) + Math.abs(r.pos[3 * i + 1] - s.pos[3 * i + 1]); dz += Math.abs(r.pos[3 * i + 2] - s.pos[3 * i + 2]); }
    expect(dxy).toBe(0);
    expect(dz).toBeGreaterThan(0);
  });
  it('CIC density of the particles recovers amp² · P_lin(k) on large scales (within 30%)', () => {
    const amp = 0.2, p = lptParticles(F1, { amp });
    const d = depositCIC3D(p.pos, p.n, BOX, N);
    expect(d.reduce((a, b) => a + b, 0) / d.length).toBeCloseTo(0, 5);
    const pk = measurePk(d, N, BOX, 10), P = linearPk(PLANCK18_LSS);
    const low = pk.k.map((k, i) => [k, pk.P[i]]).filter(([k]) => k < 0.12);
    const ratio = low.reduce((s, [k, v]) => s + v / (amp * amp * P(k)), 0) / low.length;
    expect(Math.abs(ratio - 1)).toBeLessThan(0.3);
  });
  it('linear redshift-space monopole / real-space ≈ Kaiser 1 + 2f/3 + f²/5 (same modes, within 6%)', () => {
    const amp = 0.05, f = 0.53;
    const r = lptParticles(F1, { amp }), s = lptParticles(F1, { amp, los: 2, f });
    const pr = measurePk(depositCIC3D(r.pos, r.n, BOX, N), N, BOX, 8), ps = measurePk(depositCIC3D(s.pos, s.n, BOX, N), N, BOX, 8);
    const idx = pr.k.map((k, i) => i).filter((i) => pr.k[i] < 0.1);
    const ratio = idx.reduce((a, i) => a + ps.P[i] / pr.P[i], 0) / idx.length;
    expect(Math.abs(ratio / kaiserMonopole(f) - 1)).toBeLessThan(0.06);
  });
  it('CIC interpolation reproduces a linear field exactly and conserves the mean density', () => {
    const G = 8, box = 80, g = new Float32Array(G * G * G);
    for (let k = 0; k < G; k++) for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) g[(k * G + j) * G + i] = 2 + 0.1 * j;
    const v = interpolateCIC3D(g, G, box, [0, 35, 0], 1);
    expect(v[0]).toBeCloseTo(2 + 0.1 * (35 / 10 - 0.5), 5);
    const p = lptParticles(F1, { amp: 1 }), d = depositCIC3D(p.pos, p.n, BOX, 16);
    const rho = interpolateCIC3D(d.map((x) => 1 + x), 16, BOX, p.pos, p.n);
    expect(rho.reduce((a, b) => a + b, 0) / p.n).toBeGreaterThan(1); // mass-weighted mean ρ ≥ volume mean (clustering)
  });
  it('f₂ ≈ 2 Ωm^(6/11) → 2 in Einstein–de Sitter', () => { expect(growthRate2(1, 0.5)).toBeCloseTo(2, 10); });
});

describe('Halo proxy and HOD galaxies', () => {
  const radii = [3, 4.5, 6.75];
  const S = smoothedLinear(F1, radii);
  it('smoothing reduces variance monotonically with radius', () => {
    const v = S.map((d) => d.reduce((a, b) => a + b * b, 0) / d.length);
    expect(v[0]).toBeGreaterThan(v[1]); expect(v[1]).toBeGreaterThan(v[2]);
  });
  it('halos pass the collapse threshold, are sorted by mass, and become more numerous with growth', () => {
    const h1 = findHalos(F1, S, radii, 1, 0.315), h2 = findHalos(F1, S, radii, 1.4, 0.315);
    expect(h1.n).toBeGreaterThan(0);
    expect(h2.n).toBeGreaterThan(h1.n);
    for (let k = 1; k < h1.n; k++) expect(h1.M[k]).toBeLessThanOrEqual(h1.M[k - 1]);
    for (let k = 0; k < h1.n; k++) { const ri = radii.indexOf(h1.R[k]); expect(S[ri][h1.cell[k]]).toBeGreaterThanOrEqual(DELTA_C - 1e-6); }
    // M = (2π)^{3/2} ρ̄ R³ with ρ̄ = 2.775e11 Ωm
    expect(h1.M[0] / ((2 * Math.PI) ** 1.5 * 2.77536627e11 * 0.315 * h1.R[0] ** 3)).toBeCloseTo(1, 10);
  });
  it('galaxy count matches the HOD expectation within Poisson scatter', () => {
    const n = 400, masses = new Float64Array(n), centres = new Float32Array(3 * n);
    for (let i = 0; i < n; i++) { masses[i] = 10 ** (13 + (2 * i) / n); centres[3 * i] = (i * 7) % 250; }
    const p = { logMmin: 13.5, sigmaLogM: 0.26, logM0: 13.0, logM1: 14.3, alpha: 1.0 };
    const exp = hodExpected(masses, n, p), g = populateHod(centres, masses, n, 250, 0.315, p, 3);
    expect(Math.abs(g.n - exp)).toBeLessThan(4 * Math.sqrt(exp));
  });
});

import { validateCosmicWeb } from '../src/validation/cosmicWebValidation';
describe('F6 reproducible report (validate:cosmicweb)', () => {
  const v = validateCosmicWeb();
  it('64³: Kaiser monopole ratio within 5 % for two seeds; halo proxy 3.7e13–4.2e14 M☉/h', () => {
    for (const s of v.seeds) expect(Math.abs(s.kaiserRatioOverPrediction - 1)).toBeLessThan(0.05);
    expect(v.halos.Mmin).toBeGreaterThan(3e13);
    expect(v.halos.Mmax).toBeLessThan(1e15);
  });
  it('fixed A_s: Planck σ₈ from A_s within 5 % of 0.811 (massless ν, EH98); anchored σ₈ rises with Ωm and ns', () => {
    const r = validateCosmicWeb().fixedAs;
    expect(Math.abs(r.sigma8AbsolutePlanck / r.sigma8PublishedPlanck - 1)).toBeLessThan(0.05);
    expect(r.byOm.find((x) => x.Om === 0.315)!.sigma8).toBeCloseTo(0.811, 10);
    for (let i = 1; i < r.byOm.length; i++) expect(r.byOm[i].sigma8).toBeGreaterThan(r.byOm[i - 1].sigma8);
    for (let i = 1; i < r.byNs.length; i++) expect(r.byNs[i].sigma8).toBeGreaterThan(r.byNs[i - 1].sigma8);
  });
  it('LPT particles are not frozen: 1LPT displacement is linear in amplitude; density contrast grows with σ₈', () => {
    const r = validateCosmicWeb().noTruncation;
    expect(r.maxLinearityErrMpc).toBeLessThan(1e-3);
    expect(r.contrast[1].rmsDelta).toBeGreaterThan(r.contrast[0].rmsDelta);
    expect(r.contrast[3].rmsDelta).toBeGreaterThan(r.contrast[1].rmsDelta);
    expect(r.contrast[3].voidCellFraction).toBeGreaterThan(r.contrast[1].voidCellFraction);
  });
});
