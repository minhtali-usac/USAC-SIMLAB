/**
 * Analytic theories of the natural satellites of Jupiter (Galilean moons) and Saturn (Mimas … Iapetus), and the
 * GUST86 tables for the five large Uranian moons. Generated - do not edit by hand:
 *
 *   node reference/extract_celestia_satellites.mjs <Celestia>/src/celephem/customorbit.cpp
 *
 * Sources (as cited by Celestia): the Galilean theory is that of J. Meeus, Astronomical Algorithms, ch. 44
 * (after Sampson 1921 / Lieske); the Saturnian theory is Dourneau's, from Meeus ch. 46; GUST86 is Laskar &
 * Jacobson (1987), A&A 188, 212.
 *
 * Each function returns the moon's position relative to its parent planet in kilometres, in the internal axes
 * used by Celestia: (x, y, z) = (X, Z, −Y) of a frame tied to the planet. satellites.ts converts to the J2000
 * ecliptic and measures the result against JPL Horizons.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * Copyright (C) 2001, Chris Laurel <claurel@shatters.net> and the Celestia Development Team (Celestia 1.7.0,
 * src/celephem/customorbit.cpp). Modified for USAC SimLab by the USAC SimLab team on 2026-10-22: translated
 * from C++ to TypeScript by reference/extract_celestia_satellites.mjs (syntax only). See NOTICE.md.
 */
import type { Vec3 } from '../math/vec';

const degToRad = (d: number) => (d * Math.PI) / 180;
const radToDeg = (r: number) => (r * 180) / Math.PI;
const sq = (x: number) => x * x;
const cube = (x: number) => x * x * x;
/** Remainder in [0, b), like Celestia's math::pfmod. */
const pfmod = (a: number, b: number) => a - Math.floor(a / b) * b;
const sinD = (theta: number) => Math.sin(degToRad(theta));
const cosD = (theta: number) => Math.cos(degToRad(theta));

/** (x, y, z) in Celestia's internal axes from longitude, latitude and distance. */
function fromPolar(lon: number, lat: number, distance: number): Vec3 {
  return [Math.cos(lon) * Math.sin(lat) * distance, Math.cos(lat) * distance, -Math.sin(lon) * Math.sin(lat) * distance];
}

const TWOPI = 6.28318530717958647692;
const LPEJ = 0.23509484;
const JupiterRadius = 71398.0;
const SaturnRadius = 60330.0;
const JupAscendingNode = degToRad(22.203);
const SatAscendingNode = 168.8112;
const SatTilt = 28.0817;

function galileanElements(t: number): { l1: number; l2: number; l3: number; l4: number; p1: number; p2: number; p3: number; p4: number; w1: number; w2: number; w3: number; w4: number; gamma: number; phi: number; psi: number; G: number; Gp: number } {
  let l1: number, l2: number, l3: number, l4: number, p1: number, p2: number, p3: number, p4: number, w1: number, w2: number, w3: number, w4: number, gamma: number, phi: number, psi: number, G: number, Gp: number;
  // Parameter t is Julian days, epoch 1950.0.
  l1 = 1.8513962 + 3.551552269981*t;
  l2 = 3.0670952 + 1.769322724929*t;
  l3 = 2.1041485 + 0.87820795239*t;
  l4 = 1.473836 + 0.37648621522*t;

  p1 = 1.69451 + 2.8167146e-3*t;
  p2 = 2.702927 + 8.248962e-4*t;
  p3 = 3.28443 + 1.24396e-4*t;
  p4 = 5.851859 + 3.21e-5*t;

  w1 = 5.451267 - 2.3176901e-3*t;
  w2 = 1.753028 - 5.695121e-4*t;
  w3 = 2.080331 - 1.25263e-4*t;
  w4 = 5.630757 - 3.07063e-5*t;

  gamma = 5.7653e-3*Math.sin(2.85674 + 1.8347e-5*t) + 6.002e-4*Math.sin(0.60189 - 2.82274e-4*t);
  phi = 3.485014 + 3.033241e-3*t;
  psi = 5.524285 - 3.63e-8*t;
  G = 0.527745 + 1.45023893e-3*t + gamma;
  Gp = 0.5581306 + 5.83982523e-4*t;
  return { l1, l2, l3, l4, p1, p2, p3, p4, w1, w2, w3, w4, gamma, phi, psi, G, Gp };
}

function saturnianElements(t: number): { t1: number; t2: number; t3: number; t4: number; t5: number; t6: number; t7: number; t8: number; t9: number; t10: number; t11: number; W0: number; W1: number; W2: number; W3: number; W4: number; W5: number; W6: number; W7: number; W8: number } {
  let t1: number, t2: number, t3: number, t4: number, t5: number, t6: number, t7: number, t8: number, t9: number, t10: number, t11: number, W0: number, W1: number, W2: number, W3: number, W4: number, W5: number, W6: number, W7: number, W8: number;
  t1 = t - 2411093.0;
  t2 = t1 / 365.25;
  t3 = (t - 2433282.423) / 365.25 + 1950.0;
  t4 = t - 2411368.0;
  t5 = t4 / 365.25;
  t6 = t - 2415020.0;
  t7 = t6 / 36525;
  t8 = t6 / 365.25;
  t9 = (t - 2442000.5) / 365.25;
  t10 = t - 2409786.0;
  t11 = t10 / 36525;

  W0 = 5.095 * (t3 - 1866.39);
  W1 = 74.4 + 32.39 * t2;
  W2 = 134.3 + 92.62 * t2;
  W3 = 42.0 - 0.5118 * t5;
  W4 = 276.59 + 0.5118 * t5;
  W5 = 267.2635 + 1222.1136 * t7;
  W6 = 175.4762 + 1221.5515 * t7;
  W7 = 2.4891 + 0.002435 * t7;
  W8 = 113.35 - 0.2597 * t7;
  return { t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, W0, W1, W2, W3, W4, W5, W6, W7, W8 };
}

function outerSaturnMoonParams(a: number, e: number, i: number, Om_: number, M: number, lam_: number): { lam: number; gam: number; r: number; w: number } {
  let lam: number, gam: number, r: number, w: number;
  let s1 = sinD(SatTilt);
  let c1 = cosD(SatTilt);
  let e_2 = e * e;
  let e_3 = e_2 * e;
  let e_4 = e_3 * e;
  let e_5 = e_4 * e;
  let C = (2 * e - 0.25 * e_3 + 0.0520833333 * e_5) * sinD(M) +
  (1.25 * e_2 - 0.458333333 * e_4) * sinD(2 * M) +
  (1.083333333 * e_3 - 0.671875 * e_5) * sinD(3 * M) +
  1.072917 * e_4 * sinD(4 * M) + 1.142708 * e_5 * sinD(5 * M);
  let g = Om_ - SatAscendingNode;
  let a1 = sinD(i) * sinD(g);
  let a2 = c1 * sinD(i) * cosD(g) - s1 * cosD(i);
  let u = radToDeg(Math.atan2(a1, a2));
  let h = c1 * sinD(i) - s1 * cosD(i) * cosD(g);
  let psi = radToDeg(Math.atan2(s1 * sinD(g), h));

  C = radToDeg(C);
  lam = lam_ + C + u - g - psi;
  gam = radToDeg(Math.asin(Math.sqrt(sq(a1) + sq(a2))));
  r = a * (1 - e * e) / (1 + e * cosD(M + C));
  w = SatAscendingNode + u;
  return { lam, gam, r, w };
}

