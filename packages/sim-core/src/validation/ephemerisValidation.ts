/**
 * E1 reproducible accuracy checks of the VSOP87 planets and the satellite theories against JPL Horizons
 * (DE441 + JPL satellite ephemerides). Fixtures are passed in (read by the script/test), so there is no file I/O.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * Copyright (C) 2026, the USAC SimLab team. Validates code derived from Celestia 1.7.0; see NOTICE.md.
 */
import type { Vec3 } from '../math/vec';
import { ARCSEC_PER_RAD } from '../units/convert';
import { AU } from '../units/constants';
import { vsop87Heliocentric, type VsopBody } from '../ephemeris/vsop87';
import { earthMoonBarycentre } from '../ephemeris/earthMoon';
import {
  SATELLITES, satellitePosition, satelliteEquatorialFrameVector, theoryFrame, type SatelliteId, type ParentId,
} from '../ephemeris/satellites';

const yearOf = (jdTdb: number) => 2000 + (jdTdb - 2_451_545) / 365.25;
const angle = (a: ArrayLike<number>, b: ArrayLike<number>) => {
  const c = (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (Math.hypot(a[0], a[1], a[2]) * Math.hypot(b[0], b[1], b[2]));
  return Math.acos(Math.min(1, c));
};
const rms = (v: number[]) => Math.sqrt(v.reduce((s, x) => s + x * x, 0) / v.length);

export interface PlanetRangeFixture {
  ranges: Record<string, { start: string; stop: string; planets: Record<string, { jdTdb: number; xyz: Vec3 }[]> }>;
}

export interface PlanetStats {
  planet: string;
  /** Heliocentric angular error [arcsec]. */
  angleArcsec: { max: number; rms: number; n: number };
  /** Maximum error per interval [arcsec]: edges are calendar years. */
  byInterval: { fromYear: number; toYear: number; maxArcsec: number }[];
  radiusAu: { max: number };
}

/** VSOP87 planets vs Horizons over every range of the fixture. */
export function validateVsop87(fx: PlanetRangeFixture, edgesByRange: Record<string, number[]>) {
  return Object.fromEntries(Object.entries(fx.ranges).map(([name, rg]) => {
    const edges = edgesByRange[name];
    const stats: PlanetStats[] = Object.entries(rg.planets).map(([id, rows]) => {
      const ang: number[] = [], dr: number[] = [];
      const bins = edges.slice(0, -1).map((e, i) => ({ fromYear: e, toYear: edges[i + 1], maxArcsec: 0 }));
      for (const { jdTdb, xyz } of rows) {
        const p = vsop87Heliocentric(id as VsopBody, jdTdb);
        const a = angle(p, xyz) * ARCSEC_PER_RAD;
        ang.push(a);
        dr.push(Math.abs(Math.hypot(...p) - Math.hypot(...xyz)));
        const y = yearOf(jdTdb);
        const b = bins.find((x) => y >= x.fromYear && y < x.toYear);
        if (b) b.maxArcsec = Math.max(b.maxArcsec, a);
      }
      return { planet: id, angleArcsec: { max: Math.max(...ang), rms: rms(ang), n: ang.length }, byInterval: bins, radiusAu: { max: Math.max(...dr) } };
    });
    return [name, { start: rg.start, stop: rg.stop, planets: stats }];
  }));
}

export interface SatelliteFixture { bodies: Record<string, { jdTdb: number; xyzKm: Vec3 }[]> }

export interface SatelliteStats {
  id: SatelliteId;
  parent: ParentId;
  meanRadiusKm: number;
  maxKm: number;
  rmsKm: number;
  /** Largest angular error as seen from the parent [deg]. */
  maxDeg: number;
  rmsDeg: number;
  byInterval: { fromYear: number; toYear: number; maxDeg: number }[];
}

export function validateSatellites(fx: SatelliteFixture, edges = [1900, 1930, 1960, 1990, 2020, 2050, 2080, 2100]) {
  return SATELLITES.map((s): SatelliteStats => {
    const rows = fx.bodies[s.id];
    const bins = edges.slice(0, -1).map((e, i) => ({ fromYear: e, toYear: edges[i + 1], maxDeg: 0 }));
    const km: number[] = [], deg: number[] = [], rho: number[] = [];
    for (const { jdTdb, xyzKm } of rows) {
      const p = satellitePosition(s.id, jdTdb);
      const d = Math.hypot(p[0] - xyzKm[0], p[1] - xyzKm[1], p[2] - xyzKm[2]);
      const r = Math.hypot(...xyzKm);
      km.push(d); rho.push(r); deg.push((d / r) * (180 / Math.PI));
      const y = yearOf(jdTdb);
      const b = bins.find((x) => y >= x.fromYear && y < x.toYear);
      if (b) b.maxDeg = Math.max(b.maxDeg, deg[deg.length - 1]);
    }
    return {
      id: s.id, parent: s.parent, meanRadiusKm: rho.reduce((a, b) => a + b, 0) / rho.length,
      maxKm: Math.max(...km), rmsKm: rms(km), maxDeg: Math.max(...deg), rmsDeg: rms(deg), byInterval: bins,
    };
  });
}

/** Earth's centre (VSOP87) vs Horizons 399, and the Earth–Moon barycentre vs Horizons 3, [arcsec]. */
export function validateEarthMoon(sat: SatelliteFixture, embFixture: { planets: Record<string, { jdTdb: number; xyz: Vec3 }[]> }) {
  const geo = sat.bodies.earth.map(({ jdTdb, xyzKm }) => angle(vsop87Heliocentric('earth', jdTdb), xyzKm.map((x) => x / (AU / 1000))) * ARCSEC_PER_RAD);
  const bary = embFixture.planets.earth.map(({ jdTdb, xyz }) => angle(earthMoonBarycentre(jdTdb), xyz) * ARCSEC_PER_RAD);
  const asBary = embFixture.planets.earth.map(({ jdTdb, xyz }) => angle(vsop87Heliocentric('earth', jdTdb), xyz) * ARCSEC_PER_RAD);
  return {
    geocentreMaxArcsec: Math.max(...geo), geocentreRmsArcsec: rms(geo),
    barycentreMaxArcsec: Math.max(...bary), barycentreRmsArcsec: rms(bary),
    /** What the error would be if VSOP87's "earth" were taken as the barycentre. */
    geocentreAsBarycentreMaxArcsec: Math.max(...asBary),
  };
}

/**
 * Re-derive the reference longitude φ₀ of an equatorial-frame theory (Jupiter, Saturn or Uranus system) by least
 * squares against Horizons: grid search then refinement. Used by the tests to guard THEORY_FRAME.
 */
export function fitTheorySpin(fx: SatelliteFixture, parent: 'jupiter' | 'saturn' | 'uranus', stride = 11): number {
  const moons = SATELLITES.filter((s) => s.parent === parent).map((s) => s.id);
  const score = (phi: number) => {
    let sse = 0;
    for (const id of moons) {
      const rows = fx.bodies[id];
      for (let k = 0; k < rows.length; k += stride) {
        const { jdTdb, xyzKm } = rows[k];
        const m = theoryFrame(parent, jdTdb, phi);
        const raw = satelliteEquatorialFrameVector(id, jdTdb);
        const p = [0, 1, 2].map((i) => m[i][0] * raw[0] + m[i][1] * raw[1] + m[i][2] * raw[2]);
        sse += (p[0] - xyzKm[0]) ** 2 + (p[1] - xyzKm[1]) ** 2 + (p[2] - xyzKm[2]) ** 2;
      }
    }
    return sse;
  };
  let best = { phi: 0, sse: Infinity };
  for (let phi = -180; phi < 180; phi += 1) { const s = score(phi); if (s < best.sse) best = { phi, sse: s }; }
  for (let phi = best.phi - 1; phi <= best.phi + 1; phi += 0.01) { const s = score(phi); if (s < best.sse) best = { phi, sse: s }; }
  return best.phi;
}
