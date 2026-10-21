/**
 * Impulsive orbital transfers between coplanar circular orbits about one central body.
 * Hohmann (1925); bi-elliptic (Sternfeld 1934). Formulas: Vallado 4th ed., §6.3, Algorithms 36–37;
 * Curtis, "Orbital Mechanics for Engineering Students" 4th ed., ch. 6. All speeds are relative to the
 * central body (heliocentric for planets); burns are impulsive.
 *
 * Signed burns: + = prograde (speed increase along the velocity), − = retrograde. Totals are Σ|Δv|.
 */
import { TWO_PI } from '../units/convert';
import { bisect } from '../math/roots';

/** Circular speed v_c = √(μ/r). */
export const circularSpeed = (r: number, mu: number) => Math.sqrt(mu / r);
/** Vis-viva speed on a Kepler orbit of semi-major axis a at radius r. */
const visViva = (r: number, a: number, mu: number) => Math.sqrt(mu * (2 / r - 1 / a));

export interface HohmannResult {
  /** Signed burns (+ prograde, − retrograde). Outward: both +. Inward: both −. */
  dv1: number;
  dv2: number;
  /** Σ|Δv| - the heliocentric (central-body-frame) total of the two impulses. */
  dvTotal: number;
  /** Time of flight t_H = π√(a_T³/μ) (half the transfer-orbit period). */
  tof: number;
  aTransfer: number;
  eTransfer: number;
  /**
   * Required phase angle φ_H = π − n₂ t_H of the target AHEAD of the departure body at departure [rad],
   * wrapped to (−π, π]; negative means the target must trail (typical for inward transfers).
   */
  phaseAngle: number;
  /** Synodic period T_syn = 2π/|n₁ − n₂| (spacing of repeated geometry). */
  synodicPeriod: number;
  n1: number;
  n2: number;
}

const wrapPi = (x: number) => { const y = ((x + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI; return y === -Math.PI ? Math.PI : y; };

export function hohmann(r1: number, r2: number, mu: number): HohmannResult {
  const aT = 0.5 * (r1 + r2);
  const dv1 = visViva(r1, aT, mu) - circularSpeed(r1, mu);
  const dv2 = circularSpeed(r2, mu) - visViva(r2, aT, mu);
  const tof = Math.PI * Math.sqrt((aT * aT * aT) / mu);
  const n1 = Math.sqrt(mu / (r1 * r1 * r1));
  const n2 = Math.sqrt(mu / (r2 * r2 * r2));
  return {
    dv1, dv2, dvTotal: Math.abs(dv1) + Math.abs(dv2), tof, aTransfer: aT, eTransfer: Math.abs(r2 - r1) / (r1 + r2),
    phaseAngle: wrapPi(Math.PI - n2 * tof), synodicPeriod: TWO_PI / Math.abs(n1 - n2), n1, n2,
  };
}

export interface BiEllipticResult {
  /** Signed burns: at r₁, at r_b, at r₂. */
  dv1: number; dv2: number; dv3: number;
  dvTotal: number;
  /** t_bi = π√(a₁³/μ) + π√(a₂³/μ). */
  tof: number;
  a1: number; a2: number; rb: number;
}

/** Bi-elliptic transfer r₁ → r_b → r₂ (r_b ≥ max(r₁, r₂)); burns from vis-viva at each point. */
export function biElliptic(r1: number, r2: number, rb: number, mu: number): BiEllipticResult {
  if (rb < Math.max(r1, r2)) throw new RangeError('biElliptic: r_b must be ≥ max(r1, r2)');
  const a1 = 0.5 * (r1 + rb), a2 = 0.5 * (r2 + rb);
  const dv1 = visViva(r1, a1, mu) - circularSpeed(r1, mu);
  const dv2 = visViva(rb, a2, mu) - visViva(rb, a1, mu);
  const dv3 = circularSpeed(r2, mu) - visViva(r2, a2, mu);
  const tof = Math.PI * (Math.sqrt(a1 ** 3 / mu) + Math.sqrt(a2 ** 3 / mu));
  return { dv1, dv2, dv3, dvTotal: Math.abs(dv1) + Math.abs(dv2) + Math.abs(dv3), tof, a1, a2, rb };
}

/**
 * Limit r_b → ∞ (parabolic legs): Δv = (√2 − 1)(v_c1 + v_c2), infinite flight time - a mathematical limit,
 * not a flyable transfer.
 */
export const biEllipticLimitDv = (r1: number, r2: number, mu: number) => (Math.SQRT2 - 1) * (circularSpeed(r1, mu) + circularSpeed(r2, mu));

/**
 * Radius-ratio thresholds R = r₂/r₁ (outward, coplanar circles), computed numerically:
 *  - R₁ ≈ 11.94: Hohmann Δv equals the r_b → ∞ bi-elliptic limit (below it Hohmann always wins);
 *  - R₂ ≈ 15.58: above it every bi-elliptic with r_b > r₂ beats Hohmann (slope of Δv_bi(r_b) at r_b = r₂⁺ < 0).
 * Between R₁ and R₂ the winner depends on r_b.
 */
export function biEllipticThresholds() {
  const R1 = bisect((R) => hohmann(1, R, 1).dvTotal - biEllipticLimitDv(1, R, 1), 5, 30, 1e-13);
  const slope = (R: number) => {
    const h = 1e-6 * R;
    return (biElliptic(1, R, R + 2 * h, 1).dvTotal - biElliptic(1, R, R + h, 1).dvTotal) / h;
  };
  const R2 = bisect(slope, 12, 30, 1e-10);
  return { R1, R2 };
}

export type BiEllipticRegion = 'hohmannAlways' | 'dependsOnRb' | 'biAlways';
export function biEllipticRegion(R: number, th = biEllipticThresholds()): BiEllipticRegion {
  const x = R >= 1 ? R : 1 / R;
  return x < th.R1 ? 'hohmannAlways' : x < th.R2 ? 'dependsOnRb' : 'biAlways';
}

/** Δv for a pure plane change of angle di at speed v. */
export const planeChangeDv = (v: number, di: number) => 2 * v * Math.sin(di / 2);

/**
 * Tsiolkovsky rocket equation: mass ratio m₀/m_f = exp(Δv/v_e) for exhaust speed v_e.
 * Propellant fraction = 1 − m_f/m₀ = 1 − exp(−Δv/v_e).
 */
export const massRatio = (dv: number, ve: number) => Math.exp(dv / ve);
