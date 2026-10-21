/**
 * Gravitational N-body problem (2D or 3D, here stored as 3D) with symplectic integrators.
 *  - Leapfrog, drift–kick–drift (2nd order, symplectic, time-reversible).
 *  - Yoshida (1990) 4th-order composition, Phys. Lett. A 150, 262.
 *  - RK4 (non-symplectic, for comparison: shows secular energy drift).
 *  - DOPRI5 (adaptive Dormand–Prince 5(4), math/ode.ts): the step shrinks automatically during close encounters;
 *    here h is only the output interval.
 * Optional Plummer softening ε (documented as a deviation from pure Newtonian gravity).
 */

import { dopri5 } from '../math/ode';

export interface Body {
  m: number;
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
}

export type Integrator = 'leapfrog' | 'yoshida4' | 'rk4' | 'dopri5';

/** Tolerances of the adaptive integrator (relative, absolute). */
export const NBODY_DOPRI_TOL = { rtol: 1e-12, atol: 1e-14 };

export interface NBodySystem {
  G: number;
  softening: number;
  bodies: Body[];
}

export function cloneSystem(s: NBodySystem): NBodySystem {
  return { G: s.G, softening: s.softening, bodies: s.bodies.map((b) => ({ ...b })) };
}

function accelerations(s: NBodySystem, ax: Float64Array, ay: Float64Array, az: Float64Array) {
  const B = s.bodies, n = B.length, eps2 = s.softening * s.softening;
  ax.fill(0); ay.fill(0); az.fill(0);
  for (let i = 0; i < n; i++) {
    const bi = B[i];
    for (let j = i + 1; j < n; j++) {
      const bj = B[j];
      const dx = bj.x - bi.x, dy = bj.y - bi.y, dz = bj.z - bi.z;
      const r2 = dx * dx + dy * dy + dz * dz + eps2;
      const inv = 1 / (r2 * Math.sqrt(r2));
      const fi = s.G * bj.m * inv, fj = s.G * bi.m * inv;
      ax[i] += fi * dx; ay[i] += fi * dy; az[i] += fi * dz;
      ax[j] -= fj * dx; ay[j] -= fj * dy; az[j] -= fj * dz;
    }
  }
}

function drift(s: NBodySystem, h: number) {
  for (const b of s.bodies) { b.x += h * b.vx; b.y += h * b.vy; b.z += h * b.vz; }
}
function kick(s: NBodySystem, h: number, ax: Float64Array, ay: Float64Array, az: Float64Array) {
  accelerations(s, ax, ay, az);
  s.bodies.forEach((b, i) => { b.vx += h * ax[i]; b.vy += h * ay[i]; b.vz += h * az[i]; });
}

const CBRT2 = Math.cbrt(2);
const W1 = 1 / (2 - CBRT2);
const W0 = -CBRT2 / (2 - CBRT2);
const YC = [W1 / 2, (W0 + W1) / 2, (W0 + W1) / 2, W1 / 2];
const YD = [W1, W0, W1];

/** Advance the system in place by one step h. */
export function stepNBody(s: NBodySystem, h: number, method: Integrator) {
  const n = s.bodies.length;
  const ax = new Float64Array(n), ay = new Float64Array(n), az = new Float64Array(n);
  if (method === 'leapfrog') {
    // drift–kick–drift form (one force evaluation per step)
    drift(s, h / 2);
    kick(s, h, ax, ay, az);
    drift(s, h / 2);
  } else if (method === 'yoshida4') {
    for (let k = 0; k < 3; k++) {
      drift(s, YC[k] * h);
      kick(s, YD[k] * h, ax, ay, az);
    }
    drift(s, YC[3] * h);
  } else if (method === 'rk4') {
    rk4NBody(s, h);
  } else {
    dopriNBody(s, h);
  }
}

