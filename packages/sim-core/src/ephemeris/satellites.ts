/**
 * Natural satellites of the planets: positions relative to the parent planet's centre, in the J2000 ecliptic
 * frame, from the analytic theories bundled with Celestia.
 *
 *  - Moon: Meeus ch. 47 series (ELP-2000/82 truncated)
 *  - Io … Callisto: Meeus ch. 44 (Sampson/Lieske theory)
 *  - Mimas … Iapetus: Dourneau's theory (Meeus ch. 46)
 *  - Ariel … Oberon: GUST86 (Laskar & Jacobson 1987)
 *  - Triton: Emelyanov & Samorodov (2015), MNRAS 454, 2205
 *
 * The raw theories live in satelliteTheories.ts (generated from Celestia). Here they are placed in the J2000
 * ecliptic frame: the Jovian, Saturnian and Uranian outputs are in the parent's equatorial frame, whose pole
 * comes from the IAU model and whose single reference longitude φ₀ (and, for Jupiter, the drift with the equinox)
 * is a constant of each theory - not given in the Celestia source, since the frame is declared in its data files,
 * so it was determined against JPL Horizons and is re-derived by the test suite (satellites-e1.test.ts).
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * Copyright (C) 2026, the USAC SimLab team. Derived from Celestia 1.7.0, src/celephem/customorbit.cpp
 * (Copyright (C) 2001, Chris Laurel and the Celestia Development Team): the Moon's frame conversion, GUST86 and
 * Triton are rewritten from the C++ in TypeScript, the others come from satelliteTheories.ts. See NOTICE.md.
 *
 * Not included: Phobos and Deimos (Celestia's secular theory errs by 4–22° over 1900–2100), Miranda (≈ 9°, a phase
 * error in the truncated GUST86 data) and Hyperion (chaotic, ≈ 1.8°). Measured errors: docs/validation/E1-moons.json.
 */
import { DEG } from '../units/convert';
import { JD_J2000 } from '../units/constants';
import type { Vec3 } from '../math/vec';
import * as T from './satelliteTheories';
import {
  EQUATORIAL_TO_ECLIPTIC, equatorFrameToEquatorial, iauOrientation, matMul, matVec, precessionLongitudeDeg, rotationZ, type Mat3,
} from './rotation';

export type SatelliteId =
  | 'moon' | 'io' | 'europa' | 'ganymede' | 'callisto'
  | 'mimas' | 'enceladus' | 'tethys' | 'dione' | 'rhea' | 'titan' | 'iapetus'
  | 'ariel' | 'umbriel' | 'titania' | 'oberon' | 'triton';

export type ParentId = 'earth' | 'jupiter' | 'saturn' | 'uranus' | 'neptune';

export interface SatelliteInfo {
  id: SatelliteId;
  parent: ParentId;
  /** Mean radius [km] (display only). */
  radiusKm: number;
  /** Sidereal period [days]. */
  periodDays: number;
}

// TODO: cần xác minh - radii are NASA/JPL satellite fact-sheet values used for drawing sizes only; no physics depends on them.
export const SATELLITES: SatelliteInfo[] = [
  { id: 'moon', parent: 'earth', radiusKm: 1737.4, periodDays: 27.321661 },
  { id: 'io', parent: 'jupiter', radiusKm: 1821.6, periodDays: T.THEORY_PERIOD_DAYS.io },
  { id: 'europa', parent: 'jupiter', radiusKm: 1560.8, periodDays: T.THEORY_PERIOD_DAYS.europa },
  { id: 'ganymede', parent: 'jupiter', radiusKm: 2634.1, periodDays: T.THEORY_PERIOD_DAYS.ganymede },
  { id: 'callisto', parent: 'jupiter', radiusKm: 2410.3, periodDays: T.THEORY_PERIOD_DAYS.callisto },
  { id: 'mimas', parent: 'saturn', radiusKm: 198.2, periodDays: T.THEORY_PERIOD_DAYS.mimas },
  { id: 'enceladus', parent: 'saturn', radiusKm: 252.1, periodDays: T.THEORY_PERIOD_DAYS.enceladus },
  { id: 'tethys', parent: 'saturn', radiusKm: 531.1, periodDays: T.THEORY_PERIOD_DAYS.tethys },
  { id: 'dione', parent: 'saturn', radiusKm: 561.4, periodDays: T.THEORY_PERIOD_DAYS.dione },
  { id: 'rhea', parent: 'saturn', radiusKm: 763.8, periodDays: T.THEORY_PERIOD_DAYS.rhea },
  { id: 'titan', parent: 'saturn', radiusKm: 2574.7, periodDays: T.THEORY_PERIOD_DAYS.titan },
  { id: 'iapetus', parent: 'saturn', radiusKm: 734.5, periodDays: T.THEORY_PERIOD_DAYS.iapetus },
  ...(['ariel', 'umbriel', 'titania', 'oberon'] as const).map((id, k) => ({
    id, parent: 'uranus' as const, radiusKm: [578.9, 584.7, 788.9, 761.4][k], periodDays: (2 * Math.PI) / T.GUST86.n[k + 1],
  })),
  { id: 'triton', parent: 'neptune', radiusKm: 1353.4, periodDays: 5.87685421025 },
];

