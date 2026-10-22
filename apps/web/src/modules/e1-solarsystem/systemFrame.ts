/**
 * Geometry of the E1 scene at one instant: where each body is drawn, how it is oriented and which bodies shade it.
 * Pure functions (no three.js, no React) so they can be tested. All physics is in @usac/sim-core; this file only maps
 * ecliptic-J2000 quantities to scene axes (x = ecl x, y = ecl z, z = −ecl y) and to the exaggerated drawing scale.
 *
 * Shadows are evaluated in real kilometres (see celestiaShaders.ts), independent of the drawing scale.
 */
import {
  PLANETS, SATELLITES, AU, planetState, iauOrientation, bodyToEcliptic, satellitePosition, satellitesOf, jdUtToTt,
  type PlanetId, type SatelliteId, type ParentId, type EphemerisModel, type Vec3, type Mat3,
} from '@usac/sim-core';

export const AU_KM = AU / 1000;
export type DistanceMode = 'log' | 'linear';
export type SizeMode = 'big' | 'true';

export const eclToScene = (v: Vec3, s = 1): Vec3 => [v[0] * s, v[2] * s, -v[1] * s];

/** Heliocentric position [au, ecliptic] → drawing position (10 units/au linear, or 16·log10(1 + r/0.25) compressed). */
export function mapDistance(helioAu: Vec3, mode: DistanceMode): Vec3 {
  if (mode === 'linear') return eclToScene(helioAu, 10);
  const r = Math.hypot(helioAu[0], helioAu[1], helioAu[2]) || 1e-9;
  return eclToScene(helioAu, (16 * Math.log10(1 + r / 0.25)) / r);
}

/** Scene units per km used for true-size drawing (near-Sun slope in compressed mode). */
export const sceneUnitsPerKm = (mode: DistanceMode) => (mode === 'linear' ? 10 : 16 / 0.25 / Math.LN10) / AU_KM;

export function visualRadius(kind: 'sun' | 'planet' | 'moon', km: number, size: SizeMode, dist: DistanceMode): number {
  if (size === 'true') return Math.max(km * sceneUnitsPerKm(dist), kind === 'sun' ? 0.01 : 0.0000004);
  if (kind === 'sun') return 1.1;
  if (kind === 'planet') return 0.18 + 0.12 * Math.log10(km / 2000);
  return 0.06 + 0.05 * Math.log10(km / 100);
}

/** Scene offset of a moon from its planet: true scale, or compressed in planet radii (direction kept exact). */
export function moonOffset(relKm: Vec3, planetRadiusKm: number, planetVisual: number, size: SizeMode, dist: DistanceMode): Vec3 {
  const rho = Math.hypot(relKm[0], relKm[1], relKm[2]);
  if (size === 'true') return eclToScene(relKm, sceneUnitsPerKm(dist));
  const d = planetVisual * (1.25 + 1.6 * Math.log(Math.max(rho / planetRadiusKm, 1.01)));
  return eclToScene(relKm, d / rho);
}

/** Rotation matrix (scene axes) of a body from its body-fixed → ecliptic matrix, for a sphere whose poles lie on local y. */
export function sceneRotation(R: Mat3): Mat3 {
  // local (x, y, z) = (x_b, z_b, −y_b); scene s = P·e with P the same mapping, so M = P·R·Pᵀ
  const P: Mat3 = [[1, 0, 0], [0, 0, 1], [0, -1, 0]];
  const PT: Mat3 = [[1, 0, 0], [0, 0, -1], [0, 1, 0]];
  const mul = (A: Mat3, B: Mat3): Mat3 => A.map((r) => [0, 1, 2].map((j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j])) as Mat3;
  return mul(P, mul(R, PT));
}

/** Unit quaternion [x, y, z, w] of a rotation matrix. */
export function matrixToQuaternion(m: Mat3): [number, number, number, number] {
  const tr = m[0][0] + m[1][1] + m[2][2];
  let x: number, y: number, z: number, w: number;
  if (tr > 0) {
    const s = Math.sqrt(tr + 1) * 2;
    w = 0.25 * s; x = (m[2][1] - m[1][2]) / s; y = (m[0][2] - m[2][0]) / s; z = (m[1][0] - m[0][1]) / s;
  } else if (m[0][0] > m[1][1] && m[0][0] > m[2][2]) {
    const s = Math.sqrt(1 + m[0][0] - m[1][1] - m[2][2]) * 2;
    w = (m[2][1] - m[1][2]) / s; x = 0.25 * s; y = (m[0][1] + m[1][0]) / s; z = (m[0][2] + m[2][0]) / s;
  } else if (m[1][1] > m[2][2]) {
    const s = Math.sqrt(1 + m[1][1] - m[0][0] - m[2][2]) * 2;
    w = (m[0][2] - m[2][0]) / s; x = (m[0][1] + m[1][0]) / s; y = 0.25 * s; z = (m[1][2] + m[2][1]) / s;
  } else {
    const s = Math.sqrt(1 + m[2][2] - m[0][0] - m[1][1]) * 2;
    w = (m[1][0] - m[0][1]) / s; x = (m[0][2] + m[2][0]) / s; y = (m[1][2] + m[2][1]) / s; z = 0.25 * s;
  }
  return [x, y, z, w];
}