function saturnMoonPosition(lam: number, gam: number, Om: number, r: number): Vec3 {
  let u = lam - Om;
  let w = Om - SatAscendingNode;

  u = degToRad(u);
  w = degToRad(w);
  gam = -degToRad(gam);
  r = r * SaturnRadius;

  // Corrections for Celestia's coordinate system
  u = -u;
  w = -w;

  let cu: number;
  let su: number;
  su = Math.sin(u); cu = Math.cos(u);
  let cw: number;
  let sw: number;
  sw = Math.sin(w); cw = Math.cos(w);
  let cgam: number;
  let sgam: number;
  sgam = Math.sin(gam); cgam = Math.cos(gam);

  let x = r * (cu * cw - su * sw * cgam);
  let y = r * su * sgam;
  let z = r * (su * cw * cgam + cu * sw);

  return [x, y, z];
}

/** Io: position relative to the parent planet, km, in Celestia's internal axes (x, y, z) = (X, Z, −Y). jd = TDB. */
export function io(jd: number): Vec3 {
  //Computation will yield latitude(L), longitude(B) and distance(R) relative to Jupiter
  let t: number;
  let l1: number, l2: number, l3: number, l4: number;
  let p1: number, p2: number, p3: number, p4: number;
  let w1: number, w2: number, w3: number, w4: number;
  let gamma: number, phi: number, psi: number, G: number, Gp: number;
  let sigma: number, L: number, B: number, R: number;
  let T: number, P: number;

  // Epoch for Galilean satellites is 1976.0 Aug 10
  t = jd - 2443000.5;

  ({ l1, l2, l3, l4, p1, p2, p3, p4, w1, w2, w3, w4, gamma, phi, psi, G, Gp } = galileanElements(t));

  // Calculate periodic terms for longitude
  sigma = 0.47259*Math.sin(2*(l1 - l2)) - 0.03478*Math.sin(p3 - p4)
        + 0.01081*Math.sin(l2 - 2*l3 + p3) + 7.38e-3*Math.sin(phi)
        + 7.13e-3*Math.sin(l2 - 2*l3 + p2) - 6.74e-3*Math.sin(p1 + p3 - 2*LPEJ - 2*G)
        + 6.66e-3*Math.sin(l2 - 2*l3 + p4) + 4.45e-3*Math.sin(l1 - p3)
        - 3.54e-3*Math.sin(l1 - l2) - 3.17e-3*Math.sin(2*(psi - LPEJ))
        + 2.65e-3*Math.sin(l1 - p4) - 1.86e-3*Math.sin(G)
        + 1.62e-3*Math.sin(p2 - p3) + 1.58e-3*Math.sin(4*(l1 - l2))
        - 1.55e-3*Math.sin(l1 - l3) - 1.38e-3*Math.sin(psi + w3 - 2*LPEJ - 2*G)
        - 1.15e-3*Math.sin(2*(l1 - 2*l2 + w2)) + 8.9e-4*Math.sin(p2 - p4)
        + 8.5e-4*Math.sin(l1 + p3 - 2*LPEJ - 2*G) + 8.3e-4*Math.sin(w2 - w3)
        + 5.3e-4*Math.sin(psi - w2);
  sigma = pfmod(sigma, 360.0);
  sigma = degToRad(sigma);
  L = l1 + sigma;

  // Calculate periodic terms for the tangent of the latitude
  B = 6.393e-4*Math.sin(L - w1) + 1.825e-4*Math.sin(L - w2)
    + 3.29e-5*Math.sin(L - w3) - 3.11e-5*Math.sin(L - psi)
    + 9.3e-6*Math.sin(L - w4) + 7.5e-6*Math.sin(3*L - 4*l2 - 1.9927*sigma + w2)
    + 4.6e-6*Math.sin(L + psi - 2*LPEJ - 2*G);
  B = Math.atan(B);

  // Calculate the periodic terms for distance
  R = -4.1339e-3*Math.cos(2*(l1 - l2)) - 3.87e-5*Math.cos(l1 - p3)
    - 2.14e-5*Math.cos(l1 - p4) + 1.7e-5*Math.cos(l1 - l2)
    - 1.31e-5*Math.cos(4*(l1 - l2)) + 1.06e-5*Math.cos(l1 - l3)
    - 6.6e-6*Math.cos(l1 + p3 - 2*LPEJ - 2*G);
  R = 5.90569 * JupiterRadius * (1 + R);

  T = (jd - 2433282.423) / 36525.0;
  P = 1.3966626*T + 3.088e-4*T*T;
  L += degToRad(P);

  L += JupAscendingNode;

  // Corrections for internal coordinate system
  B -= (Math.PI/2);
  L += Math.PI;

  return fromPolar(L, B, R);
}

/** Europa: position relative to the parent planet, km, in Celestia's internal axes (x, y, z) = (X, Z, −Y). jd = TDB. */
export function europa(jd: number): Vec3 {
  // Computation will yield latitude(L), longitude(B) and distance(R) relative to Jupiter
  let t: number;
  let l1: number, l2: number, l3: number, l4: number;
  let p1: number, p2: number, p3: number, p4: number;
  let w1: number, w2: number, w3: number, w4: number;
  let gamma: number, phi: number, psi: number, G: number, Gp: number;
  let sigma: number, L: number, B: number, R: number;
  let T: number, P: number;

  // Epoch for Galilean satellites is 1976 Aug 10
  t = jd - 2443000.5;

  ({ l1, l2, l3, l4, p1, p2, p3, p4, w1, w2, w3, w4, gamma, phi, psi, G, Gp } = galileanElements(t));

  // Calculate periodic terms for longitude
  sigma = 1.06476*Math.sin(2*(l2 - l3)) + 0.04256*Math.sin(l1 - 2*l2 + p3)
        + 0.03581*Math.sin(l2 - p3) + 0.02395*Math.sin(l1 - 2*l2 + p4)
        + 0.01984*Math.sin(l2 - p4) - 0.01778*Math.sin(phi)
        + 0.01654*Math.sin(l2 - p2) + 0.01334*Math.sin(l2 - 2*l3 + p2)
        + 0.01294*Math.sin(p3 - p4) - 0.01142*Math.sin(l2 - l3)
        - 0.01057*Math.sin(G) - 7.75e-3*Math.sin(2*(psi - LPEJ))
        + 5.24e-3*Math.sin(2*(l1 - l2)) - 4.6e-3*Math.sin(l1 - l3)
        + 3.16e-3*Math.sin(psi - 2*G + w3 - 2*LPEJ) - 2.03e-3*Math.sin(p1 + p3 - 2*LPEJ - 2*G)
        + 1.46e-3*Math.sin(psi - w3) - 1.45e-3*Math.sin(2*G)
        + 1.25e-3*Math.sin(psi - w4) - 1.15e-3*Math.sin(l1 - 2*l3 + p3)
        - 9.4e-4*Math.sin(2*(l2 - w2)) + 8.6e-4*Math.sin(2*(l1 - 2*l2 + w2))
        - 8.6e-4*Math.sin(5*Gp - 2*G + 0.9115) - 7.8e-4*Math.sin(l2 - l4)
        - 6.4e-4*Math.sin(3*l3 - 7*l4 + 4*p4) + 6.4e-4*Math.sin(p1 - p4)
        - 6.3e-4*Math.sin(l1 - 2*l3 + p4) + 5.8e-4*Math.sin(w3 - w4)
        + 5.6e-4*Math.sin(2*(psi - LPEJ - G)) + 5.6e-4*Math.sin(2*(l2 - l4))
        + 5.5e-4*Math.sin(2*(l1 - l3)) + 5.2e-4*Math.sin(3*l3 - 7*l4 + p3 +3*p4)
        - 4.3e-4*Math.sin(l1 - p3) + 4.1e-4*Math.sin(5*(l2 - l3))
        + 4.1e-4*Math.sin(p4 - LPEJ) + 3.2e-4*Math.sin(w2 - w3)
        + 3.2e-4*Math.sin(2*(l3 - G - LPEJ));
  sigma = pfmod(sigma, 360.0);
  sigma = degToRad(sigma);
  L = l2 + sigma;

  // Calculate periodic terms for the tangent of the latitude
  B = 8.1004e-3*Math.sin(L - w2) + 4.512e-4*Math.sin(L - w3)
    - 3.284e-4*Math.sin(L - psi) + 1.160e-4*Math.sin(L - w4)
    + 2.72e-5*Math.sin(l1 - 2*l3 + 1.0146*sigma + w2) - 1.44e-5*Math.sin(L - w1)
    + 1.43e-5*Math.sin(L + psi - 2*LPEJ - 2*G) + 3.5e-6*Math.sin(L - psi + G)
    - 2.8e-6*Math.sin(l1 - 2*l3 + 1.0146*sigma + w3);
  B = Math.atan(B);

  // Calculate the periodic terms for distance
  R = 9.3848e-3*Math.cos(l1 - l2) - 3.116e-4*Math.cos(l2 - p3)
    - 1.744e-4*Math.cos(l2 - p4) - 1.442e-4*Math.cos(l2 - p2)
    + 5.53e-5*Math.cos(l2 - l3) + 5.23e-5*Math.cos(l1 - l3)
    - 2.9e-5*Math.cos(2*(l1 - l2)) + 1.64e-5*Math.cos(2*(l2 - w2))
    + 1.07e-5*Math.cos(l1 - 2*l3 + p3) - 1.02e-5*Math.cos(l2 - p1)
    - 9.1e-6*Math.cos(2*(l1 - l3));
  R = 9.39657 * JupiterRadius * (1 + R);

  T = (jd - 2433282.423) / 36525.0;
  P = 1.3966626*T + 3.088e-4*T*T;
  L += degToRad(P);

  L += JupAscendingNode;

  // Corrections for internal coordinate system
  B -= (Math.PI/2);
  L += Math.PI;

  return fromPolar(L, B, R);
}

