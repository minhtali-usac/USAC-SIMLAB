/**
 * Redshift landmarks for F4 (lookback). Redshifts are published spectroscopic values; all derived quantities
 * (lookback time, distances) are computed in friedmann.ts for the chosen cosmology.
 */
export interface Landmark { id: string; z: number; source: string; kind: 'object' | 'epoch' }
export const COSMIC_LANDMARKS: Landmark[] = [
  { id: 'coma', z: 0.0231, source: 'Coma Cluster mean redshift (NED)', kind: 'object' },
  { id: '3c273', z: 0.158, source: '3C 273, first identified quasar (Schmidt 1963, Nature 197, 1040)', kind: 'object' },
  { id: 'reion', z: 7.67, source: 'Reionization midpoint z_re = 7.67 ± 0.73 (Planck 2018 VI)', kind: 'epoch' },
  { id: 'j1342', z: 7.5413, source: 'ULAS J1342+0928 quasar (Bañados et al. 2018, Nature 553, 473)', kind: 'object' },
  { id: 'gnz11', z: 10.603, source: 'GN-z11 (Bunker et al. 2023, A&A 677, A88)', kind: 'object' },
  { id: 'jades14', z: 14.1796, source: 'JADES-GS-z14-0, ALMA [O III] 88 μm (Carniani et al. 2025, A&A 696, A87); discovery: Carniani et al. 2024, Nature 633, 318', kind: 'object' },
  { id: 'cmb', z: 1089.92, source: 'Last scattering z* = 1089.92 (Planck 2018 VI, TT,TE,EE+lowE+lensing)', kind: 'epoch' },
];
/** Planck 2018 VI (TT,TE,EE+lowE+lensing): sound horizon at last scattering r* [Mpc] and 100θ*. */
export const PLANCK18_RSTAR_MPC = 144.43;
export const PLANCK18_100THETA_STAR = 1.04110;
/** Present CMB temperature (Fixsen 2009, ApJ 707, 916). */
export const T_CMB0 = 2.7255;
