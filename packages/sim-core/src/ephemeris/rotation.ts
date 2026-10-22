/**
 * Orientation of the planets and large moons from the IAU rotation models (pole of rotation and prime meridian).
 *
 * Convention (IAU WGCCRE): the body-fixed frame has its z axis on the north pole (α₀, δ₀ in the J2000 equatorial
 * frame) and its x axis on the prime meridian. The rotation from body-fixed to J2000 equatorial coordinates is
 *     R = Rz(α₀ + 90°) · Rx(90° − δ₀) · Rz(W).
 * Composing with Rx(−ε) gives the J2000 ecliptic frame used by the rest of sim-core.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * Copyright (C) 2026, the USAC SimLab team. The model data (iauRotationData.ts) is derived from Celestia 1.7.0,
 * src/celephem/customrotation.cpp (Copyright (C) 2008-2009, the Celestia Development Team); see NOTICE.md.
 */
import { DEG } from '../units/convert';
import { JD_J2000 } from '../units/constants';
import { OBLIQUITY_J2000_DEG } from '../units/constants';
import { IAU_ROTATION, type IauModel } from './iauRotationData';

/** General precession in ecliptic longitude [deg] from J2000 to the date, T in Julian centuries (Meeus 1998, ch. 21). */
export const precessionLongitudeDeg = (T: number) => (5028.796_195 * T + 1.105_434_8 * T * T) / 3600;

export type Mat3 = [[number, number, number], [number, number, number], [number, number, number]];

export interface Orientation {
  /** Right ascension and declination of the north pole, J2000 equatorial [deg]. */
  poleRaDeg: number;
  poleDecDeg: number;
  /** Prime meridian angle W [deg]. */
  primeMeridianDeg: number;
}

/** IAU (2009) model of the Earth: α₀ = −0.641 T, δ₀ = 90° − 0.557 T, W = 190.147° + 360.9856235° d (UT1). */
const EARTH: IauModel = {
  rateDegPerDay: 360.9856235,
  pole: (d) => { const T = Math.max(-50, Math.min(50, d / 36525)); return [0 - 0.641 * T, 90 - 0.557 * T]; },
  meridian: (d) => 190.147 + 360.9856235 * d,
};

export type OrientedBody = 'earth' | keyof typeof IAU_ROTATION;

export function hasOrientation(body: string): body is OrientedBody {
  return body === 'earth' || body in IAU_ROTATION;
}

/**
 * Pole and prime meridian of a body at a TT Julian date. For the Earth W follows UT1, so pass `jdUt` as well
 * (the 69 s difference would otherwise turn the globe by 0.29°).
 */
export function iauOrientation(body: OrientedBody, jdTt: number, jdUt = jdTt): Orientation {
  const model = body === 'earth' ? EARTH : IAU_ROTATION[body];
  const [ra, dec] = model.pole(jdTt - JD_J2000);
  const w = model.meridian(body === 'earth' ? jdUt - JD_J2000 : jdTt - JD_J2000);
  return { poleRaDeg: ra, poleDecDeg: dec, primeMeridianDeg: ((w % 360) + 360) % 360 };
}

const rz = (a: number): Mat3 => [[Math.cos(a), -Math.sin(a), 0], [Math.sin(a), Math.cos(a), 0], [0, 0, 1]];
const rx = (a: number): Mat3 => [[1, 0, 0], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]];
export const matMul = (A: Mat3, B: Mat3): Mat3 =>
  A.map((r) => [0, 1, 2].map((j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j])) as Mat3;
export const matVec = (A: Mat3, v: readonly [number, number, number]): [number, number, number] => [
  A[0][0] * v[0] + A[0][1] * v[1] + A[0][2] * v[2],
  A[1][0] * v[0] + A[1][1] * v[1] + A[1][2] * v[2],
  A[2][0] * v[0] + A[2][1] * v[1] + A[2][2] * v[2],
];
export const rotationZ = rz;
export const rotationX = rx;

/** Rotation from the frame whose x axis is the equator's ascending node on the J2000 equator (no spin) to J2000 equatorial. */
export function equatorFrameToEquatorial(poleRaDeg: number, poleDecDeg: number): Mat3 {
  return matMul(rz((poleRaDeg + 90) * DEG), rx((90 - poleDecDeg) * DEG));
}

/** Body-fixed → J2000 equatorial. */
export function bodyToEquatorial(o: Orientation): Mat3 {
  return matMul(equatorFrameToEquatorial(o.poleRaDeg, o.poleDecDeg), rz(o.primeMeridianDeg * DEG));
}

/** J2000 equatorial → J2000 ecliptic. */
export const EQUATORIAL_TO_ECLIPTIC: Mat3 = rx(-OBLIQUITY_J2000_DEG * DEG);

/** Body-fixed → J2000 ecliptic. */
export function bodyToEcliptic(o: Orientation): Mat3 {
  return matMul(EQUATORIAL_TO_ECLIPTIC, bodyToEquatorial(o));
}

/** Unit vector of the north pole in the J2000 ecliptic frame. */
export function poleEcliptic(o: Orientation): [number, number, number] {
  return matVec(bodyToEcliptic({ ...o, primeMeridianDeg: 0 }), [0, 0, 1]);
}

const modelOf = (body: OrientedBody): IauModel => (body === 'earth' ? EARTH : IAU_ROTATION[body]);

/** Sidereal rotation period [hours] from the model's mean rate (Earth 23.934 h, Mercury 1407.5 h, Jupiter 9.925 h). */
export function rotationPeriodHours(body: OrientedBody): number {
  return (24 * 360) / Math.abs(modelOf(body).rateDegPerDay);
}

/** True when the body rotates retrograde (prime meridian decreasing: Venus, Uranus, Triton, the Uranian moons…). */
export function isRetrogradeRotator(body: OrientedBody): boolean {
  const m = modelOf(body);
  return m.meridian(0.001) < m.meridian(0);
}
