/**
 * Heavy lifting for F6 off the main thread: LPT fields (FFT 3D), smoothed linear fields for the halo proxy,
 * and per-epoch derived products (2D slice, halos, HOD galaxies, measured P(k)). All physics from @usac/sim-core.
 */
import {
  PLANCK18_LSS, lptFields, smoothedLinear, lptParticles, depositCIC2D, smoothPeriodic2D, depositCIC3D, measurePk, findHalos, populateHod, interpolateCIC3D,
  type LptFields,
} from '@usac/sim-core';
import { BOX, RADII, type BuildReq, type DeriveReq, type DeriveRes } from './shared';

const ctx = self as unknown as { onmessage: ((e: MessageEvent) => void) | null; postMessage: (m: unknown, t?: Transferable[]) => void };
let F: LptFields | null = null, S: Float32Array[] = [], fieldId = -1;

const SLICE_G = 160;

ctx.onmessage = (e: MessageEvent<BuildReq | DeriveReq>) => {
  const m = e.data;
  if (m.type === 'build') {
    F = lptFields({ ...PLANCK18_LSS, Om: m.Om, ns: m.ns }, m.N, BOX, m.seed, 2);
    S = smoothedLinear(F, RADII);
    fieldId = m.id;
    const d1 = F.disp1.slice(), d2 = F.disp2!.slice(), eg = F.eig.slice();
    ctx.postMessage({ type: 'build', id: m.id, N: F.N, box: F.box, disp1: d1, disp2: d2, eig: eg }, [d1.buffer, d2.buffer, eg.buffer]);
    return;
  }
  if (!F) return;
  const P = lptParticles(F, { amp: m.amp, order2: m.order2, los: m.los, f: m.f, f2: m.f2 });
  const Gd = Math.min(F.N, 64), dg = depositCIC3D(P.pos, P.n, BOX, Gd); // 3.9 Mpc/h cells at 64³
  for (let k = 0; k < dg.length; k++) dg[k] += 1;
  const dens = interpolateCIC3D(dg, Gd, BOX, P.pos, P.n);
  // 2D projected slab (thickness box/8 through the middle) along sliceAxis
  const ax = m.sliceAxis, h = ax === 0 ? 1 : 0, v = ax === 2 ? 1 : 2;
  const xs: number[] = [], ys: number[] = [];
  for (let i = 0; i < P.n; i++) {
    const c = P.pos[3 * i + ax];
    if (Math.abs(c - BOX / 2) < BOX / 16) { xs.push(P.pos[3 * i + h]); ys.push(BOX - P.pos[3 * i + v]); }
  }
  const slice = smoothPeriodic2D(depositCIC2D(xs, ys, xs.length, BOX, SLICE_G), SLICE_G, 1.1);

  let haloPos: Float32Array = new Float32Array(0), haloR: Float32Array = new Float32Array(0), haloM: Float64Array = new Float64Array(0), nHalo = 0;
  let galPos: Float32Array = new Float32Array(0), nGal = 0, nCen = 0, nSat = 0;
  if (m.halos || m.gals || m.pk) {
    const H = findHalos(F, S, RADII, m.amp, m.Om);
    nHalo = H.n; haloR = H.R; haloM = H.M;
    haloPos = new Float32Array(3 * H.n);
    for (let k = 0; k < H.n; k++) for (let a = 0; a < 3; a++) haloPos[3 * k + a] = P.pos[3 * H.cell[k] + a];
    if (m.gals || m.pk) {
      const G = populateHod(haloPos, haloM, H.n, BOX, m.Om, m.hod, m.galSeed);
      galPos = G.pos; nGal = G.n; nCen = G.nCentral; nSat = G.nSatellite;
    }
  }
  let pk: DeriveRes['pk'] = null;
  if (m.pk) {
    const Gk = Math.min(64, F.N);
    const pm = measurePk(depositCIC3D(P.pos, P.n, BOX, Gk), Gk, BOX, 14);
    const ph = nHalo > 20 ? measurePk(depositCIC3D(haloPos, nHalo, BOX, Gk), Gk, BOX, 14) : null;
    const pg = nGal > 20 ? measurePk(depositCIC3D(galPos, nGal, BOX, Gk), Gk, BOX, 14) : null;
    pk = { k: pm.k, Pm: pm.P, Ph: ph ? ph.P : null, Pg: pg ? pg.P : null };
  }
  const res: DeriveRes = { type: 'derive', id: m.id, slice, sliceG: SLICE_G, dens, haloPos, haloR, haloM, nHalo, galPos, nGal, nCen, nSat, pk, fieldId };
  ctx.postMessage(res, [dens.buffer, slice.buffer, haloPos.buffer, haloR.buffer, haloM.buffer, galPos.buffer]);
};
