import { describe, it, expect } from 'vitest';
import { PLANCK18, ageAtZ, lookbackTimeGyr, transverseComovingMpc, COSMIC_LANDMARKS, PLANCK18_RSTAR_MPC, PLANCK18_100THETA_STAR, angularDiameterDistanceMpc } from '../src';

describe('F4 lookback and distances (Planck 2018 cosmology in friedmann.ts)', () => {
  it('age today 13.787 Gyr within 0.01 Gyr', () => { expect(Math.abs(ageAtZ(PLANCK18, 0) - 13.787)).toBeLessThan(0.01); });
  it('acoustic angle 100θ* = 100 r*/D_M(z*) matches Planck 1.04110 within 0.2 %', () => {
    const z = COSMIC_LANDMARKS.find((l) => l.id === 'cmb')!.z;
    const t = (100 * PLANCK18_RSTAR_MPC) / transverseComovingMpc(PLANCK18, z);
    expect(Math.abs(t / PLANCK18_100THETA_STAR - 1)).toBeLessThan(0.002);
  });
  it('age at last scattering ≈ 0.37 Myr; lookback to GN-z11 ≈ 13.35 Gyr; lookback monotone in z', () => {
    expect(ageAtZ(PLANCK18, 1089.92) * 1e3).toBeGreaterThan(0.36);
    expect(ageAtZ(PLANCK18, 1089.92) * 1e3).toBeLessThan(0.385);
    expect(lookbackTimeGyr(PLANCK18, 10.603)).toBeGreaterThan(13.3);
    let prev = 0;
    for (const z of [0.01, 0.1, 1, 3, 10, 100, 1000]) { const lb = lookbackTimeGyr(PLANCK18, z); expect(lb).toBeGreaterThan(prev); prev = lb; }
  });
  it('angular-diameter distance peaks near z ≈ 1.6 (objects of fixed size look smallest there)', () => {
    let best = 0, zb = 0;
    for (let z = 0.5; z < 3; z += 0.01) { const d = angularDiameterDistanceMpc(PLANCK18, z); if (d > best) { best = d; zb = z; } }
    expect(zb).toBeGreaterThan(1.4); expect(zb).toBeLessThan(1.8);
  });
});
