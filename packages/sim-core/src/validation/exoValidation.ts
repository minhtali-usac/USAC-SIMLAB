/**
 * Reproducible validation of the A4 exoplanet model (run: npm run validate:exo).
 * 1. Transit flux: ring integration (n = 400, as used in the app) vs
 *    (a) the exact uniform-disk overlap area (analytic, u1 = u2 = 0) and
 *    (b) an independent 2-D polar quadrature over the planet disk (quadratic limb darkening).
 * 2. Eccentric geometry: numerical contact times vs Seager & Mallén-Ornelas (e = 0, exact) and
 *    vs Winn (2010) analytic approximation (e > 0); RV sign convention vs dZ/dt.
 * 3. Presets: model-derived K, a/R★, b, T14, depth vs the values published in the SAME solution.
 */
import { transitFlux, overlapArea, transitDuration, limbDarkening, rvSemiAmplitude } from '../exoplanets/detection';
import { transitContacts, transitDurationWinn, impactParameter, skyPosition, radialVelocityAt, aOverRstar, type OrbitGeometry } from '../exoplanets/keplerTransit';
import { EXO_PRESETS, R_EARTH_EQ_KM } from '../data/exoplanetPresets';
import { M_SUN, R_SUN, SECONDS_PER_DAY } from '../units/constants';

const M_EARTH = 5.9722e24;

/** Independent reference: blocked flux by 2-D midpoint quadrature in polar coordinates centred on the planet. */
export function blockedFlux2D(d: number, p: number, u1: number, u2: number, nr = 500, nphi = 1000): number {
  let s = 0;
  for (let i = 0; i < nr; i++) {
    const rho = ((i + 0.5) / nr) * p;
    for (let j = 0; j < nphi; j++) {
      const ph = ((j + 0.5) / nphi) * 2 * Math.PI;
      const x = d + rho * Math.cos(ph), y = rho * Math.sin(ph);
      const r = Math.hypot(x, y);
      if (r < 1) s += limbDarkening(r, u1, u2) * rho;
    }
  }
  const blocked = s * (p / nr) * ((2 * Math.PI) / nphi);
  return blocked / (Math.PI * (1 - u1 / 3 - u2 / 6));
}

export function validateTransitFlux() {
  const ks = [0.01, 0.05, 0.1, 0.15, 0.3];
  const lds: [number, number][] = [[0.4, 0.26], [0.6, 0.1], [0.2, 0.4]];
  let maxUniform = 0, max2D = 0, maxRel2D = 0, nCases = 0;
  const worst: { k: number; d: number; u1: number; u2: number; dF: number } = { k: 0, d: 0, u1: 0, u2: 0, dF: 0 };
  for (const k of ks) {
    for (let m = 0; m <= 40; m++) {
      const d = (m / 40) * (1 + k) * 0.999;
      const ref = overlapArea(d, k) / Math.PI;
      maxUniform = Math.max(maxUniform, Math.abs(1 - transitFlux(d, k, 0, 0, 400) - ref));
      if (m % 4 === 0) {
        for (const [u1, u2] of lds) {
          const ref2 = blockedFlux2D(d, k, u1, u2);
          const dF = Math.abs(1 - transitFlux(d, k, u1, u2, 400) - ref2);
          nCases++;
          if (dF > max2D) Object.assign(worst, { k, d, u1, u2, dF });
          max2D = Math.max(max2D, dF);
          if (ref2 > 1e-6) maxRel2D = Math.max(maxRel2D, dF / ref2);
        }
      }
    }
  }
  return {
    description: 'max |ΔF| of the n = 400 ring integration; k ∈ {0.01,0.05,0.1,0.15,0.3}, d ∈ [0, 1+k) (41 positions), LD (u1,u2) ∈ {(0,0),(0.4,0.26),(0.6,0.1),(0.2,0.4)}',
    uniformVsExactOverlap: { cases: ks.length * 41, maxAbsDF: maxUniform },
    limbDarkenedVs2DQuadrature: { cases: nCases, maxAbsDF: max2D, maxRelToDepth: maxRel2D, worst, reference: 'polar midpoint quadrature 500 × 1000 over the planet disk' },
  };
}

