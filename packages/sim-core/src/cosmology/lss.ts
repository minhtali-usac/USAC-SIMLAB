/**
 * Large-scale structure toolkit (ported from lss-lab, github.com/MinhMPA/lss-lab, and extended).
 *  - Eisenstein & Hu 1998, ApJ 496, 605: transfer function with baryon wiggles (eqs. 2–24) and the
 *    "no-wiggle" fit (eqs. 26, 28–31).
 *  - Linear P(k) = A kⁿˢ T²(k), A fixed by σ₈ (top-hat R = 8 Mpc/h).
 *  - Linear growth D(a): exact ODE  D'' + (2 + dlnH/dlna) D' = (3/2) Ωm(a) D  (′ = d/dln a), flat ΛCDM, growing
 *    mode D → a; Carroll, Press & Turner 1992 fit kept for comparison only.
 *  - Gaussian random fields on periodic grids, Zel'dovich (1LPT) and 2LPT displacements, deformation tensor.
 *  - Power-spectrum estimator (CIC) and the Zheng et al. 2007 HOD.
 * Units: k in h/Mpc, lengths in Mpc/h.
 */

export interface LssCosmo { Om: number; Ob: number; h: number; ns: number; sigma8: number; Tcmb?: number }
export const PLANCK18_LSS: LssCosmo = { Om: 0.315, Ob: 0.049, h: 0.674, ns: 0.965, sigma8: 0.811, Tcmb: 2.7255 };

/** Mulberry32 uniform RNG (seeded, reproducible "matched phases"). */
export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
export function fillGaussian(arr: Float32Array | Float64Array, seed: number) {
  const rnd = mulberry32(seed);
  for (let i = 0; i < arr.length; i += 2) {
    const u1 = Math.max(rnd(), 1e-12), u2 = rnd();
    const r = Math.sqrt(-2 * Math.log(u1)), th = 2 * Math.PI * u2;
    arr[i] = r * Math.cos(th);
    if (i + 1 < arr.length) arr[i + 1] = r * Math.sin(th);
  }
}

type Arr = Float32Array | Float64Array;
/** In-place radix-2 complex FFT along one strided line; inverse divides by n. */
export function fftLine(re: Arr, im: Arr, n: number, off: number, stride: number, inverse: boolean) {
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const a = off + i * stride, b = off + j * stride;
      let t = re[a]; re[a] = re[b]; re[b] = t;
      t = im[a]; im[a] = im[b]; im[b] = t;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inverse ? 2 : -2) * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang), half = len >> 1;
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < half; k++) {
        const a = off + (i + k) * stride, b = off + (i + k + half) * stride;
        const br = re[b] * cr - im[b] * ci, bi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - br; im[b] = im[a] - bi; re[a] += br; im[a] += bi;
        const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
  if (inverse) for (let i = 0; i < n; i++) { re[off + i * stride] /= n; im[off + i * stride] /= n; }
}
/** 2D FFT, index = iy·N + ix. */
export function fft2d(re: Arr, im: Arr, N: number, inverse: boolean) {
  for (let y = 0; y < N; y++) fftLine(re, im, N, y * N, 1, inverse);
  for (let x = 0; x < N; x++) fftLine(re, im, N, x, N, inverse);
}
/** 3D FFT, index = (iz·N + iy)·N + ix. */
export function fft3d(re: Arr, im: Arr, N: number, inverse: boolean) {
  const N2 = N * N;
  for (let z = 0; z < N; z++) for (let y = 0; y < N; y++) fftLine(re, im, N, (z * N + y) * N, 1, inverse);
  for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) fftLine(re, im, N, z * N2 + x, N, inverse);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) fftLine(re, im, N, y * N + x, N2, inverse);
}