/** Ganymede: position relative to the parent planet, km, in Celestia's internal axes (x, y, z) = (X, Z, −Y). jd = TDB. */
export function ganymede(jd: number): Vec3 {
  //Computation will yield latitude(L), longitude(B) and distance(R) relative to Jupiter
  let t: number;
  let l1: number, l2: number, l3: number, l4: number;
  let p1: number, p2: number, p3: number, p4: number;
  let w1: number, w2: number, w3: number, w4: number;
  let gamma: number, phi: number, psi: number, G: number, Gp: number;
  let sigma: number, L: number, B: number, R: number;
  let T: number, P: number;

  //Epoch for Galilean satellites is 1976 Aug 10
  t = jd - 2443000.5;

  ({ l1, l2, l3, l4, p1, p2, p3, p4, w1, w2, w3, w4, gamma, phi, psi, G, Gp } = galileanElements(t));

  //Calculate periodic terms for longitude
  sigma = 0.1649*Math.sin(l3 - p3) + 0.09081*Math.sin(l3 - p4)
        - 0.06907*Math.sin(l2 - l3) + 0.03784*Math.sin(p3 - p4)
        + 0.01846*Math.sin(2*(l3 - l4)) - 0.01340*Math.sin(G)
        - 0.01014*Math.sin(2*(psi - LPEJ)) + 7.04e-3*Math.sin(l2 - 2*l3 + p3)
        - 6.2e-3*Math.sin(l2 - 2*l3 + p2) - 5.41e-3*Math.sin(l3 - l4)
        + 3.81e-3*Math.sin(l2 - 2*l3 + p4) + 2.35e-3*Math.sin(psi - w3)
        + 1.98e-3*Math.sin(psi - w4) + 1.76e-3*Math.sin(phi)
        + 1.3e-3*Math.sin(3*(l3 - l4)) + 1.25e-3*Math.sin(l1 - l3)
        - 1.19e-3*Math.sin(5*Gp - 2*G + 0.9115) + 1.09e-3*Math.sin(l1 - l2)
        - 1.0e-3*Math.sin(3*l3 - 7*l4 + 4*p4) + 9.1e-4*Math.sin(w3 - w4)
        + 8.0e-4*Math.sin(3*l3 - 7*l4 + p3 + 3*p4) - 7.5e-4*Math.sin(2*l2 - 3*l3 + p3)
        + 7.2e-4*Math.sin(p1 + p3 - 2*LPEJ - 2*G) + 6.9e-4*Math.sin(p4 - LPEJ)
        - 5.8e-4*Math.sin(2*l3 - 3*l4 + p4) - 5.7e-4*Math.sin(l3 - 2*l4 + p4)
        + 5.6e-4*Math.sin(l3 + p3 - 2*LPEJ - 2*G) - 5.2e-4*Math.sin(l2 - 2*l3 + p1)
        - 5.0e-4*Math.sin(p2 - p3) + 4.8e-4*Math.sin(l3 - 2*l4 + p3)
        - 4.5e-4*Math.sin(2*l2 - 3*l3 + p4) - 4.1e-4*Math.sin(p2 - p4)
        - 3.8e-4*Math.sin(2*G) - 3.7e-4*Math.sin(p3 - p4 + w3 - w4)
        - 3.2e-4*Math.sin(3*l3 - 7*l4 + 2*p3 + 2*p4) + 3.0e-4*Math.sin(4*(l3 - l4))
        + 2.9e-4*Math.sin(l3 + p4 - 2*LPEJ - 2*G) - 2.8e-4*Math.sin(w3 + psi - 2*LPEJ - 2*G)
        + 2.6e-4*Math.sin(l3 - LPEJ - G) + 2.4e-4*Math.sin(l2 - 3*l3 + 2*l4)
        + 2.1e-4*Math.sin(2*(l3 - LPEJ - G)) - 2.1e-4*Math.sin(l3 - p2)
        + 1.7e-4*Math.sin(l3 - p3);
  sigma = pfmod(sigma, 360.0);
  sigma = degToRad(sigma);
  L = l3 + sigma;

  //Calculate periodic terms for the tangent of the latitude
  B = 3.2402e-3*Math.sin(L - w3) - 1.6911e-3*Math.sin(L - psi)
    + 6.847e-4*Math.sin(L - w4) - 2.797e-4*Math.sin(L - w2)
    + 3.21e-5*Math.sin(L + psi - 2*LPEJ - 2*G) + 5.1e-6*Math.sin(L - psi + G)
    - 4.5e-6*Math.sin(L - psi - G) - 4.5e-6*Math.sin(L + psi - 2*LPEJ)
    + 3.7e-6*Math.sin(L + psi - 2*LPEJ - 3*G) + 3.0e-6*Math.sin(2*l2 - 3*L + 4.03*sigma + w2)
    - 2.1e-6*Math.sin(2*l2 - 3*L + 4.03*sigma + w3);
  B = Math.atan(B);

  //Calculate the periodic terms for distance
  R = -1.4388e-3*Math.cos(l3 - p3) - 7.919e-4*Math.cos(l3 - p4)
    + 6.342e-4*Math.cos(l2 - l3) - 1.761e-4*Math.cos(2*(l3 - l4))
    + 2.94e-5*Math.cos(l3 - l4) - 1.56e-5*Math.cos(3*(l3 - l4))
    + 1.56e-5*Math.cos(l1 - l3) - 1.53e-5*Math.cos(l1 - l2)
    + 7.0e-6*Math.cos(2*l2 - 3*l3 + p3) - 5.1e-6*Math.cos(l3 + p3 - 2*LPEJ - 2*G);
  R = 14.98832 * JupiterRadius * (1 + R);

  T = (jd - 2433282.423) / 36525.0;
  P = 1.3966626*T + 3.088e-4*T*T;
  L += degToRad(P);

  L += JupAscendingNode;

  //Corrections for internal coordinate system
  B -= (Math.PI/2);
  L += Math.PI;

  return fromPolar(L, B, R);
}

