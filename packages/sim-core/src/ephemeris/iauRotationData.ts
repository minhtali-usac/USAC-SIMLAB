/**
 * IAU rotation models (pole direction and prime meridian) of the planets and the large moons, from the reports of
 * the IAU Working Group on Cartographic Coordinates and Rotational Elements (2009, 2015; Archinal et al. 2011,
 * Celest. Mech. Dyn. Astr. 109, 101; 2018, 130, 22). Generated - do not edit by hand:
 *
 *   node reference/extract_celestia_rotation.mjs <Celestia>/src/celephem/customrotation.cpp
 *
 * Time argument d = days since J2000.0 (TT). pole(d) → [α₀, δ₀] of the north pole in the J2000 equatorial frame
 * [deg]; meridian(d) → W [deg], the longitude of the prime meridian measured from the ascending node of the body's
 * equator on the J2000 equator. Secular terms are clamped by the caller (see rotation.ts), as Celestia does.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * Copyright (C) 2008-2009, the Celestia Development Team (Celestia 1.7.0, src/celephem/customrotation.cpp).
 * Modified for USAC SimLab by the USAC SimLab team on 2026-10-22: translated from C++ to TypeScript by
 * reference/extract_celestia_rotation.mjs (syntax only). See NOTICE.md.
 */
const degToRad = (d: number) => (d * Math.PI) / 180;
/** Secular terms are not extrapolated beyond this many centuries from J2000 (as in Celestia). */
const SECULAR_VALID_CENTURIES = 50;
const clampCenturies = (T: number) => Math.max(-SECULAR_VALID_CENTURIES, Math.min(SECULAR_VALID_CENTURIES, T));

export interface IauModel {
  /** Mean rotation rate [deg/day] as given by the model's constructor (magnitude; the sign is in meridian()). */
  rateDegPerDay: number;
  pole: (d: number) => [number, number];
  meridian: (d: number) => number;
}

/** Uniform rotation about a pole that precesses linearly (rates in degrees per Julian century / per day). */
function precessing(ra0: number, raRate: number, dec0: number, decRate: number, w0: number, rate: number): IauModel {
  return {
    rateDegPerDay: rate,
    pole: (d) => { const T = clampCenturies(d / 36525); return [ra0 + raRate * T, dec0 + decRate * T]; },
    meridian: (d) => w0 + rate * d,
  };
}

/** Arguments E1…E13 of the IAU lunar model (E[0] unused). */
function lunarArgs(d: number): number[] {
  const E: number[] = new Array(14).fill(0);
  E[1] = degToRad(125.045 -  0.0529921 * d);
  E[2] = degToRad(250.089 -  0.1059842 * d);
  E[3] = degToRad(260.008 + 13.0120009 * d);
  E[4] = degToRad(176.625 + 13.3407154 * d);
  E[5] = degToRad(357.529 +  0.9856003 * d);
  E[6] = degToRad(311.589 + 26.4057084 * d);
  E[7] = degToRad(134.963 + 13.0649930 * d);
  E[8] = degToRad(276.617 +  0.3287146 * d);
  E[9] = degToRad( 34.226 +  1.7484877 * d);
  E[10] = degToRad( 15.134 -  0.1589763 * d);
  E[11] = degToRad(119.743 +  0.0036096 * d);
  E[12] = degToRad(239.961 +  0.1643573 * d);
  E[13] = degToRad( 25.053 + 12.9590088 * d);
  return E;
}