/** Sound horizon at the drag epoch s [Mpc] and other EH98 scalars. */
export function eh98Scalars(c: LssCosmo) {
  const theta = (c.Tcmb ?? 2.7255) / 2.7, h = c.h;
  const om = c.Om * h * h, ob = c.Ob * h * h;
  const zeq = 2.5e4 * om * theta ** -4, keq = 0.0746 * om * theta ** -2;
  const b1 = 0.313 * om ** -0.419 * (1 + 0.607 * om ** 0.674), b2 = 0.238 * om ** 0.223;
  const zd = ((1291 * om ** 0.251) / (1 + 0.659 * om ** 0.828)) * (1 + b1 * ob ** b2);
  const Req = 31.5 * ob * theta ** -4 * (1000 / zeq), Rd = 31.5 * ob * theta ** -4 * (1000 / zd);
  const s = (2 / (3 * keq)) * Math.sqrt(6 / Req) * Math.log((Math.sqrt(1 + Rd) + Math.sqrt(Rd + Req)) / (1 + Math.sqrt(Req)));
  return { zeq, keq, zd, Req, Rd, s, om, ob, theta };
}

/** Full EH98 transfer function T(k) with baryon acoustic oscillations; k in h/Mpc. */
export function eh98Transfer(c: LssCosmo): (k: number) => number {
  const { keq, zeq, zd, Rd, s, om, ob } = eh98Scalars(c);
  const fb = c.Ob / c.Om, fc = (c.Om - c.Ob) / c.Om, h = c.h;
  const ksilk = 1.6 * ob ** 0.52 * om ** 0.73 * (1 + (10.4 * om) ** -0.95);
  const a1 = (46.9 * om) ** 0.67 * (1 + (32.1 * om) ** -0.532), a2 = (12.0 * om) ** 0.424 * (1 + (45.0 * om) ** -0.582);
  const alphaC = a1 ** -fb * a2 ** (-fb * fb * fb);
  const bb1 = 0.944 / (1 + (458 * om) ** -0.708), bb2 = (0.395 * om) ** -0.0266;
  const betaC = 1 / (1 + bb1 * (fc ** bb2 - 1));
  const Gy = (y: number) => y * (-6 * Math.sqrt(1 + y) + (2 + 3 * y) * Math.log((Math.sqrt(1 + y) + 1) / (Math.sqrt(1 + y) - 1)));
  const alphaB = 2.07 * keq * s * (1 + Rd) ** -0.75 * Gy((1 + zeq) / (1 + zd));
  const betaB = 0.5 + fb + (3 - 2 * fb) * Math.sqrt((17.2 * om) ** 2 + 1);
  const betaNode = 8.41 * om ** 0.435;
  const T0 = (k: number, ac: number, bc: number) => {
    const q = k / (13.41 * keq), C = 14.2 / ac + 386 / (1 + 69.9 * q ** 1.08), L = Math.log(Math.E + 1.8 * bc * q);
    return L / (L + C * q * q);
  };
  return (k: number) => {
    if (k <= 0) return 1;
    const kp = k * h, ks = kp * s;
    const f = 1 / (1 + (ks / 5.4) ** 4);
    const Tc = f * T0(kp, 1, betaC) + (1 - f) * T0(kp, alphaC, betaC);
    const st = s / (1 + (betaNode / ks) ** 3) ** (1 / 3);
    const j0 = Math.sin(kp * st) / (kp * st);
    const Tb = (T0(kp, 1, 1) / (1 + (ks / 5.2) ** 2) + (alphaB / (1 + (betaB / ks) ** 3)) * Math.exp(-((kp / ksilk) ** 1.4))) * j0;
    return fb * Tb + fc * Tc;
  };
}

/** EH98 no-wiggle transfer function (smooth shape, eq. 29–31). */
export function eh98TransferNoWiggle(c: LssCosmo): (k: number) => number {
  const h = c.h, omh2 = c.Om * h * h, obh2 = c.Ob * h * h, fb = c.Ob / c.Om, theta2 = ((c.Tcmb ?? 2.7255) / 2.7) ** 2;
  const s = (44.5 * Math.log(9.83 / omh2)) / Math.sqrt(1 + 10 * obh2 ** 0.75);
  const aG = 1 - 0.328 * Math.log(431 * omh2) * fb + 0.38 * Math.log(22.3 * omh2) * fb * fb;
  return (k: number) => {
    if (k <= 0) return 1;
    const ks = k * h * s, gEff = c.Om * h * (aG + (1 - aG) / (1 + (0.43 * ks) ** 4)), q = (k * theta2) / gEff;
    const L = Math.log(2 * Math.E + 1.8 * q), C = 14.2 + 731 / (1 + 62.5 * q);
    return L / (L + C * q * q);
  };
}

