/**
 * ODE integrators (float64).
 *  - rk4Step: classical 4th-order Runge–Kutta, fixed step.
 *  - Dopri5: Dormand–Prince 5(4) embedded pair with adaptive step size
 *    (Dormand & Prince 1980, J. Comput. Appl. Math. 6, 19; Hairer, Nørsett & Wanner,
 *    "Solving ODEs I", §II.5 - coefficients and step control as in DOPRI5).
 */

export type Deriv = (t: number, y: Float64Array, dydt: Float64Array) => void;

export function rk4Step(f: Deriv, t: number, y: Float64Array, h: number): Float64Array {
  const n = y.length;
  const k1 = new Float64Array(n), k2 = new Float64Array(n), k3 = new Float64Array(n), k4 = new Float64Array(n);
  const tmp = new Float64Array(n);
  f(t, y, k1);
  for (let i = 0; i < n; i++) tmp[i] = y[i] + 0.5 * h * k1[i];
  f(t + 0.5 * h, tmp, k2);
  for (let i = 0; i < n; i++) tmp[i] = y[i] + 0.5 * h * k2[i];
  f(t + 0.5 * h, tmp, k3);
  for (let i = 0; i < n; i++) tmp[i] = y[i] + h * k3[i];
  f(t + h, tmp, k4);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) out[i] = y[i] + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
  return out;
}

// Dormand–Prince tableau
const c2 = 1 / 5, c3 = 3 / 10, c4 = 4 / 5, c5 = 8 / 9;
const a21 = 1 / 5;
const a31 = 3 / 40, a32 = 9 / 40;
const a41 = 44 / 45, a42 = -56 / 15, a43 = 32 / 9;
const a51 = 19372 / 6561, a52 = -25360 / 2187, a53 = 64448 / 6561, a54 = -212 / 729;
const a61 = 9017 / 3168, a62 = -355 / 33, a63 = 46732 / 5247, a64 = 49 / 176, a65 = -5103 / 18656;
const a71 = 35 / 384, a73 = 500 / 1113, a74 = 125 / 192, a75 = -2187 / 6784, a76 = 11 / 84;
// error coefficients e = b5 − b4
const e1 = 71 / 57600, e3 = -71 / 16695, e4 = 71 / 1920, e5 = -17253 / 339200, e6 = 22 / 525, e7 = -1 / 40;

export interface Dopri5Options {
  rtol?: number;
  atol?: number;
  hInit?: number;
  hMax?: number;
  maxSteps?: number;
  /** Optional event: integration stops as soon as it returns true after an accepted step. */
  stop?: (t: number, y: Float64Array) => boolean;
}

export interface Dopri5Result {
  t: number;
  y: Float64Array;
  /** Suggested next step size. */
  h: number;
  accepted: number;
  rejected: number;
  stopped: boolean;
}

/**
 * Advance y from t0 to t1 (t1 may be < t0) with adaptive DOPRI5.
 * Optionally records accepted steps through `onStep`.
 */
export function dopri5(
  f: Deriv,
  t0: number,
  y0: Float64Array,
  t1: number,
  opts: Dopri5Options = {},
  onStep?: (t: number, y: Float64Array) => void,
): Dopri5Result {
  const n = y0.length;
  const rtol = opts.rtol ?? 1e-10;
  const atol = opts.atol ?? 1e-12;
  const maxSteps = opts.maxSteps ?? 1_000_000;
  const dir = t1 >= t0 ? 1 : -1;
  const span = Math.abs(t1 - t0);
  const hMax = opts.hMax ?? span;
  let h = Math.min(Math.abs(opts.hInit ?? span / 100), hMax) || 1e-6;

  const k1 = new Float64Array(n), k2 = new Float64Array(n), k3 = new Float64Array(n);
  const k4 = new Float64Array(n), k5 = new Float64Array(n), k6 = new Float64Array(n), k7 = new Float64Array(n);
  const tmp = new Float64Array(n), ynew = new Float64Array(n);
  let y = Float64Array.from(y0);
  let t = t0;
  let accepted = 0, rejected = 0;
  f(t, y, k1);

  while (dir * (t1 - t) > 0) {
    if (accepted + rejected > maxSteps) break;
    if (h > Math.abs(t1 - t)) h = Math.abs(t1 - t);
    const hs = dir * h;
    for (let i = 0; i < n; i++) tmp[i] = y[i] + hs * a21 * k1[i];
    f(t + c2 * hs, tmp, k2);
    for (let i = 0; i < n; i++) tmp[i] = y[i] + hs * (a31 * k1[i] + a32 * k2[i]);
    f(t + c3 * hs, tmp, k3);
    for (let i = 0; i < n; i++) tmp[i] = y[i] + hs * (a41 * k1[i] + a42 * k2[i] + a43 * k3[i]);
    f(t + c4 * hs, tmp, k4);
    for (let i = 0; i < n; i++) tmp[i] = y[i] + hs * (a51 * k1[i] + a52 * k2[i] + a53 * k3[i] + a54 * k4[i]);
    f(t + c5 * hs, tmp, k5);
    for (let i = 0; i < n; i++) tmp[i] = y[i] + hs * (a61 * k1[i] + a62 * k2[i] + a63 * k3[i] + a64 * k4[i] + a65 * k5[i]);
    f(t + hs, tmp, k6);
    for (let i = 0; i < n; i++) ynew[i] = y[i] + hs * (a71 * k1[i] + a73 * k3[i] + a74 * k4[i] + a75 * k5[i] + a76 * k6[i]);
    f(t + hs, ynew, k7);

    let err = 0;
    for (let i = 0; i < n; i++) {
      const sc = atol + rtol * Math.max(Math.abs(y[i]), Math.abs(ynew[i]));
      const ei = hs * (e1 * k1[i] + e3 * k3[i] + e4 * k4[i] + e5 * k5[i] + e6 * k6[i] + e7 * k7[i]);
      err += (ei / sc) ** 2;
    }
    err = Math.sqrt(err / n);

    if (err <= 1 || h < 1e-14 * Math.max(1, Math.abs(t))) {
      t += hs;
      y = Float64Array.from(ynew);
      k1.set(k7); // FSAL
      accepted++;
      onStep?.(t, y);
      const fac = err === 0 ? 5 : Math.min(5, Math.max(0.2, 0.9 * err ** -0.2));
      h = Math.min(hMax, h * fac);
      if (opts.stop?.(t, y)) return { t, y, h, accepted, rejected, stopped: true };
    } else {
      rejected++;
      h *= Math.max(0.2, 0.9 * err ** -0.2);
    }
  }
  return { t, y, h, accepted, rejected, stopped: false };
}
