/**
 * Special relativity. Units: c = 1 unless stated (β = v/c, rapidity η = artanh β).
 * References: Taylor & Wheeler, "Spacetime Physics" 2nd ed.; Rindler, "Relativity: Special,
 * General and Cosmological" (2006), ch. 2–4; Jackson, "Classical Electrodynamics" §11.3.
 */
import type { Vec3 } from '../math/vec';
import { dot } from '../math/vec';

/** Lorentz factor γ = 1/√(1−β²). Uses 1/√((1−β)(1+β)) for better precision near β → 1. */
export function gamma(beta: number): number {
  const b = Math.abs(beta);
  if (b >= 1) return Infinity;
  return 1 / Math.sqrt((1 - b) * (1 + b));
}

export const rapidity = (beta: number) => Math.atanh(beta);
export const betaFromRapidity = (eta: number) => Math.tanh(eta);
export const gammaFromRapidity = (eta: number) => Math.cosh(eta);

/** Relativistic collinear velocity addition (β units): (u+v)/(1+uv) = tanh(η_u + η_v). */
export const addVelocities = (u: number, v: number) => (u + v) / (1 + u * v);

/** 4-vector (ct, x, y, z). */
export type FourVector = [number, number, number, number];

/** Minkowski interval s² = (ct)² − x² − y² − z² (signature +−−−). */
export const interval = (a: FourVector) => a[0] * a[0] - a[1] * a[1] - a[2] * a[2] - a[3] * a[3];

/**
 * General pure boost of a 4-vector into a frame moving with velocity β (3-vector, |β| < 1):
 *   ct' = γ(ct − β·x),   x' = x + ((γ−1)/β²)(β·x)β − γ ct β.
 */
export function boost(X: FourVector, beta: Vec3): FourVector {
  const b2 = dot(beta, beta);
  if (b2 === 0) return [...X] as FourVector;
  const g = 1 / Math.sqrt(1 - b2);
  const x: Vec3 = [X[1], X[2], X[3]];
  const bx = dot(beta, x);
  const k = ((g - 1) * bx) / b2 - g * X[0];
  return [g * (X[0] - bx), x[0] + k * beta[0], x[1] + k * beta[1], x[2] + k * beta[2]];
}

/** 1+1D boost along x with rapidity η: (ct, x) → (ct', x'). */
export function boost1D(ct: number, x: number, eta: number): [number, number] {
  const ch = Math.cosh(eta), sh = Math.sinh(eta);
  return [ch * ct - sh * x, -sh * ct + ch * x];
}

/** Relativistic energy & momentum for rest mass m (energy units: m c²). */
export const energy = (m: number, beta: number) => gamma(beta) * m;
export const momentum = (m: number, beta: number) => gamma(beta) * m * beta;
export const kineticEnergy = (m: number, beta: number) => (gamma(beta) - 1) * m;
/** Invariant mass from E and |p| (c = 1): m² = E² − p². */
export const invariantMass = (E: number, p: number) => Math.sqrt(Math.max(0, E * E - p * p));

/**
 * Relativistic Doppler factor D = ν_obs/ν_emit = 1/(γ(1 − β cos θ_obs)),
 * θ_obs = angle between source velocity and the line of sight to the observer,
 * measured in the observer's frame.
 */
export const dopplerFactor = (beta: number, cosTheta: number) => 1 / (gamma(beta) * (1 - beta * cosTheta));

/**
 * Aberration: a direction making angle θ with the velocity in frame S appears at θ′
 * in a frame moving with β along that axis:  cos θ′ = (cos θ + β)/(1 + β cos θ).
 * (Directions refer to where light comes FROM.)
 */
export const aberrateCos = (cosTheta: number, beta: number) => (cosTheta + beta) / (1 + beta * cosTheta);

/**
 * Apparent transverse speed of a blob moving at β at angle θ to the line of sight:
 * β_app = β sin θ / (1 − β cos θ) (Rees 1966).
 */
export const apparentTransverseSpeed = (beta: number, theta: number) =>
  (beta * Math.sin(theta)) / (1 - beta * Math.cos(theta));

/** Lorentz contraction of a proper length L0. */
export const contractedLength = (L0: number, beta: number) => L0 / gamma(beta);
/** Dilated coordinate time for a proper interval Δτ. */
export const dilatedTime = (dtau: number, beta: number) => dtau * gamma(beta);
