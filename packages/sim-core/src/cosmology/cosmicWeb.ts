/**
 * 3D cosmic-web toolkit built on lss.ts (developed from lss-lab's "Cosmic Web Sandbox", github.com/MinhMPA/lss-lab).
 *  - Particles from Lagrangian perturbation theory, x = q + D Ψ⁽¹⁾ + (3/7) D² Ψ⁽²⁾ (Bouchet et al. 1995, A&A 296, 575),
 *    applied without truncation, as in lss-lab: particles stream through caustics (multi-streaming after shell
 *    crossing is the known limit of LPT). An earlier version stopped each particle at its first shell crossing;
 *    that froze ~50 % of the particles at σ₈ = 0.81 and made the web insensitive to σ₈ and Ωm, so it was removed.
 *  - Redshift-space distortions: s = x + (v·ê/aH) ê with v/aH = f D Ψ⁽¹⁾ + f₂ (3/7) D² Ψ⁽²⁾,
 *    f = dlnD/dlna, f₂ ≈ 2 Ωm(a)^(6/11) (Bouchet et al. 1995). Linear limit → Kaiser (1987) δ_s = (1 + f μ²) δ.
 *  - Cloud-in-cell density on a 3D grid (Hockney & Eastwood 1988).
 *  - Halo proxy: peaks of the Gaussian-smoothed linear field that pass the spherical-collapse threshold
 *    δ_c = 1.686 (Gunn & Gott 1972; Press & Schechter 1974), mass M = (2π)^(3/2) ρ̄_m R_G³ (Gaussian-filter mass, Bardeen et al. 1986).
 *    This is a "peak-patch-lite" proxy, not an N-body halo catalogue.
 *  - Galaxies: Zheng et al. (2007) HOD (hodZheng) placed in those halos.
 * Units: Mpc/h, M☉/h.
 */
import { fft3d, mulberry32, hodZheng, omegaMa, type LptFields } from './lss';

/** ρ_crit,0 / h² = 2.775 × 10¹¹ M☉ Mpc⁻³ (PDG 2024, Astrophysical constants) ⇒ ρ̄_m = 2.775e11 Ωm (M☉/h)/(Mpc/h)³. */
export const RHO_CRIT_H2 = 2.77536627e11;
/** Spherical-collapse linear threshold (Einstein–de Sitter value; weak Ωm dependence neglected). */
export const DELTA_C = 1.686;

/** Second-order growth rate f₂ ≈ 2 Ωm(a)^(6/11) (Bouchet et al. 1995). */
export const growthRate2 = (Om: number, a: number) => 2 * omegaMa(Om, a) ** (6 / 11);

/** Kaiser (1987) monopole boost of the redshift-space power spectrum: b² + 2bf/3 + f²/5. */
export const kaiserMonopole = (f: number, b = 1) => b * b + (2 * b * f) / 3 + (f * f) / 5;

export interface ParticleOpts {
  /** Growth amplitude relative to the σ₈-normalised fields (D(a)/D(1) · σ₈/σ₈,fields). */
  amp: number;
  /** Include 2LPT term (requires F.disp2). */
  order2?: boolean;
  /** Line-of-sight axis for redshift-space distortions (0 x, 1 y, 2 z) or −1 for real space. */
  los?: -1 | 0 | 1 | 2;
  /** Linear growth rate f and second-order f₂ (needed only when los ≥ 0). */
  f?: number;
  f2?: number;
}

/**
 * Particle positions (interleaved xyz in [0, box)), Jacobian density ρ/ρ̄ and web type (0–3) for every grid cell.
 * The GPU shader in apps/web f6 mirrors this function exactly.
 */
export function lptParticles(F: LptFields, o: ParticleOpts) {
  const { N, box, disp1, disp2, eig } = F, M = N * N * N, cell = box / N;
  const pos = new Float32Array(3 * M), rho = new Float32Array(M), web = new Uint8Array(M);
  const use2 = !!(o.order2 && disp2), los = o.los ?? -1, f = o.f ?? 0, f2 = o.f2 ?? 0, m = o.amp;
  for (let iz = 0, i = 0; iz < N; iz++) for (let iy = 0; iy < N; iy++) for (let ix = 0; ix < N; ix++, i++) {
    const l1 = eig[3 * i], l2 = eig[3 * i + 1], l3 = eig[3 * i + 2];
    const me = m, c2 = use2 ? (3 / 7) * me * me : 0;
    const q = [ix * cell, iy * cell, iz * cell];
    for (let a = 0; a < 3; a++) {
      const p1 = disp1[3 * i + a], p2 = use2 ? disp2![3 * i + a] : 0;
      let x = q[a] + me * p1 + c2 * p2;
      if (a === los) x += f * me * p1 + f2 * c2 * p2;
      pos[3 * i + a] = ((x % box) + box) % box;
    }
    rho[i] = 1 / Math.max(1e-3, Math.abs((1 + me * l1) * (1 + me * l2) * (1 + me * l3)));
    web[i] = (m * l1 < -0.4 ? 1 : 0) + (m * l2 < -0.4 ? 1 : 0) + (m * l3 < -0.4 ? 1 : 0);
  }
  return { pos, rho, web, n: M };
}