/** Callisto: position relative to the parent planet, km, in Celestia's internal axes (x, y, z) = (X, Z, −Y). jd = TDB. */
export function callisto(jd: number): Vec3 {
  //Computation will yield latitude(L), longitude(B) and distance(R) relative to Jupiter
  let t: number;
  let l1: number, l2: number, l3: number, l4: number;
  let p1: number, p2: number, p3: number, p4: number;
  let w1: number, w2: number, w3: number, w4: number;
  let gamma: number, phi: number, psi: number, G: number, Gp: number;
  let sigma: number, L: number, B: number, R: number;
  let T: number, P: number;

  //Epoch for Galilean satellites is 1976 Aug 10
  t = jd - 2443000.5;

  ({ l1, l2, l3, l4, p1, p2, p3, p4, w1, w2, w3, w4, gamma, phi, psi, G, Gp } = galileanElements(t));

  //Calculate periodic terms for longitude
  sigma =
      0.84287*Math.sin(l4 - p4)
      + 0.03431*Math.sin(p4 - p3)
      - 0.03305*Math.sin(2*(psi - LPEJ))
      - 0.03211*Math.sin(G)
      - 0.01862*Math.sin(l4 - p3)
      + 0.01186*Math.sin(psi - w4)
      + 6.23e-3*Math.sin(l4 + p4 - 2*G - 2*LPEJ)
      + 3.87e-3*Math.sin(2*(l4 - p4))
      - 2.84e-3*Math.sin(5*Gp - 2*G + 0.9115)
      - 2.34e-3*Math.sin(2*(psi - p4))
      - 2.23e-3*Math.sin(l3 - l4)
      - 2.08e-3*Math.sin(l4 - LPEJ)
      + 1.78e-3*Math.sin(psi + w4 - 2*p4)
      + 1.34e-3*Math.sin(p4 - LPEJ)
      + 1.25e-3*Math.sin(2*(l4 - G - LPEJ))
      - 1.17e-3*Math.sin(2*G)
      - 1.12e-3*Math.sin(2*(l3 - l4))
      + 1.07e-3*Math.sin(3*l3 - 7*l4 + 4*p4)
      + 1.02e-3*Math.sin(l4 - G - LPEJ)
      + 9.6e-4*Math.sin(2*l4 - psi - w4)
      + 8.7e-4*Math.sin(2*(psi - w4))
      - 8.5e-4*Math.sin(3*l3 - 7*l4 + p3 + 3*p4)
      + 8.5e-4*Math.sin(l3 - 2*l4 + p4)
      - 8.1e-4*Math.sin(2*(l4 - psi))
      + 7.1e-4*Math.sin(l4 + p4 - 2*LPEJ - 3*G)
      + 6.1e-4*Math.sin(l1 - l4)
      - 5.6e-4*Math.sin(psi - w3)
      - 5.4e-4*Math.sin(l3 - 2*l4 + p3)
      + 5.1e-4*Math.sin(l2 - l4)
      + 4.2e-4*Math.sin(2*(psi - G - LPEJ))
      + 3.9e-4*Math.sin(2*(p4 - w4))
      + 3.6e-4*Math.sin(psi + LPEJ - p4 - w4)
      + 3.5e-4*Math.sin(2*Gp - G + 3.2877)
      - 3.5e-4*Math.sin(l4 - p4 + 2*LPEJ - 2*psi)
      - 3.2e-4*Math.sin(l4 + p4 - 2*LPEJ - G)
      + 3.0e-4*Math.sin(2*Gp - 2*G + 2.6032)
      + 2.9e-4*Math.sin(3*l3 - 7*l4 + 2*p3 + 2*p4)
      + 2.8e-4*Math.sin(l4 - p4 + 2*psi - 2*LPEJ)
      - 2.8e-4*Math.sin(2*(l4 - w4))
      - 2.7e-4*Math.sin(p3 - p4 + w3 - w4)
      - 2.6e-4*Math.sin(5*Gp - 3*G + 3.2877)
      + 2.5e-4*Math.sin(w4 - w3)
      - 2.5e-4*Math.sin(l2 - 3*l3 + 2*l4)
      - 2.3e-4*Math.sin(3*(l3 - l4))
      + 2.1e-4*Math.sin(2*l4 - 2*LPEJ - 3*G)
      - 2.1e-4*Math.sin(2*l3 - 3*l4 + p4)
      + 1.9e-4*Math.sin(l4 - p4 - G)
      - 1.9e-4*Math.sin(2*l4 - p3 - p4)
      - 1.8e-4*Math.sin(l4 - p4 + G)
      - 1.6e-4*Math.sin(l4 + p3 - 2*LPEJ - 2*G);
  sigma = pfmod(sigma, 360.0);
  sigma = degToRad(sigma);
  L = l4 + sigma;

  //Calculate periodic terms for the tangent of the latitude
  B =
      - 7.6579e-3 * Math.sin(L - psi)
      + 4.4134e-3 * Math.sin(L - w4)
      - 5.112e-4  * Math.sin(L - w3)
      + 7.73e-5   * Math.sin(L + psi - 2*LPEJ - 2*G)
      + 1.04e-5   * Math.sin(L - psi + G)
      - 1.02e-5   * Math.sin(L - psi - G)
      + 8.8e-6    * Math.sin(L + psi - 2*LPEJ - 3*G)
      - 3.8e-6    * Math.sin(L + psi - 2*LPEJ - G);
  B = Math.atan(B);

  //Calculate the periodic terms for distance
  R =
      - 7.3546e-3 * Math.cos(l4 - p4)
      + 1.621e-4  * Math.cos(l4 - p3)
      + 9.74e-5   * Math.cos(l3 - l4)
      - 5.43e-5   * Math.cos(l4 + p4 - 2*LPEJ - 2*G)
      - 2.71e-5   * Math.cos(2*(l4 - p4))
      + 1.82e-5   * Math.cos(l4 - LPEJ)
      + 1.77e-5   * Math.cos(2*(l3 - l4))
      - 1.67e-5   * Math.cos(2*l4 - psi - w4)
      + 1.67e-5   * Math.cos(psi - w4)
      - 1.55e-5   * Math.cos(2*(l4 - LPEJ - G))
      + 1.42e-5   * Math.cos(2*(l4 - psi))
      + 1.05e-5   * Math.cos(l1 - l4)
      + 9.2e-6    * Math.cos(l2 - l4)
      - 8.9e-6    * Math.cos(l4 - LPEJ -G)
      - 6.2e-6    * Math.cos(l4 + p4 - 2*LPEJ - 3*G)
      + 4.8e-6    * Math.cos(2*(l4 - w4));

  R = 26.36273 * JupiterRadius * (1 + R);

  T = (jd - 2433282.423) / 36525.0;
  P = 1.3966626*T + 3.088e-4*T*T;
  L += degToRad(P);

  L += JupAscendingNode;

  //Corrections for internal coordinate system
  B -= (Math.PI/2);
  L += Math.PI;

  return fromPolar(L, B, R);
}

