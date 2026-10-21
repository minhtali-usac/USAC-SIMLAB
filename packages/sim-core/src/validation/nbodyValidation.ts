/**
 * B4 reproducible checks for the N-body integrators (leapfrog DKD, Yoshida-4, RK4).
 *  1. Empirical convergence order on the figure-eight orbit (Chenciner & Montgomery 2000; Simó's initial
 *     conditions, period T = 6.32591398…): position error at t = T/2 against a Yoshida-4 reference with h = T/64 000.
 *  2. Figure-eight return after one period and relative energy error.
 *  3. Long-term energy behaviour on Sun–Jupiter–Saturn (au, yr, M☉; G = 4π²) over 1000 yr, h = 0.02 yr:
 *     symplectic schemes must stay bounded, RK4 drifts secularly.
 *  4. Two-body Kepler orbit (e = 0.5) after 10 periods compared with the analytic conic solution (kepler.ts).
 */
import { stepNBody, totalEnergy, angularMomentumZ, toCenterOfMass, type NBodySystem, type Integrator } from '../orbits/nbody';
import { conicState } from '../orbits/kepler';

export const FIGURE8_PERIOD = 6.32591398;
const b = (m: number, x: number, y: number, vx: number, vy: number) => ({ m, x, y, z: 0, vx, vy, vz: 0 });
export const figure8 = (): NBodySystem => ({ G: 1, softening: 0, bodies: [b(1, 0.97000436, -0.24308753, 0.466203685, 0.43236573), b(1, -0.97000436, 0.24308753, 0.466203685, 0.43236573), b(1, 0, 0, -0.93240737, -0.86473146)] });

function run(s: NBodySystem, h: number, n: number, m: Integrator) { for (let i = 0; i < n; i++) stepNBody(s, h, m); return s; }
const posErr = (a: NBodySystem, r: NBodySystem) => Math.max(...a.bodies.map((p, i) => Math.hypot(p.x - r.bodies[i].x, p.y - r.bodies[i].y)));

let cache: ReturnType<typeof compute> | null = null;
export const validateNBody = () => (cache ??= compute());

function compute() {
  const T = FIGURE8_PERIOD, tEnd = T / 2;
  const ref = run(figure8(), tEnd / 32000, 32000, 'yoshida4');
  const methods: Integrator[] = ['leapfrog', 'yoshida4', 'rk4'];
  const convergence = methods.map((m) => {
    const rows = [250, 500, 1000, 2000].map((n) => ({ n, h: tEnd / n, err: posErr(run(figure8(), tEnd / n, n, m), ref) }));
    const orders = rows.slice(1).map((r, k) => Math.log2(rows[k].err / r.err));
    return { method: m, rows, order: orders[orders.length - 1] };
  });
  // figure eight: one full period
  const ret = methods.map((m) => {
    const s0 = figure8(), E0 = totalEnergy(s0), L0 = angularMomentumZ(s0), n = 6400;
    const s = run(figure8(), T / n, n, m);
    return { method: m, h: T / n, returnErr: posErr(s, s0), dE: Math.abs((totalEnergy(s) - E0) / E0), dL: Math.abs(angularMomentumZ(s) - L0) };
  });
  // Sun–Jupiter–Saturn, 1000 yr
  const G = 4 * Math.PI ** 2;
  const sjs = (): NBodySystem => { const s: NBodySystem = { G, softening: 0, bodies: [b(1, 0, 0, 0, 0), b(1 / 1047.348, 5.2029, 0, 0, Math.sqrt(G / 5.2029)), b(1 / 3497.9, -9.5367, 0, 0, -Math.sqrt(G / 9.5367))] }; toCenterOfMass(s); return s; };
  const longTerm = methods.map((m) => {
    const s = sjs(), E0 = totalEnergy(s), h = 0.02, n = 50000;
    let maxFirst = 0, maxLast = 0;
    for (let i = 0; i < n; i++) {
      stepNBody(s, h, m);
      const e = Math.abs((totalEnergy(s) - E0) / E0);
      if (i < n / 10) maxFirst = Math.max(maxFirst, e); else if (i >= (9 * n) / 10) maxLast = Math.max(maxLast, e);
    }
    return { method: m, h, years: n * h, maxRelErrFirst100yr: maxFirst, maxRelErrLast100yr: maxLast, final: Math.abs((totalEnergy(s) - E0) / E0) };
  });
  // two-body vs Kepler: m1 = 1, m2 = 1e-3, relative orbit q = 1, e = 0.5
  const mu = 1.001, q = 1, e = 0.5, a = q / (1 - e), P = 2 * Math.PI * Math.sqrt(a ** 3 / mu);
  const v0 = Math.sqrt((mu * (1 + e)) / q);
  const kepler = methods.map((m) => {
    const s: NBodySystem = { G: 1, softening: 0, bodies: [b(1, 0, 0, 0, 0), b(1e-3, q, 0, 0, v0)] };
    toCenterOfMass(s);
    const n = 20000, h = (10 * P) / n;
    run(s, h, n, m);
    const rel = [s.bodies[1].x - s.bodies[0].x, s.bodies[1].y - s.bodies[0].y];
    const an = conicState(q, e, mu, 10 * P);
    return { method: m, h, periods: 10, posErr: Math.hypot(rel[0] - an.x, rel[1] - an.y) };
  });
  // Pythagorean problem (masses 3, 4, 5 at rest on a 3-4-5 triangle), Yoshida-4 with the module's default step,
  // and a 4× smaller step: energy error and which pair ends bound at t = 70.
  const pyth = (): NBodySystem => ({ G: 1, softening: 0, bodies: [b(3, 1, 3, 0, 0), b(4, -2, -1, 0, 0), b(5, 1, -1, 0, 0)] });
  const pythagorean = ([['yoshida4', 5e-4], ['yoshida4', 1.25e-4], ['dopri5', 0.01]] as [Integrator, number][]).map(([method, h]) => {
    const s = pyth(), E0 = totalEnergy(s), n = Math.round(70 / h), every = method === 'dopri5' ? 1 : 50;
    let maxErr = 0;
    for (let i = 0; i < n; i++) { stepNBody(s, h, method); if (i % every === 0) maxErr = Math.max(maxErr, Math.abs((totalEnergy(s) - E0) / E0)); }
    const B = s.bodies, pairs: { pair: string; energy: number }[] = [];
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
      const mi = B[i].m, mj = B[j].m, mu = (mi * mj) / (mi + mj);
      const dv2 = (B[i].vx - B[j].vx) ** 2 + (B[i].vy - B[j].vy) ** 2, r = Math.hypot(B[i].x - B[j].x, B[i].y - B[j].y);
      pairs.push({ pair: `${mi}+${mj}`, energy: 0.5 * mu * dv2 - (mi * mj) / r });
    }
    const bound = pairs.filter((p) => p.energy < 0).map((p) => p.pair);
    return { method, h, maxRelEnergyErr: maxErr, boundPairs: bound, final: s.bodies.map((p) => ({ m: p.m, x: +p.x.toFixed(3), y: +p.y.toFixed(3), vx: +p.vx.toFixed(4), vy: +p.vy.toFixed(4) })) };
  });
  return { figure8Period: T, convergence, figure8Return: ret, longTerm, kepler, pythagorean };
}
