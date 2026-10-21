import type { HodParams } from '@usac/sim-core';

/** Box side [Mpc/h] (as in lss-lab's Cosmic Web Sandbox) and Gaussian halo-finder radii R_G [Mpc/h]. */
export const BOX = 250;
export const RADII = [3, 4.5, 6.75, 10];

export interface BuildReq { type: 'build'; id: number; Om: number; ns: number; N: number; seed: number }
export interface BuildRes {
  type: 'build'; id: number; N: number; box: number;
  disp1: Float32Array; disp2: Float32Array; eig: Float32Array;
}
export interface DeriveReq {
  type: 'derive'; id: number;
  amp: number; order2: boolean; los: -1 | 0 | 1 | 2; f: number; f2: number; Om: number;
  halos: boolean; gals: boolean; hod: HodParams; galSeed: number;
  /** projection axis of the 2D slice */
  sliceAxis: 0 | 1 | 2;
  pk: boolean;
}
export interface DeriveRes {
  type: 'derive'; id: number;
  slice: Float64Array; sliceG: number;
  /** Eulerian ρ/ρ̄ at each particle (CIC on an N³ grid, at most 64³, interpolated back). */
  dens: Float32Array;
  haloPos: Float32Array; haloR: Float32Array; haloM: Float64Array; nHalo: number;
  galPos: Float32Array; nGal: number; nCen: number; nSat: number;
  pk: { k: number[]; Pm: number[]; Ph: number[] | null; Pg: number[] | null } | null;
  fieldId: number;
}
