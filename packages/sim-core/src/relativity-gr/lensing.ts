/**
 * Gravitational lensing by a point mass, thin-lens & weak-field approximation.
 * Schneider, Ehlers & Falco, "Gravitational Lenses" (1992), ch. 2; Paczyński 1986, ApJ 304, 1.
 */
import { C, G } from '../units/constants';

/**
 * Einstein angle θ_E = √(4GM/c² · D_ls/(D_l D_s)) [rad].
 * Distances in metres. For non-cosmological distances D_ls = D_s − D_l.
 */
export function einsteinAngle(massKg: number, Dl: number, Ds: number, Dls = Ds - Dl): number {
  return Math.sqrt(((4 * G * massKg) / (C * C)) * (Dls / (Dl * Ds)));
}

/** Image positions θ± = (β ± √(β² + 4θ_E²))/2 (same angular units as inputs). */
export function imagePositions(beta: number, thetaE: number): [number, number] {
  const s = Math.sqrt(beta * beta + 4 * thetaE * thetaE);
  return [(beta + s) / 2, (beta - s) / 2];
}

/** Total magnification A(u) = (u² + 2)/(u√(u² + 4)), u = β/θ_E. */
export const totalMagnification = (u: number) => (u * u + 2) / (u * Math.sqrt(u * u + 4));

/** Individual image magnifications A± = (A ± 1)/2 (absolute values). */
export function imageMagnifications(u: number): [number, number] {
  const A = totalMagnification(u);
  return [(A + 1) / 2, (A - 1) / 2];
}

/** Microlensing light curve u(t) = √(u0² + ((t − t0)/tE)²). */
export const microlensU = (t: number, t0: number, tE: number, u0: number) => Math.hypot(u0, (t - t0) / tE);

/**
 * Lens equation for ray shooting (in θ_E units): β = θ − θ/|θ|².
 * Returns source-plane coordinates for an image-plane position.
 */
export function lensMap(tx: number, ty: number): [number, number] {
  const r2 = tx * tx + ty * ty;
  if (r2 === 0) return [Infinity, Infinity];
  return [tx - tx / r2, ty - ty / r2];
}