/** Cloud-in-cell density contrast δ = ρ/ρ̄ − 1 of n points (interleaved xyz) on a G³ periodic grid. */
export function depositCIC3D(pos: ArrayLike<number>, n: number, box: number, G: number): Float32Array {
  const g = new Float32Array(G * G * G), s = G / box;
  const w = (v: number) => ((v % G) + G) % G;
  for (let p = 0; p < n; p++) {
    const fx = pos[3 * p] * s - 0.5, fy = pos[3 * p + 1] * s - 0.5, fz = pos[3 * p + 2] * s - 0.5;
    const i0 = Math.floor(fx), j0 = Math.floor(fy), k0 = Math.floor(fz);
    const dx = fx - i0, dy = fy - j0, dz = fz - k0;
    const I = [w(i0), w(i0 + 1)], J = [w(j0), w(j0 + 1)], K = [w(k0), w(k0 + 1)];
    const WX = [1 - dx, dx], WY = [1 - dy, dy], WZ = [1 - dz, dz];
    for (let c = 0; c < 2; c++) for (let b = 0; b < 2; b++) for (let a = 0; a < 2; a++)
      g[(K[c] * G + J[b]) * G + I[a]] += WX[a] * WY[b] * WZ[c];
  }
  const mean = n / g.length;
  for (let k = 0; k < g.length; k++) g[k] = g[k] / mean - 1;
  return g;
}

/** Gaussian-smoothed linear δ_L (at the fields' normalisation) for each smoothing radius R_G [Mpc/h]. */
export function smoothedLinear(F: LptFields, radii: number[]): Float32Array[] {
  const { N, box, delta } = F, M = N * N * N, half = N >> 1, kf = (2 * Math.PI) / box;
  const re = Float32Array.from(delta), im = new Float32Array(M);
  fft3d(re, im, N, false);
  const k2 = new Float32Array(M);
  for (let i = 0; i < M; i++) {
    const ix = i % N, iy = Math.floor(i / N) % N, iz = Math.floor(i / (N * N));
    const fx = ix <= half ? ix : ix - N, fy = iy <= half ? iy : iy - N, fz = iz <= half ? iz : iz - N;
    k2[i] = kf * kf * (fx * fx + fy * fy + fz * fz);
  }
  return radii.map((R) => {
    const r = new Float32Array(M), i2 = new Float32Array(M);
    for (let i = 0; i < M; i++) { const W = Math.exp(-0.5 * k2[i] * R * R); r[i] = re[i] * W; i2[i] = im[i] * W; }
    fft3d(r, i2, N, true);
    return r;
  });
}

export interface Halos {
  /** Lagrangian cell index of each halo centre. */
  cell: Int32Array;
  /** Gaussian smoothing radius R_G and mass M = (2π)^{3/2} ρ̄_m R_G³. */
  R: Float32Array;
  M: Float64Array;
  n: number;
}

/**
 * Peak-patch-lite halo proxy: scanning radii from largest to smallest, a cell is a halo centre if amp·δ_R ≥ δ_c and
 * δ_R is a local maximum among its 6 neighbours; cells within the equal-mass Lagrangian top-hat radius R_TH = ((3/2)√(2π))^{1/3} R_G ≈ 1.55 R_G
 * of an already accepted (more massive) halo are excluded. Returned sorted by mass, descending.
 */
export function findHalos(F: LptFields, smooth: Float32Array[], radii: number[], amp: number, Om: number, deltaC = DELTA_C): Halos {
  const { N, box } = F, M = N * N * N, cell = box / N, rhoM = RHO_CRIT_H2 * Om;
  const taken = new Uint8Array(M);
  const cells: number[] = [], Rs: number[] = [], Ms: number[] = [];
  const order = radii.map((R, k) => [R, k] as const).sort((a, b) => b[0] - a[0]);
  const w = (v: number) => ((v % N) + N) % N;
  for (const [R, k] of order) {
    const d = smooth[k], thr = deltaC / amp;
    const cand: number[] = [];
    for (let i = 0; i < M; i++) {
      const v = d[i];
      if (v < thr || taken[i]) continue;
      const ix = i % N, iy = Math.floor(i / N) % N, iz = Math.floor(i / (N * N));
      if (v < d[(iz * N + iy) * N + w(ix + 1)] || v < d[(iz * N + iy) * N + w(ix - 1)] || v < d[(iz * N + w(iy + 1)) * N + ix] ||
        v < d[(iz * N + w(iy - 1)) * N + ix] || v < d[(w(iz + 1) * N + iy) * N + ix] || v < d[(w(iz - 1) * N + iy) * N + ix]) continue;
      cand.push(i);
    }
    cand.sort((a, b) => d[b] - d[a]);
    const Rth = Math.cbrt(1.5 * Math.sqrt(2 * Math.PI)) * R, rc = Math.ceil(Rth / cell);
    for (const i of cand) {
      if (taken[i]) continue;
      cells.push(i); Rs.push(R); Ms.push((2 * Math.PI) ** 1.5 * rhoM * R * R * R);
      const ix = i % N, iy = Math.floor(i / N) % N, iz = Math.floor(i / (N * N));
      for (let dz = -rc; dz <= rc; dz++) for (let dy = -rc; dy <= rc; dy++) for (let dx = -rc; dx <= rc; dx++)
        if ((dx * dx + dy * dy + dz * dz) * cell * cell <= Rth * Rth) taken[(w(iz + dz) * N + w(iy + dy)) * N + w(ix + dx)] = 1;
    }
  }
  const idx = Ms.map((_, k) => k).sort((a, b) => Ms[b] - Ms[a]);
  return { cell: Int32Array.from(idx.map((k) => cells[k])), R: Float32Array.from(idx.map((k) => Rs[k])), M: Float64Array.from(idx.map((k) => Ms[k])), n: idx.length };
}

