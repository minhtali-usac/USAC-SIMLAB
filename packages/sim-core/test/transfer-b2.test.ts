import { describe, it, expect } from 'vitest';
import {
  hohmann, biElliptic, biEllipticLimitDv, biEllipticThresholds, biEllipticRegion, solveLambert, lambertArc,
  hohmannPhaseDates, realPhaseAngle, idealHohmannBetween, lambertLeg, validateTransfer, propagateTwoBody, MU_SUN_AU_DAY_B2,
  AU, GM_SUN, SECONDS_PER_DAY, norm, sub,
} from '../src';

const JD_START = 2461333.5; // 2026-10-20
const KMS = AU / SECONDS_PER_DAY / 1000;

describe('B2 Hohmann (ideal coplanar circles)', () => {
  it('Earth → Mars, r = 1 → 1.524 au: 2.946 + 2.650 = 5.596 km/s, 258.9 d, φ_H = 44.4° (NASA/JPL ≈ 259 d, 44°)', () => {
    const h = hohmann(AU, 1.524 * AU, GM_SUN);
    expect(h.dv1 / 1000).toBeCloseTo(2.946, 3);
    expect(h.dv2 / 1000).toBeCloseTo(2.650, 3);
    expect(h.dvTotal / 1000).toBeCloseTo(5.596, 3);
    expect(h.tof / SECONDS_PER_DAY).toBeCloseTo(258.9, 1);
    expect((h.phaseAngle * 180) / Math.PI).toBeCloseTo(44.36, 2);
  });
  it('with JPL J2000 semi-major axes: 2.945 + 2.649 = 5.594 km/s, T_syn ≈ 780 d', () => {
    const h = idealHohmannBetween('earth', 'mars', MU_SUN_AU_DAY_B2);
    expect(h.dv1 * KMS).toBeCloseTo(2.945, 3);
    expect(h.dv2 * KMS).toBeCloseTo(2.649, 3);
    expect(h.synodicPeriod).toBeCloseTo(779.9, 1);
  });
  it('inward transfer: both burns retrograde (negative), magnitudes mirror the outward case, target trails', () => {
    const o = hohmann(0.723, 1, 1), i = hohmann(1, 0.723, 1);
    expect(i.dv1).toBeLessThan(0);
    expect(i.dv2).toBeLessThan(0);
    expect(i.dv1).toBeCloseTo(-o.dv2, 14);
    expect(i.dv2).toBeCloseTo(-o.dv1, 14);
    expect(i.dvTotal).toBeCloseTo(o.dvTotal, 14);
    expect(i.phaseAngle).toBeLessThan(0);
  });
});

describe('B2 bi-elliptic', () => {
  const th = biEllipticThresholds();
  it('thresholds R₁ = 11.9388 (vs r_b → ∞) and R₂ = 15.5817 (all r_b > r₂)', () => {
    expect(th.R1).toBeCloseTo(11.938765, 5);
    expect(th.R2).toBeCloseTo(15.5817, 3);
  });
  it('regions: R = 11 Hohmann always; R = 14 depends on r_b; R = 20 bi-elliptic for every r_b', () => {
    expect(biEllipticRegion(11, th)).toBe('hohmannAlways');
    expect(biEllipticRegion(14, th)).toBe('dependsOnRb');
    expect(biEllipticRegion(20, th)).toBe('biAlways');
    // R = 14: small r_b loses, large r_b wins
    expect(biElliptic(1, 14, 14 * 1.5, 1).dvTotal).toBeGreaterThan(hohmann(1, 14, 1).dvTotal);
    expect(biElliptic(1, 14, 14 * 100, 1).dvTotal).toBeLessThan(hohmann(1, 14, 1).dvTotal);
    // R = 20: even r_b barely above r₂ wins
    expect(biElliptic(1, 20, 20 * 1.01, 1).dvTotal).toBeLessThan(hohmann(1, 20, 1).dvTotal);
  });
  it('Δv → (√2 − 1)(v_c1 + v_c2) and flight time → ∞ as r_b → ∞; burns from vis-viva', () => {
    const b = biElliptic(1, 20, 2e6, 1);
    expect(b.dvTotal).toBeCloseTo(biEllipticLimitDv(1, 20, 1), 3);
    expect(b.tof).toBeGreaterThan(1e9);
    expect(biElliptic(1, 5, 5, 1).dvTotal).toBeCloseTo(hohmann(1, 5, 1).dvTotal, 12); // r_b = r₂ reduces to Hohmann
  });
});