export const IAU_ROTATION: Record<string, IauModel> = {
  mercury: {
    rateDegPerDay: 6.1385108,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    T = clampCenturies(T);
    ra = 281.0103 - 0.0328 * T;
    dec = 61.4155 - 0.0049 * T;
    return [ra, dec];
    },
    meridian: (d: number): number => {
    const M1 = degToRad(174.7910857 + 4.092335 * d);
    const M2 = degToRad(349.5821714 + 8.184670 * d);
    const M3 = degToRad(164.3732571 + 12.277005 * d);
    const M4 = degToRad(339.1643429 + 16.369340 * d);
    const M5 = degToRad(153.9554286 + 20.461675 * d);
    return (329.5988 + 6.1385108 * d
    + 0.01067257 * Math.sin(M1)
    - 0.00112309 * Math.sin(M2)
    - 0.00011040 * Math.sin(M3)
    - 0.00002539 * Math.sin(M4)
    - 0.00000571 * Math.sin(M5));
    },
  },
  venus: precessing(272.76, 0, 67.16, 0, 160.2, -1.4813688),
  mars: {
    rateDegPerDay: 350.891982443297,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    T = clampCenturies(T);
    ra = 317.269202 - 0.10927547 * T
    + 0.000068 * Math.sin(degToRad(198.991226 + 19139.4819985 * T))
    + 0.000238 * Math.sin(degToRad(226.292679 + 38280.8511281 * T))
    + 0.000052 * Math.sin(degToRad(249.663391 + 57420.7251593 * T))
    + 0.000009 * Math.sin(degToRad(266.183510 + 76560.6367950 * T))
    + 0.419057 * Math.sin(degToRad(79.398797 + 0.5042615 * T));
    dec = 54.432516 - 0.05827105 * T
    + 0.000051 * Math.cos(degToRad(122.433576 + 19139.9407476 * T))
    + 0.000141 * Math.cos(degToRad(43.058401 + 38280.8753272 * T))
    + 0.000031 * Math.cos(degToRad(57.663379 + 57420.7517205 * T))
    + 0.000005 * Math.cos(degToRad(79.476401 + 76560.6495004 * T))
    + 1.591274 * Math.cos(degToRad(166.325722 + 0.5042615 * T));
    return [ra, dec];
    },
    meridian: (d: number): number => {
    let T = d / 36525.0;
    return (176.049863 + 350.891982443297 * d
    + 0.000145 * Math.sin(degToRad(129.071773 + 19140.0328244 * T))
    + 0.000157 * Math.sin(degToRad(36.352167 + 38281.0473591 * T))
    + 0.000040 * Math.sin(degToRad(56.668646 + 57420.9295360 * T))
    + 0.000001 * Math.sin(degToRad(67.364003 + 76560.2552215 * T))
    + 0.000001 * Math.sin(degToRad(104.792680 + 95700.4387578 * T))
    + 0.584542 * Math.sin(degToRad(95.391654 + 0.5042615 * T)));
    },
  },
  jupiter: {
    rateDegPerDay: 870.536,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    const Ja = degToRad(99.360714 + 4850.4046 * T);
    const Jb = degToRad(175.895369 + 1191.9605 * T);
    const Jc = degToRad(300.323162 + 262.5475 * T);
    const Jd = degToRad(114.012305 + 6070.2476 * T);
    const Je = degToRad(49.511251 + 64.3000 * T);
    T = clampCenturies(T);
    ra = 268.056595 - 0.006499 * T + 0.000117 * Math.sin(Ja) + 0.000938 * Math.sin(Jb)
    + 0.001432 * Math.sin(Jc) + 0.000030 * Math.sin(Jd) + 0.002150 * Math.sin(Je);
    dec = 64.495303 + 0.002413 * T + 0.000050 * Math.cos(Ja) + 0.000404 * Math.cos(Jb)
    + 0.000617 * Math.cos(Jc) - 0.000013 * Math.cos(Jd) + 0.000926 * Math.cos(Je);
    return [ra, dec];
    },
    meridian: (d: number): number => {
    return 284.95 + 870.5360000 * d;
    },
  },
  saturn: precessing(40.589, -0.036, 83.537, -0.004, 38.9, 810.7939024),
  uranus: precessing(257.311, 0, -15.175, 0, 203.81, -501.1600928),
  neptune: {
    rateDegPerDay: 541.1397757,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    const N = degToRad(357.85 + 52.316 * T);
    ra = 299.36 + 0.70 * Math.sin(N);
    dec = 43.46 - 0.51 * Math.cos(N);
    return [ra, dec];
    },
    meridian: (d: number): number => {
    let T = d / 36525.0;
    const N = degToRad(357.85 + 52.316 * T);
    return 249.978 + 541.1397757 * d - 0.48 * Math.sin(N);
    },
  },
  moon: {
    rateDegPerDay: 13.17635815,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    T = clampCenturies(T);
    const E = lunarArgs(d);
    ra = 269.9949
    + 0.0031 * T
    - 3.8787 * Math.sin(E[1])
    - 0.1204 * Math.sin(E[2])
    + 0.0700 * Math.sin(E[3])
    - 0.0172 * Math.sin(E[4])
    + 0.0072 * Math.sin(E[6])
    - 0.0052 * Math.sin(E[10])
    + 0.0043 * Math.sin(E[13]);
    dec = 66.5392
    + 0.0130 * T
    + 1.5419 * Math.cos(E[1])
    + 0.0239 * Math.cos(E[2])
    - 0.0278 * Math.cos(E[3])
    + 0.0068 * Math.cos(E[4])
    - 0.0029 * Math.cos(E[6])
    + 0.0009 * Math.cos(E[7])
    + 0.0008 * Math.cos(E[10])
    - 0.0009 * Math.cos(E[13]);
    return [ra, dec];
    },
    meridian: (d: number): number => {
    const E = lunarArgs(d);
    // d^2 represents slowing of lunar rotation as the Moon recedes
    // from the Earth. This may need to be clamped at some very large
    // time range (1 Gy?)
    return (38.3213
    + 13.17635815 * d
    - 1.4e-12 * d * d
    + 3.5610 * Math.sin(E[1])
    + 0.1208 * Math.sin(E[2])
    - 0.0642 * Math.sin(E[3])
    + 0.0158 * Math.sin(E[4])
    + 0.0252 * Math.sin(E[5])
    - 0.0066 * Math.sin(E[6])
    - 0.0047 * Math.sin(E[7])
    - 0.0046 * Math.sin(E[8])
    + 0.0028 * Math.sin(E[9])
    + 0.0052 * Math.sin(E[10])
    + 0.0040 * Math.sin(E[11])
    + 0.0019 * Math.sin(E[12])
    - 0.0044 * Math.sin(E[13]));
    },
  },
  phobos: {
    rateDegPerDay: 1128.84475928,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    const M1 = degToRad(190.72646643 + 15917.10818695 * T);
    const M2 = degToRad(21.46892470 + 31834.27934054 * T);
    const M3 = degToRad(332.86082793 + 19139.89694742 * T);
    const M4 = degToRad(394.93256437 + 38280.79631835 * T);
    T = clampCenturies(T);
    ra  = 317.67071657 - 0.10844326 * T
    - 1.78428399 * Math.sin(M1) + 0.02212824 * Math.sin(M2)
    - 0.01028251 * Math.sin(M3) - 0.00475595 * Math.sin(M4);
    dec = 52.88627266 - 0.06134706 * T
    - 1.07516537 * Math.cos(M1) + 0.00668626 * Math.cos(M2)
    - 0.00648740 * Math.cos(M3) + 0.00281576 * Math.cos(M4);
    return [ra, dec];
    },
    meridian: (d: number): number => {
    let T = d / 36525.0;
    const M1 = degToRad(190.72646643 + 15917.10818695 * T);
    const M2 = degToRad(21.46892470 + 31834.27934054 * T);
    const M3 = degToRad(332.86082793 + 19139.89694742 * T);
    const M4 = degToRad(394.93256437 + 38280.79631835 * T);
    const M5 = degToRad(189.63271560 + 41215158.18420050 * T + 12.71192322 * T * T);
    return (35.18774440 + 1128.84475928 * d + 12.72192797 * T * T
    + 1.42421769 * Math.sin(M1) - 0.02273783 * Math.sin(M2)
    + 0.00410711 * Math.sin(M3) + 0.00631964 * Math.sin(M4)
    - 1.143 * Math.sin(M5));
    },
  },
  deimos: {
    rateDegPerDay: 285.16188899,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    const M6 = degToRad(121.46893664 + 660.22803474 * T);
    const M7 = degToRad(231.05028581 + 660.99123540 * T);
    const M8 = degToRad(251.37314025 + 1320.50145245 * T);
    const M9 = degToRad(217.98635955 + 38279.96125550 * T);
    const M10 = degToRad(196.19729402 + 19139.83628608 * T);
    T = clampCenturies(T);
    ra  = 316.65705808 - 0.10518014 * T
    + 3.09217726 * Math.sin(M6) + 0.22980637 * Math.sin(M7)
    + 0.06418655 * Math.sin(M8) + 0.02533537 * Math.sin(M9)
    + 0.00778695 * Math.sin(M10);
    dec = 53.50992033 - 0.05979094 * T
    + 1.83936004 * Math.cos(M6) + 0.14325320 * Math.cos(M7)
    + 0.01911409 * Math.cos(M8) - 0.01482590 * Math.cos(M9)
    + 0.00192430 * Math.cos(M10);
    return [ra, dec];
    },
    meridian: (d: number): number => {
    let T = d / 36525.0;
    const M6 = degToRad(121.46893664 + 660.22803474 * T);
    const M7 = degToRad(231.05028581 + 660.99123540 * T);
    const M8 = degToRad(251.37314025 + 1320.50145245 * T);
    const M9 = degToRad(217.98635955 + 38279.96125550 * T);
    const M10 = degToRad(196.19729402 + 19139.83628608 * T);
    return (79.39932954 + 285.16188899 * d
    - 2.73954829 * Math.sin(M6) - 0.39968606 * Math.sin(M7)
    - 0.06563259 * Math.sin(M8) - 0.02912940 * Math.sin(M9)
    + 0.01699160 * Math.sin(M10));
    },
  },
  io: {
    rateDegPerDay: 203.4889538,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    const J3 = degToRad(283.90 + 4850.7 * T);
    const J4 = degToRad(355.80 + 1191.3 * T);
    T = clampCenturies(T);
    ra = 268.05 - 0.009 * T + 0.094 * Math.sin(J3) + 0.024 * Math.sin(J4);
    dec = 64.50 + 0.003 * T + 0.040 * Math.cos(J3) + 0.011 * Math.cos(J4);
    return [ra, dec];
    },
    meridian: (d: number): number => {
    let T = d / 36525.0;
    const J3 = degToRad(283.90 + 4850.7 * T);
    const J4 = degToRad(355.80 + 1191.3 * T);
    return 200.39 + 203.4889538 * d - 0.085 * Math.sin(J3) - 0.022 * Math.sin(J4);
    },
  },
  europa: {
    rateDegPerDay: 101.3747235,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    const J4 = degToRad(355.80 + 1191.3 * T);
    const J5 = degToRad(119.90 + 262.1 * T);
    const J6 = degToRad(229.80 + 64.3 * T);
    const J7 = degToRad(352.25 + 2382.6 * T);
    T = clampCenturies(T);
    ra = 268.08 - 0.009 * T + 1.086 * Math.sin(J4) + 0.060 * Math.sin(J5) + 0.015 * Math.sin(J6) + 0.009 * Math.sin(J7);
    dec = 64.51 + 0.003 * T + 0.468 * Math.cos(J4) + 0.026 * Math.cos(J5) + 0.007 * Math.cos(J6) + 0.002 * Math.cos(J7);
    return [ra, dec];
    },
    meridian: (d: number): number => {
    let T = d / 36525.0;
    const J4 = degToRad(355.80 + 1191.3 * T);
    const J5 = degToRad(119.90 + 262.1 * T);
    const J6 = degToRad(229.80 + 64.3 * T);
    const J7 = degToRad(352.25 + 2382.6 * T);
    return 36.022 + 101.3747235 * d - 0.980 * Math.sin(J4) - 0.054 * Math.sin(J5) - 0.014 * Math.sin(J6) - 0.008 * Math.sin(J7);
    },
  },
  ganymede: {
    rateDegPerDay: 50.3176081,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    const J4 = degToRad(355.80 + 1191.3 * T);
    const J5 = degToRad(119.90 + 262.1 * T);
    const J6 = degToRad(229.80 + 64.3 * T);
    T = clampCenturies(T);
    ra = 268.20 - 0.009 * T - 0.037 * Math.sin(J4) + 0.431 * Math.sin(J5) + 0.091 * Math.sin(J6);
    dec = 64.57 + 0.003 * T - 0.016 * Math.cos(J4) + 0.186 * Math.cos(J5) + 0.039 * Math.cos(J6);
    return [ra, dec];
    },
    meridian: (d: number): number => {
    let T = d / 36525.0;
    const J4 = degToRad(355.80 + 1191.3 * T);
    const J5 = degToRad(119.90 + 262.1 * T);
    const J6 = degToRad(229.80 + 64.3 * T);
    return 44.064 + 50.3176081 * d + 0.033 * Math.sin(J4) - 0.389 * Math.sin(J5) - 0.082 * Math.sin(J6);
    },
  },
  callisto: {
    rateDegPerDay: 21.5710715,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    const J5 = degToRad(119.90 + 262.1 * T);
    const J6 = degToRad(229.80 + 64.3 * T);
    const J8 = degToRad(113.35 + 6070.0 * T);
    T = clampCenturies(T);
    ra = 268.72 - 0.009 * T - 0.068 * Math.sin(J5) + 0.590 * Math.sin(J6) + 0.010 * Math.sin(J8);
    dec = 64.83 + 0.003 * T - 0.029 * Math.cos(J5) + 0.254 * Math.cos(J6) - 0.004 * Math.cos(J8);
    return [ra, dec];
    },
    meridian: (d: number): number => {
    let T = d / 36525.0;
    const J5 = degToRad(119.90 + 262.1 * T);
    const J6 = degToRad(229.80 + 64.3 * T);
    const J8 = degToRad(113.35 + 6070.0 * T);
    return 259.51 + 21.5710715 * d + 0.061 * Math.sin(J5) - 0.533 * Math.sin(J6) - 0.009 * Math.sin(J8);
    },
  },
  mimas: {
    rateDegPerDay: 381.994555,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    const S3 = degToRad(177.40 - 36505.5 * T);
    T = clampCenturies(T);
    ra = 40.66 - 0.036 * T + 13.56 * Math.sin(S3);
    dec = 83.52 - 0.004 * T - 1.53 * Math.cos(S3);
    return [ra, dec];
    },
    meridian: (d: number): number => {
    let T = d / 36525.0;
    const S3 = degToRad(177.40 - 36505.5 * T);
    const S5 = degToRad(316.45 + 506.2 * T);
    return 333.46 + 381.9945550 * d - 13.48 * Math.sin(S3) - 44.85 * Math.sin(S5);
    },
  },
  enceladus: precessing(40.66, -0.036, 83.52, -0.004, 6.32, 262.7318996),
  tethys: {
    rateDegPerDay: 190.6979085,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    const S4 = degToRad(300.00 - 7225.9 * T);
    T = clampCenturies(T);
    ra = 40.66 - 0.036 * T + 9.66 * Math.sin(S4);
    dec = 83.52 - 0.004 * T - 1.09 * Math.cos(S4);
    return [ra, dec];
    },
    meridian: (d: number): number => {
    let T = d / 36525.0;
    const S4 = degToRad(300.00 - 7225.9 * T);
    const S5 = degToRad(316.45 + 506.2 * T);
    return 8.95 + 190.6979085 * d - 9.60 * Math.sin(S4) + 2.23 * Math.sin(S5);
    },
  },
  dione: precessing(40.66, -0.036, 83.52, -0.004, 357.6, 131.5349316),
  rhea: {
    rateDegPerDay: 79.6900478,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    const S6 = degToRad(345.20 - 1016.3 * T);
    T = clampCenturies(T);
    ra = 40.38 - 0.036 * T + 3.10 * Math.sin(S6);
    dec = 83.55 - 0.004 * T - 0.35 * Math.cos(S6);
    return [ra, dec];
    },
    meridian: (d: number): number => {
    let T = d / 36525.0;
    const S6 = degToRad(345.20 - 1016.3 * T);
    return 235.16 + 79.6900478 * d - 3.08 * Math.sin(S6);
    },
  },
  titan: precessing(39.4827, 0, 83.4279, 0, 186.5855, 22.5769768),
  iapetus: precessing(318.16, -3.949, 75.03, -1.143, 355.2, 4.5379572),
  miranda: {
    rateDegPerDay: 254.6906892,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    const U11 = degToRad(102.23 - 2024.22 * T);
    ra =  257.43 + 4.41 * Math.sin(U11) - 0.04 * Math.sin(2.0 * U11);
    dec = -15.08 + 4.25 * Math.cos(U11) - 0.02 * Math.cos(2.0 * U11);
    return [ra, dec];
    },
    meridian: (d: number): number => {
    let T = d / 36525.0;
    const U11 = degToRad(102.23 - 2024.22 * T);
    const U12 = degToRad(316.41 + 2863.96 * T);
    return 30.70 - 254.6906892 * d
    - 1.27 * Math.sin(U12) + 0.15 * Math.sin(2.0 * U12)
    + 1.15 * Math.sin(U11) - 0.09 * Math.sin(2.0 * U11);
    },
  },
  ariel: {
    rateDegPerDay: 142.8356681,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    const U13 = degToRad(304.01 - 51.94 * T);
    ra =  257.43 + 0.29 * Math.sin(U13);
    dec = -15.10 + 0.28 * Math.cos(U13);
    return [ra, dec];
    },
    meridian: (d: number): number => {
    let T = d / 36525.0;
    const U12 = degToRad(316.41 + 2863.96 * T);
    const U13 = degToRad(304.01 - 51.94 * T);
    return 156.22 - 142.8356681 * d + 0.05 * Math.sin(U12) + 0.08 * Math.sin(U13);
    },
  },
  umbriel: {
    rateDegPerDay: 86.8688923,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    const U14 = degToRad(308.71 - 93.17 * T);
    ra =  257.43 + 0.21 * Math.sin(U14);
    dec = -15.10 + 0.20 * Math.cos(U14);
    return [ra, dec];
    },
    meridian: (d: number): number => {
    let T = d / 36525.0;
    const U12 = degToRad(316.41 + 2863.96 * T);
    const U14 = degToRad(308.71 - 93.17 * T);
    return 108.05 - 86.8688923 * d - 0.09 * Math.sin(U12) + 0.06 * Math.sin(U14);
    },
  },
  titania: {
    rateDegPerDay: 41.351431,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    const U15 = degToRad(340.82 - 75.32 * T);
    ra =  257.43 + 0.29 * Math.sin(U15);
    dec = -15.10 + 0.28 * Math.cos(U15);
    return [ra, dec];
    },
    meridian: (d: number): number => {
    let T = d / 36525.0;
    const U15 = degToRad(340.82 - 75.32 * T);
    return 77.74 - 41.3514316 * d + 0.08 * Math.sin(U15);
    },
  },
  oberon: {
    rateDegPerDay: 26.7394932,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    const U16 = degToRad(259.14 - 504.81 * T);
    ra =  257.43 + 0.16 * Math.sin(U16);
    dec = -15.10 + 0.16 * Math.cos(U16);
    return [ra, dec];
    },
    meridian: (d: number): number => {
    let T = d / 36525.0;
    const U16 = degToRad(259.14 - 504.81 * T);
    return 6.77 - 26.7394932 * d + 0.04 * Math.sin(U16);
    },
  },
  triton: {
    rateDegPerDay: 61.2572637,
    pole: (d: number): [number, number] => {
    let ra: number, dec: number;
    let T = d / 36525.0;
    const N7 = degToRad(177.85 + 52.316 * T);
    ra = 299.36 - 32.35 * Math.sin(N7) - 6.28 * Math.sin(2 * N7)
    - 2.08 * Math.sin(3 * N7) - 0.74 * Math.sin(4 * N7)
    - 0.28 * Math.sin(5 * N7) - 0.11 * Math.sin(6 * N7)
    - 0.07 * Math.sin(7 * N7) - 0.02 * Math.sin(8 * N7)
    - 0.01 * Math.sin(9 * N7);
    dec = 41.17 + 22.55 * Math.cos(N7) + 2.10 * Math.cos(2 * N7)
    + 0.55 * Math.cos(3 * N7) + 0.16 * Math.cos(4 * N7)
    + 0.05 * Math.cos(5 * N7) + 0.02 * Math.cos(6 * N7)
    + 0.01 * Math.cos(7 * N7);
    return [ra, dec];
    },
    meridian: (d: number): number => {
    let T = d / 36525.0;
    const N7 = degToRad(177.85 + 52.316 * T);
    return (296.53 - 61.2572637 * d
    + 22.25 * Math.sin(N7) + 6.73 * Math.sin(2 * N7)
    + 2.05 * Math.sin(3 * N7) + 0.74 * Math.sin(4 * N7)
    + 0.28 * Math.sin(5 * N7) + 0.11 * Math.sin(6 * N7)
    + 0.05 * Math.sin(7 * N7) + 0.02 * Math.sin(8 * N7)
    + 0.01 * Math.sin(9 * N7));
    },
  },
};