/** Mimas: position relative to the parent planet, km, in Celestia's internal axes (x, y, z) = (X, Z, −Y). jd = TDB. */
export function mimas(jd: number): Vec3 {
  // Computation will yield latitude(L), longitude(B) and distance(R)
  // relative to Saturn.
  let t1: number, t2: number, t3: number, t4: number, t5: number, t6: number, t7: number, t8: number, t9: number, t10: number, t11: number;
  let W0: number, W1: number, W2: number, W3: number, W4: number, W5: number, W6: number, W7: number, W8: number;

  ({ t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, W0, W1, W2, W3, W4, W5, W6, W7, W8 } = saturnianElements(jd));

  let L = 127.64 + 381.994497 * t1 - 43.57 * sinD(W0) -
      0.720 * sinD( 3 * W0) - 0.02144 * sinD(5 * W0);
  let p = 106.1 + 365.549 * t2;
  let M = L - p;
  let C = 2.18287 * sinD(M) + 0.025988 * sinD(2 * M) +
      0.00043 * sinD(3 * M);
  let lam = L + C;
  let r = 3.06879 / (1 + 0.01905 * cosD(M + C));
  let gam = 1.563;
  let Om = 54.5 - 365.072 * t2;

  return saturnMoonPosition(lam, gam, Om, r);
}

/** Enceladus: position relative to the parent planet, km, in Celestia's internal axes (x, y, z) = (X, Z, −Y). jd = TDB. */
export function enceladus(jd: number): Vec3 {
  // Computation will yield latitude(L), longitude(B) and distance(R)
  // relative to Saturn.
  let t1: number, t2: number, t3: number, t4: number, t5: number, t6: number, t7: number, t8: number, t9: number, t10: number, t11: number;
  let W0: number, W1: number, W2: number, W3: number, W4: number, W5: number, W6: number, W7: number, W8: number;

  ({ t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, W0, W1, W2, W3, W4, W5, W6, W7, W8 } = saturnianElements(jd));

  let L = 200.317 + 262.7319002 * t1 + 0.25667 * sinD(W1) +
      0.20883 * sinD(W2);
  let p = 309.107 + 123.44121 * t2;
  let M = L - p;
  let C = 0.55577 * sinD(M) + 0.00168 * sinD(2 * M);
  let lam = L + C;
  let r = 3.94118 / (1 + 0.00485 * cosD(M + C));
  let gam = 0.0262;
  let Om = 348 - 151.95 * t2;

  return saturnMoonPosition(lam, gam, Om, r);
}

/** Tethys: position relative to the parent planet, km, in Celestia's internal axes (x, y, z) = (X, Z, −Y). jd = TDB. */
export function tethys(jd: number): Vec3 {
  // Computation will yield latitude(L), longitude(B) and distance(R)
  // relative to Saturn.
  let t1: number, t2: number, t3: number, t4: number, t5: number, t6: number, t7: number, t8: number, t9: number, t10: number, t11: number;
  let W0: number, W1: number, W2: number, W3: number, W4: number, W5: number, W6: number, W7: number, W8: number;

  ({ t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, W0, W1, W2, W3, W4, W5, W6, W7, W8 } = saturnianElements(jd));

  let lam = 285.306 + 190.69791226 * t1 + 2.063 * sinD(W0) +
      0.03409 * sinD(3 * W0) + 0.001015 * sinD(5 * W0);
  let r = 4.880998;
  let gam = 1.0976;
  let Om = 111.33 - 72.2441 * t2;

  return saturnMoonPosition(lam, gam, Om, r);
}

/** Dione: position relative to the parent planet, km, in Celestia's internal axes (x, y, z) = (X, Z, −Y). jd = TDB. */
export function dione(jd: number): Vec3 {
  // Computation will yield latitude(L), longitude(B) and distance(R)
  // relative to Saturn.
  let t1: number, t2: number, t3: number, t4: number, t5: number, t6: number, t7: number, t8: number, t9: number, t10: number, t11: number;
  let W0: number, W1: number, W2: number, W3: number, W4: number, W5: number, W6: number, W7: number, W8: number;

  ({ t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, W0, W1, W2, W3, W4, W5, W6, W7, W8 } = saturnianElements(jd));

  let L = 254.712 + 131.53493193 * t1 - 0.0215 * sinD(W1) -
      0.01733 * sinD(W2);
  let p = 174.8 + 30.820 * t2;
  let M = L - p;
  let C = 0.24717 * sinD(M) + 0.00033 * sinD(2 * M);
  let lam = L + C;
  let r = 6.24871 / (1 + 0.002157 * cosD(M + C));
  let gam = 0.0139;
  let Om = 232 - 30.27 * t2;
  // cout << "Dione: " << pfmod(lam, 360.0) << ',' << gam << ',' << pfmod(Om, 360.0) << ',' << r << '\n';

  return saturnMoonPosition(lam, gam, Om, r);
}

/** Rhea: position relative to the parent planet, km, in Celestia's internal axes (x, y, z) = (X, Z, −Y). jd = TDB. */
export function rhea(jd: number): Vec3 {
  // Computation will yield latitude(L), longitude(B) and distance(R)
  // relative to Saturn.
  let t1: number, t2: number, t3: number, t4: number, t5: number, t6: number, t7: number, t8: number, t9: number, t10: number, t11: number;
  let W0: number, W1: number, W2: number, W3: number, W4: number, W5: number, W6: number, W7: number, W8: number;

  ({ t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, W0, W1, W2, W3, W4, W5, W6, W7, W8 } = saturnianElements(jd));
  /*let e1 = 0.05589 - 0.000346 * t7;  Unused*/

  let p_ = 342.7 + 10.057 * t2;
  let a1 = 0.000265 * sinD(p_) + 0.01 * sinD(W4);
  let a2 = 0.000265 * cosD(p_) + 0.01 * cosD(W4);
  let e = Math.sqrt(sq(a1) + sq(a2));
  let p = radToDeg(Math.atan2(a1, a2));
  let N = 345 - 10.057 * t2;
  let lam_ = 359.244 + 79.69004720 * t1 + 0.086754 * sinD(N);
  let i = 28.0362 + 0.346898 * cosD(N) + 0.01930 * cosD(W3);
  let Om = 168.8034 + 0.736936 * sinD(N) + 0.041 * sinD(W3);
  let a = 8.725924;

  let lam: number, gam: number, r: number, w: number;
  ({ lam, gam, r, w } = outerSaturnMoonParams(a, e, i, Om, lam_ - p, lam_));
  // cout << "Rhea (intermediate): " << e << ',' << pfmod(lam_, 360.0) << ',' << pfmod(i, 360.0) << ',' << pfmod(Om, 360.0) << '\n';
  // cout << "Rhea: " << pfmod(lam, 360.0) << ',' << gam << ',' << pfmod(w, 360.0) << ',' << r << '\n';

  return saturnMoonPosition(lam, gam, w, r);
}

