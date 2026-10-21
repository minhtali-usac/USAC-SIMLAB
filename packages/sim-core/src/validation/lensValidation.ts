/**
 * D5 reproducible checks (point-mass lens, thin lens, weak field).
 *  1. Inverse ray shooting (lensMap, as in the module) measures the magnification of a small uniform disk source:
 *     A = (image-plane area mapping into the source)/(source area). Compared with the point-source A(u) for ρ ≪ u
 *     and with the exact uniform-disk value at perfect alignment A₀ = √(1 + 4/ρ²) (Witt & Mao 1994).
 *  2. Image positions satisfy the lens equation; A₊ − A₋ = 1.
 *  3. Deflection at the solar limb 4GM☉/(c²R☉) and θ_E of a 0.5 M☉ lens at 4 kpc for a source at 8 kpc.
 */
import { lensMap, totalMagnification, imagePositions, imageMagnifications, einsteinAngle, lightDeflectionWeak, M_SUN, GM_SUN, R_SUN, PARSEC, ARCSEC_PER_RAD } from '../index';

let cache: ReturnType<typeof compute> | null = null;
export const validateLens = () => (cache ??= compute());

function shoot(ux: number, rho: number, half: number, n: number) {
  // count image-plane cells whose mapped point lies inside the source disk (centre (ux, 0), radius rho)
  const h = (2 * half) / n;
  let hits = 0;
  for (let j = 0; j < n; j++) {
    const ty = -half + (j + 0.5) * h;
    for (let i = 0; i < n; i++) {
      const tx = -half + (i + 0.5) * h;
      const [bx, by] = lensMap(tx, ty);
      if ((bx - ux) ** 2 + by * by <= rho * rho) hits++;
    }
  }
  return (hits * h * h) / (Math.PI * rho * rho);
}

function compute() {
  const rho = 0.02;
  const pointRows = [0.1, 0.3, 0.5, 1].map((u) => {
    const A = shoot(u, rho, 2.2, 3000);
    return { u, rho, rayShooting: A, analyticPoint: totalMagnification(u), relErr: Math.abs(A / totalMagnification(u) - 1) };
  });
  const A0shoot = shoot(0, 0.1, 1.3, 3000), A0exact = Math.sqrt(1 + 4 / 0.01);
  let maxLensEqErr = 0, maxDiffErr = 0;
  for (let k = 0; k < 200; k++) {
    const beta = 0.01 + (3 * k) / 200;
    const [tp, tm] = imagePositions(beta, 1);
    for (const t of [tp, tm]) maxLensEqErr = Math.max(maxLensEqErr, Math.abs(t - 1 / t - beta));
    const [Ap, Am] = imageMagnifications(beta);
    maxDiffErr = Math.max(maxDiffErr, Math.abs(Ap - Am - 1));
  }
  const solarLimbArcsec = lightDeflectionWeak(GM_SUN, R_SUN) * ARCSEC_PER_RAD;
  const thetaEmas = einsteinAngle(0.5 * M_SUN, 4000 * PARSEC, 8000 * PARSEC) * ARCSEC_PER_RAD * 1e3;
  return { pointSource: pointRows, aligned: { rho: 0.1, rayShooting: A0shoot, exact: A0exact, relErr: Math.abs(A0shoot / A0exact - 1) }, maxLensEqErr, maxDiffErr, solarLimbArcsec, thetaEmas };
}
