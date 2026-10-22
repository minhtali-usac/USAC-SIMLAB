/**
 * Eclipse geometry: the fraction of the Sun's disc hidden by spherical bodies, seen from a point.
 *
 * The Sun and each occulter are discs on the sky with angular radii ρ_s and ρ_o whose centres are d apart; the hidden
 * fraction is the area of the intersection of the two discs divided by πρ_s² (a lens, two circular segments). The
 * small-angle planar approximation is excellent here (ρ ≲ 0.3°). Used by the 3D view's GLSL shaders (mirrored in
 * apps/web/src/lib/celestiaShaders.ts) and tested against the total solar eclipse of 8 April 2024.
 *
 * Celestia (src/celengine/shadermanager.cpp) uses a linear fall-off between umbra and penumbra instead; the exact
 * overlap is used here.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * Copyright (C) 2026, the USAC SimLab team; inspired by the eclipse shadows of Celestia 1.7.0. See NOTICE.md.
 */
import type { Vec3 } from '../math/vec';

/** Fraction of the Sun's disc (angular radius rs) covered by a disc of angular radius ro whose centre is d away. */
export function sunDiscCoverage(rs: number, ro: number, d: number): number {
  if (d >= rs + ro) return 0;
  if (d <= Math.abs(ro - rs)) return ro >= rs ? 1 : (ro * ro) / (rs * rs);
  const a = rs * rs * Math.acos(clamp((d * d + rs * rs - ro * ro) / (2 * d * rs)))
    + ro * ro * Math.acos(clamp((d * d + ro * ro - rs * rs) / (2 * d * ro)))
    - 0.5 * Math.sqrt(Math.max((-d + rs + ro) * (d + rs - ro) * (d - rs + ro) * (d + rs + ro), 0));
  return clamp(a / (Math.PI * rs * rs), 0, 1);
}

const clamp = (x: number, lo = -1, hi = 1) => Math.max(lo, Math.min(hi, x));
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);

export interface Occulter { /** centre relative to the shaded body's centre [km], same axes as `point` */ position: Vec3; radiusKm: number }

/**
 * Fraction of sunlight reaching `point` (km from the shaded body's centre): 1 in full sun, 0 in the umbra.
 * `sunDirection` is the unit vector from the body to the Sun.
 */
export function sunlightFraction(point: Vec3, sunDirection: Vec3, sunDistanceKm: number, sunRadiusKm: number, occulters: Occulter[]): number {
  const toSun = sub([sunDirection[0] * sunDistanceKm, sunDirection[1] * sunDistanceKm, sunDirection[2] * sunDistanceKm], point);
  const ds = norm(toSun);
  const rs = Math.asin(Math.min(sunRadiusKm / ds, 1));
  let visible = 1;
  for (const o of occulters) {
    const toO = sub(o.position, point);
    const dO = norm(toO);
    if (dO <= o.radiusKm) return 0;
    if (dO >= ds) continue;
    const ro = Math.asin(Math.min(o.radiusKm / dO, 1));
    const d = Math.acos(clamp(dot(toSun, toO) / (ds * dO)));
    visible *= 1 - sunDiscCoverage(rs, ro, d);
  }
  return visible;
}