/** Titan: position relative to the parent planet, km, in Celestia's internal axes (x, y, z) = (X, Z, −Y). jd = TDB. */
export function titan(jd: number): Vec3 {
  // Computation will yield latitude(L), longitude(B) and distance(R)
  // relative to Saturn.
  let t1: number, t2: number, t3: number, t4: number, t5: number, t6: number, t7: number, t8: number, t9: number, t10: number, t11: number;
  let W0: number, W1: number, W2: number, W3: number, W4: number, W5: number, W6: number, W7: number, W8: number;

  ({ t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, W0, W1, W2, W3, W4, W5, W6, W7, W8 } = saturnianElements(jd));
  let e1 = 0.05589 - 0.000346 * t7;

  let L = 261.1582 + 22.57697855 * t4 + 0.074025 * sinD(W3);
  let i_ = 27.45141 + 0.295999 * cosD(W3);
  let Om_ = 168.66925 + 0.628808 * sinD(W3);
  let a1 = sinD(W7) * sinD(Om_ - W8);
  let a2 = cosD(W7) * sinD(i_) - sinD(W7) * cosD(i_) * cosD(Om_ - W8);
  let g0 = 102.8623;
  let psi = radToDeg(Math.atan2(a1, a2));
  let s = Math.sqrt(sq(a1) + sq(a2));
  let g = W4 - Om_ - psi;

  // Three successive approximations will always be enough
  let om = 0.0;
  for (let n = 0; n < 3; n++)
  {
      om = W4 + 0.37515 * (sinD(2 * g) - sinD(2 * g0));
      g = om - Om_ - psi;
  }

  let e_ = 0.029092 + 0.00019048 * (cosD(2 * g) - cosD(2 * g0));
  let q = 2 * (W5 - om);
  let b1 = sinD(i_) * sinD(Om_ - W8);
  let b2 = cosD(W7) * sinD(i_) * cosD(Om_ - W8) - sinD(W7) * cosD(i_);
  let theta = radToDeg(Math.atan2(b1, b2)) + W8;
  let e = e_ + 0.002778797 * e_ * cosD(q);
  let p = om + 0.159215 * sinD(q);
  let u = 2 * W5 - 2 * theta + psi;
  let h = 0.9375 * sq(e_) * sinD(q) + 0.1875 * sq(s) * sinD(2 * (W5 - theta));
  let lam_ = L - 0.254744 * (e1 * sinD(W6) + 0.75 * sq(e1) * sinD(2 * W6) + h);
  let i = i_ + 0.031843 * s * cosD(u);
  let Om = Om_ + (0.031843 * s * sinD(u)) / sinD(i_);
  let a = 20.216193;

  let lam: number, gam: number, r: number, w: number;
  ({ lam, gam, r, w } = outerSaturnMoonParams(a, e, i, Om, lam_ - p, lam_));

  return saturnMoonPosition(lam, gam, w, r);
}

/** Hyperion: position relative to the parent planet, km, in Celestia's internal axes (x, y, z) = (X, Z, −Y). jd = TDB. */
export function hyperion(jd: number): Vec3 {
  // Computation will yield latitude(L), longitude(B) and distance(R)
  // relative to Saturn.
  let t1: number, t2: number, t3: number, t4: number, t5: number, t6: number, t7: number, t8: number, t9: number, t10: number, t11: number;
  let W0: number, W1: number, W2: number, W3: number, W4: number, W5: number, W6: number, W7: number, W8: number;

  ({ t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, W0, W1, W2, W3, W4, W5, W6, W7, W8 } = saturnianElements(jd));
  let eta = 92.39 + 0.5621071 * t6;
  let zeta = 148.19 - 19.18 * t8;
  let theta = 184.8 - 35.41 * t9;
  let theta_ = theta - 7.5;
  let as = 176 + 12.22 * t8;
  let bs = 8 + 24.44 * t8;
  let cs = bs + 5;
  let om = 68.898 - 18.67088 * t8;
  let phi = 2 * (om - W5);
  let chi = 94.9 - 2.292 * t8;
  let a = 24.50601 -
      0.08686 * cosD(eta) -
      0.00166 * cosD(zeta + eta) +
      0.00175 * cosD(zeta - eta);
  let e = 0.103458 -
      0.004099 * cosD(eta) -
      0.000167 * cosD(zeta + eta) +
      0.000235 * cosD(zeta - eta) +
      0.02303 * cosD(zeta) -
      0.00212 * cosD(2 * zeta) +
      0.000151 * cosD(3 * zeta) +
      0.00013 * sinD(phi);
  let p = om +
      0.15648 * sinD(chi) -
      0.4457 * sinD(eta) -
      0.2657 * sinD(zeta + eta) -
      0.3573 * sinD(zeta - eta) -
      12.872 * sinD(zeta) +
      1.668 * sinD(2 * zeta) -
      0.2419 * sinD(3 * zeta) -
      0.07 * sinD(phi);
  let lam_ = 177.047 +
      16.91993829 * t6 +
      0.15648 * sinD(chi) +
      9.142 * sinD(eta) +
      0.007 * sinD(2 * eta) -
      0.014 * sinD(3 * eta) +
      0.2275 * sinD(zeta + eta) +
      0.2112 * sinD(zeta - eta) -
      0.26 * sinD(zeta) -
      0.0098 * sinD(2 * zeta) -
      0.013 * sinD(as) +
      0.017 * sinD(bs) -
      0.0303 * sinD(phi);
  let i = 27.3347 + 0.643486 * cosD(chi) + 0.315 * cosD(W3) +
      0.018 * cosD(theta) - 0.018 * cosD(cs);
  let Om = 168.6812 + 1.40136 * cosD(chi) + 0.68599 * sinD(W3) -
      0.0392 * sinD(cs) + 0.0366 * sinD(theta_);

  let lam: number, gam: number, r: number, w: number;
  ({ lam, gam, r, w } = outerSaturnMoonParams(a, e, i, Om, lam_ - p, lam_));

  return saturnMoonPosition(lam, gam, w, r);
}

/** Iapetus: position relative to the parent planet, km, in Celestia's internal axes (x, y, z) = (X, Z, −Y). jd = TDB. */
export function iapetus(jd: number): Vec3 {
  // Computation will yield latitude(L), longitude(B) and distance(R)
  // relative to Saturn.
  let t1: number, t2: number, t3: number, t4: number, t5: number, t6: number, t7: number, t8: number, t9: number, t10: number, t11: number;
  let W0: number, W1: number, W2: number, W3: number, W4: number, W5: number, W6: number, W7: number, W8: number;

  ({ t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, W0, W1, W2, W3, W4, W5, W6, W7, W8 } = saturnianElements(jd));
  let L = 261.1582 + 22.57697855 * t4;
  let om_ = 91.796 + 0.562 * t7;
  let psi = 4.367 - 0.195 * t7;
  let theta = 146.819 - 3.198 * t7;
  let phi = 60.470 + 1.521 * t7;
  let Phi = 205.055 - 2.091 * t7;
  let e_ = 0.028298 + 0.001156 * t11;
  let om0 = 352.91 + 11.71 * t11;
  let mu = 76.3852 + 4.53795125 * t10;
  let i_ = 18.4602 - 0.9518 * t11 - 0.072 * sq(t11) +
      0.0054 * cube(t11);
  let Om_ = 143.198 - 3.919 * t11 + 0.116 * sq(t11) +
      0.008 * cube(t11);
  let l = mu - om0;
  let g = om0 - Om_ - psi;
  let g1 = om0 - Om_ - phi;
  let ls = W5 - om_;
  let gs = om_ - theta;
  let lT = L - W4;
  let gT = W4 - Phi;
  let u1 = 2 * (l + g - (ls + gs));
  let u2 = l + g1 - (lT + gT);
  let u3 = l + 2 * (g - (ls + gs));
  let u4 = lT + gT - g1;
  let u5 = 2 * (ls + gs);

  let a = 58.935028 + 0.004638 * cosD(u1) + 0.058222 * cosD(u2);
  let e = e_ -
      0.0014097 * cosD(g1 - gT) +
      0.0003733 * cosD(u5 - 2 * g) +
      0.0001180 * cosD(u3) +
      0.0002408 * cosD(l) +
      0.0002849 * cosD(l + u2) +
      0.0006190 * cosD(u4);
  let W = 0.08077 * sinD(g1 - gT) +
      0.02139 * sinD(u5 - 2 * g) -
      0.00676 * sinD(u3) +
      0.01380 * sinD(l) +
      0.01632 * sinD(l + u2) +
      0.03547 * sinD(u4);
  let p = om0 + W / e_;
  let lam_ = mu -
      0.04299 * sinD(u2) -
      0.00789 * sinD(u1) -
      0.06312 * sinD(ls) -
      0.00295 * sinD(2 * ls) -
      0.02231 * sinD(u5) +
      0.00650 * sinD(u5 + psi);
  let sum = l + g1 + lT + gT + phi;
  let i = i_ +
      0.04204 * cosD(u5 + psi) +
      0.00235 * cosD(sum) +
      0.00360 * cosD(u2 + phi);
  let w_ = 0.04204 * sinD(u5 + psi) +
      0.00235 * sinD(sum) +
      0.00358 * sinD(u2 + phi);
  let Om = Om_ + w_ / sinD(i_);

  let lam: number, gam: number, r: number, w: number;
  ({ lam, gam, r, w } = outerSaturnMoonParams(a, e, i, Om, lam_ - p, lam_));

  return saturnMoonPosition(lam, gam, w, r);
}