/** Adaptive DOPRI5 over an interval h (state vector x, y, z, vx, vy, vz per body). Returns accepted/rejected steps. */
export function dopriNBody(s: NBodySystem, h: number, tol = NBODY_DOPRI_TOL) {
  const n = s.bodies.length, y0 = new Float64Array(6 * n);
  s.bodies.forEach((b, i) => y0.set([b.x, b.y, b.z, b.vx, b.vy, b.vz], 6 * i));
  const ax = new Float64Array(n), ay = new Float64Array(n), az = new Float64Array(n);
  const f = (_t: number, y: Float64Array, d: Float64Array) => {
    s.bodies.forEach((b, i) => { b.x = y[6 * i]; b.y = y[6 * i + 1]; b.z = y[6 * i + 2]; });
    accelerations(s, ax, ay, az);
    for (let i = 0; i < n; i++) { d[6 * i] = y[6 * i + 3]; d[6 * i + 1] = y[6 * i + 4]; d[6 * i + 2] = y[6 * i + 5]; d[6 * i + 3] = ax[i]; d[6 * i + 4] = ay[i]; d[6 * i + 5] = az[i]; }
  };
  const r = dopri5(f, 0, y0, h, { rtol: tol.rtol, atol: tol.atol, hInit: h / 4 });
  s.bodies.forEach((b, i) => { b.x = r.y[6 * i]; b.y = r.y[6 * i + 1]; b.z = r.y[6 * i + 2]; b.vx = r.y[6 * i + 3]; b.vy = r.y[6 * i + 4]; b.vz = r.y[6 * i + 5]; });
  return { accepted: r.accepted, rejected: r.rejected };
}

function rk4NBody(s: NBodySystem, h: number) {
  const n = s.bodies.length;
  const y0 = s.bodies.map((b) => [b.x, b.y, b.z, b.vx, b.vy, b.vz]);
  const ax = new Float64Array(n), ay = new Float64Array(n), az = new Float64Array(n);
  const deriv = (st: number[][]) => {
    s.bodies.forEach((b, i) => { b.x = st[i][0]; b.y = st[i][1]; b.z = st[i][2]; });
    accelerations(s, ax, ay, az);
    return st.map((q, i) => [q[3], q[4], q[5], ax[i], ay[i], az[i]]);
  };
  const addS = (a: number[][], k: number[][], f: number) => a.map((q, i) => q.map((v, j) => v + f * k[i][j]));
  const k1 = deriv(y0);
  const k2 = deriv(addS(y0, k1, h / 2));
  const k3 = deriv(addS(y0, k2, h / 2));
  const k4 = deriv(addS(y0, k3, h));
  s.bodies.forEach((b, i) => {
    const q = y0[i].map((v, j) => v + (h / 6) * (k1[i][j] + 2 * k2[i][j] + 2 * k3[i][j] + k4[i][j]));
    b.x = q[0]; b.y = q[1]; b.z = q[2]; b.vx = q[3]; b.vy = q[4]; b.vz = q[5];
  });
}

/** Total energy (kinetic + softened potential). */
export function totalEnergy(s: NBodySystem): number {
  const B = s.bodies, eps2 = s.softening * s.softening;
  let K = 0, U = 0;
  for (let i = 0; i < B.length; i++) {
    const b = B[i];
    K += 0.5 * b.m * (b.vx * b.vx + b.vy * b.vy + b.vz * b.vz);
    for (let j = i + 1; j < B.length; j++) {
      const c = B[j];
      const r = Math.sqrt((c.x - b.x) ** 2 + (c.y - b.y) ** 2 + (c.z - b.z) ** 2 + eps2);
      U -= (s.G * b.m * c.m) / r;
    }
  }
  return K + U;
}

/** z-component of total angular momentum (planar systems). */
export function angularMomentumZ(s: NBodySystem): number {
  return s.bodies.reduce((L, b) => L + b.m * (b.x * b.vy - b.y * b.vx), 0);
}

/** Shift to the centre-of-mass frame (zero total momentum). */
export function toCenterOfMass(s: NBodySystem) {
  const M = s.bodies.reduce((a, b) => a + b.m, 0);
  const c = [0, 0, 0, 0, 0, 0];
  for (const b of s.bodies) {
    c[0] += b.m * b.x; c[1] += b.m * b.y; c[2] += b.m * b.z;
    c[3] += b.m * b.vx; c[4] += b.m * b.vy; c[5] += b.m * b.vz;
  }
  for (const b of s.bodies) {
    b.x -= c[0] / M; b.y -= c[1] / M; b.z -= c[2] / M;
    b.vx -= c[3] / M; b.vy -= c[4] / M; b.vz -= c[5] / M;
  }
}