describe('B2 ephemeris phase dates (geometric screening)', () => {
  const h = idealHohmannBetween('earth', 'mars', MU_SUN_AU_DAY_B2);
  const dates = hohmannPhaseDates('earth', 'mars', h.phaseAngle, JD_START, 5);
  it('returned dates satisfy realPhase = φ_H to < 1e-8 rad', () => {
    expect(dates.length).toBe(5);
    for (const jd of dates) {
      const d = Math.abs(((realPhaseAngle('earth', 'mars', jd) - h.phaseAngle + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
      expect(d).toBeLessThan(1e-8);
    }
  });
  it('first date after 2026-10-20 is 2026-12-04; spacings vary (eccentric orbits), not a fixed 780 d', () => {
    expect(new Date((dates[0] - 2440587.5) * 864e5).toISOString().slice(0, 10)).toBe('2026-12-04');
    const sp = dates.slice(1).map((d, i) => d - dates[i]);
    expect(Math.max(...sp) - Math.min(...sp)).toBeGreaterThan(10);
    for (const s of sp) { expect(s).toBeGreaterThan(740); expect(s).toBeLessThan(830); }
  });
});

describe('B2 Lambert (universal variables)', () => {
  it('Curtis Example 5.2: v₁ = (−5.9925, 1.9254, 3.2456), v₂ = (−3.3125, −4.1966, −0.38529) km/s', () => {
    const s = solveLambert([5000, 10000, 2100], [-14600, 2500, 7000], 3600, 398600, true)!;
    [-5.9925, 1.9254, 3.2456].forEach((v, k) => expect(s.v1[k]).toBeCloseTo(v, 3));
    [-3.3125, -4.1966, -0.38529].forEach((v, k) => expect(s.v2[k]).toBeCloseTo(v, 3));
    expect(s.residual).toBeLessThan(1e-12);
  });
  it('independent DOPRI5 propagation of (r₁, v₁) for Δt lands on r₂; drawn arc ends on r₂', () => {
    const r1: [number, number, number] = [5000, 10000, 2100], r2: [number, number, number] = [-14600, 2500, 7000];
    const s = solveLambert(r1, r2, 3600, 398600, true)!;
    expect(norm(sub(propagateTwoBody(r1, s.v1, 3600, 398600), r2))).toBeLessThan(1e-6);
    expect(norm(sub(lambertArc(r1, s.v1, 3600, 398600, 10)[10], r2))).toBeLessThan(1e-6);
  });
  it('near Δθ = 180° with t = t_H, Lambert reproduces the Hohmann perihelion speed to 1e-8', () => {
    expect(Math.abs(validateTransfer(JD_START).lambertVsHohmann.relDiff)).toBeLessThan(1e-8);
  });
  it('real Earth → Mars leg: v∞ = v_sc − v_planet at both ends, C3 = |v∞,dep|², plausible 2026 minimum', () => {
    const leg = lambertLeg('earth', 'mars', 2461358.5, 270, MU_SUN_AU_DAY_B2)!;
    expect(leg.c3).toBeCloseTo(norm(sub(leg.v1, leg.vDepPlanet)) ** 2, 14);
    const best = validateTransfer(JD_START).minC3NextWindow;
    expect(best.c3Kms2).toBeGreaterThan(5);
    expect(best.c3Kms2).toBeLessThan(20);
  });
});