/**
 * Geocentric Moon from the series of J. Meeus, Astronomical Algorithms, ch. 47 (Chapront-Touzé & Chapront, ELP-2000/82
 * truncated). Ecliptic longitude and latitude [rad] refer to the mean equinox and ecliptic of the date; distance in km.
 * jd = TDB.
 */
export function lunarSeries(jd: number): { lon: number; lat: number; distanceKm: number } {
  let jd19: number, t: number, t2: number;
  let ld: number, ms: number, md: number, de: number, f: number, n: number, hp: number;
  let a: number, sa: number, sn: number, b: number, sb: number, c: number, sc: number, e: number, e2: number, l: number, g: number, w1: number, w2: number;
  let m1: number, m2: number, m3: number, m4: number, m5: number, m6: number;
  let eclLon: number, eclLat: number, horzPar: number, distance: number;
  let RA: number, dec: number;

  // Computation requires an abbreviated Julian day:
  // epoch January 0.5, 1900.
  jd19 = jd - 2415020.0;
  t = jd19/36525;
  t2 = t*t;

  m1 = jd19/27.32158213;
  m1 = 360.0*(m1-Math.trunc(m1));
  m2 = jd19/365.2596407;
  m2 = 360.0*(m2-Math.trunc(m2));
  m3 = jd19/27.55455094;
  m3 = 360.0*(m3-Math.trunc(m3));
  m4 = jd19/29.53058868;
  m4 = 360.0*(m4-Math.trunc(m4));
  m5 = jd19/27.21222039;
  m5 = 360.0*(m5-Math.trunc(m5));
  m6 = jd19/6798.363307;
  m6 = 360.0*(m6-Math.trunc(m6));

  ld = 270.434164+m1-(.001133-.0000019*t)*t2;
  ms = 358.475833+m2-(.00015+.0000033*t)*t2;
  md = 296.104608+m3+(.009192+.0000144*t)*t2;
  de = 350.737486+m4-(.001436-.0000019*t)*t2;
  f = 11.250889+m5-(.003211+.0000003*t)*t2;
  n = 259.183275-m6+(.002078+.000022*t)*t2;

  a = degToRad(51.2+20.2*t);
  sa = Math.sin(a);
  sn = Math.sin(degToRad(n));
  b = 346.56+(132.87-.0091731*t)*t;
  sb = .003964*Math.sin(degToRad(b));
  c = degToRad(n+275.05-2.3*t);
  sc = Math.sin(c);
  ld = ld+.000233*sa+sb+.001964*sn;
  ms = ms-.001778*sa;
  md = md+.000817*sa+sb+.002541*sn;
  f = f+sb-.024691*sn-.004328*sc;
  de = de+.002011*sa+sb+.001964*sn;
  e = 1-(.002495+7.52e-06*t)*t;
  e2 = e*e;

  ld = degToRad(ld);
  ms = degToRad(ms);
  n = degToRad(n);
  de = degToRad(de);
  f = degToRad(f);
  md = degToRad(md);

  l = 6.28875*Math.sin(md)+1.27402*Math.sin(2*de-md)+.658309*Math.sin(2*de)+
      .213616*Math.sin(2*md)-e*.185596*Math.sin(ms)-.114336*Math.sin(2*f)+
      .058793*Math.sin(2*(de-md))+.057212*e*Math.sin(2*de-ms-md)+
      .05332*Math.sin(2*de+md)+.045874*e*Math.sin(2*de-ms)+.041024*e*Math.sin(md-ms);
  l = l-.034718*Math.sin(de)-e*.030465*Math.sin(ms+md)+.015326*Math.sin(2*(de-f))-
      .012528*Math.sin(2*f+md)-.01098*Math.sin(2*f-md)+.010674*Math.sin(4*de-md)+
      .010034*Math.sin(3*md)+.008548*Math.sin(4*de-2*md)-e*.00791*Math.sin(ms-md+2*de)-
      e*.006783*Math.sin(2*de+ms);
  l = l+.005162*Math.sin(md-de)+e*.005*Math.sin(ms+de)+.003862*Math.sin(4*de)+
      e*.004049*Math.sin(md-ms+2*de)+.003996*Math.sin(2*(md+de))+
      .003665*Math.sin(2*de-3*md)+e*.002695*Math.sin(2*md-ms)+
      .002602*Math.sin(md-2*(f+de))+e*.002396*Math.sin(2*(de-md)-ms)-
      .002349*Math.sin(md+de);
  l = l+e2*.002249*Math.sin(2*(de-ms))-e*.002125*Math.sin(2*md+ms)-
      e2*.002079*Math.sin(2*ms)+e2*.002059*Math.sin(2*(de-ms)-md)-
      .001773*Math.sin(md+2*(de-f))-.001595*Math.sin(2*(f+de))+
      e*.00122*Math.sin(4*de-ms-md)-.00111*Math.sin(2*(md+f))+.000892*Math.sin(md-3*de);
  l = l-e*.000811*Math.sin(ms+md+2*de)+e*.000761*Math.sin(4*de-ms-2*md)+
      e2*.000704*Math.sin(md-2*(ms+de))+e*.000693*Math.sin(ms-2*(md-de))+
      e*.000598*Math.sin(2*(de-f)-ms)+.00055*Math.sin(md+4*de)+.000538*Math.sin(4*md)+
      e*.000521*Math.sin(4*de-ms)+.000486*Math.sin(2*md-de);
  l = l+e2*.000717*Math.sin(md-2*ms);
      eclLon = ld+degToRad(l);
      eclLon = pfmod(eclLon, TWOPI);

  g = 5.12819*Math.sin(f)+.280606*Math.sin(md+f)+.277693*Math.sin(md-f)+
      .173238*Math.sin(2*de-f)+.055413*Math.sin(2*de+f-md)+.046272*Math.sin(2*de-f-md)+
      .032573*Math.sin(2*de+f)+.017198*Math.sin(2*md+f)+.009267*Math.sin(2*de+md-f)+
      .008823*Math.sin(2*md-f)+e*.008247*Math.sin(2*de-ms-f);
  g = g+.004323*Math.sin(2*(de-md)-f)+.0042*Math.sin(2*de+f+md)+
      e*.003372*Math.sin(f-ms-2*de)+e*.002472*Math.sin(2*de+f-ms-md)+
      e*.002222*Math.sin(2*de+f-ms)+e*.002072*Math.sin(2*de-f-ms-md)+
      e*.001877*Math.sin(f-ms+md)+.001828*Math.sin(4*de-f-md)-e*.001803*Math.sin(f+ms)-
      .00175*Math.sin(3*f);
  g = g+e*.00157*Math.sin(md-ms-f)-.001487*Math.sin(f+de)-e*.001481*Math.sin(f+ms+md)+
      e*.001417*Math.sin(f-ms-md)+e*.00135*Math.sin(f-ms)+.00133*Math.sin(f-de)+
      .001106*Math.sin(f+3*md)+.00102*Math.sin(4*de-f)+.000833*Math.sin(f+4*de-md)+
      .000781*Math.sin(md-3*f)+.00067*Math.sin(f+4*de-2*md);
  g = g+.000606*Math.sin(2*de-3*f)+.000597*Math.sin(2*(de+md)-f)+
      e*.000492*Math.sin(2*de+md-ms-f)+.00045*Math.sin(2*(md-de)-f)+
      .000439*Math.sin(3*md-f)+.000423*Math.sin(f+2*(de+md))+
      .000422*Math.sin(2*de-f-3*md)-e*.000367*Math.sin(ms+f+2*de-md)-
      e*.000353*Math.sin(ms+f+2*de)+.000331*Math.sin(f+4*de);
  g = g+e*.000317*Math.sin(2*de+f-ms+md)+e2*.000306*Math.sin(2*(de-ms)-f)-
      .000283*Math.sin(md+3*f);
  w1 = .0004664*Math.cos(n);
  w2 = .0000754*Math.cos(c);
  eclLat = degToRad(g)*(1-w1-w2);

  hp = .950724+.051818*Math.cos(md)+.009531*Math.cos(2*de-md)+.007843*Math.cos(2*de)+
       .002824*Math.cos(2*md)+.000857*Math.cos(2*de+md)+e*.000533*Math.cos(2*de-ms)+
       e*.000401*Math.cos(2*de-md-ms)+e*.00032*Math.cos(md-ms)-.000271*Math.cos(de)-
       e*.000264*Math.cos(ms+md)-.000198*Math.cos(2*f-md);
  hp = hp+.000173*Math.cos(3*md)+.000167*Math.cos(4*de-md)-e*.000111*Math.cos(ms)+
       .000103*Math.cos(4*de-2*md)-.000084*Math.cos(2*md-2*de)-
       e*.000083*Math.cos(2*de+ms)+.000079*Math.cos(2*de+2*md)+.000072*Math.cos(4*de)+
       e*.000064*Math.cos(2*de-ms+md)-e*.000063*Math.cos(2*de+ms-md)+
       e*.000041*Math.cos(ms+de);
  hp = hp+e*.000035*Math.cos(2*md-ms)-.000033*Math.cos(3*md-2*de)-
       .00003*Math.cos(md+de)-.000029*Math.cos(2*(f-de))-e*.000029*Math.cos(2*md+ms)+
       e2*.000026*Math.cos(2*(de-ms))-.000023*Math.cos(2*(f-de)+md)+
       e*.000019*Math.cos(4*de-ms-md);
  horzPar = degToRad(hp);

  // At this point we have values of ecliptic longitude, latitude and
  // horizontal parallax (eclLong, eclLat, horzPar) in radians.

  // Now compute distance using horizontal parallax.
  distance = 6378.14 / Math.sin(horzPar);
  return { lon: eclLon, lat: eclLat, distanceKm: distance };
}