/** σ(R) for a given P(k) (top-hat window), integrated in ln k on [1e-4, 50] h/Mpc. */
export function sigmaR(P: (k: number) => number, R: number, n = 600): number {
  const lk0 = Math.log(1e-4), lk1 = Math.log(50);
  let s = 0;
  for (let i = 0; i < n; i++) {
    const k = Math.exp(lk0 + ((lk1 - lk0) * (i + 0.5)) / n), x = k * R;
    const W = (3 * (Math.sin(x) - x * Math.cos(x))) / (x * x * x);
    s += k * k * k * P(k) * W * W;
  }
  return Math.sqrt((s * (lk1 - lk0)) / n / (2 * Math.PI * Math.PI));
}

/** Linear P(k) [(Mpc/h)³] at z = 0, normalised to c.sigma8; `wiggles` = full EH98 vs no-wiggle. */
export function linearPk(c: LssCosmo, wiggles = true): (k: number) => number {
  const T = wiggles ? eh98Transfer(c) : eh98TransferNoWiggle(c);
  const raw = (k: number) => k ** c.ns * T(k) ** 2;
  const A = (c.sigma8 / sigmaR(raw, 8)) ** 2;
  return (k: number) => (k > 0 ? A * raw(k) : 0);
}

/** Planck 2018 primordial amplitude A_s = e^{3.044} × 10⁻¹⁰ = 2.099 × 10⁻⁹ at k_p = 0.05 Mpc⁻¹ (Planck 2018 VI, Table 2, TT,TE,EE+lowE+lensing). */
export const PLANCK18_AS = Math.exp(3.044) * 1e-10;
export const K_PIVOT_PER_MPC = 0.05;
const C_OVER_H100 = 2997.92458; // c/(100 km/s/Mpc) in Mpc/h

/**
 * σ8 implied by a primordial amplitude A_s (linear theory, Dodelson & Schmidt 2020, Modern Cosmology 2nd ed., ch. 8):
 *   Δ²(k) = (4/25) A_s (k/k_p)^{ns−1} (k c/H0)⁴ T²(k) [D(1)/Ωm]²,   D → a deep in matter domination,
 *   σ8² = ∫ Δ²(k) W²(8k) d ln k (top-hat W, k in h/Mpc, c/H0 = 2997.92458 Mpc/h).
 * T(k) is EH98 (massless neutrinos); D from growthSolution (flat ΛCDM, radiation neglected in the growth ODE).
 */
export function sigma8FromAs(c: LssCosmo, As: number, n = 800): number {
  const T = eh98Transfer(c), g = growthSolution(c.Om, 1.0, 3000).D1 / c.Om, kp = K_PIVOT_PER_MPC / c.h;
  const lk0 = Math.log(1e-4), lk1 = Math.log(50);
  let s = 0;
  for (let i = 0; i < n; i++) {
    const k = Math.exp(lk0 + ((lk1 - lk0) * (i + 0.5)) / n), x = 8 * k;
    const W = (3 * (Math.sin(x) - x * Math.cos(x))) / (x * x * x);
    s += (4 / 25) * As * (k / kp) ** (c.ns - 1) * (k * C_OVER_H100) ** 4 * T(k) ** 2 * g * g * W * W;
  }
  return Math.sqrt((s * (lk1 - lk0)) / n);
}

/**
 * σ8 at fixed A_s, anchored to Planck 2018: σ8 = σ8,P · σ8FromAs(c, A_s) / σ8FromAs(Planck, A_s,P), so that the
 * Planck cosmology reproduces σ8 = 0.811 exactly and only the Ωm, ns and A_s dependence comes from the formula above.
 */
export function sigma8AtFixedAs(c: LssCosmo, As = PLANCK18_AS): number {
  return (PLANCK18_LSS.sigma8 * sigma8FromAs(c, As)) / sigma8FromAs(PLANCK18_LSS, PLANCK18_AS);
}

/** Flat ΛCDM Ωm(a). */
export const omegaMa = (Om: number, a: number) => { const m = Om / (a * a * a); return m / (m + (1 - Om)); };

/**
 * Linear growth by RK4 in N = ln a from a = 1e-3 (D = a, D' = D) to aMax; returns samplers for D(a) and f(a).
 * Flat matter + Λ (radiation neglected): dlnH/dlna = −(3/2) Ωm(a).
 */