export const satellitesOf = (parent: ParentId) => SATELLITES.filter((s) => s.parent === parent);

/**
 * Largest angular error [deg, seen from the parent] of each theory against JPL Horizons over 1900–2100, rounded up
 * (docs/validation/E1-moons.json; satellites-e1 tests keep this table within 15 % of the measurement).
 */
export const SATELLITE_ERROR_DEG: Record<SatelliteId, number> = {
  moon: 0.007, io: 0.17, europa: 0.13, ganymede: 0.19, callisto: 0.11,
  mimas: 0.69, enceladus: 0.22, tethys: 0.11, dione: 0.11, rhea: 1.09, titan: 0.17, iapetus: 0.36,
  ariel: 0.81, umbriel: 1.2, titania: 0.81, oberon: 0.71, triton: 1.15,
};

/** Years over which the satellite theories were checked against Horizons; outside them errors are not characterised. */
export const SATELLITE_VALID_YEARS: [number, number] = [1900, 2100];

// ── small rotation helpers in Celestia's internal axes (x, y, z) = (X, Z, −Y), right-handed ──────────
type M = Mat3;
const rotY = (a: number): M => [[Math.cos(a), 0, Math.sin(a)], [0, 1, 0], [-Math.sin(a), 0, Math.cos(a)]];
const rotXi = (a: number): M => [[1, 0, 0], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]];
const mul3 = (...ms: M[]): M => ms.reduce((a, b) => matMul(a, b));
/** Celestia internal axes → standard (X, Y, Z) of the same frame. */
const std = (v: readonly [number, number, number]): Vec3 => [v[0], -v[2], v[1]];
const toEcliptic = (equatorial: Vec3): Vec3 => matVec(EQUATORIAL_TO_ECLIPTIC, equatorial);

// ── Moon ───────────────────────────────────────────────────────────────────────────────────────
/** Mean obliquity of the ecliptic of the date [rad], t in Julian centuries since 1900 (as used by the series). */
const obliquity1900 = (t: number) => (23.452_294_44 - ((((-1.81e-3 * t) + 5.9e-3) * t + 4.6845e1) * t) / 3600) * DEG;

/** Equatorial coordinates of date → J2000 (Meeus 1998, ch. 21, rigorous formulae). */
function epochToJ2000(jd: number, ra0: number, dec0: number): [number, number] {
  const T0 = (jd - JD_J2000) / 36525;
  const t = (JD_J2000 - jd) / 36525;
  const s = (x: number) => (x * DEG) / 3600;
  const zeta = s((2306.2181 + 1.39656 * T0 - 0.000139 * T0 * T0) * t + (0.30188 - 0.000344 * T0) * t * t + 0.017998 * t * t * t);
  const z = s((2306.2181 + 1.39656 * T0 - 0.000139 * T0 * T0) * t + (1.09468 + 0.000066 * T0) * t * t + 0.018203 * t * t * t);
  const theta = s((2004.3109 - 0.8533 * T0 - 0.000217 * T0 * T0) * t - (0.42665 + 0.000217 * T0) * t * t - 0.041833 * t * t * t);
  const A = Math.cos(dec0) * Math.sin(ra0 + zeta);
  const B = Math.cos(theta) * Math.cos(dec0) * Math.cos(ra0 + zeta) - Math.sin(theta) * Math.sin(dec0);
  const C = Math.sin(theta) * Math.cos(dec0) * Math.cos(ra0 + zeta) + Math.cos(theta) * Math.sin(dec0);
  return [Math.atan2(A, B) + z, Math.asin(C)];
}