/** Sidereal orbital periods [days] as quoted by Celestia. */
export const THEORY_PERIOD_DAYS = {
  io: 1.769138,
  europa: 3.5511810791,
  ganymede: 7.154553,
  callisto: 16.689018,
  mimas: 0.9424218,
  enceladus: 1.370218,
  tethys: 1.887802,
  dione: 2.736915,
  rhea: 4.517500,
  titan: 15.94544758,
  hyperion: 21.276609,
  iapetus: 79.330183,
} as const;

/** GUST86 tables (Laskar & Jacobson 1987), one entry per moon: Miranda, Ariel, Umbriel, Titania, Oberon. */
export const GUST86 = {
  n: [ 4.44352267, 2.49254257, 1.51595490, 0.72166316, 0.46658054 ],
  a: [ 129800, 191200, 266000, 435800, 583600 ],
  L0: [ -0.23805158, 3.09804641, 2.28540169, 0.85635879, -0.91559180 ],
  L1: [ 4.44519055, 2.49295252, 1.51614811, 0.72171851, 0.46669212 ],
  L_k: [ [ 0.02547217, -0.00308831, -3.181e-4 ], [ -1.86050e-3, 2.1999e-4, 0 ], [ 6.6057e-4, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ] ],
  L_theta: [ [ -2.18167e-4, -4.36336e-4, -6.54502e-4 ], [ -2.18167e-4, -4.36336e-4, 0 ], [ -2.18167e-4, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ] ],
  L_phi: [ [ 1.32, 2.64, 3.97 ], [ 1.32, 2.64, 0 ], [ 1.32, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ] ],
  z_k: [ [ 1.31238e-3, -1.2331e-4, -1.9410e-4, 0, 0 ], [ 1.18763e-3, 8.6159e-4, 0, 0, 0 ], [ -2.2795e-4, 3.90496e-3, 3.0917e-4, 2.2192e-4, 5.4923e-4 ], [ 9.3281e-4, 1.12089e-3, 7.9343e-4, 0, 0 ], [ -7.5868e-4, 1.39734e-3, -9.8726e-4, 0, 0 ] ],
  z_theta: [ [ 1.5273e-4, 0.08606, 0.709, 0, 0 ], [ 4.727824e-5, 2.179316e-5, 0, 0, 0 ], [ 4.727824e-5, 2.179132e-5, 1.580524e-5, 2.9363068e-6, -0.01157 ], [ 1.580524e-5, 2.9363068e-6, -6.9008e-3, 0, 0 ], [ 1.580524e-5, 2.9363068e-6, -6.9008e-3, 0, 0 ] ],
  z_phi: [ [ 0.61, 0.15, 6.04, 0, 0 ], [ 2.41, 2.07, 0, 0, 0 ], [ 2.41, 2.07, 0.74, 0.43, 5.71 ], [ 0.74, 0.43, 1.82, 0, 0 ], [ 0.74, 0.43, 1.82, 0, 0 ] ],
  zeta_k: [ [ 0.03787171, 0 ], [ 3.5825e-4, 2.9008e-4 ], [ 1.11336e-3, 3.5014e-4 ], [ 6.8572e-4, 3.7832e-4 ], [ -5.9633e-4, 4.5169e-4 ] ],
  zeta_theta: [ [ -1.54449e-4, 0 ], [ -4.782474e-5, -2.156628e-5 ], [ -2.156628e-5, -1.401373e-5 ], [ -1.401373e-5, -1.9713918e-6 ], [ -1.401373e-5, -1.9713918e-6 ] ],
  zeta_phi: [ [ 5.70, 0 ], [ 0.40, 0.59 ], [ 0.59, 1.75 ], [ 1.75, 4.21 ], [ 1.75, 4.21 ]],
} as const;
