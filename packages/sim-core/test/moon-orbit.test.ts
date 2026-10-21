import { describe, it, expect } from 'vitest';
import { moonApsides, moonLibrationLongitude, moonMeanLongitude, moonAscendingNode, moonPosition } from '../src';

describe('A3 lunar orbit helpers', () => {
  const jd0 = 2461333.5; // 2026-10-20
  const aps = moonApsides(jd0, jd0 + 60);
  it('finds alternating perigees and apogees ~13.8 d apart, distances in the observed ranges', () => {
    expect(aps.length).toBeGreaterThanOrEqual(4);
    for (let i = 1; i < aps.length; i++) {
      expect(aps[i].kind).not.toBe(aps[i - 1].kind);
      expect(aps[i].jd - aps[i - 1].jd).toBeGreaterThan(10);
      expect(aps[i].jd - aps[i - 1].jd).toBeLessThan(18);
    }
    for (const a of aps) {
      if (a.kind === 'perigee') { expect(a.distanceKm).toBeGreaterThan(355_000); expect(a.distanceKm).toBeLessThan(371_000); }
      else { expect(a.distanceKm).toBeGreaterThan(403_000); expect(a.distanceKm).toBeLessThan(407_500); }
    }
  });
  it('libration in longitude stays within ±9° and the mean-vs-true offset averages to ~0', () => {
    let sum = 0, max = 0;
    for (let k = 0; k < 400; k++) { const l = moonLibrationLongitude(jd0 + k * 0.5); sum += l; max = Math.max(max, Math.abs(l)); }
    expect(max).toBeLessThan(9);
    expect(max).toBeGreaterThan(5);
    expect(Math.abs(sum / 400)).toBeLessThan(1);
  });
  it('node regresses ~19.35°/yr; mean longitude advances one sidereal month in 27.32 d', () => {
    const d = ((moonAscendingNode(jd0) - moonAscendingNode(jd0 + 365.25)) + 360) % 360;
    expect(d).toBeCloseTo(19.35, 1);
    expect(((moonMeanLongitude(jd0 + 27.321661) - moonMeanLongitude(jd0)) + 360) % 360).toBeLessThan(0.05 + 0.0);
    expect(moonPosition(jd0).distanceKm).toBeGreaterThan(350_000);
  });
});
