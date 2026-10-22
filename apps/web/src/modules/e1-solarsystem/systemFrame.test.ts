import { describe, it, expect } from 'vitest';
import { iauOrientation, poleEcliptic, bodyToEcliptic, dateToJD, jdUtToTt, satellitePosition, type Mat3, type Vec3 } from '@usac/sim-core';
import {
  eclToScene, mapDistance, moonOffset, sceneRotation, matrixToQuaternion, computeFrame, visualRadius, sceneUnitsPerKm,
} from './systemFrame';

const norm = (v: readonly number[]) => Math.hypot(v[0], v[1], v[2]);
const rotate = (q: [number, number, number, number], v: Vec3): Vec3 => {
  const [x, y, z, w] = q;
  // v' = v + 2w(q×v) + 2 q×(q×v)
  const t: Vec3 = [2 * (y * v[2] - z * v[1]), 2 * (z * v[0] - x * v[2]), 2 * (x * v[1] - y * v[0])];
  return [v[0] + w * t[0] + (y * t[2] - z * t[1]), v[1] + w * t[1] + (z * t[0] - x * t[2]), v[2] + w * t[2] + (x * t[1] - y * t[0])];
};
const JD = dateToJD(Date.UTC(2026, 9, 22, 12));

describe('E1 scene geometry', () => {
  it('maps ecliptic axes to scene axes (x, z, −y)', () => {
    expect(eclToScene([1, 2, 3])).toEqual([1, 3, -2]);
  });
  it('linear distances are 10 units per au; compressed distances keep the direction and are monotonic', () => {
    expect(mapDistance([1, 0, 0], 'linear')).toEqual([10, 0, -0]);
    const a = mapDistance([0.5, 0.5, 0], 'log'), b = mapDistance([5, 5, 0], 'log');
    expect(a[0] / a[2]).toBeCloseTo(-1, 9);
    expect(norm(b)).toBeGreaterThan(norm(a));
    expect(norm(mapDistance([0.25, 0, 0], 'log'))).toBeCloseTo(16 * Math.log10(2), 9);
  });
  it('true-size radii use the scene scale; exaggerated radii grow slowly with the real radius', () => {
    expect(visualRadius('planet', 6371, 'true', 'linear')).toBeCloseTo(6371 * sceneUnitsPerKm('linear'), 12);
    expect(visualRadius('planet', 69_911, 'big', 'log')).toBeGreaterThan(visualRadius('planet', 6371, 'big', 'log'));
    expect(visualRadius('moon', 1737, 'big', 'log')).toBeLessThan(visualRadius('planet', 6371, 'big', 'log'));
  });
  it('quaternions reproduce the rotation matrix', () => {
    const o = iauOrientation('saturn', jdUtToTt(JD));
    const M = sceneRotation(bodyToEcliptic(o));
    const q = matrixToQuaternion(M);
    expect(q[0] ** 2 + q[1] ** 2 + q[2] ** 2 + q[3] ** 2).toBeCloseTo(1, 12);
    for (const v of [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0.3, -0.5, 0.8]] as Vec3[]) {
      const m = [0, 1, 2].map((i) => M[i][0] * v[0] + M[i][1] * v[1] + M[i][2] * v[2]);
      const r = rotate(q, v);
      for (let i = 0; i < 3; i++) expect(r[i]).toBeCloseTo(m[i], 10);
    }
  });
  it('the sphere\'s local +y (its pole) points along the IAU pole in scene axes', () => {
    for (const body of ['earth', 'jupiter', 'uranus'] as const) {
      const o = iauOrientation(body, jdUtToTt(JD));
      const q = matrixToQuaternion(sceneRotation(bodyToEcliptic(o)));
      const pole = eclToScene(poleEcliptic(o));
      const y = rotate(q, [0, 1, 0]);
      for (let i = 0; i < 3; i++) expect(y[i], body).toBeCloseTo(pole[i], 10);
    }
  });
  it('the prime meridian (local +x) lies on the body-fixed x axis, so Greenwich faces the right way', () => {
    const o = iauOrientation('earth', jdUtToTt(JD), JD);
    const R: Mat3 = bodyToEcliptic(o);
    const q = matrixToQuaternion(sceneRotation(R));
    const x = rotate(q, [1, 0, 0]);
    const want = eclToScene([R[0][0], R[1][0], R[2][0]]);
    for (let i = 0; i < 3; i++) expect(x[i]).toBeCloseTo(want[i], 10);
  });
});