export interface HodParams { logMmin: number; sigmaLogM: number; logM0: number; logM1: number; alpha: number }

/** Poisson deviate (Knuth for small λ, normal approximation above 30). */
function poisson(lam: number, r: () => number) {
  if (lam <= 0) return 0;
  if (lam > 30) { const g = Math.sqrt(-2 * Math.log(r() || 1e-12)) * Math.cos(2 * Math.PI * r()); return Math.max(0, Math.round(lam + Math.sqrt(lam) * g)); }
  const L = Math.exp(-lam); let k = 0, p = 1;
  do { k++; p *= r(); } while (p > L);
  return k - 1;
}

/**
 * Populate halos with galaxies: a central (Bernoulli ⟨N_cen⟩) at the halo centre and Poisson ⟨N_sat⟩ satellites
 * scattered isotropically (Gaussian, σ = r₂₀₀/2, r₂₀₀ from M = (4π/3)·200 ρ̄_m r³). Simplified profile - not NFW.
 * `centres` are halo positions (interleaved xyz, already displaced / in redshift space). Returns galaxy positions.
 */
export function populateHod(centres: ArrayLike<number>, masses: ArrayLike<number>, n: number, box: number, Om: number, p: HodParams, seed: number) {
  const r = mulberry32(seed), out: number[] = [], rhoM = RHO_CRIT_H2 * Om;
  let nc = 0, ns = 0;
  for (let h = 0; h < n; h++) {
    const occ = hodZheng(masses[h], p);
    const hasCen = r() < occ.ncen;
    const nsat = poisson(occ.nsat, r);
    if (hasCen) { out.push(centres[3 * h], centres[3 * h + 1], centres[3 * h + 2]); nc++; }
    const sig = 0.5 * Math.cbrt((3 * masses[h]) / (4 * Math.PI * 200 * rhoM));
    for (let s = 0; s < nsat; s++) {
      for (let a = 0; a < 3; a++) {
        const g = Math.sqrt(-2 * Math.log(r() || 1e-12)) * Math.cos(2 * Math.PI * r());
        out.push((((centres[3 * h + a] + sig * g) % box) + box) % box);
      }
      ns++;
    }
  }
  return { pos: Float32Array.from(out), n: out.length / 3, nCentral: nc, nSatellite: ns };
}

/** Expected galaxy count Σ_h (⟨N_cen⟩ + ⟨N_sat⟩) for a halo list (for checks and readouts). */
export function hodExpected(masses: ArrayLike<number>, n: number, p: HodParams) {
  let s = 0;
  for (let h = 0; h < n; h++) { const o = hodZheng(masses[h], p); s += o.ncen + o.nsat; }
  return s;
}

/** Trilinear (CIC-consistent) interpolation of a G³ periodic grid at n points (interleaved xyz) → values. */
export function interpolateCIC3D(grid: ArrayLike<number>, G: number, box: number, pos: ArrayLike<number>, n: number): Float32Array {
  const out = new Float32Array(n), s = G / box, w = (v: number) => ((v % G) + G) % G;
  for (let p = 0; p < n; p++) {
    const fx = pos[3 * p] * s - 0.5, fy = pos[3 * p + 1] * s - 0.5, fz = pos[3 * p + 2] * s - 0.5;
    const i0 = Math.floor(fx), j0 = Math.floor(fy), k0 = Math.floor(fz), dx = fx - i0, dy = fy - j0, dz = fz - k0;
    const I = [w(i0), w(i0 + 1)], J = [w(j0), w(j0 + 1)], K = [w(k0), w(k0 + 1)], WX = [1 - dx, dx], WY = [1 - dy, dy], WZ = [1 - dz, dz];
    let v = 0;
    for (let c = 0; c < 2; c++) for (let b = 0; b < 2; b++) for (let a = 0; a < 2; a++) v += WX[a] * WY[b] * WZ[c] * grid[(K[c] * G + J[b]) * G + I[a]];
    out[p] = v;
  }
  return out;
}