export function growthSolution(Om: number, aMax = 4, steps = 4000) {
  const N0 = Math.log(1e-3), N1 = Math.log(aMax), dN = (N1 - N0) / steps;
  const Ds = new Float64Array(steps + 1), Fs = new Float64Array(steps + 1);
  let D = Math.exp(N0), G = D;
  const rhs = (N: number, d: number, g: number) => { const om = omegaMa(Om, Math.exp(N)); return [g, -(2 - 1.5 * om) * g + 1.5 * om * d]; };
  Ds[0] = D; Fs[0] = 1;
  for (let i = 0; i < steps; i++) {
    const N = N0 + i * dN;
    const k1 = rhs(N, D, G), k2 = rhs(N + dN / 2, D + (dN / 2) * k1[0], G + (dN / 2) * k1[1]);
    const k3 = rhs(N + dN / 2, D + (dN / 2) * k2[0], G + (dN / 2) * k2[1]), k4 = rhs(N + dN, D + dN * k3[0], G + dN * k3[1]);
    D += (dN / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    G += (dN / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    Ds[i + 1] = D; Fs[i + 1] = G / D;
  }
  const at = (arr: Float64Array, a: number) => {
    const x = (Math.log(a) - N0) / dN;
    if (x <= 0) return arr === Ds ? a : 1;
    const i = Math.min(steps - 1, Math.floor(x)), t = x - i;
    return arr[i] * (1 - t) + arr[i + 1] * t;
  };
  return { D: (a: number) => at(Ds, a), f: (a: number) => at(Fs, a), D1: at(Ds, 1) };
}

/** Carroll, Press & Turner 1992 growth fit (ARA&A 30, 499, eq. 29), ~1% accurate; comparison only. */
export function growthCarroll(a: number, Om: number) {
  const oma = omegaMa(Om, a), ola = 1 - oma;
  return (a * 2.5 * oma) / (oma ** (4 / 7) - ola + (1 + oma / 2) * (1 + ola / 70));
}

export interface LptFields {
  N: number; box: number;
  /** δ_L(q) at σ₈-normalised amplitude and D = 1 (multiply by D(a)/D(1)). */
  delta: Float32Array;
  /** 1st-order displacement Ψ⁽¹⁾ [Mpc/h], interleaved xyz, at D = 1. */
  disp1: Float32Array;
  /** 2nd-order displacement Ψ⁽²⁾ (multiply by +(3/7) D²), interleaved xyz; null if order 1. */
  disp2: Float32Array | null;
  /** Eigenvalues λ₁ ≤ λ₂ ≤ λ₃ of the deformation tensor ∂Ψᵢ/∂q_j (per cell, at D = 1), interleaved. */
  eig: Float32Array;
}

/**
 * 3D Lagrangian perturbation theory fields on an N³ periodic grid of side `box` [Mpc/h] (N a power of 2).
 * Ψ⁽¹⁾(k) = i k/k² δ(k) (so ∇·Ψ⁽¹⁾ = −δ);  2LPT source s = Σ_{i<j}(φ,ᵢᵢ φ,ⱼⱼ − φ,ᵢⱼ²) with φ,ᵢⱼ(k) = kᵢk_j δ/k²,
 * stored Ψ⁽²⁾(k) = i k/k² s(k);  positions  x = q + D Ψ⁽¹⁾ + (3/7) D² Ψ⁽²⁾  (Bouchet et al. 1995, D₂ ≈ −3/7 D²).
 * The sign is checked by the density skewness test (2LPT raises S₃ toward the perturbation-theory 34/7).
 */
export function lptFields(c: LssCosmo, N: number, box: number, seed: number, order: 1 | 2 = 1, wiggles = true): LptFields {
  const M = N * N * N, half = N >> 1, kf = (2 * Math.PI) / box;
  const wr = new Float32Array(M), wi = new Float32Array(M);
  fillGaussian(wr, seed);
  fft3d(wr, wi, N, false);
  const P = linearPk(c, wiggles);
  const cellNorm = Math.sqrt(M / (box * box * box));
  const kvec = (idx: number) => {
    const ix = idx % N, iy = Math.floor(idx / N) % N, iz = Math.floor(idx / (N * N));
    const fx = ix <= half ? ix : ix - N, fy = iy <= half ? iy : iy - N, fz = iz <= half ? iz : iz - N;
    const nyq = Math.abs(fx) === half || Math.abs(fy) === half || Math.abs(fz) === half ? 0 : 1;
    return [kf * fx, kf * fy, kf * fz, nyq] as const;
  };
  const dRe = new Float32Array(M), dIm = new Float32Array(M);
  for (let i = 0; i < M; i++) {
    const [kx, ky, kz] = kvec(i), k2 = kx * kx + ky * ky + kz * kz;
    if (k2 === 0) continue;
    const amp = Math.sqrt(P(Math.sqrt(k2))) * cellNorm;
    dRe[i] = wr[i] * amp; dIm[i] = wi[i] * amp;
  }
  /** inverse FFT of (factor(k) · field(k)) */
  const spawn = (srcRe: Float32Array, srcIm: Float32Array, factor: (kx: number, ky: number, kz: number, k2: number, nyq: number) => [number, number]) => {
    const r = new Float32Array(M), im = new Float32Array(M);
    for (let i = 0; i < M; i++) {
      const [kx, ky, kz, nyq] = kvec(i), k2 = kx * kx + ky * ky + kz * kz;
      if (k2 === 0) continue;
      const [fr, fi] = factor(kx, ky, kz, k2, nyq); // multiply by (fr + i fi)
      r[i] = srcRe[i] * fr - srcIm[i] * fi; im[i] = srcRe[i] * fi + srcIm[i] * fr;
    }
    fft3d(r, im, N, true);
    return r;
  };
  const delta = spawn(dRe, dIm, () => [1, 0]);
  const comp = [0, 1, 2].map((a) => spawn(dRe, dIm, (kx, ky, kz, k2, ny) => [0, (ny * [kx, ky, kz][a]) / k2]));
  const disp1 = new Float32Array(3 * M);
  for (let i = 0; i < M; i++) { disp1[3 * i] = comp[0][i]; disp1[3 * i + 1] = comp[1][i]; disp1[3 * i + 2] = comp[2][i]; }
  // deformation tensor ∂Ψᵢ/∂q_j = −(kᵢk_j/k²) δ … in real space (for web classification / caustics)
  const pairs: [number, number][] = [[0, 0], [1, 1], [2, 2], [0, 1], [0, 2], [1, 2]];
  const T = pairs.map(([a, b]) => spawn(dRe, dIm, (kx, ky, kz, k2) => { const kk = [kx, ky, kz]; return [-(kk[a] * kk[b]) / k2, 0]; }));
  const eig = new Float32Array(3 * M);
  for (let i = 0; i < M; i++) {
    const e = symEig3(T[0][i], T[1][i], T[2][i], T[3][i], T[4][i], T[5][i]);
    eig[3 * i] = e[0]; eig[3 * i + 1] = e[1]; eig[3 * i + 2] = e[2];
  }
  let disp2: Float32Array | null = null;
  if (order === 2) {
    // φ,ᵢⱼ(k) = (kᵢk_j/k²) δ(k)
    const phi = pairs.map(([a, b]) => spawn(dRe, dIm, (kx, ky, kz, k2, ny) => { const kk = [kx, ky, kz]; return [(ny * kk[a] * kk[b]) / k2, 0]; }));
    const sRe = new Float32Array(M), sIm = new Float32Array(M);
    for (let i = 0; i < M; i++) sRe[i] = phi[0][i] * phi[1][i] + phi[0][i] * phi[2][i] + phi[1][i] * phi[2][i] - phi[3][i] ** 2 - phi[4][i] ** 2 - phi[5][i] ** 2;
    fft3d(sRe, sIm, N, false);
    const c2 = [0, 1, 2].map((a) => spawn(sRe, sIm, (kx, ky, kz, k2, ny) => [0, (ny * [kx, ky, kz][a]) / k2]));
    disp2 = new Float32Array(3 * M);
    for (let i = 0; i < M; i++) { disp2[3 * i] = c2[0][i]; disp2[3 * i + 1] = c2[1][i]; disp2[3 * i + 2] = c2[2][i]; }
  }
  return { N, box, delta, disp1, disp2, eig };
}

/** Eigenvalues (ascending) of a symmetric 3×3 matrix (analytic, Smith 1961). */
export function symEig3(a11: number, a22: number, a33: number, a12: number, a13: number, a23: number): [number, number, number] {
  const p1 = a12 * a12 + a13 * a13 + a23 * a23;
  const q = (a11 + a22 + a33) / 3;
  if (p1 < 1e-30) { const e = [a11, a22, a33].sort((x, y) => x - y); return [e[0], e[1], e[2]]; }
  const p2 = (a11 - q) ** 2 + (a22 - q) ** 2 + (a33 - q) ** 2 + 2 * p1, p = Math.sqrt(p2 / 6);
  const b11 = (a11 - q) / p, b22 = (a22 - q) / p, b33 = (a33 - q) / p, b12 = a12 / p, b13 = a13 / p, b23 = a23 / p;
  const r = (b11 * (b22 * b33 - b23 * b23) - b12 * (b12 * b33 - b23 * b13) + b13 * (b12 * b23 - b22 * b13)) / 2;
  const phi = r <= -1 ? Math.PI / 3 : r >= 1 ? 0 : Math.acos(r) / 3;
  const e1 = q + 2 * p * Math.cos(phi), e3 = q + 2 * p * Math.cos(phi + (2 * Math.PI) / 3), e2 = 3 * q - e1 - e3;
  return [e3, e2, e1];
}

/**
 * Cosmic-web type from the deformation-tensor eigenvalues at growth D (T-web style, Hahn et al. 2007):
 * number of axes with D·λ < −λ_th (collapsing along that axis): 0 void, 1 sheet, 2 filament, 3 node.
 */
export function webType(eig: Float32Array, i: number, D: number, lth = 0.4): 0 | 1 | 2 | 3 {
  let n = 0;
  for (let k = 0; k < 3; k++) if (D * eig[3 * i + k] < -lth) n++;
  return n as 0 | 1 | 2 | 3;
}

/**
 * Isotropic power spectrum of a density-contrast grid (N³, side box), binned in log k.
 * Returns { k, P, n } with P in (Mpc/h)³; CIC/aliasing corrections are not applied.
 */
export function measurePk(delta: Float32Array, N: number, box: number, nbins = 20) {
  const M = N * N * N, re = Float32Array.from(delta), im = new Float32Array(M);
  fft3d(re, im, N, false);
  const half = N >> 1, kf = (2 * Math.PI) / box, kmax = kf * half;
  const lk0 = Math.log(kf), lk1 = Math.log(kmax);
  const sum = new Float64Array(nbins), ks = new Float64Array(nbins), cnt = new Float64Array(nbins);
  const V = box ** 3;
  for (let i = 0; i < M; i++) {
    const ix = i % N, iy = Math.floor(i / N) % N, iz = Math.floor(i / (N * N));
    const fx = ix <= half ? ix : ix - N, fy = iy <= half ? iy : iy - N, fz = iz <= half ? iz : iz - N;
    const k = kf * Math.hypot(fx, fy, fz);
    if (k === 0 || k >= kmax) continue;
    const b = Math.min(nbins - 1, Math.floor(((Math.log(k) - lk0) / (lk1 - lk0)) * nbins));
    sum[b] += (re[i] * re[i] + im[i] * im[i]) * (V / (M * M)); ks[b] += k; cnt[b]++;
  }
  const out = { k: [] as number[], P: [] as number[], n: [] as number[] };
  for (let b = 0; b < nbins; b++) if (cnt[b] > 0) { out.k.push(ks[b] / cnt[b]); out.P.push(sum[b] / cnt[b]); out.n.push(cnt[b]); }
  return out;
}

/** Zheng et al. 2007 HOD: mean central and satellite occupation for halo mass M [M☉/h]. */
export function hodZheng(M: number, p = { logMmin: 13.5, sigmaLogM: 0.26, logM0: 13.0, logM1: 14.3, alpha: 1.06 }) {
  const lm = Math.log10(M);
  const ncen = 0.5 * (1 + erf((lm - p.logMmin) / p.sigmaLogM));
  const ns = M > 10 ** p.logM0 ? ncen * ((M - 10 ** p.logM0) / 10 ** p.logM1) ** p.alpha : 0;
  return { ncen, nsat: ns };
}

/** Abramowitz & Stegun 7.1.26 erf (|error| < 1.5e-7). */
export function erf(x: number) {
  const s = Math.sign(x), t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y;
}

/**
 * Particles of a thin slab (layers iz = 0…nz−1) displaced by the Zel'dovich map with amplitude m = D(a)/D_ref:
 * x = q + m_eff Ψ⁽¹⁾(q), with adhesion-style regularisation m_eff = min(m, −1/λ₁) (particles stop at their
 * first shell crossing instead of streaming through). Density from the Jacobian
 * ρ/ρ̄ = 1/|(1 + m_eff λ₁)(1 + m_eff λ₂)(1 + m_eff λ₃)|. Returns x, y in [0, box) and ρ/ρ̄ per particle.
 */
export function slabParticles(F: LptFields, nz: number, m: number) {
  const { N, box, disp1, eig } = F, cell = box / N, n = N * N * nz;
  const x = new Float32Array(n), y = new Float32Array(n), rho = new Float32Array(n), web = new Uint8Array(n);
  let o = 0;
  for (let iz = 0; iz < nz; iz++) for (let iy = 0; iy < N; iy++) for (let ix = 0; ix < N; ix++, o++) {
    const i = (iz * N + iy) * N + ix;
    const l1 = eig[3 * i], l2 = eig[3 * i + 1], l3 = eig[3 * i + 2];
    const me = l1 < 0 ? Math.min(m, -0.999 / l1) : m;
    x[o] = (((ix * cell + me * disp1[3 * i]) % box) + box) % box;
    y[o] = (((iy * cell + me * disp1[3 * i + 1]) % box) + box) % box;
    rho[o] = 1 / Math.max(1e-3, Math.abs((1 + me * l1) * (1 + me * l2) * (1 + me * l3)));
    web[o] = (m * l1 < -0.4 ? 1 : 0) + (m * l2 < -0.4 ? 1 : 0) + (m * l3 < -0.4 ? 1 : 0);
  }
  return { x, y, rho, web, n };
}

/**
 * Cloud-in-cell mass assignment of 2D particles (periodic box of side `box`) onto a G×G grid.
 * Returns density in units of the mean (mean = 1). Hockney & Eastwood (1988) §5-3.
 */
export function depositCIC2D(x: ArrayLike<number>, y: ArrayLike<number>, n: number, box: number, G: number): Float64Array {
  const g = new Float64Array(G * G), s = G / box;
  for (let p = 0; p < n; p++) {
    const fx = x[p] * s - 0.5, fy = y[p] * s - 0.5;
    const i0 = Math.floor(fx), j0 = Math.floor(fy), dx = fx - i0, dy = fy - j0;
    const i1 = (((i0 + 1) % G) + G) % G, j1 = (((j0 + 1) % G) + G) % G, ia = ((i0 % G) + G) % G, ja = ((j0 % G) + G) % G;
    g[ja * G + ia] += (1 - dx) * (1 - dy); g[ja * G + i1] += dx * (1 - dy);
    g[j1 * G + ia] += (1 - dx) * dy; g[j1 * G + i1] += dx * dy;
  }
  const norm = (G * G) / n;
  for (let k = 0; k < g.length; k++) g[k] *= norm;
  return g;
}

/** Separable periodic Gaussian smoothing of a G×G field, σ in grid cells (kernel truncated at 3σ, renormalised). */
export function smoothPeriodic2D(f: Float64Array, G: number, sigma: number): Float64Array {
  if (sigma <= 0) return f.slice();
  const R = Math.ceil(3 * sigma), w = new Float64Array(2 * R + 1);
  let ws = 0;
  for (let k = -R; k <= R; k++) { w[k + R] = Math.exp(-(k * k) / (2 * sigma * sigma)); ws += w[k + R]; }
  for (let k = 0; k < w.length; k++) w[k] /= ws;
  const tmp = new Float64Array(G * G), out = new Float64Array(G * G);
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
    let acc = 0;
    for (let k = -R; k <= R; k++) acc += w[k + R] * f[j * G + ((((i + k) % G) + G) % G)];
    tmp[j * G + i] = acc;
  }
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
    let acc = 0;
    for (let k = -R; k <= R; k++) acc += w[k + R] * tmp[((((j + k) % G) + G) % G) * G + i];
    out[j * G + i] = acc;
  }
  return out;
}
