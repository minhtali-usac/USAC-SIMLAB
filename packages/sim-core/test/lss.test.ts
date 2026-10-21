import { describe, it, expect } from 'vitest';
import {
  PLANCK18_LSS, eh98Scalars, eh98Transfer, eh98TransferNoWiggle, linearPk, sigmaR, growthSolution, growthCarroll, omegaMa,
  lptFields, measurePk, symEig3, fft3d, hodZheng, erf, mulberry32, depositCIC2D, smoothPeriodic2D,
} from '../src';

describe('EH98 transfer function and linear P(k)', () => {
  it('sound horizon s ≈ 150 Mpc (EH98 fit; Planck r_drag = 147.1 Mpc within 3%)', () => {
    const { s } = eh98Scalars(PLANCK18_LSS);
    expect(Math.abs(s / 147.1 - 1)).toBeLessThan(0.03);
  });
  it('T → 1 on large scales, decreasing, and the wiggle/no-wiggle ratio oscillates by a few % around 1', () => {
    const T = eh98Transfer(PLANCK18_LSS), Tn = eh98TransferNoWiggle(PLANCK18_LSS);
    expect(T(1e-4)).toBeCloseTo(1, 3);
    expect(T(0.1)).toBeLessThan(T(0.01));
    let mx = 0, mn = 2;
    for (let k = 0.03; k < 0.3; k += 0.002) { const r = (T(k) / Tn(k)) ** 2; mx = Math.max(mx, r); mn = Math.min(mn, r); }
    expect(mx).toBeGreaterThan(1.02); expect(mn).toBeLessThan(0.98); expect(mx).toBeLessThan(1.15);
  });
  it('σ₈ normalisation reproduces the input σ₈', () => {
    expect(sigmaR(linearPk(PLANCK18_LSS), 8)).toBeCloseTo(0.811, 6);
  });
});

describe('linear growth', () => {
  it('Einstein–de Sitter: D = a exactly, f = 1', () => {
    const g = growthSolution(1);
    for (const a of [0.1, 0.5, 1, 3]) { expect(g.D(a) / a).toBeCloseTo(1, 5); expect(g.f(a)).toBeCloseTo(1, 5); }
  });
  it('ΛCDM Ωm = 0.3: D(1) ≈ 0.779 (Carroll fit within 1%), f ≈ Ωm(a)^0.55 within 1%', () => {
    const g = growthSolution(0.3);
    expect(g.D1).toBeCloseTo(0.779, 2);
    expect(Math.abs(g.D1 / growthCarroll(1, 0.3) - 1)).toBeLessThan(0.01);
    for (const a of [0.3, 0.5, 1]) expect(Math.abs(g.f(a) / omegaMa(0.3, a) ** 0.55 - 1)).toBeLessThan(0.01); // Linder 2005 fit holds for a ≲ 1
  });
});

describe('Gaussian fields and LPT', () => {
  const N = 32, box = 256;
  const F = lptFields(PLANCK18_LSS, N, box, 12345, 2);
  it('measured P(k) of the generated δ matches the input spectrum on large scales (cosmic variance)', () => {
    const P = linearPk(PLANCK18_LSS), m = measurePk(F.delta, N, box, 10);
    let lnr = 0, w = 0;
    m.k.forEach((k, i) => { if (k < 0.15) { lnr += Math.log(m.P[i] / P(k)) * m.n[i]; w += m.n[i]; } });
    expect(Math.abs(lnr / w)).toBeLessThan(0.15);
  });
  it('trace of the deformation tensor equals −δ (∇·Ψ⁽¹⁾ = −δ)', () => {
    let err = 0, s2 = 0;
    for (let i = 0; i < N ** 3; i += 7) { const tr = F.eig[3 * i] + F.eig[3 * i + 1] + F.eig[3 * i + 2]; err += (tr + F.delta[i]) ** 2; s2 += F.delta[i] ** 2; }
    expect(Math.sqrt(err / s2)).toBeLessThan(1e-4);
  });
  it('2LPT raises the density skewness S₃ relative to Zel’dovich (sign check)', () => {
    const S3 = (useSecond: boolean, D: number) => {
      const M = N ** 3, g = new Float32Array(M), cell = box / N;
      for (let i = 0; i < M; i++) {
        const ix = i % N, iy = Math.floor(i / N) % N, iz = Math.floor(i / (N * N));
        const p = [ix, iy, iz].map((q, a) => q * cell + D * F.disp1[3 * i + a] + (useSecond ? (3 / 7) * D * D * F.disp2![3 * i + a] : 0));
        const c = p.map((x) => ((Math.floor(x / cell) % N) + N) % N);
        g[(c[2] * N + c[1]) * N + c[0]] += 1;
      }
      let m2 = 0, m3 = 0;
      for (let i = 0; i < M; i++) { const d = g[i] - 1; m2 += d * d; m3 += d * d * d; }
      m2 /= M; m3 /= M;
      return m3 / (m2 * m2);
    };
    expect(S3(true, 0.5)).toBeGreaterThan(S3(false, 0.5));
  });
  it('FFT round trip and symmetric eigen-solver', () => {
    const re = new Float32Array(512).map((_, i) => Math.sin(i)), im = new Float32Array(512), c = Float32Array.from(re);
    fft3d(re, im, 8, false); fft3d(re, im, 8, true);
    let e = 0; for (let i = 0; i < 512; i++) e = Math.max(e, Math.abs(re[i] - c[i]));
    expect(e).toBeLessThan(1e-5);
    const [a, b, d] = symEig3(2, 3, 4, 0.5, 0, 0.2);
    expect(a + b + d).toBeCloseTo(9, 10);
    expect(a).toBeLessThan(b); expect(b).toBeLessThan(d);
  });
  it('HOD: ⟨N_cen⟩ = ½ at M_min; erf accurate to 1e-6', () => {
    expect(hodZheng(10 ** 13.5).ncen).toBeCloseTo(0.5, 6);
    expect(erf(1)).toBeCloseTo(0.8427007929, 6);
  });
});

describe('CIC deposit and periodic smoothing (display density)', () => {
  it('conserves mass (mean density = 1) including particles across the periodic edge', () => {
    const n = 5000, x = new Float64Array(n), y = new Float64Array(n);
    const r = mulberry32(7);
    for (let p = 0; p < n; p++) { x[p] = r() * 100; y[p] = p % 10 === 0 ? 99.99 : r() * 100; }
    const g = depositCIC2D(x, y, n, 100, 32);
    expect(g.reduce((a, b) => a + b, 0) / g.length).toBeCloseTo(1, 10);
    const s = smoothPeriodic2D(g, 32, 1.5);
    expect(s.reduce((a, b) => a + b, 0) / s.length).toBeCloseTo(1, 10);
    expect(Math.max(...s)).toBeLessThanOrEqual(Math.max(...g));
  });
  it('a particle at a cell centre lands entirely in that cell', () => {
    const g = depositCIC2D([2.5 * 100 / 8], [5.5 * 100 / 8], 1, 100, 8);
    expect(g[5 * 8 + 2]).toBeCloseTo(64, 10);
  });
});