function moon(jd: number): Vec3 {
  const { lon, lat, distanceKm } = T.lunarSeries(jd);
  const eps = obliquity1900((jd - 2415020.0) / 36525);
  // ecliptic of date → equatorial of date (mean obliquity) → J2000 equatorial → J2000 ecliptic
  const ra = Math.atan2(Math.sin(lon) * Math.cos(eps) - Math.tan(lat) * Math.sin(eps), Math.cos(lon));
  const dec = Math.asin(Math.sin(lat) * Math.cos(eps) + Math.cos(lat) * Math.sin(eps) * Math.sin(lon));
  const [a, d] = epochToJ2000(jd, ra, dec);
  return toEcliptic([distanceKm * Math.cos(d) * Math.cos(a), distanceKm * Math.cos(d) * Math.sin(a), distanceKm * Math.sin(d)]);
}

// ── Uranian moons: GUST86 ──────────────────────────────────────────────────────────────────────
function uranian(k: number, jd: number): Vec3 {
  const G = T.GUST86;
  const t = jd - 2444239.5;
  let L = G.L0[k] + G.L1[k] * t;
  for (let i = 0; i < 3; i++) L += G.L_k[k][i] * Math.sin(G.L_theta[k][i] * t + G.L_phi[k][i]);
  let a0 = 0, a1 = 0;
  for (let i = 0; i < 5; i++) { const w = G.z_theta[k][i] * t + G.z_phi[k][i]; a0 += G.z_k[k][i] * Math.cos(w); a1 += G.z_k[k][i] * Math.sin(w); }
  let b0 = 0, b1 = 0;
  for (let i = 0; i < 2; i++) { const w = G.zeta_theta[k][i] * t + G.zeta_phi[k][i]; b0 += G.zeta_k[k][i] * Math.cos(w); b1 += G.zeta_k[k][i] * Math.sin(w); }
  const e = Math.sqrt(a0 * a0 + a1 * a1);
  const p = Math.atan2(a1, a0);
  const gamma = 2 * Math.asin(Math.sqrt(b0 * b0 + b1 * b1));
  const theta = Math.atan2(b1, b0);
  L += 174.99 * DEG;
  const Mm = L - p;
  let ecc = Mm;
  for (let i = 0; i < 4; i++) ecc = Mm + e * Math.sin(ecc);
  const a = G.a[k];
  const x = a * (Math.cos(ecc) - e);
  const z = a * Math.sqrt(1 - e * e) * -Math.sin(ecc);
  const R = mul3(rotY(theta), rotXi(gamma), rotY(p - theta));
  return std(matVec(R, [x, 0, z]));
}

// ── Triton (Emelyanov & Samorodov 2015) ────────────────────────────────────────────────────────
const TRITON_KI = [0.0, 0.00096486, 0.00664662, 0.00004687, 0.00095975, -0.00037627, -0.00000225];
const TRITON_KU = [-0.00012327, -0.00279453, -0.04335625, -0.00017215, -0.00233686, 0.00170605, 0.00000730];
const TRITON_KOMEGA = [0.00063339, -0.00178908, -0.01560110, -0.00009186, -0.00218071, 0.00096231, 0.00000536];
const TRITON_K1 = [2, 2, 0, -2, 2, 0, -2];
const TRITON_K2 = [0, 1, 1, 1, 2, 2, 2];

function triton(jd: number): Vec3 {
  // Sun's relative motion around Neptune (INPOP10) and Triton's mean motion, as in Celestia
  const OmegaSun = 200.788181, u0Sun = 258.727508, duSun = 0.00598084154;
  const a = 354696.76, I0 = 157.268439, u0 = 31.791760, du = 61.25871809, Omega0 = 73.395781, dOmega = 0.001452458;
  const alpha0 = 299.090 * DEG, delta0 = 43.019 * DEG;
  const t0 = 2378520.5, ts = 2451545.0;
  const t = jd - t0;
  const uSun = u0Sun + duSun * (jd - ts);
  let Omega = Omega0 + dOmega * t;
  let dI = 0, du_ = 0, dOm = 0;
  for (let i = 0; i < 7; i++) {
    const arg = (TRITON_K1[i] * uSun + TRITON_K2[i] * (OmegaSun - Omega)) * DEG;
    dI += TRITON_KI[i] * Math.cos(arg);
    du_ += TRITON_KU[i] * Math.sin(arg);
    dOm += TRITON_KOMEGA[i] * Math.sin(arg);
  }
  const I = (I0 + dI) * DEG;
  const u = (u0 + du * t + du_) * DEG;
  Omega = (Omega + dOm) * DEG;
  const x = a * (Math.cos(u) * Math.cos(Omega) - Math.sin(u) * Math.sin(Omega) * Math.cos(I));
  const y = a * (Math.cos(u) * Math.sin(Omega) + Math.sin(u) * Math.cos(Omega) * Math.cos(I));
  const z = a * Math.sin(u) * Math.sin(I);
  // rotate to the Earth's equatorial plane (J2000), then to the ecliptic
  const sA = Math.sin(alpha0), cA = Math.cos(alpha0), sD = Math.sin(delta0), cD = Math.cos(delta0);
  const xg = -sA * x - cA * sD * y + cA * cD * z;
  const yg = cA * x - sA * sD * y + sA * cD * z;
  const zg = cD * y + sD * z;
  return toEcliptic([xg, yg, zg]);
}