describe('E1 frame at one instant', () => {
  const frame = computeFrame(JD, { dist: 'log', size: 'big', model: 'vsop87', system: 'jupiter' });
  it('draws the four Galilean moons of Jupiter and shades planet and moons from the same Sun direction', () => {
    expect(frame.moons.map((m) => m.id)).toEqual(['io', 'europa', 'ganymede', 'callisto']);
    for (const m of frame.moons) expect(m.sunDir).toEqual(frame.planets.jupiter.sunDir);
  });
  it('keeps the true direction of each moon from its planet, compressing only the distance', () => {
    for (const m of frame.moons) {
      const want = eclToScene(satellitePosition(m.id, jdUtToTt(JD)));
      const wn = norm(want), on = norm(m.offset);
      for (let i = 0; i < 3; i++) expect(m.offset[i] / on).toBeCloseTo(want[i] / wn, 9);
      expect(on).toBeLessThan(0.6 * frame.planets.jupiter.radiusVisual * 20);
    }
  });
  it('orders moons outwards in the picture as in space', () => {
    const d = frame.moons.map((m) => norm(m.offset));
    expect(d[0]).toBeLessThan(d[1]); expect(d[1]).toBeLessThan(d[2]); expect(d[2]).toBeLessThan(d[3]);
  });
  it('gives each body at most four occluders, and the planet is one for each of its moons', () => {
    expect(frame.planets.jupiter.occluders).toHaveLength(4);
    for (const m of frame.moons) expect(m.occluders.length).toBeLessThanOrEqual(4);
    expect(frame.moons[0].occluders[0].radiusKm).toBeGreaterThan(60_000); // Jupiter is the biggest occluder seen from Io
  });
  it('has no moons when no system is selected, and a Sun 1 au away for Earth', () => {
    const none = computeFrame(JD, { dist: 'log', size: 'big', model: 'vsop87', system: null });
    expect(none.moons).toHaveLength(0);
    expect(none.planets.earth.sunDistKm / 149_597_870.7).toBeGreaterThan(0.98);
    expect(none.planets.earth.sunDistKm / 149_597_870.7).toBeLessThan(1.02);
  });
  it('the Kepler model puts the planets within a few arcminutes of VSOP87', () => {
    const k = computeFrame(JD, { dist: 'linear', size: 'big', model: 'kepler', system: null });
    const v = computeFrame(JD, { dist: 'linear', size: 'big', model: 'vsop87', system: null });
    for (const id of ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'] as const) {
      const a = k.planets[id].position, b = v.planets[id].position;
      const ang = Math.acos((a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (norm(a) * norm(b)));
      expect(ang * (180 / Math.PI) * 60, id).toBeLessThan(10);
    }
  });
  it('compressed moon offsets exist in true-size mode too, at the true distance', () => {
    const t = computeFrame(JD, { dist: 'linear', size: 'true', model: 'vsop87', system: 'earth' });
    const moon = t.moons[0];
    expect(norm(moon.offset) / sceneUnitsPerKm('linear')).toBeGreaterThan(356_000);
    expect(norm(moon.offset) / sceneUnitsPerKm('linear')).toBeLessThan(407_000);
    expect(moonOffset([384_400, 0, 0], 6371, 0.24, 'true', 'linear')).toEqual(eclToScene([384_400 * sceneUnitsPerKm('linear'), 0, 0]));
  });
});
