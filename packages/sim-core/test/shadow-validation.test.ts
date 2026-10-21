import { describe, it, expect } from 'vitest';
import { validateShadowEdge, shaderRayFate, shadowAngle } from '../src';

describe('D3 shader shadow edge (float32 RK4 port)', () => {
  it('rendered edge within 1e-4 of the Synge angle for r_obs = 8…120 M, both quality presets', () => {
    for (const r of validateShadowEdge()) {
      expect(Math.abs(r.highRelErr)).toBeLessThan(1e-4);
      expect(Math.abs(r.saverRelErr)).toBeLessThan(1e-4);
    }
  });
  it('rays 1% inside the edge are captured, 1% outside escape', () => {
    const a = shadowAngle(30);
    expect(shaderRayFate(30, Math.sin(a * 0.99), Math.cos(a * 0.99), 0.012, 1100)).toBe('captured');
    expect(shaderRayFate(30, Math.sin(a * 1.01), Math.cos(a * 1.01), 0.012, 1100)).toBe('escaped');
  });
});