export function validateEccentricGeometry() {
  // e = 0: numerical T14 vs the exact circular formula
  let maxCirc = 0;
  for (const aR of [5, 8.76, 20, 52.9]) for (const incDeg of [90, 88, 86.71]) for (const k of [0.01, 0.0708, 0.12]) {
    const g: OrbitGeometry = { P: 1, e: 0, omega: Math.PI / 2, aR, inc: (incDeg * Math.PI) / 180 };
    const c = transitContacts(g, k);
    if (!c.transits) continue;
    maxCirc = Math.max(maxCirc, Math.abs(c.T14 / transitDuration(1, aR, k, g.inc) - 1));
  }
  // e > 0: numerical vs Winn (2010) approximation
  let maxWinn = 0;
  const rows: { e: number; omegaDeg: number; T14num: number; T14winn: number; b: number }[] = [];
  for (const e of [0.1, 0.3, 0.5]) for (const omegaDeg of [0, 45, 90, 180, 270]) {
    const g: OrbitGeometry = { P: 10, e, omega: (omegaDeg * Math.PI) / 180, aR: 20, inc: (89 * Math.PI) / 180 };
    const c = transitContacts(g, 0.1);
    if (!c.transits) continue;
    const w = transitDurationWinn(g, 0.1);
    rows.push({ e, omegaDeg, T14num: c.T14, T14winn: w, b: impactParameter(g) });
    maxWinn = Math.max(maxWinn, Math.abs(c.T14 / w - 1));
  }
  // RV convention: v_r must be proportional (positive constant) to dZ/dt of the planet
  const g: OrbitGeometry = { P: 1, e: 0.4, omega: 1.1, aR: 10, inc: 1.4 };
  let minCorr = 1;
  {
    const xs: number[] = [], ys: number[] = [];
    for (let j = 0; j < 400; j++) {
      const t = j / 400, h = 1e-6;
      xs.push((skyPosition(t + h, g).Z - skyPosition(t - h, g).Z) / (2 * h));
      ys.push(radialVelocityAt(t, g, 1) - radialVelocityAt(0, { ...g }, 0)); // γ = 0
    }
    const mx = xs.reduce((a, b) => a + b) / xs.length, my = ys.reduce((a, b) => a + b) / ys.length;
    let sxy = 0, sxx = 0, syy = 0;
    xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; syy += (ys[i] - my) ** 2; });
    minCorr = sxy / Math.sqrt(sxx * syy);
  }
  return { circularNumericalVsExactMaxRel: maxCirc, eccentricNumericalVsWinnMaxRel: maxWinn, eccentricCases: rows, rvVsDZdtCorrelation: minCorr };
}

/** Compare each preset’s model-derived observables with the values published in the same solution. */
export function validatePresets() {
  return EXO_PRESETS.map((p) => {
    const Ms = p.mStar * M_SUN, Mp = p.mPlanet * M_EARTH, Rs = p.rStar * R_SUN, Ps = p.P * SECONDS_PER_DAY;
    const inc = (p.incDeg * Math.PI) / 180;
    const aR = aOverRstar(Ps, Ms, Mp, Rs);
    const k = (p.rPlanet * R_EARTH_EQ_KM * 1000) / Rs;
    const g: OrbitGeometry = { P: p.P * 24, e: p.e, omega: (p.omegaDeg * Math.PI) / 180, aR, inc };
    const c = transitContacts(g, k);
    const model = {
      K: rvSemiAmplitude(Ps, Ms, Mp, inc, p.e),
      aR, k, b: impactParameter(g),
      T14h: c.transits ? c.T14 : undefined,
      depthUniformPct: k * k * 100,
    };
    const rel = (m?: number, r?: number) => (m !== undefined && r !== undefined ? m / r - 1 : undefined);
    return {
      id: p.id, solution: p.solution, published: p.published, model,
      relDiff: { K: rel(model.K, p.published.K), aR: rel(model.aR, p.published.aR), b: rel(model.b, p.published.b), T14h: rel(model.T14h, p.published.T14h), k: rel(model.k, p.published.k) },
    };
  });
}