export interface Occluder { /** km relative to the shaded body's centre, scene axes */ pos: Vec3; radiusKm: number }

export interface BodyFrame {
  id: PlanetId | SatelliteId;
  position: Vec3;
  quat: [number, number, number, number];
  radiusVisual: number;
  radiusKm: number;
  /** Unit vector towards the Sun, and the Sun's distance [km], at the body. */
  sunDir: Vec3;
  sunDistKm: number;
  occluders: Occluder[];
}

export interface PlanetFrame extends BodyFrame {
  id: PlanetId;
  helioAu: Vec3;
  velocityAuDay: Vec3;
}

export interface MoonFrame extends BodyFrame {
  id: SatelliteId;
  parent: ParentId;
  /** Position relative to the parent [km, ecliptic J2000]. */
  relKm: Vec3;
  /** Scene offset from the parent. */
  offset: Vec3;
}

export interface SystemFrame {
  jdUt: number;
  jdTt: number;
  planets: Record<PlanetId, PlanetFrame>;
  /** Moons of the planet whose system is shown (empty if none). */
  moons: MoonFrame[];
}

export interface FrameParams { dist: DistanceMode; size: SizeMode; model: EphemerisModel; system: ParentId | null }

const MAX_OCC = 4;
const pick = (list: Occluder[], from: Vec3) => list
  .map((o) => ({ o, ang: o.radiusKm / Math.max(Math.hypot(o.pos[0] - from[0], o.pos[1] - from[1], o.pos[2] - from[2]), 1) }))
  .sort((a, b) => b.ang - a.ang).slice(0, MAX_OCC).map((x) => x.o);

export function computeFrame(jdUt: number, p: FrameParams): SystemFrame {
  const jdTt = jdUtToTt(jdUt);
  const planets = {} as Record<PlanetId, PlanetFrame>;
  for (const info of PLANETS) {
    const st = planetState(info.id, jdUt, p.model);
    const r = Math.hypot(...st.position);
    const o = iauOrientation(info.id === 'earth' ? 'earth' : info.id, jdTt, jdUt);
    const radiusVisual = visualRadius('planet', info.radiusKm, p.size, p.dist);
    planets[info.id] = {
      id: info.id, helioAu: st.position, velocityAuDay: st.velocity,
      position: mapDistance(st.position, p.dist),
      quat: matrixToQuaternion(sceneRotation(bodyToEcliptic(o))),
      radiusVisual, radiusKm: info.radiusKm,
      sunDir: eclToScene([-st.position[0] / r, -st.position[1] / r, -st.position[2] / r]),
      sunDistKm: r * AU_KM, occluders: [],
    };
  }

  const moons: MoonFrame[] = [];
  if (p.system) {
    const parent = planets[p.system as PlanetId];
    const sys = satellitesOf(p.system);
    const rel = sys.map((s) => satellitePosition(s.id, jdTt));
    const relScene = rel.map((v) => eclToScene(v));
    sys.forEach((s, i) => {
      const offset = moonOffset(rel[i], parent.radiusKm, parent.radiusVisual, p.size, p.dist);
      const o = iauOrientation(s.id, jdTt, jdUt);
      const occ: Occluder[] = [{ pos: eclToScene([-rel[i][0], -rel[i][1], -rel[i][2]]), radiusKm: parent.radiusKm }];
      sys.forEach((t, j) => { if (j !== i) occ.push({ pos: [relScene[j][0] - relScene[i][0], relScene[j][1] - relScene[i][1], relScene[j][2] - relScene[i][2]], radiusKm: t.radiusKm }); });
      moons.push({
        id: s.id, parent: s.parent, relKm: rel[i], offset,
        position: [parent.position[0] + offset[0], parent.position[1] + offset[1], parent.position[2] + offset[2]],
        quat: matrixToQuaternion(sceneRotation(bodyToEcliptic(o))),
        radiusVisual: visualRadius('moon', s.radiusKm, p.size, p.dist), radiusKm: s.radiusKm,
        sunDir: parent.sunDir, sunDistKm: parent.sunDistKm,
        occluders: pick(occ, [0, 0, 0]),
      });
    });
    parent.occluders = pick(sys.map((s, i) => ({ pos: relScene[i], radiusKm: s.radiusKm })), [0, 0, 0]);
  }
  return { jdUt, jdTt, planets, moons };
}

export const moonInfo = (id: SatelliteId) => SATELLITES.find((s) => s.id === id)!;