// ── Jovian, Saturnian and Uranian systems: parent-equatorial frame → ecliptic ──────────────────
/**
 * Reference longitude φ₀ [deg] of each theory's x axis, measured from the ascending node of the parent's equator,
 * and whether the theory's longitudes follow the equinox of date (Jupiter: L carries the general precession).
 * Determined by least squares against JPL Horizons (1900–2100) - see satellites-e1.test.ts, which re-derives them.
 */
export const THEORY_FRAME: Record<'jupiter' | 'saturn' | 'uranus', { spinDeg: number; followsEquinox: boolean; flipped: boolean }> = {
  jupiter: { spinDeg: -20.445, followsEquinox: true, flipped: false },
  saturn: { spinDeg: 39.925, followsEquinox: false, flipped: false },
  // GUST86 uses the pole opposite to the IAU's positive pole of Uranus (the planet rotates retrograde)
  uranus: { spinDeg: 4.68, followsEquinox: false, flipped: true },
};

/** Matrix from a theory's parent-equatorial frame (standard axes) to the J2000 ecliptic. */
export function theoryFrame(parent: 'jupiter' | 'saturn' | 'uranus', jdTt: number, spinDeg = THEORY_FRAME[parent].spinDeg): Mat3 {
  const o = iauOrientation(parent, jdTt);
  const f = THEORY_FRAME[parent];
  const precession = f.followsEquinox ? precessionLongitudeDeg((jdTt - JD_J2000) / 36525) : 0;
  const [ra, dec] = f.flipped ? [o.poleRaDeg + 180, -o.poleDecDeg] : [o.poleRaDeg, o.poleDecDeg];
  return matMul(EQUATORIAL_TO_ECLIPTIC, matMul(equatorFrameToEquatorial(ra, dec), rotationZ((spinDeg - precession) * DEG)));
}

const RAW: Partial<Record<SatelliteId, (jd: number) => Vec3>> = {
  io: T.io, europa: T.europa, ganymede: T.ganymede, callisto: T.callisto,
  mimas: T.mimas, enceladus: T.enceladus, tethys: T.tethys, dione: T.dione, rhea: T.rhea, titan: T.titan, iapetus: T.iapetus,
};
/** Index into the GUST86 tables (0 = Miranda, not used). */
const URANIAN: Partial<Record<SatelliteId, number>> = { ariel: 1, umbriel: 2, titania: 3, oberon: 4 };

/** Raw theory output of an equatorial-frame theory in standard axes [km] (before the frame matrix). */
export function satelliteEquatorialFrameVector(id: SatelliteId, jdTt: number): Vec3 {
  const k = URANIAN[id];
  if (k !== undefined) return uranian(k, jdTt);
  const f = RAW[id];
  if (!f) throw new Error(`satellite ${id} is not an equatorial-frame theory`);
  return std(f(jdTt));
}

/** Position [km] of a satellite relative to its parent planet's centre, J2000 ecliptic, jdTt = TT Julian date. */
export function satellitePosition(id: SatelliteId, jdTt: number): Vec3 {
  switch (id) {
    case 'moon': return moon(jdTt);
    case 'triton': return triton(jdTt);
    default: {
      const parent = SATELLITES.find((s) => s.id === id)!.parent as 'jupiter' | 'saturn' | 'uranus';
      return matVec(theoryFrame(parent, jdTt), satelliteEquatorialFrameVector(id, jdTt));
    }
  }
}

/** Closed orbit polyline [km, relative to the parent] over one period, centred on jdTt. */
export function satelliteOrbitPath(id: SatelliteId, jdTt: number, n = 128): Vec3[] {
  const period = SATELLITES.find((s) => s.id === id)!.periodDays;
  const pts: Vec3[] = [];
  for (let k = 0; k <= n; k++) pts.push(satellitePosition(id, jdTt + (k / n) * period));
  return pts;
}
